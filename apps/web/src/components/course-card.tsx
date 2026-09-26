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
  thumbnailUrl?: string | null;
  category: string | null;
  level: string;
  teacher: { name: string };
  enrollments: unknown[];
  reviews: { rating: number }[];
}

/** Deterministic hue per course so placeholder art is stable and varied. */
function hueFor(slug: string) {
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return 240 + (h % 70); // stays in the violet → blue → cyan band
}

function CourseArt({ course }: { course: CourseCardData }) {
  if (course.thumbnailUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote R2/CDN thumbnails; no image optimizer on Workers
      <img
        data-card-media
        src={course.thumbnailUrl}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover/course:scale-[1.04]"
      />
    );
  }
  const hue = hueFor(course.slug);
  return (
    <div
      aria-hidden="true"
      className="theme-dark relative h-full w-full transition-transform duration-700 ease-out-expo group-hover/course:scale-[1.04]"
      style={{
        background: `radial-gradient(circle at 25% 30%, hsl(${hue} 85% 60% / 0.45), transparent 60%), radial-gradient(circle at 80% 80%, hsl(${hue - 60} 90% 55% / 0.25), transparent 55%), #0a0a0d`,
      }}
    >
      <div className="background-grid absolute inset-0 opacity-70 [background-size:28px_28px] [mask-image:none]" />
      <span className="absolute bottom-3 right-4 font-mono text-[10px] tracking-[0.2em] text-white/40">
        {course.level}
      </span>
    </div>
  );
}

export function CourseCard({ course }: { course: CourseCardData }) {
  const avgRating =
    course.reviews.length > 0
      ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length
      : null;

  return (
    <StaggerItem>
      <Link href={`/courses/${course.slug}`} className="group/course block h-full rounded-3xl">
        <MotionCard className="flex h-full flex-col overflow-hidden">
          <div className="aspect-[16/9] overflow-hidden border-b border-border">
            <CourseArt course={course} />
          </div>
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
          <CardFooter className="mt-auto flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
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
