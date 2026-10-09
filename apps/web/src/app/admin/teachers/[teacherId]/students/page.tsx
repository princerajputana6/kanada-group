import { adminTeacherWorkspace } from "@/lib/workspace";
import { StudentsView } from "@/components/teacher/views/students";

export default async function Page({ params, searchParams }: { params: Promise<{ teacherId: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { teacherId } = await params;
  return <StudentsView ws={await adminTeacherWorkspace(teacherId)} searchParams={searchParams} />;
}
