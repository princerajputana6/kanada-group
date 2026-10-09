import { teacherSelfWorkspace } from "@/lib/workspace";
import { CourseEditorView } from "@/components/teacher/views/course-editor";

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { id } = await params;
  return <CourseEditorView ws={await teacherSelfWorkspace()} params={Promise.resolve({ id })} searchParams={searchParams} />;
}
