import { adminTeacherWorkspace } from "@/lib/workspace";
import { NotesView } from "@/components/teacher/views/notes";

export default async function Page({ params, searchParams }: { params: Promise<{ teacherId: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { teacherId } = await params;
  return <NotesView ws={await adminTeacherWorkspace(teacherId)} searchParams={searchParams} />;
}
