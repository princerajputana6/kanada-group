import { teacherSelfWorkspace } from "@/lib/workspace";
import { LiveView } from "@/components/teacher/views/live";

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  return <LiveView ws={await teacherSelfWorkspace()} searchParams={searchParams} />;
}
