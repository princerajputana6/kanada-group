import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button, buttonVariants, cn } from "@kanada/ui";
import { requireRole } from "@/lib/session";
import { getCourseForLearning } from "@/lib/queries";
import { VideoPlayer } from "@/components/video-player";
import { LessonFade } from "@/components/lesson-fade";
import { markLessonCompleteAction } from "@/actions/progress-actions";

export default async function LearnPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lesson?: string }>;
}) {
  const user = await requireRole(["STUDENT"]);
  const { slug } = await params;
  const { lesson: lessonParam } = await searchParams;

  const data = await getCourseForLearning(slug, user.id);
  if (!data) notFound();
  const { course, enrollment, progressByLesson } = data;

  // Paid tracks are only accessible once payment is verified.
  if (!course.isFree && enrollment.paymentStatus !== "PAID") {
    redirect(`/courses/${slug}`);
  }

  const allLessons = course.sections.flatMap((s) => s.lessons);
  if (allLessons.length === 0) {
    return <p className="mx-auto max-w-4xl px-4 py-12">This course has no lessons yet.</p>;
  }

  const currentLesson =
    allLessons.find((l) => l.id === lessonParam) ??
    allLessons.find((l) => !progressByLesson.get(l.id)?.completed) ??
    allLessons[0]!;

  const currentProgress = progressByLesson.get(currentLesson.id);
  const completedCount = allLessons.filter((l) => progressByLesson.get(l.id)?.completed).length;

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8">
      <div className="min-w-0 flex-1">
        <Link href={`/courses/${slug}`} className="text-sm text-muted-foreground hover:underline">
          ← {course.title}
        </Link>

        <LessonFade lessonKey={currentLesson.id}>
          <h1 className="mt-2 text-2xl font-bold">{currentLesson.title}</h1>

          <div className="mt-4">
            {currentLesson.type === "VIDEO" && currentLesson.videoKey ? (
              <VideoPlayer
                key={currentLesson.id}
                lessonId={currentLesson.id}
                initialSeconds={currentProgress?.watchedSeconds ?? 0}
              />
            ) : currentLesson.type === "VIDEO" ? (
              <div className="flex aspect-video items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                Video not uploaded yet.
              </div>
            ) : (
              <div className="prose max-w-none whitespace-pre-wrap rounded-lg border border-border p-6 text-sm">
                {currentLesson.content}
              </div>
            )}
          </div>

          <form action={markLessonCompleteAction.bind(null, currentLesson.id)} className="mt-4">
            <Button type="submit" variant={currentProgress?.completed ? "secondary" : "default"}>
              {currentProgress?.completed ? "✓ Completed" : "Mark as complete"}
            </Button>
          </form>
        </LessonFade>
      </div>

      <aside className="w-72 shrink-0">
        <p className="mb-3 text-sm font-medium text-muted-foreground">
          {completedCount}/{allLessons.length} lessons complete
        </p>
        {completedCount === allLessons.length && (
          <Link
            href={`/student/courses/${slug}/certificate`}
            className={cn(buttonVariants({ size: "sm" }), "mb-4 w-full")}
          >
            🎓 View certificate
          </Link>
        )}
        <div className="space-y-4">
          {course.sections.map((section) => (
            <div key={section.id}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {section.lessons.map((lesson) => {
                  const isActive = lesson.id === currentLesson.id;
                  const isDone = progressByLesson.get(lesson.id)?.completed;
                  return (
                    <li key={lesson.id}>
                      <Link
                        href={`/student/courses/${slug}/learn?lesson=${lesson.id}`}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                          isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
                        )}
                      >
                        <span>{isDone ? "✓" : lesson.type === "VIDEO" ? "▶" : "📄"}</span>
                        <span className="line-clamp-1">{lesson.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
