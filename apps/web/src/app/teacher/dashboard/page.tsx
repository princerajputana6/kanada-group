import Link from "next/link";
import {
  Badge,
  CardContent,
  CardHeader,
  CardTitle,
  MotionCard,
  StaggerGrid,
  StaggerItem,
} from "@kanada/ui";
import { requireRole } from "@/lib/session";
import { getTeacherCourses } from "@/lib/queries";

export default async function TeacherDashboardPage() {
  const user = await requireRole(["TEACHER"]);
  const courses = await getTeacherCourses(user.id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Courses</h1>
        <Link href="/teacher/courses/new" className="text-sm font-medium text-primary hover:underline">
          + New course
        </Link>
      </div>

      {courses.length === 0 ? (
        <p className="mt-8 text-muted-foreground">
          You haven&apos;t created any courses yet.
        </p>
      ) : (
        <StaggerGrid className="mt-8 grid gap-4 sm:grid-cols-2">
          {courses.map((course) => {
            const lessonCount = course.sections.reduce((n, s) => n + s.lessons.length, 0);
            return (
              <StaggerItem key={course.id}>
                <Link href={`/teacher/courses/${course.id}/edit`}>
                  <MotionCard className="h-full">
                    <CardHeader>
                      <Badge variant={course.published ? "success" : "outline"}>
                        {course.published ? "Published" : "Draft"}
                      </Badge>
                      <CardTitle className="mt-1 line-clamp-2">{course.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      {course.enrollments.length} student{course.enrollments.length === 1 ? "" : "s"}
                      {" · "}
                      {lessonCount} lesson{lessonCount === 1 ? "" : "s"}
                    </CardContent>
                  </MotionCard>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerGrid>
      )}
    </div>
  );
}
