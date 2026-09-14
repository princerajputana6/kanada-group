import Link from "next/link";
import { listPublishedCourses } from "@/lib/queries";
import { getDb } from "@/lib/db";
import { CourseCard } from "@/components/course-card";
import { Hero } from "@/components/hero";
import { Reveal } from "@/components/motion-primitives";
import {
  MarqueeSection,
  StatsSection,
  TracksSection,
  SiliconSection,
  RoadmapSection,
  FeaturesSection,
  TestimonialsSection,
  CtaSection,
} from "@/components/landing-sections";

export default async function HomePage() {
  const courses = await listPublishedCourses();
  const featured = courses.slice(0, 6);

  const db = await getDb();
  const teacherCount = (
    await db.query.users.findMany({ where: (u, { eq }) => eq(u.role, "TEACHER") })
  ).length;

  return (
    <div>
      <Hero
        courses={courses.map((c) => ({
          slug: c.slug,
          title: c.title,
          description: c.description,
          category: c.category,
          level: c.level,
        }))}
        stats={{ courses: courses.length, teachers: teacherCount, students: 0 }}
      />

      <MarqueeSection />
      <StatsSection />

      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Featured <span className="text-gradient">courses</span>
            </h2>
            <p className="mt-2 text-muted-foreground">
              Hand-picked courses from across the VLSI curriculum.
            </p>
          </div>
          <Link
            href="/courses"
            className="hidden shrink-0 text-sm font-medium text-primary hover:underline sm:block"
          >
            View all →
          </Link>
        </Reveal>

        {featured.length === 0 ? (
          <p className="text-muted-foreground">
            No courses are published yet — check back soon.
          </p>
        ) : (
          <div className="reveal-stagger grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>

      <TracksSection />
      <SiliconSection />
      <RoadmapSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CtaSection />
    </div>
  );
}
