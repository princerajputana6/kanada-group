"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { courses, sections, lessons } from "@kanada/db";
import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { removeVideo } from "@/lib/storage";
import { courseSchema, sectionSchema, lessonSchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";
import type { ActionState } from "./auth-actions";

async function assertCourseOwner(courseId: string, userId: string) {
  const db = await getDb();
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
  });
  if (!course || course.teacherId !== userId) {
    throw new Error("Not found or not authorized.");
  }
  return course;
}

async function assertSectionOwner(sectionId: string, userId: string) {
  const db = await getDb();
  const section = await db.query.sections.findFirst({
    where: eq(sections.id, sectionId),
  });
  if (!section) throw new Error("Section not found.");
  const course = await assertCourseOwner(section.courseId, userId);
  return { section, course };
}

async function assertLessonOwner(lessonId: string, userId: string) {
  const db = await getDb();
  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
  });
  if (!lesson) throw new Error("Lesson not found.");
  const { section, course } = await assertSectionOwner(lesson.sectionId, userId);
  return { lesson, section, course };
}

export async function createCourseAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole(["TEACHER"]);
  const parsed = courseSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    category: formData.get("category") || undefined,
    level: formData.get("level") || "BEGINNER",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const db = await getDb();
  const baseSlug = slugify(parsed.data.title);
  let slug = baseSlug;
  let suffix = 1;
  while (await db.query.courses.findFirst({ where: eq(courses.slug, slug) })) {
    slug = `${baseSlug}-${++suffix}`;
  }

  const [course] = await db
    .insert(courses)
    .values({ ...parsed.data, slug, teacherId: user.id })
    .returning();

  redirect(`/teacher/courses/${course!.id}/edit`);
}

export async function updateCourseAction(
  courseId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole(["TEACHER"]);
  await assertCourseOwner(courseId, user.id);

  const parsed = courseSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    category: formData.get("category") || undefined,
    level: formData.get("level") || "BEGINNER",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const db = await getDb();
  await db.update(courses).set(parsed.data).where(eq(courses.id, courseId));
  revalidatePath(`/teacher/courses/${courseId}/edit`);
  return { success: true };
}

export async function togglePublishAction(courseId: string) {
  const user = await requireRole(["TEACHER"]);
  const course = await assertCourseOwner(courseId, user.id);
  const db = await getDb();
  await db
    .update(courses)
    .set({ published: !course.published })
    .where(eq(courses.id, courseId));
  revalidatePath(`/teacher/courses/${courseId}/edit`);
  revalidatePath("/teacher/dashboard");
  revalidatePath("/courses");
}

export async function deleteCourseAction(courseId: string) {
  const user = await requireRole(["TEACHER"]);
  await assertCourseOwner(courseId, user.id);
  const db = await getDb();
  await db.delete(courses).where(eq(courses.id, courseId));
  revalidatePath("/teacher/dashboard");
  redirect("/teacher/dashboard");
}

export async function createSectionAction(courseId: string, formData: FormData) {
  const user = await requireRole(["TEACHER"]);
  await assertCourseOwner(courseId, user.id);

  const parsed = sectionSchema.safeParse({ title: formData.get("title") });
  if (!parsed.success) return;

  const db = await getDb();
  const countRows = await db
    .select({ count: sql<number>`count(*)` })
    .from(sections)
    .where(eq(sections.courseId, courseId));

  await db.insert(sections).values({
    courseId,
    title: parsed.data.title,
    order: countRows[0]?.count ?? 0,
  });
  revalidatePath(`/teacher/courses/${courseId}/edit`);
}

export async function updateSectionAction(sectionId: string, formData: FormData) {
  const user = await requireRole(["TEACHER"]);
  const { section, course } = await assertSectionOwner(sectionId, user.id);

  const parsed = sectionSchema.safeParse({ title: formData.get("title") });
  if (!parsed.success) return;

  const db = await getDb();
  await db
    .update(sections)
    .set({ title: parsed.data.title })
    .where(eq(sections.id, section.id));
  revalidatePath(`/teacher/courses/${course.id}/edit`);
}

export async function deleteSectionAction(sectionId: string) {
  const user = await requireRole(["TEACHER"]);
  const { course } = await assertSectionOwner(sectionId, user.id);
  const db = await getDb();
  await db.delete(sections).where(eq(sections.id, sectionId));
  revalidatePath(`/teacher/courses/${course.id}/edit`);
}

