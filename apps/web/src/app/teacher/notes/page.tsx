import Link from "next/link";
import { FileText } from "lucide-react";
import { requireRole } from "@/lib/session";
import { getTeacherCourseOptions, getTeacherNotes } from "@/lib/teacher-queries";
import { EmptyState, PageHeader, Panel } from "@/components/teacher/ui";
import { NoteUploadForm } from "@/components/teacher/note-upload-form";
import { NoteItem } from "@/components/teacher/note-item";

export default async function TeacherNotesPage({ searchParams }: { searchParams: Promise<{ course?: string }> }) {
  const user = await requireRole(["TEACHER"]);
  const { course } = await searchParams;
  const [courses, notes] = await Promise.all([getTeacherCourseOptions(user.id), getTeacherNotes(user.id)]);
  const filtered = course ? notes.filter((n) => n.courseId === course) : notes;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Teach"
        title="Notes & materials"
        description="Share PDFs, Word documents, slides and sheets. Only students with access to the course can download them."
      />

      {courses.length === 0 ? (
        <EmptyState icon={FileText} title="Create a course first">
          Notes are attached to a course. <Link href="/teacher/courses/new" className="text-primary hover:underline">Create one</Link>.
        </EmptyState>
      ) : (
        <Panel title="Upload notes">
          <NoteUploadForm courses={courses} />
        </Panel>
      )}

      <Panel
        title={`Library (${filtered.length})`}
        action={
          courses.length > 1 && (
            <form method="get" className="flex items-center gap-2">
              <label htmlFor="notes-filter" className="sr-only">Filter by course</label>
              <select id="notes-filter" name="course" defaultValue={course ?? ""} className="h-9 rounded-xl border border-input bg-card px-3 text-sm">
                <option value="">All courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              <button type="submit" className="h-9 rounded-full border border-border px-3 text-sm font-medium hover:border-primary/40">Filter</button>
            </form>
          )
        }
      >
        {filtered.length === 0 ? (
          <EmptyState icon={FileText} title="No notes uploaded yet">Upload your first document above.</EmptyState>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((n) => (
              <NoteItem key={n.id} note={n} />
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
