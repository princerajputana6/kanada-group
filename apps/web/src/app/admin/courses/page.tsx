import { getAdminStats } from "@/lib/queries";
import { CoursesTable, type AdminCourseRow } from "@/components/admin/courses-table";

export default async function AdminCoursesPage() {
  const { courses } = await getAdminStats();

  const rows: AdminCourseRow[] = courses.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    teacherName: c.teacher.name,
    students: c.enrollments.length,
    published: c.published,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold">Courses</h1>
      <div className="mt-6">
        <CoursesTable courses={rows} />
      </div>
    </div>
  );
}