export async function createLessonAction(
  sectionId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole(["TEACHER"]);
  const { section, course } = await assertSectionOwner(sectionId, user.id);

  const parsed = lessonSchema.safeParse({
    title: formData.get("title"),
    type: formData.get("type"),
    content: formData.get("content") || undefined,
    isPreview: formData.get("isPreview") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const db = await getDb();
  const countRows = await db
    .select({ count: sql<number>`count(*)` })
    .from(lessons)
    .where(eq(lessons.sectionId, sectionId));

  await db.insert(lessons).values({
    sectionId: section.id,
    title: parsed.data.title,
    type: parsed.data.type,
    content: parsed.data.content ?? null,
    isPreview: parsed.data.isPreview,
    order: countRows[0]?.count ?? 0,
  });
  revalidatePath(`/teacher/courses/${course.id}/edit`);
  return { success: true };
}

export async function updateLessonAction(lessonId: string, formData: FormData) {
  const user = await requireRole(["TEACHER"]);
  const { course } = await assertLessonOwner(lessonId, user.id);

  const parsed = lessonSchema.safeParse({
    title: formData.get("title"),
    type: formData.get("type"),
    content: formData.get("content") || undefined,
    isPreview: formData.get("isPreview") === "on",
  });
  if (!parsed.success) return;

  const db = await getDb();
  await db
    .update(lessons)
    .set({
      title: parsed.data.title,
      type: parsed.data.type,
      content: parsed.data.content ?? null,
      isPreview: parsed.data.isPreview,
    })
    .where(eq(lessons.id, lessonId));

  revalidatePath(`/teacher/courses/${course.id}/edit`);
}

export async function deleteLessonAction(lessonId: string) {
  const user = await requireRole(["TEACHER"]);
  const { lesson, course } = await assertLessonOwner(lessonId, user.id);
  const db = await getDb();

  if (lesson.videoKey) {
    await removeVideo(lesson.videoKey);
  }
  await db.delete(lessons).where(eq(lessons.id, lessonId));
  revalidatePath(`/teacher/courses/${course.id}/edit`);
}

export async function moveLessonAction(
  lessonId: string,
  direction: "up" | "down",
) {
  const user = await requireRole(["TEACHER"]);
  const { lesson, section, course } = await assertLessonOwner(lessonId, user.id);
  const db = await getDb();

  const siblings = await db.query.lessons.findMany({
    where: eq(lessons.sectionId, section.id),
    orderBy: (l, { asc }) => [asc(l.order)],
  });

  const index = siblings.findIndex((l) => l.id === lesson.id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= siblings.length) return;

  const other = siblings[swapWith]!;
  await db.batch([
    db.update(lessons).set({ order: other.order }).where(eq(lessons.id, lesson.id)),
    db.update(lessons).set({ order: lesson.order }).where(eq(lessons.id, other.id)),
  ]);

  revalidatePath(`/teacher/courses/${course.id}/edit`);
}

export async function moveSectionAction(
  sectionId: string,
  direction: "up" | "down",
) {
  const user = await requireRole(["TEACHER"]);
  const { section, course } = await assertSectionOwner(sectionId, user.id);
  const db = await getDb();

  const siblings = await db.query.sections.findMany({
    where: eq(sections.courseId, course.id),
    orderBy: (s, { asc }) => [asc(s.order)],
  });

  const index = siblings.findIndex((s) => s.id === section.id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= siblings.length) return;

  const other = siblings[swapWith]!;
  await db.batch([
    db.update(sections).set({ order: other.order }).where(eq(sections.id, section.id)),
    db.update(sections).set({ order: section.order }).where(eq(sections.id, other.id)),
  ]);

  revalidatePath(`/teacher/courses/${course.id}/edit`);
}

export async function confirmLessonVideoAction(
  lessonId: string,
  videoKey: string,
  durationSeconds: number,
) {
  const user = await requireRole(["TEACHER"]);
  const { course } = await assertLessonOwner(lessonId, user.id);
  const db = await getDb();
  await db
    .update(lessons)
    .set({ videoKey, durationSeconds, type: "VIDEO" })
    .where(eq(lessons.id, lessonId));
  revalidatePath(`/teacher/courses/${course.id}/edit`);
}

export { assertCourseOwner, assertSectionOwner, assertLessonOwner };
