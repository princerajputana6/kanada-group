import Link from "next/link";
import { Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@kanada/ui";
import { getAdminStats } from "@/lib/queries";
import { setCoursePublishedAction } from "@/actions/admin-actions";

export default async function AdminCoursesPage() {
  const { courses } = await getAdminStats();

  return (
    <div>
      <h1 className="text-2xl font-bold">Courses</h1>
      <div className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">
                  <Link href={`/courses/${course.slug}`} className="hover:underline">
                    {course.title}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{course.teacher.name}</TableCell>
                <TableCell className="text-muted-foreground">{course.enrollments.length}</TableCell>
                <TableCell>
                  <Badge variant={course.published ? "success" : "outline"}>
                    {course.published ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <form
                    action={async () => {
                      "use server";
                      await setCoursePublishedAction(course.id, !course.published);
                    }}
                  >
                    <Button type="submit" size="sm" variant="ghost">
                      {course.published ? "Unpublish" : "Publish"}
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
