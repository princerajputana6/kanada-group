import type { Workspace } from "@/lib/workspace";
import { GraduationCap, Search } from "lucide-react";
import { Badge, Button, Input, Progress, Select, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@kanada/ui";
import { getTeacherCourseOptions, getTeacherStudentProgress } from "@/lib/teacher-queries";
import { formatDate } from "@/lib/utils";
import { EmptyState, PageHeader } from "@/components/teacher/ui";

const PAYMENT_LABEL: Record<string, { label: string; variant: "success" | "secondary" | "outline" | "destructive" }> = {
  NONE: { label: "Free", variant: "outline" },
  PAID: { label: "Paid", variant: "success" },
  SUBMITTED: { label: "Verifying payment", variant: "secondary" },
  AWAITING: { label: "Awaiting payment", variant: "secondary" },
  REJECTED: { label: "Payment rejected", variant: "destructive" },
};

export async function StudentsView({ ws, searchParams }: { ws: Workspace; searchParams: Promise<{ q?: string; course?: string; status?: string }>; }) {
  const { q, course, status } = await searchParams;
  const [rows, courses] = await Promise.all([getTeacherStudentProgress(ws.teacherId), getTeacherCourseOptions(ws.teacherId)]);

  const query = q?.trim().toLowerCase();
  const filtered = rows.filter(
    (r) =>
      (!query || r.name.toLowerCase().includes(query) || r.email.toLowerCase().includes(query)) &&
      (!course || r.courseId === course) &&
      (!status ||
        (status === "completed" && r.completedAt) ||
        (status === "active" && r.hasAccess && !r.completedAt) ||
        (status === "pending" && !r.hasAccess)),
  );
  const uniqueStudents = new Set(rows.map((r) => r.userId)).size;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Learners"
        title="Students"
        description={`${uniqueStudents} student${uniqueStudents === 1 ? "" : "s"} across your courses, with their progress per course.`}
      />

      <form method="get" role="search" className="grid gap-3 rounded-3xl border border-border bg-card p-4 sm:grid-cols-[2fr_1.5fr_1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input name="q" type="search" defaultValue={q ?? ""} placeholder="Search name or email…" aria-label="Search students" className="pl-9" />
        </div>
        <Select name="course" defaultValue={course ?? ""} aria-label="Course">
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </Select>
        <Select name="status" defaultValue={status ?? ""} aria-label="Status">
          <option value="">Any status</option>
          <option value="active">Learning</option>
          <option value="completed">Completed</option>
          <option value="pending">Payment pending</option>
        </Select>
        <Button type="submit" className="h-10">Apply</Button>
      </form>

      {filtered.length === 0 ? (
        <EmptyState icon={GraduationCap} title={rows.length ? "No students match" : "No students yet"}>
          {rows.length ? "Try a different search or filter." : "Students appear here once they enroll in your courses."}
        </EmptyState>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead className="min-w-40">Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead>Last active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => {
                const pay = PAYMENT_LABEL[r.paymentStatus] ?? PAYMENT_LABEL.NONE!;
                return (
                  <TableRow key={`${r.userId}:${r.courseId}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {r.name.slice(0, 1).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{r.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{r.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-52 truncate text-muted-foreground">{r.courseTitle}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={r.percent} className="h-1.5" />
                        <span className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
                          {r.lessonsDone}/{r.lessonsTotal}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {r.completedAt ? (
                        <Badge variant="success">Completed</Badge>
                      ) : (
                        r.hasAccess ? <Badge variant="secondary">Learning</Badge> : <Badge variant={pay.variant}>{pay.label}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(r.enrolledAt)}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{r.lastActiveAt ? formatDate(r.lastActiveAt) : "—"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
