import type { Workspace } from "@/lib/workspace";
import Link from "next/link";
import { History, Radio } from "lucide-react";
import { getTeacherCourseOptions, getTeacherLiveClasses } from "@/lib/teacher-queries";
import { EmptyState, PageHeader, Panel } from "@/components/teacher/ui";
import { LiveClassItem } from "@/components/teacher/live-class-item";
import { ScheduleClassForm } from "@/components/teacher/schedule-class-form";

export async function LiveView({ ws, searchParams }: { ws: Workspace; searchParams: Promise<{ course?: string }> }) {
  const { course } = await searchParams;
  const [courses, { upcoming, past }] = await Promise.all([
    getTeacherCourseOptions(ws.teacherId),
    getTeacherLiveClasses(ws.teacherId),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Teach"
        title="Live classes"
        description="Schedule sessions on Google Meet, Zoom or Teams. Students with access see them on their dashboard and get an email; the Join button opens 15 minutes before start."
      />

      {courses.length === 0 ? (
        <EmptyState icon={Radio} title="Create a course first">
          Live classes belong to a course. <Link href={`${ws.base}/courses/new`} className="text-primary hover:underline">Create one</Link>.
        </EmptyState>
      ) : (
        <Panel title="Schedule a class">
          <ScheduleClassForm courses={courses} defaultCourseId={courses.some((c) => c.id === course) ? course : undefined} />
        </Panel>
      )}

      <Panel title={`Upcoming (${upcoming.length})`}>
        {upcoming.length === 0 ? (
          <EmptyState icon={Radio} title="Nothing scheduled">Your next live class will appear here.</EmptyState>
        ) : (
          <ul className="space-y-3">
            {upcoming.map((c) => (
              <LiveClassItem key={c.id} cls={c} />
            ))}
          </ul>
        )}
      </Panel>

      <Panel title={`Past & cancelled (${past.length})`}>
        {past.length === 0 ? (
          <EmptyState icon={History} title="No past classes yet">Add recording links here after each class.</EmptyState>
        ) : (
          <ul className="space-y-3">
            {past.map((c) => (
              <LiveClassItem key={c.id} cls={c} />
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
