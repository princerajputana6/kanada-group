import {
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kanada/ui";
import { requireRole } from "@/lib/session";
import { getTeacherStudents } from "@/lib/queries";

export default async function TeacherStudentsPage() {
  const user = await requireRole(["TEACHER"]);
  const students = await getTeacherStudents(user.id);

  return (
    <div>
      <h1 className="text-2xl font-bold">Students</h1>
      <p className="mt-1 text-muted-foreground">
        {students.length} student{students.length === 1 ? "" : "s"} across your courses
      </p>

      <div className="mt-6">
        {students.length === 0 ? (
          <p className="text-sm text-muted-foreground">No students enrolled yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Enrolled courses</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map(({ student, courses }) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar name={student.name} src={student.image} />
                      <span className="font-medium">{student.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{student.email}</TableCell>
                  <TableCell className="text-muted-foreground">{courses.join(", ")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
