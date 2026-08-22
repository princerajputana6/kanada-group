"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { courses, enrollments, reviews } from "@kanada/db";
import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { reviewSchema } from "@/lib/validation";
import type { ActionState } from "./auth-actions";

export async function createReviewAction(
  courseSlug: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole(["STUDENT"]);
  const db = await getDb();

  const course = await db.query.courses.findFirst({ where: eq(courses.slug, courseSlug) });
  if (!course) return { error: "Course not found." };

  const enrollment = await db.query.enrollments.findFirst({
    where: and(eq(enrollments.userId, user.id), eq(enrollments.courseId, course.id)),
  });
  if (!enrollment) return { error: "Enroll in this course before leaving a review." };

  const parsed = reviewSchema.safeParse({
    rating: formData.get("rating"),
    comment: formData.get("comment") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await db.query.reviews.findFirst({
    where: and(eq(reviews.userId, user.id), eq(reviews.courseId, course.id)),
  });

  if (existing) {
    await db
      .update(reviews)
      .set({ rating: parsed.data.rating, comment: parsed.data.comment ?? null })
      .where(eq(reviews.id, existing.id));
  } else {
    await db.insert(reviews).values({
      userId: user.id,
      courseId: course.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment ?? null,
    });
  }

  revalidatePath(`/courses/${courseSlug}`);
  return { success: true };
}
