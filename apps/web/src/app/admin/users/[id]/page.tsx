import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kanada/ui";
import { requireRole } from "@/lib/session";
import { getUserDetail } from "@/lib/admin-queries";
import { formatDate } from "@/lib/utils";
import {
  adminResetProgressAction,
  adminUnenrollAction,
  setUserBannedAction,
  setUserRoleAction,
  signOutUserEverywhereAction,
} from "@/actions/admin-actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { EnrollForm } from "@/components/admin/enroll-form";
import { ResetPassword } from "@/components/admin/reset-password";

const ROLE_LABEL = { ADMIN: "Admin", TEACHER: "Teacher", STUDENT: "Student" } as const;

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{children}</dd>
    </div>
  );
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireRole(["ADMIN"]);
  const { id } = await params;
  const data = await getUserDetail(id);
  if (!data) notFound();

  const { profile: u, enrolled, reviews, coursesTaught } = data;
  const isSelf = admin.id === u.id;
  const completed = enrolled.filter((e) => e.completedAt).length;
  const avg = enrolled.length ? Math.round(enrolled.reduce((s, e) => s + e.percent, 0) / enrolled.length) : 0;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={u.role === "STUDENT" ? "/admin/students" : "/admin/users"}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← {u.role === "STUDENT" ? "Students" : "All users"}
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold">{u.name}</h1>
          <Badge variant="outline">{ROLE_LABEL[u.role]}</Badge>
          <Badge variant={u.banned ? "destructive" : "success"}>{u.banned ? "Banned" : "Active"}</Badge>
          {isSelf && <Badge variant="secondary">You</Badge>}
        </div>
        <p className="mt-1 text-muted-foreground">{u.email}</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Fact label="Joined">{formatDate(u.createdAt)}</Fact>
            <Fact label="Last active">{data.lastActiveAt ? formatDate(data.lastActiveAt) : "Never"}</Fact>
            <Fact label="Courses">
              {enrolled.length} enrolled · {completed} completed
            </Fact>
            <Fact label="Progress">
              {data.lessonsCompleted} lessons · {avg}% avg
            </Fact>
            {u.bio && (
              <div className="sm:col-span-2 lg:col-span-4">
                <Fact label="Bio">
                  <span className="font-normal text-muted-foreground">{u.bio}</span>
                </Fact>
              </div>
            )}
            <div className="sm:col-span-2 lg:col-span-4">
              <Fact label="Account ID">
                <code className="font-mono text-xs font-normal text-muted-foreground">{u.id}</code>
              </Fact>
            </div>
          </dl>
        </CardContent>
      </Card>

      {(u.whatsapp || u.resumeKey || u.qualification) && (
        <Card>
          <CardHeader>
            <CardTitle>Registration details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {u.whatsapp && <Fact label="WhatsApp">{u.whatsapp}</Fact>}
              {u.qualification && <Fact label="Course">{u.qualification}</Fact>}
              {u.branch && <Fact label="Branch">{u.branch}</Fact>}
              {u.completionYear && <Fact label="Completion year">{u.completionYear}</Fact>}
              {u.affiliation && <Fact label="Affiliation">{u.affiliation}</Fact>}
              {u.interestField && <Fact label="Interested field">{u.interestField}</Fact>}
              {u.workExperience && (
                <div className="sm:col-span-2 lg:col-span-3">
                  <Fact label="Work experience">
                    <span className="font-normal text-muted-foreground">{u.workExperience}</span>
                  </Fact>
                </div>
              )}
              {u.priorTools && (
                <div className="sm:col-span-2 lg:col-span-3">
                  <Fact label="Prior tools used">
                    <span className="font-normal text-muted-foreground">{u.priorTools}</span>
                  </Fact>
                </div>
              )}
              {u.resumeKey && (
                <Fact label="Resume">
                  <a
                    href={`/api/resume/${u.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View resume (PDF) →
                  </a>
                </Fact>
              )}
            </dl>
          </CardContent>
        </Card>
      )}

      {!isSelf && (
        <Card>
          <CardHeader>
            <CardTitle>Account actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Password</p>
              <p className="mb-3 text-sm text-muted-foreground">
                Passwords are stored as one-way hashes and can&apos;t be viewed. Generate a temporary
                one to share with this person instead.
              </p>
              <ResetPassword userId={u.id} userName={u.name} />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Role</p>
                <form
                  action={async (formData: FormData) => {
                    "use server";
                    await setUserRoleAction(u.id, formData.get("role") as "ADMIN" | "TEACHER" | "STUDENT");
                  }}
                  className="mt-2 flex items-center gap-2"
                >
                  <Select name="role" defaultValue={u.role} className="h-9 w-40" aria-label="Role">
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Teacher</option>
                    <option value="ADMIN">Admin</option>
                  </Select>
                  <Button type="submit" size="sm" variant="outline">
                    Save role
                  </Button>
                </form>
              </div>
              <div className="flex flex-wrap gap-2">
                <form
                  action={async () => {
                    "use server";
                    await setUserBannedAction(u.id, !u.banned);
                  }}
                >
                  <ConfirmSubmitButton
                    size="sm"
                    variant={u.banned ? "outline" : "destructive"}
                    confirmText={u.banned ? `Unban ${u.name}?` : `Ban ${u.name}? They'll be signed out and can't sign in.`}
                  >
                    {u.banned ? "Unban" : "Ban account"}
                  </ConfirmSubmitButton>
                </form>
                <form
                  action={async () => {
                    "use server";
                    await signOutUserEverywhereAction(u.id);
                  }}
                >
                  <ConfirmSubmitButton size="sm" variant="ghost" confirmText={`Sign ${u.name} out on every device?`}>
                    Sign out everywhere
                  </ConfirmSubmitButton>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <section>
        <h2 className="mb-4 text-xl font-semibold">Enrollments</h2>
        {enrolled.length === 0 ? (
          <p className="text-sm text-muted-foreground">Not enrolled in any course.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead className="min-w-40">Progress</TableHead>
                  <TableHead>Enrolled</TableHead>
                  <TableHead>Last active</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrolled.map((e) => (
                  <TableRow key={e.enrollmentId}>
                    <TableCell className="font-medium">
                      <Link href={`/courses/${e.slug}`} className="hover:text-primary">
                        {e.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={e.percent} className="h-1.5" />
                        <span className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
                          {e.lessonsDone}/{e.lessonsTotal}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(e.enrolledAt)}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {e.lastActiveAt ? formatDate(e.lastActiveAt) : "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {e.completedAt ? (
                        <Badge variant="success">{formatDate(e.completedAt)}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <form
                          action={async () => {
                            "use server";
                            await adminResetProgressAction(e.enrollmentId);
                          }}
                        >
                          <ConfirmSubmitButton
                            size="sm"
                            variant="ghost"
                            disabled={e.lessonsDone === 0 && !e.completedAt}
                            confirmText={`Reset ${u.name}'s progress in "${e.title}"? This can't be undone.`}
                          >
                            Reset progress
                          </ConfirmSubmitButton>
                        </form>
                        <form
                          action={async () => {
                            "use server";
                            await adminUnenrollAction(e.enrollmentId);
                          }}
                        >
                          <ConfirmSubmitButton
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            confirmText={`Unenroll ${u.name} from "${e.title}"? Their progress in it is deleted.`}
                          >
                            Unenroll
                          </ConfirmSubmitButton>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium">Enroll in a course</p>
          <EnrollForm userId={u.id} courses={data.enrollableCourses} />
        </div>
      </section>

      {coursesTaught.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Courses taught</h2>
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {coursesTaught.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                <Link href={`/courses/${c.slug}`} className="font-medium hover:text-primary">
                  {c.title}
                </Link>
                <span className="flex items-center gap-3 text-muted-foreground">
                  {c.enrollments.length} student{c.enrollments.length === 1 ? "" : "s"}
                  <Badge variant={c.published ? "success" : "outline"}>{c.published ? "Published" : "Draft"}</Badge>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-xl font-semibold">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews written.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <Link href={`/courses/${r.course.slug}`} className="font-medium hover:text-primary">
                    {r.course.title}
                  </Link>
                  <span className="text-muted-foreground">
                    <span className="text-amber-500" aria-label={`${r.rating} out of 5 stars`}>
                      {"★".repeat(r.rating)}
                      <span className="text-muted-foreground/40">{"★".repeat(5 - r.rating)}</span>
                    </span>{" "}
                    · {formatDate(r.createdAt)}
                  </span>
                </div>
                {r.comment && <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
