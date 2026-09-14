import Link from "next/link";
import { Badge, Card, CardContent, CardHeader, CardTitle, Progress } from "@kanada/ui";
import { requireRole } from "@/lib/session";
import { getTeacherAnalytics } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export default async function TeacherAnalyticsPage() {
  const user = await requireRole(["TEACHER"]);
  const data = await getTeacherAnalytics(user.id);

  return (
    <div>
      <h1 className="text-2xl font-bold">Analytics</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Courses</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{data.totalCourses}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Unique students</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{data.totalStudents}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Total enrollments</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{data.totalEnrollments}</CardContent>
        </Card>
      </div>

      <h2 className="mb-4 mt-10 text-lg font-semibold">Course performance</h2>
      <div className="space-y-4">
        {data.courses.length === 0 && (
          <p className="text-sm text-muted-foreground">No courses yet.</p>
        )}
        {data.courses.map((course) => (
          <Card key={course.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <Link
                  href={`/teacher/courses/${course.id}/edit`}
                  className="font-medium hover:underline"
                >
                  {course.title}
                </Link>
                <div className="flex items-center gap-2">
                  <Badge variant={course.published ? "success" : "outline"}>
                    {course.published ? "Published" : "Draft"}
                  </Badge>
                  {course.avgRating && (
                    <span className="text-sm text-muted-foreground">
                      ★ {course.avgRating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">Enrollments</p>
                  <p className="text-lg font-semibold">{course.enrollmentCount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Lessons</p>
                  <p className="text-lg font-semibold">{course.totalLessons}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">
                    Completion rate ({course.completionRate}%)
                  </p>
                  <Progress value={course.completionRate} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="mb-4 mt-10 text-lg font-semibold">Recent enrollments</h2>
      <div className="rounded-lg border border-border">
        {data.recentStudents.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No enrollments yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {data.recentStudents.map((e) => (
              <li key={e.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{e.user.name}</p>
                  <p className="text-muted-foreground">{e.courseTitle}</p>
                </div>
                <p className="text-muted-foreground">
                  {e.enrolledAt ? formatDate(e.enrolledAt) : "—"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
