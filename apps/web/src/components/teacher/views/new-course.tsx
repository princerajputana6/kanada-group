import type { Workspace } from "@/lib/workspace";
import { CourseForm } from "@/components/course-form";
import { createCourseAction } from "@/actions/course-actions";
import { PageHeader } from "@/components/teacher/ui";

export function NewCourseView({ ws }: { ws: Workspace }) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Teach"
        title="Create a new course"
        description={
          ws.isAdmin
            ? `This course will belong to ${ws.teacherName}. Add sections, lessons, notes and live classes after creating it.`
            : "You can add sections, lessons, videos, notes and live classes after creating the course."
        }
      />
      <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--glass-shadow)]">
        <CourseForm
          action={createCourseAction}
          submitLabel="Create course"
          hiddenFields={ws.isAdmin ? { teacherId: ws.teacherId } : undefined}
        />
      </div>
    </div>
  );
}
