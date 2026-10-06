import Link from "next/link";
import {
  Badge,
  Button,
  Input,
  Progress,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  buttonVariants,
  cn,
} from "@kanada/ui";
import { getStudentDirectory, parseStudentFilters } from "@/lib/admin-queries";
import { formatDate } from "@/lib/utils";

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = parseStudentFilters(sp);
  const { rows, total, courses } = await getStudentDirectory(filters);

  const exportParams = new URLSearchParams();
  if (filters.q) exportParams.set("q", filters.q);
  if (filters.status) exportParams.set("status", filters.status);
  if (filters.courseId) exportParams.set("course", filters.courseId);
  if (filters.joinedDays) exportParams.set("joined", String(filters.joinedDays));
  if (filters.sort) exportParams.set("sort", filters.sort);
  const isFiltered = !!(filters.q || filters.status || filters.courseId || filters.joinedDays);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="mt-1 text-muted-foreground">
            {isFiltered ? `${rows.length} of ${total}` : total} student{total === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/admin/users/new?role=STUDENT"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            + Add student
          </Link>
          <a
            href={`/admin/students/export?${exportParams}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            download
          >
            Export CSV{isFiltered ? " (filtered)" : ""}
          </a>
        </div>
      </div>

      <form method="get" role="search" className="mt-6 grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-[2fr_1fr_1.5fr_1fr_1fr_auto]">
        <Input name="q" type="search" defaultValue={filters.q ?? ""} placeholder="Search name or email…" aria-label="Search name or email" />
        <Select name="status" defaultValue={filters.status ?? ""} aria-label="Status">
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
        </Select>
        <Select name="course" defaultValue={filters.courseId ?? ""} aria-label="Enrolled in course">
          <option value="">Any course</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </Select>
        <Select name="joined" defaultValue={filters.joinedDays ? String(filters.joinedDays) : ""} aria-label="Joined">
          <option value="">Joined any time</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </Select>
        <Select name="sort" defaultValue={filters.sort ?? "joined"} aria-label="Sort by">
          <option value="joined">Newest first</option>
          <option value="active">Recently active</option>
          <option value="progress">Most progress</option>
          <option value="name">Name A–Z</option>
        </Select>
        <div className="flex gap-2">
          <Button type="submit" size="sm" className="h-10 flex-1">
            Apply
          </Button>
          {isFiltered && (
            <Link href="/admin/students" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-10")}>
              Clear
            </Link>
          )}
        </div>
      </form>

      {rows.length === 0 ? (
        <p className="mt-10 text-muted-foreground">
          {total === 0 ? "No students have registered yet." : "No students match these filters."}
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Courses</TableHead>
                <TableHead className="text-right">Completed</TableHead>
                <TableHead className="min-w-36">Avg. progress</TableHead>
                <TableHead>Last active</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Link href={`/admin/users/${s.id}`} className="group block">
                      <span className="block font-medium group-hover:text-primary">{s.name}</span>
                      <span className="block text-muted-foreground">{s.email}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(s.joinedAt)}</TableCell>
                  <TableCell className="text-right tabular-nums">{s.enrolledCount}</TableCell>
                  <TableCell className="text-right tabular-nums">{s.completedCount}</TableCell>
                  <TableCell>
                    {s.enrolledCount === 0 ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Progress value={s.avgProgress} className="h-1.5" />
                        <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">{s.avgProgress}%</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {s.lastActiveAt ? formatDate(s.lastActiveAt) : "Never"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.banned ? "destructive" : "success"}>{s.banned ? "Banned" : "Active"}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
