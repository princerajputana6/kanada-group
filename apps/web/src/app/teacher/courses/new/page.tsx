import { teacherSelfWorkspace } from "@/lib/workspace";
import { NewCourseView } from "@/components/teacher/views/new-course";

export default async function Page() {
  return <NewCourseView ws={await teacherSelfWorkspace()}  />;
}
