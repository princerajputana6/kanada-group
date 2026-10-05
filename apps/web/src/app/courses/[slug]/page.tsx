import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Button, buttonVariants, cn } from "@kanada/ui";
import { getCourseDetail } from "@/lib/queries";
import { getSession } from "@/lib/session";
import { enrollAction } from "@/actions/enrollment-actions";
import { formatDuration, formatPrice } from "@/lib/utils";
import { ReviewForm } from "@/components/review-form";
import { PaymentUpload } from "@/components/payment-upload";

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
  const myEnrollment = isStudent
    ? course.enrollments.find((e) => e.userId === session!.user.id)
    : undefined;
  const isEnrolled = !!myEnrollment;
  const hasAccess = course.isFree
    ? isEnrolled
    : myEnrollment?.paymentStatus === "PAID";

  const avgRating =
    course.reviews.length > 0
      ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length
      : null;

  const totalLessons = course.sections.reduce((sum, s) => sum + s.lessons.length, 0);
  const myReview = isStudent
    ? course.reviews.find((r) => r.userId === session!.user.id)
    : undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-12 pt-16 sm:px-8 md:pt-24">
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
          <h1 className="mt-4 font-display text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[0.98] tracking-[-0.045em] text-foreground">
            {course.title}
          </h1>
          <p className="mt-5 text-muted-foreground md:text-lg">{course.description}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Taught by <span className="font-medium text-foreground">{course.teacher.name}</span>
            {" · "}
            {course.enrollments.length} student{course.enrollments.length === 1 ? "" : "s"}
            {avgRating ? ` · ★ ${avgRating.toFixed(1)}` : ""}
            {` · ${totalLessons} lesson${totalLessons === 1 ? "" : "s"}`}
          </p>

          <h2 className="mb-5 mt-14 text-2xl font-semibold">Curriculum</h2>
          <div className="space-y-4">
            {course.sections.map((section) => (
              <div key={section.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="border-b border-border bg-secondary/60 px-5 py-3 font-medium">
                  {section.title}
                </div>
                <ul className="divide-y divide-border">
                  {section.lessons.map((lesson) => {
                    const locked = !lesson.isPreview && !hasAccess && !isOwner && !isAdmin;
                    return (
                      <li
                        key={lesson.id}
                        className="flex items-center justify-between px-5 py-3 text-sm"
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

          <h2 className="mb-5 mt-14 text-2xl font-semibold">Reviews</h2>
          {isStudent && isEnrolled && (
            <ReviewForm courseSlug={slug} initial={myReview} />
          )}
          <div className="mt-6 space-y-4">
            {course.reviews.length === 0 && (
              <p className="text-sm text-muted-foreground">No reviews yet.</p>
            )}
            {course.reviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-border bg-card p-5">
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

        <div className="glass h-fit rounded-3xl p-6 lg:sticky lg:top-24">
          <p className="mb-1 text-xs uppercase tracking-[0.14em] text-subtle">Price</p>
          {course.isFree ? (
            <p className="mb-5 font-display text-4xl font-bold tracking-tight text-foreground">
              Free
            </p>
          ) : (
            <div className="mb-5">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-4xl font-bold tracking-tight text-foreground">
                  {formatPrice(course.price)}
                </span>
                {course.originalPrice && course.originalPrice > (course.price ?? 0) && (
                  <span className="text-lg font-medium text-muted-foreground line-through">
                    {formatPrice(course.originalPrice)}
                  </span>
                )}
              </div>
              {course.originalPrice && course.originalPrice > (course.price ?? 0) && (
                <span className="mt-1 inline-block rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {Math.round((1 - (course.price ?? 0) / course.originalPrice) * 100)}% off
                </span>
              )}
            </div>
          )}

          {isOwner ? (
            <Link
              href={`/teacher/courses/${course.id}/edit`}
              className={cn(buttonVariants(), "w-full")}
            >
              Manage course
            </Link>
          ) : isAdmin ? (
            <Link
              href={`/student/courses/${course.slug}/learn`}
              className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            >
              Preview course
            </Link>
          ) : !isStudent ? (
            <Link
              href={`/sign-in?callbackUrl=/courses/${slug}`}
              className={cn(buttonVariants(), "w-full")}
            >
              Sign in to enroll
            </Link>
          ) : hasAccess ? (
            <Link
              href={`/student/courses/${course.slug}/learn`}
              className={cn(buttonVariants(), "w-full")}
            >
              Go to course
            </Link>
          ) : course.isFree ? (
            <form action={enrollAction.bind(null, slug)}>
              <Button type="submit" className="w-full">
                Enroll for free
              </Button>
            </form>
          ) : myEnrollment?.paymentStatus === "SUBMITTED" ? (
            <div className="rounded-xl border border-border bg-secondary/50 p-4 text-sm">
              <p className="font-medium text-foreground">⏳ Payment under review</p>
              <p className="mt-1 text-muted-foreground">
                We&apos;ve received your payment proof. You&apos;ll get an email once
                an admin verifies it.
              </p>
            </div>
          ) : (
            // AWAITING, REJECTED, or not-yet-enrolled.
            <div className="space-y-4 text-sm">
              {myEnrollment?.paymentStatus === "REJECTED" && (
                <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-destructive">
                  Your previous payment proof was rejected. Please pay and upload a
                  valid screenshot.
                </p>
              )}
              {!myEnrollment ? (
                <form action={enrollAction.bind(null, slug)}>
                  <Button type="submit" className="w-full">
                    Proceed to payment
                  </Button>
                </form>
              ) : (
                <>
                  <div>
                    <p className="mb-2 font-medium text-foreground">
                      Scan &amp; pay {formatPrice(course.price)}
                    </p>
                    <div className="mx-auto w-fit overflow-hidden rounded-2xl border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/brand/payment-qr.png"
                        alt="PhonePe payment QR code — pay to SULEKHA DEVI"
                        width={220}
                        height={220}
                        className="h-56 w-56"
                      />
                    </div>
                 
                    <p className="mt-2 text-center text-xs text-muted-foreground">
                      Scan with any UPI app, then upload your payment screenshot below.
                    </p>
                  </div>
                  <PaymentUpload enrollmentId={myEnrollment.id} />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
