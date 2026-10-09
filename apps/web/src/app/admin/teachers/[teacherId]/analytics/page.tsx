import { adminTeacherWorkspace } from "@/lib/workspace";
import { AnalyticsView } from "@/components/teacher/views/analytics";

export default async function Page({ params }: { params: Promise<{ teacherId: string }> }) {
  const { teacherId } = await params;
  return <AnalyticsView ws={await adminTeacherWorkspace(teacherId)}  />;
}
