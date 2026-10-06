import Link from "next/link";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@kanada/ui";
import { getPortalOverview, getPaymentCounts, getEnquiryCounts } from "@/lib/admin-queries";
import { formatDate } from "@/lib/utils";

function Stat({ label, value, hint, href }: { label: string; value: number; hint?: string; href?: string }) {
  const body = (
    <Card className="h-full transition-colors hover:border-primary/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-display text-3xl font-bold tracking-tight tabular-nums">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export default async function AdminDashboardPage() {
  const [o, payments, enquiries] = await Promise.all([
    getPortalOverview(),
    getPaymentCounts(),
    getEnquiryCounts(),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Overview</h1>
        <p className="mt-1 text-muted-foreground">Everything happening on the platform at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Students" value={o.students} hint={`+${o.newStudents7} this week · +${o.newStudents30} in 30 days`} href="/admin/students" />
        <Stat label="Active learners (7 days)" value={o.activeLearners7} hint="Watched or completed a lesson" href="/admin/students?sort=active" />
        <Stat label="Enrollments" value={o.enrollments} hint={`+${o.enrollments30} in the last 30 days`} />
        <Stat label="Course completions" value={o.completions} />
        <Stat label="Payments to review" value={payments.pending} hint={`${payments.paid} paid · ${payments.total} total`} href="/admin/enrollments" />
        <Stat label="New enquiries" value={enquiries.newCount} hint={`${enquiries.total} total`} href="/admin/enquiries" />
        <Stat label="Teachers" value={o.teachers} href="/admin/users" />
        <Stat label="Courses" value={o.courses} hint={`${o.publishedCourses} published`} href="/admin/courses" />
        <Stat label="Banned accounts" value={o.banned} href="/admin/students?status=banned" />
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-semibold">Newest students</h2>
          <Link href="/admin/students" className="text-sm font-medium text-primary hover:underline">
            View all →
          </Link>
        </div>
        {o.recentStudents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No students have registered yet.</p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {o.recentStudents.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/admin/users/${s.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-foreground/[0.03]"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{s.name}</span>
                    <span className="block truncate text-sm text-muted-foreground">{s.email}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3 text-sm text-muted-foreground">
                    {s.banned && <Badge variant="destructive">Banned</Badge>}
                    Joined {formatDate(s.createdAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
