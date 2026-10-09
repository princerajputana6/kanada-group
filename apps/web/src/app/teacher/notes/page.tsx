import { teacherSelfWorkspace } from "@/lib/workspace";
import { NotesView } from "@/components/teacher/views/notes";

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  return <NotesView ws={await teacherSelfWorkspace()} searchParams={searchParams} />;
}
