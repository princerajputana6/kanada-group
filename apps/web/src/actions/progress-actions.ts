"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { courses, enrollments, lessonProgress, lessons, sections } from "@kanada/db";
import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/session";

async function assertEnrolled(lessonId: string, userId: string) {
  const db = await getDb();
  const lesson = await db.query.lessons.findFirst({ where: eq(lessons.id, lessonId) });
  if (!lesson) throw new Error("Lesson not found.");
  const section = await db.query.sections.findFirst({
    where: eq(sections.id, lesson.sectionId),
  });
  if (!section) throw new Error("Section not found.");
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, section.courseId),
  });
  if (!course) throw new Error("Course not found.");

  const enrollment = await db.query.enrollments.findFirst({
    where: and(eq(enrollments.userId, userId), eq(enrollments.courseId, course.id)),
  });
  if (!enrollment) throw new Error("Not enrolled.");

  return { lesson, section, course };
}

export async function updateProgressAction(lessonId: string, watchedSeconds: number) {
  const user = await requireRole(["STUDENT"]);
  await assertEnrolled(lessonId, user.id);
  const db = await getDb();

  const existing = await db.query.lessonProgress.findFirst({
    where: and(eq(lessonProgress.userId, user.id), eq(lessonProgress.lessonId, lessonId)),
  });

  if (existing) {
    await db
      .update(lessonProgress)
      .set({
        watchedSeconds: Math.max(existing.watchedSeconds, Math.floor(watchedSeconds)),
        lastWatchedAt: new Date(),
      })
      .where(eq(lessonProgress.id, existing.id));
  } else {
    await db.insert(lessonProgress).values({
      userId: user.id,
      lessonId,
      watchedSeconds: Math.floor(watchedSeconds),
      lastWatchedAt: new Date(),
    });
  }
}

export async function markLessonCompleteAction(lessonId: string) {
  const user = await requireRole(["STUDENT"]);
  const { course } = await assertEnrolled(lessonId, user.id);
  const db = await getDb();

  const existing = await db.query.lessonProgress.findFirst({
    where: and(eq(lessonProgress.userId, user.id), eq(lessonProgress.lessonId, lessonId)),
  });

  if (existing) {
    await db
      .update(lessonProgress)
      .set({ completed: true, lastWatchedAt: new Date() })
      .where(eq(lessonProgress.id, existing.id));
  } else {
    await db.insert(lessonProgress).values({
      userId: user.id,
      lessonId,
      completed: true,
      lastWatchedAt: new Date(),
    });
  }

  revalidatePath(`/student/courses/${course.slug}/learn`);
  revalidatePath("/student/dashboard");
}
