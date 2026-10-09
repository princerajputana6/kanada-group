import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge, Button, Input, Progress, Textarea, cn } from "@kanada/ui";
import { FileText, Radio, Users } from "lucide-react";
import { getTeacherLiveClasses, getTeacherNotes, getTeacherStudentProgress } from "@/lib/teacher-queries";
import { EmptyState, Panel } from "@/components/teacher/ui";
import { LiveClassItem } from "@/components/teacher/live-class-item";
import { ScheduleClassForm } from "@/components/teacher/schedule-class-form";
import { NoteUploadForm } from "@/components/teacher/note-upload-form";
import { NoteItem } from "@/components/teacher/note-item";
import { requireRole } from "@/lib/session";
import { getCourseForEdit } from "@/lib/queries";
import { formatDuration } from "@/lib/utils";
import { CourseForm } from "@/components/course-form";
import { AddLessonForm } from "@/components/add-lesson-form";
import { VideoUploadWidget } from "@/components/video-upload-widget";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import {
  createSectionAction,
  deleteCourseAction,
  deleteLessonAction,
  deleteSectionAction,
  moveLessonAction,
  moveSectionAction,
  togglePublishAction,
  updateCourseAction,
  updateLessonAction,
  updateSectionAction,
} from "@/actions/course-actions";

