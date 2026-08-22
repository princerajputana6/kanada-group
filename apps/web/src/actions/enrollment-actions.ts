"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { courses, enrollments } from "@kanada/db";
import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function enrollAction(courseSlug: string) {
  const user = await requireRole(["STUDENT"]);
  const db = await getDb();

  const course = await db.query.courses.findFirst({
    where: and(eq(courses.slug, courseSlug), eq(courses.published, true)),
  });
  if (!course) throw new Error("Course not found.");

  const existing = await db.query.enrollments.findFirst({
    where: and(
      eq(enrollments.userId, user.id),
      eq(enrollments.courseId, course.id),
    ),
  });
  if (!existing) {
    await db.insert(enrollments).values({ userId: user.id, courseId: course.id });
  }

  revalidatePath(`/courses/${courseSlug}`);
  revalidatePath("/student/dashboard");
}
