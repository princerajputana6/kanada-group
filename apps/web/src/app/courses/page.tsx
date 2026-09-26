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
    <div className="mx-auto max-w-container px-4 pb-12 pt-16 sm:px-8 md:pt-24">
      <p className="eyebrow mb-6">Catalog</p>
      <h1 className="text-section text-foreground">All courses</h1>
      <p className="mt-5 max-w-xl text-muted-foreground md:text-lg">
        Browse Kanada Group&apos;s VLSI training catalog.
      </p>

      <form className="mt-10 max-w-md" method="get" role="search">
        <Input
          type="search"
          name="q"
          aria-label="Search courses"
          placeholder="Search courses…"
          defaultValue={q ?? ""}
          className="h-12 rounded-full px-5"
        />
      </form>

      {courses.length === 0 ? (
        <p className="mt-12 text-muted-foreground">No courses match your search.</p>
      ) : (
        <StaggerGrid className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </StaggerGrid>
      )}
    </div>
  );
}
