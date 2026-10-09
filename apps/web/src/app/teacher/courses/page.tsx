import { teacherSelfWorkspace } from "@/lib/workspace";
import { CoursesView } from "@/components/teacher/views/courses";

export default async function Page() {
  return <CoursesView ws={await teacherSelfWorkspace()}  />;
}