const TABS = [
  { id: "curriculum", label: "Curriculum" },
  { id: "details", label: "Details" },
  { id: "live", label: "Live classes" },
  { id: "notes", label: "Notes" },
  { id: "students", label: "Students" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export default async function EditCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await requireRole(["TEACHER"]);
  const { id } = await params;
  const { tab: rawTab } = await searchParams;
  const tab: Tab = TABS.some((t) => t.id === rawTab) ? (rawTab as Tab) : "curriculum";
  const course = await getCourseForEdit(id, user.id);
  if (!course) notFound();

  const [live, notes, studentRows] = await Promise.all([
    tab === "live" ? getTeacherLiveClasses(user.id, course.id) : null,
    tab === "notes" ? getTeacherNotes(user.id, course.id) : null,
    tab === "students" ? getTeacherStudentProgress(user.id) : null,
  ]);
  const lessonCount = course.sections.reduce((n, s) => n + s.lessons.length, 0);

  return (
    <div className="space-y-6">
      <Link href="/teacher/courses" className="text-sm text-muted-foreground hover:text-foreground">
        ← My courses
      </Link>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant={course.published ? "success" : "outline"}>
              {course.published ? "Published" : "Draft"}
            </Badge>
            <Link href={`/courses/${course.slug}`} className="text-sm text-primary hover:underline">
              View public page
            </Link>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">{course.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {course.sections.length} section{course.sections.length === 1 ? "" : "s"} · {lessonCount} lesson{lessonCount === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex gap-2">
          <form action={togglePublishAction.bind(null, course.id)}>
            <Button type="submit" variant="outline" size="sm">
              {course.published ? "Unpublish" : "Publish"}
            </Button>
          </form>
          <form action={deleteCourseAction.bind(null, course.id)}>
            <ConfirmSubmitButton
              confirmText="Delete this course and all its content? This cannot be undone."
              variant="destructive"
              size="sm"
            >
              Delete
            </ConfirmSubmitButton>
          </form>
        </div>
      </div>

      <nav aria-label="Course sections" className="-mx-1 overflow-x-auto border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex w-max gap-1 px-1">
          {TABS.map((t) => (
            <li key={t.id}>
              <Link
                href={`/teacher/courses/${course.id}/edit${t.id === "curriculum" ? "" : `?tab=${t.id}`}`}
                aria-current={tab === t.id ? "page" : undefined}
                className={cn(
                  "-mb-px inline-block border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                  tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {tab === "details" && (
      <section className="max-w-3xl">
        <h2 className="mb-4 text-lg font-semibold">Course details</h2>
        <CourseForm
          action={updateCourseAction.bind(null, course.id)}
          defaultValues={{
            title: course.title,
            description: course.description,
            category: course.category,
            level: course.level,
          }}
          submitLabel="Save details"
        />
      </section>

      )}

      {tab === "curriculum" && (
      <section className="max-w-3xl">
        <h2 className="mb-4 text-lg font-semibold">Curriculum</h2>
        <div className="space-y-6">
          {course.sections.map((section, sIndex) => (
            <div key={section.id} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between gap-2">
                <form
                  action={updateSectionAction.bind(null, section.id)}
                  className="flex flex-1 items-center gap-2"
                >
                  <span className="text-sm text-muted-foreground">{sIndex + 1}.</span>
                  <Input name="title" defaultValue={section.title} className="h-8 max-w-xs text-sm font-medium" />
                  <Button type="submit" size="sm" variant="outline">
                    Save
                  </Button>
                </form>
                <div className="flex items-center gap-1">
                  <form action={moveSectionAction.bind(null, section.id, "up")}>
                    <Button type="submit" variant="ghost" size="sm" disabled={sIndex === 0}>
                      ↑
                    </Button>
                  </form>
                  <form action={moveSectionAction.bind(null, section.id, "down")}>
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      disabled={sIndex === course.sections.length - 1}
                    >
                      ↓
                    </Button>
                  </form>
                  <form action={deleteSectionAction.bind(null, section.id)}>
                    <ConfirmSubmitButton
                      confirmText="Delete this section and its lessons?"
                      variant="ghost"
                      size="sm"
                    >
                      Delete
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </div>

              <ul className="mt-3 space-y-3">
                {section.lessons.map((lesson, lIndex) => (
                  <li key={lesson.id} className="rounded-md bg-secondary/40 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <form
                        action={updateLessonAction.bind(null, lesson.id)}
                        className="flex-1 space-y-2"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Input
                            name="title"
                            defaultValue={lesson.title}
                            className="h-8 max-w-xs text-sm"
                          />
                          <input type="hidden" name="type" value={lesson.type} />
                          <Badge variant="outline">{lesson.type}</Badge>
                          <label className="flex items-center gap-1 text-xs text-muted-foreground">
                            <input
                              type="checkbox"
                              name="isPreview"
                              defaultChecked={lesson.isPreview}
                            />
                            Preview
                          </label>
                          <Button type="submit" size="sm" variant="outline">
                            Save
                          </Button>
                        </div>
                        {lesson.type === "TEXT" && (
                          <Textarea
                            name="content"
                            defaultValue={lesson.content ?? ""}
                            rows={3}
                            className="text-sm"
                          />
                        )}
                      </form>
                      <div className="flex shrink-0 items-center gap-1">
                        <form action={moveLessonAction.bind(null, lesson.id, "up")}>
                          <Button type="submit" variant="ghost" size="sm" disabled={lIndex === 0}>
                            ↑
                          </Button>
                        </form>
                        <form action={moveLessonAction.bind(null, lesson.id, "down")}>
                          <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            disabled={lIndex === section.lessons.length - 1}
                          >
                            ↓
                          </Button>
                        </form>
                        <form action={deleteLessonAction.bind(null, lesson.id)}>
                          <ConfirmSubmitButton
                            confirmText="Delete this lesson?"
                            variant="ghost"
                            size="sm"
                          >
                            Delete
                          </ConfirmSubmitButton>
                        </form>
                      </div>
                    </div>

                    {lesson.type === "VIDEO" && (
                      <div className="mt-2">
                        {lesson.videoKey ? (
                          <p className="text-xs text-muted-foreground">
                            ✓ Video uploaded ({formatDuration(lesson.durationSeconds)}) —
                            upload again to replace it.
                          </p>
                        ) : null}
                        <VideoUploadWidget lessonId={lesson.id} />
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              <AddLessonForm sectionId={section.id} />
            </div>
          ))}
        </div>

        <form action={createSectionAction.bind(null, course.id)} className="mt-6 flex gap-2">
          <Input name="title" placeholder="New section title" required className="max-w-xs" />
          <Button type="submit" variant="outline">
            Add section
          </Button>
        </form>
      </section>
      )}

      {tab === "live" && live && (
        <div className="space-y-6">
          <Panel title="Schedule a class for this course">
            <ScheduleClassForm courses={[{ id: course.id, title: course.title }]} defaultCourseId={course.id} />
          </Panel>
          <Panel title={`Upcoming (${live.upcoming.length})`}>
            {live.upcoming.length === 0 ? (
              <EmptyState icon={Radio} title="Nothing scheduled" />
            ) : (
              <ul className="space-y-3">{live.upcoming.map((c) => <LiveClassItem key={c.id} cls={c} showCourse={false} />)}</ul>
            )}
          </Panel>
          {live.past.length > 0 && (
            <Panel title={`Past & cancelled (${live.past.length})`}>
              <ul className="space-y-3">{live.past.map((c) => <LiveClassItem key={c.id} cls={c} showCourse={false} />)}</ul>
            </Panel>
          )}
        </div>
      )}

      {tab === "notes" && notes && (
        <div className="space-y-6">
          <Panel title="Upload notes">
            <NoteUploadForm
              courses={[{ id: course.id, title: course.title, sections: course.sections.map((s) => ({ id: s.id, title: s.title })) }]}
              defaultCourseId={course.id}
            />
          </Panel>
          <Panel title={`Notes (${notes.length})`}>
            {notes.length === 0 ? (
              <EmptyState icon={FileText} title="No notes yet" />
            ) : (
              <ul className="divide-y divide-border">{notes.map((n) => <NoteItem key={n.id} note={n} showCourse={false} />)}</ul>
            )}
          </Panel>
        </div>
      )}

      {tab === "students" && studentRows && (
        <Panel title="Enrolled students">
          {(() => {
            const rows = studentRows.filter((r) => r.courseId === course.id);
            if (rows.length === 0) return <EmptyState icon={Users} title="No students yet" />;
            return (
              <ul className="divide-y divide-border">
                {rows.map((r) => (
                  <li key={r.userId} className="grid gap-2 py-3 sm:grid-cols-[1fr_12rem_8rem] sm:items-center">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{r.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{r.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={r.percent} className="h-1.5" />
                      <span className="text-xs tabular-nums text-muted-foreground">{r.percent}%</span>
                    </div>
                    <Badge variant={r.completedAt ? "success" : r.hasAccess ? "secondary" : "outline"}>
                      {r.completedAt ? "Completed" : r.hasAccess ? "Learning" : "Payment pending"}
                    </Badge>
                  </li>
                ))}
              </ul>
            );
          })()}
        </Panel>
      )}
    </div>
  );
}
