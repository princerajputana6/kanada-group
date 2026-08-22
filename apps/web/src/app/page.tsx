import Link from "next/link";
import { StaggerGrid } from "@kanada/ui";
import { listPublishedCourses } from "@/lib/queries";
import { CourseCard } from "@/components/course-card";
import { Hero } from "@/components/hero";

export default async function HomePage() {
  const courses = await listPublishedCourses();
  const featured = courses.slice(0, 6);

  return (
    <div>
      <Hero />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Featured courses</h2>
          <Link href="/courses" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="text-muted-foreground">
            No courses are published yet — check back soon.
          </p>
        ) : (
          <StaggerGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </StaggerGrid>
        )}
      </section>
    </div>
  );
}
