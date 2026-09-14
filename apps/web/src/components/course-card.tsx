import Link from "next/link";
import { Badge } from "@kanada/ui";
import { RevealItem, SpotlightCard } from "./motion-primitives";

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

const CATEGORY_STYLE: Record<string, { gradient: string; icon: string }> = {
  Foundations: { gradient: "from-indigo-500/40 via-violet-500/25 to-purple-500/20", icon: "⚛" },
  "Digital VLSI": { gradient: "from-blue-500/40 via-cyan-500/25 to-sky-500/20", icon: "⬡" },
  "Analog VLSI": { gradient: "from-fuchsia-500/40 via-pink-500/25 to-purple-500/20", icon: "∿" },
};

export function CourseCard({ course }: { course: CourseCardData }) {
  const avgRating =
    course.reviews.length > 0
      ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length
      : null;

  const style = (course.category ? CATEGORY_STYLE[course.category] : undefined) ?? {
    gradient: "from-primary/40 via-primary/20 to-accent/20",
    icon: "◆",
  };

  return (
    <RevealItem className="h-full">
      <Link href={`/courses/${course.slug}`} className="block h-full">
        <SpotlightCard className="flex h-full flex-col rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-[0_20px_50px_-20px_hsl(255_92%_68%_/_0.5)]">
          {/* Gradient thumbnail */}
          <div
            className={`relative flex h-32 items-center justify-center overflow-hidden rounded-t-2xl bg-gradient-to-br ${style.gradient}`}
          >
            <span className="text-6xl opacity-40 transition-transform duration-500 group-hover:scale-110">
              {style.icon}
            </span>
            <div className="absolute left-3 top-3 flex gap-2">
              {course.category && <Badge variant="secondary">{course.category}</Badge>}
            </div>
            <Badge variant="outline" className="absolute right-3 top-3 glass">
              {course.level}
            </Badge>
          </div>

          <div className="flex flex-1 flex-col p-5">
            <h3 className="line-clamp-2 font-semibold leading-snug">{course.title}</h3>
            <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
              {course.description}
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
              <span className="truncate">{course.teacher.name}</span>
              <span className="whitespace-nowrap">
                {course.enrollments.length} 👥
                {avgRating ? ` · ${avgRating.toFixed(1)} ★` : ""}
              </span>
            </div>
          </div>
        </SpotlightCard>
      </Link>
    </RevealItem>
  );
}
