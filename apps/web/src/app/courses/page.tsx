import { Input } from "@kanada/ui";
import { listPublishedCourses } from "@/lib/queries";
import { CourseCard } from "@/components/course-card";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const courses = await listPublishedCourses({ search: q, category });

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary/10 to-transparent" />
      <div className="relative mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl font-bold sm:text-5xl">
          All <span className="text-gradient">courses</span>
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Browse Kanada Group&apos;s complete VLSI training catalog — foundations, digital, and
          analog tracks.
        </p>

        <form className="mt-6 max-w-md" method="get">
          <Input type="search" name="q" placeholder="Search courses…" defaultValue={q ?? ""} />
        </form>

        {courses.length === 0 ? (
          <p className="mt-12 text-muted-foreground">No courses match your search.</p>
        ) : (
          <div className="reveal-stagger mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
