import { StaggerGrid } from "@kanada/ui";
import { listPublishedCourses } from "@/lib/queries";
import { CourseCard } from "@/components/course-card";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { LogoMarquee } from "@/components/ui/LogoMarquee";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CTA } from "@/components/sections/CTA";
import { Hero } from "@/components/sections/Hero";
import { Intro } from "@/components/sections/Intro";
import { Platform } from "@/components/sections/Platform";
import { Stats, type PlatformStats } from "@/components/sections/Stats";
import { Tracks } from "@/components/sections/Tracks";

const TOPICS = [
  "CMOS",
  "FinFET",
  "Verilog",
  "SystemVerilog",
  "UVM",
  "Static timing analysis",
  "Floorplanning",
  "Clock tree synthesis",
  "DRC / LVS",
  "Op-amps",
  "PLLs",
  "Data converters",
  "Layout",
  "Low-power design",
];

export default async function HomePage() {
  const courses = await listPublishedCourses();
  const featured = courses.slice(0, 6);

  const ratings = courses.flatMap((c) => c.reviews.map((r) => r.rating));
  const stats: PlatformStats = {
    courses: courses.length,
    enrollments: courses.reduce((sum, c) => sum + c.enrollments.length, 0),
    instructors: new Set(courses.map((c) => c.teacherId)).size,
    avgRating: ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
  };

  return (
    <div>
      <Hero />
      <Intro />
      <Tracks />

      <LogoMarquee
        label="Topics covered"
        className="theme-dark border-t border-white/[0.06] bg-background py-8"
        items={TOPICS.map((t) => (
          <span key={t} className="font-display text-xl font-semibold tracking-tight md:text-2xl">
            {t}
          </span>
        ))}
      />

      <Stats stats={stats} />

      <section aria-labelledby="featured-title" className="px-4 py-28 sm:px-8 md:py-36">
        <div className="mx-auto max-w-container">
          <div className="mb-14 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="Featured courses"
              title={["Start learning", "today."]}
            />
            <AnimatedButton href="/courses" variant="secondary" className="self-start md:self-auto">
              View all courses
            </AnimatedButton>
          </div>

          {featured.length === 0 ? (
            <p className="text-muted-foreground">
              No courses are published yet — check back soon.
            </p>
          ) : (
            <StaggerGrid inView className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((course) => (
                <CourseCard key={course.id} course={course} showStudents={false} />
              ))}
            </StaggerGrid>
          )}
        </div>
      </section>

      <Platform />
      <CTA />
    </div>
  );
}
