import { Input, StaggerGrid } from "@kanada/ui";
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
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold">All courses</h1>
      <p className="mt-2 text-muted-foreground">
        Browse Kanada Group&apos;s VLSI training catalog.
      </p>

      <form className="mt-6 max-w-md" method="get">
        <Input type="search" name="q" placeholder="Search courses…" defaultValue={q ?? ""} />
      </form>

      {courses.length === 0 ? (
        <p className="mt-12 text-muted-foreground">No courses match your search.</p>
      ) : (
        <StaggerGrid className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </StaggerGrid>
      )}
    </div>
  );
}
