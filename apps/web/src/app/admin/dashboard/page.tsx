import { Card, CardContent, CardHeader, CardTitle } from "@kanada/ui";
import { getAdminStats } from "@/lib/queries";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div>
      <h1 className="text-2xl font-bold">Platform overview</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
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
            <CardTitle className="text-sm text-muted-foreground">Enrollments</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{stats.enrollmentCount}</CardContent>
        </Card>
      </div>
    </div>
  );
}
