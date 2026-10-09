import { teacherSelfWorkspace } from "@/lib/workspace";
import { OverviewView } from "@/components/teacher/views/overview";

export default async function Page() {
  return <OverviewView ws={await teacherSelfWorkspace()}  />;
}
