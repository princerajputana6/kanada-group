import { ExternalLink, FileText, PlayCircle, Radio } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { getCourseLearningExtras } from "@/lib/teacher-queries";
import { NoteItem } from "@/components/teacher/note-item";
import { UpcomingClassesList } from "./upcoming-classes";

/** Live classes, recordings and notes for a course the student can access. */
export async function CourseExtras({ courseId }: { courseId: string }) {
  const { upcomingClasses, pastRecordings, notes } = await getCourseLearningExtras(courseId);
  if (upcomingClasses.length === 0 && pastRecordings.length === 0 && notes.length === 0) return null;

  return (
    <div className="mt-10 space-y-6">
      {upcomingClasses.length > 0 && (
        <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold">
            <Radio className="h-5 w-5 text-primary" aria-hidden="true" /> Live classes
          </h2>
          <UpcomingClassesList classes={upcomingClasses} showCourse={false} />
        </section>
      )}

      {notes.length > 0 && (
        <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold">
            <FileText className="h-5 w-5 text-primary" aria-hidden="true" /> Notes &amp; materials
          </h2>
          <ul className="divide-y divide-border">
            {notes.map((n) => (
              <NoteItem key={n.id} note={n} showCourse={false} canDelete={false} />
            ))}
          </ul>
        </section>
      )}

      {pastRecordings.length > 0 && (
        <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold">
            <PlayCircle className="h-5 w-5 text-primary" aria-hidden="true" /> Class recordings
          </h2>
          <ul className="divide-y divide-border">
            {pastRecordings.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{c.title}</p>
                  <p className="text-muted-foreground">{formatDate(c.startsAt)}</p>
                </div>
                <a href={c.recordingUrl!} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1 font-medium text-primary hover:underline">
                  Watch <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
