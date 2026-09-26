import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@kanada/ui";
import { getAdminAnalytics, getAdminStats } from "@/lib/queries";

export default async function AdminAnalyticsPage() {
  const [analytics, stats] = await Promise.all([getAdminAnalytics(), getAdminStats()]);

  const roleCount = {
    ADMIN: stats.users.filter((u) => u.role === "ADMIN").length,
    TEACHER: stats.users.filter((u) => u.role === "TEACHER").length,
    STUDENT: stats.users.filter((u) => u.role === "STUDENT").length,
  };

  const maxCategoryCount = Math.max(1, ...analytics.categoryBreakdown.map((c) => c.count));
  const maxTopCourse = Math.max(1, ...analytics.topCourses.map((c) => c.enrollmentCount));

  return (
    <div>
      <h1 className="text-2xl font-bold">Analytics</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Total users</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{stats.userCount}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Courses</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{stats.courseCount}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Completion rate</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{analytics.completionRate}%</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Avg. rating</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {analytics.avgRating ? analytics.avgRating.toFixed(1) : "—"}
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-semibold">Users by role</h2>
          <div className="space-y-3 rounded-lg border border-border p-4">
            {(["ADMIN", "TEACHER", "STUDENT"] as const).map((role) => (
              <div key={role}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{role}</span>
                  <span className="text-muted-foreground">{roleCount[role]}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${stats.userCount === 0 ? 0 : (roleCount[role] / stats.userCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <h2 className="mb-4 mt-8 text-lg font-semibold">Courses by category</h2>
          <div className="space-y-3 rounded-lg border border-border p-4">
            {analytics.categoryBreakdown.map((cat) => (
              <div key={cat.name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{cat.name}</span>
                  <span className="text-muted-foreground">{cat.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(cat.count / maxCategoryCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">Top courses by enrollment</h2>
          <div className="space-y-3 rounded-lg border border-border p-4">
            {analytics.topCourses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No enrollments yet.</p>
            ) : (
              analytics.topCourses.map((course) => (
                <div key={course.slug}>
                  <div className="mb-1 flex justify-between text-sm">
                    <Link href={`/courses/${course.slug}`} className="hover:underline">
                      {course.title}
                    </Link>
                    <span className="text-muted-foreground">{course.enrollmentCount}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${(course.enrollmentCount / maxTopCourse) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{course.teacherName}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
