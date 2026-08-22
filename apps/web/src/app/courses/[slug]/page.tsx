import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Button } from "@kanada/ui";
import { getCourseDetail } from "@/lib/queries";
import { getSession } from "@/lib/session";
import { enrollAction } from "@/actions/enrollment-actions";
import { formatDuration } from "@/lib/utils";
import { ReviewForm } from "@/components/review-form";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseDetail(slug);
  const session = await getSession();
  const isOwner = session?.user.role === "TEACHER" && session.user.id === course?.teacherId;
  const isAdmin = session?.user.role === "ADMIN";

  if (!course || (!course.published && !isOwner && !isAdmin)) {
    notFound();
  }

  const isStudent = session?.user.role === "STUDENT";
  const isEnrolled = isStudent
    ? course.enrollments.some((e) => e.userId === session!.user.id)
    : false;

  const avgRating =
    course.reviews.length > 0
      ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length
      : null;

  const totalLessons = course.sections.reduce((sum, s) => sum + s.lessons.length, 0);
  const myReview = isStudent
    ? course.reviews.find((r) => r.userId === session!.user.id)
    : undefined;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {!course.published && (
        <Badge variant="destructive" className="mb-4">
          Unpublished — only visible to you
        </Badge>
      )}

      <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
        <div>
          <div className="mb-2 flex gap-2">
            {course.category && <Badge variant="secondary">{course.category}</Badge>}
            <Badge variant="outline">{course.level}</Badge>
          </div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="mt-3 text-muted-foreground">{course.description}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Taught by <span className="font-medium text-foreground">{course.teacher.name}</span>
            {" · "}
            {course.enrollments.length} student{course.enrollments.length === 1 ? "" : "s"}
            {avgRating ? ` · ★ ${avgRating.toFixed(1)}` : ""}
            {` · ${totalLessons} lesson${totalLessons === 1 ? "" : "s"}`}
          </p>

          <h2 className="mb-4 mt-10 text-xl font-semibold">Curriculum</h2>
          <div className="space-y-4">
            {course.sections.map((section) => (
              <div key={section.id} className="rounded-lg border border-border">
                <div className="border-b border-border bg-secondary/40 px-4 py-2 font-medium">
                  {section.title}
                </div>
                <ul className="divide-y divide-border">
                  {section.lessons.map((lesson) => {
                    const locked = !lesson.isPreview && !isEnrolled && !isOwner && !isAdmin;
                    return (
                      <li
                        key={lesson.id}
                        className="flex items-center justify-between px-4 py-2 text-sm"
                      >
                        <span className={locked ? "text-muted-foreground" : ""}>
                          {locked ? "🔒 " : lesson.type === "VIDEO" ? "▶ " : "📄 "}
                          {lesson.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {lesson.type === "VIDEO"
                            ? formatDuration(lesson.durationSeconds)
                            : "Reading"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          <h2 className="mb-4 mt-10 text-xl font-semibold">Reviews</h2>
          {isStudent && isEnrolled && (
            <ReviewForm courseSlug={slug} initial={myReview} />
          )}
          <div className="mt-6 space-y-4">
            {course.reviews.length === 0 && (
              <p className="text-sm text-muted-foreground">No reviews yet.</p>
            )}
            {course.reviews.map((review) => (
              <div key={review.id} className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{review.user.name}</span>
                  <span className="text-sm text-amber-500">{"★".repeat(review.rating)}</span>
                </div>
                {review.comment && (
                  <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="h-fit rounded-lg border border-border p-6">
          <p className="mb-4 text-2xl font-bold text-primary">Free</p>
          {isOwner ? (
            <Link
              href={`/teacher/courses/${course.id}/edit`}
              className="block w-full rounded-md bg-primary py-2 text-center text-sm font-medium text-primary-foreground"
            >
              Manage course
            </Link>
          ) : isEnrolled ? (
            <Link
              href={`/student/courses/${course.slug}/learn`}
              className="block w-full rounded-md bg-primary py-2 text-center text-sm font-medium text-primary-foreground"
            >
              Go to course
            </Link>
          ) : isStudent ? (
            <form action={enrollAction.bind(null, slug)}>
              <Button type="submit" className="w-full">
                Enroll for free
              </Button>
            </form>
          ) : (
            <Link
              href={`/sign-in?callbackUrl=/courses/${slug}`}
              className="block w-full rounded-md bg-primary py-2 text-center text-sm font-medium text-primary-foreground"
            >
              Sign in to enroll
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
