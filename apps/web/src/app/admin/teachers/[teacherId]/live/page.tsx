import { adminTeacherWorkspace } from "@/lib/workspace";
import { LiveView } from "@/components/teacher/views/live";

export default async function Page({ params, searchParams }: { params: Promise<{ teacherId: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { teacherId } = await params;
  return <LiveView ws={await adminTeacherWorkspace(teacherId)} searchParams={searchParams} />;
}
