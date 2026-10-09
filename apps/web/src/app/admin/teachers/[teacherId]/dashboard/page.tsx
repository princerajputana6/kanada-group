import { adminTeacherWorkspace } from "@/lib/workspace";
import { OverviewView } from "@/components/teacher/views/overview";

export default async function Page({ params }: { params: Promise<{ teacherId: string }> }) {
  const { teacherId } = await params;
  return <OverviewView ws={await adminTeacherWorkspace(teacherId)}  />;
}
