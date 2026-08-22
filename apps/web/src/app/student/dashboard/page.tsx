import Link from "next/link";
import {
  Badge,
  CardContent,
  CardHeader,
  CardTitle,
  MotionCard,
  Progress,
  StaggerGrid,
  StaggerItem,
} from "@kanada/ui";
import { requireRole } from "@/lib/session";
import { getStudentDashboard } from "@/lib/queries";

export default async function StudentDashboardPage() {
  const user = await requireRole(["STUDENT"]);
  const items = await getStudentDashboard(user.id);

  return (
    <div>
      <h1 className="text-2xl font-bold">My Learning</h1>
      <p className="mt-1 text-muted-foreground">
        {items.length} course{items.length === 1 ? "" : "s"} enrolled
      </p>

      {items.length === 0 ? (
        <p className="mt-8 text-muted-foreground">
          You haven&apos;t enrolled in any courses yet.{" "}
          <Link href="/courses" className="text-primary hover:underline">
            Browse the catalog
          </Link>
          .
        </p>
      ) : (
        <StaggerGrid className="mt-8 grid gap-4 sm:grid-cols-2">
          {items.map(({ course, percent, completedLessons, totalLessons }) => (
            <StaggerItem key={course.id}>
              <Link href={`/student/courses/${course.slug}/learn`}>
                <MotionCard className="h-full">
                  <CardHeader>
                    {course.category && <Badge variant="secondary">{course.category}</Badge>}
                    <CardTitle className="mt-1 line-clamp-2">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={percent} />
                    <p className="mt-2 text-sm text-muted-foreground">
                      {completedLessons}/{totalLessons} lessons complete ({percent}%)
                    </p>
                  </CardContent>
                </MotionCard>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGrid>
      )}
    </div>
  );
}
