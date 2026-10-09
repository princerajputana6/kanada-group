import { teacherSelfWorkspace } from "@/lib/workspace";
import { AnalyticsView } from "@/components/teacher/views/analytics";

export default async function Page() {
  return <AnalyticsView ws={await teacherSelfWorkspace()}  />;
}
