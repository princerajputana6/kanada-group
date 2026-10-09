import { teacherSelfWorkspace } from "@/lib/workspace";
import { StudentsView } from "@/components/teacher/views/students";

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  return <StudentsView ws={await teacherSelfWorkspace()} searchParams={searchParams} />;
}
