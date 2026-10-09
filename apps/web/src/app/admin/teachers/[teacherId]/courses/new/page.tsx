import { adminTeacherWorkspace } from "@/lib/workspace";
import { NewCourseView } from "@/components/teacher/views/new-course";

export default async function Page({ params }: { params: Promise<{ teacherId: string }> }) {
  const { teacherId } = await params;
  return <NewCourseView ws={await adminTeacherWorkspace(teacherId)}  />;
}
