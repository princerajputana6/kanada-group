import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { GlowBackground } from "@/components/ui/GlowBackground";

export interface PlatformStats {
  courses: number;
  enrollments: number;
  instructors: number;
  avgRating: number | null;
}

/** Live platform numbers, derived from the published catalog — never hard-coded. */
export function Stats({ stats }: { stats: PlatformStats }) {
  const items = [
    { value: stats.courses, label: "Published courses" },
    { value: 20, label: "Weeks of training" },
    { value: 10, suffix: "+", label: "Instructors" },
    stats.avgRating !== null
      ? { value: stats.avgRating, decimals: 1, suffix: "★", label: "Average rating" }
      : { value: 100, suffix: "%", label: "Free to enroll" },
  ];

  return (
    <section aria-label="Platform in numbers" className="relative overflow-hidden px-4 py-28 sm:px-8 md:py-36">
      <GlowBackground variant="section" />
      <dl className="relative mx-auto grid max-w-container grid-cols-2 gap-y-14 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex flex-col-reverse gap-3 border-border px-2 sm:px-8 lg:border-l lg:first:border-l-0"
          >
            <dt className="text-sm text-muted-foreground">{item.label}</dt>
            <dd className="font-display text-[clamp(3rem,7vw,6rem)] font-bold leading-none tracking-[-0.05em] text-foreground">
              <AnimatedCounter value={item.value} decimals={item.decimals} suffix={item.suffix} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
