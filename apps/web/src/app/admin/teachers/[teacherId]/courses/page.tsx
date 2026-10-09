import { adminTeacherWorkspace } from "@/lib/workspace";
import { CoursesView } from "@/components/teacher/views/courses";

export default async function Page({ params }: { params: Promise<{ teacherId: string }> }) {
  const { teacherId } = await params;
  return <CoursesView ws={await adminTeacherWorkspace(teacherId)}  />;
}
