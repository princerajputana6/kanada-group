import Link from "next/link";
import {
  Badge,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  MotionCard,
  StaggerItem,
} from "@kanada/ui";

export interface CourseCardData {
  slug: string;
  title: string;
  description: string;
  category: string | null;
  level: string;
  teacher: { name: string };
  enrollments: unknown[];
  reviews: { rating: number }[];
}

export function CourseCard({ course }: { course: CourseCardData }) {
  const avgRating =
    course.reviews.length > 0
      ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length
      : null;

  return (
    <StaggerItem>
      <Link href={`/courses/${course.slug}`}>
        <MotionCard className="h-full">
          <CardHeader>
            <div className="mb-1 flex items-center gap-2">
              {course.category && <Badge variant="secondary">{course.category}</Badge>}
              <Badge variant="outline">{course.level}</Badge>
            </div>
            <CardTitle className="line-clamp-2">{course.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="line-clamp-3 text-sm text-muted-foreground">{course.description}</p>
          </CardContent>
          <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{course.teacher.name}</span>
            <span>
              {course.enrollments.length} student{course.enrollments.length === 1 ? "" : "s"}
              {avgRating ? ` · ★ ${avgRating.toFixed(1)}` : ""}
            </span>
          </CardFooter>
        </MotionCard>
      </Link>
    </StaggerItem>
  );
}
