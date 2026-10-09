import { adminTeacherWorkspace } from "@/lib/workspace";
import { CourseEditorView } from "@/components/teacher/views/course-editor";

export default async function Page({ params, searchParams }: { params: Promise<{ teacherId: string; id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { teacherId, id } = await params;
  return <CourseEditorView ws={await adminTeacherWorkspace(teacherId)} params={Promise.resolve({ id })} searchParams={searchParams} />;
}
