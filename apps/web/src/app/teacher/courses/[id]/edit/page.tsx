import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge, Button, Input, Textarea } from "@kanada/ui";
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

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole(["TEACHER"]);
  const { id } = await params;
  const course = await getCourseForEdit(id, user.id);
  if (!course) notFound();

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant={course.published ? "success" : "outline"}>
              {course.published ? "Published" : "Draft"}
            </Badge>
            <Link href={`/courses/${course.slug}`} className="text-sm text-primary hover:underline">
              View public page
            </Link>
          </div>
          <h1 className="mt-1 text-2xl font-bold">{course.title}</h1>
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

      <section className="mt-8">
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

      <section className="mt-10">
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
    </div>
  );
}
