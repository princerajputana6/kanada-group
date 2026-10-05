import { and, eq } from "drizzle-orm";
import { lessons, sections, courses, enrollments } from "@kanada/db";
import { streamR2Object } from "@kanada/storage";
import { getDb } from "@/lib/db";
import { getEnv } from "@/lib/cloudflare";
import { auth } from "@/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const { lessonId } = await params;
  const db = await getDb();

  const lesson = await db.query.lessons.findFirst({ where: eq(lessons.id, lessonId) });
  if (!lesson || !lesson.videoKey) {
    return new Response("Not found", { status: 404 });
  }

  if (!lesson.isPreview) {
    const session = await auth();
    if (!session?.user) return new Response("Unauthorized", { status: 401 });

    const section = await db.query.sections.findFirst({
      where: eq(sections.id, lesson.sectionId),
    });
    if (!section) return new Response("Not found", { status: 404 });

    const course = await db.query.courses.findFirst({
      where: eq(courses.id, section.courseId),
    });
    if (!course) return new Response("Not found", { status: 404 });

    const isOwnerTeacher =
      session.user.role === "TEACHER" && course.teacherId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwnerTeacher && !isAdmin) {
      const enrollment = await db.query.enrollments.findFirst({
        where: and(
          eq(enrollments.userId, session.user.id),
          eq(enrollments.courseId, course.id),
        ),
      });
      if (!enrollment) return new Response("Forbidden", { status: 403 });
      // Paid-track videos require a verified payment.
      if (!course.isFree && enrollment.paymentStatus !== "PAID") {
        return new Response("Payment required", { status: 402 });
      }
    }
  }

  const env = await getEnv();
  return streamR2Object(env.VIDEO_BUCKET, lesson.videoKey, request.headers.get("range"));
}
