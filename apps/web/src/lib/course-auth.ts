import "server-only";
import { eq } from "drizzle-orm";
import { courses, lessons, sections, users } from "@kanada/db";
import { getDb } from "./db";

/**
 * Ownership checks for course content. Deliberately NOT in a "use server"
 * file: every export there is a publicly callable endpoint, and these take
 * the acting user as an argument — they must only ever receive the session
 * user from server code. Admins may manage any course.
 */
export type CourseActor = { id: string; role: "ADMIN" | "TEACHER" | "STUDENT" };

export async function assertCourseOwner(courseId: string, actor: CourseActor) {
  const db = await getDb();
  const course = await db.query.courses.findFirst({ where: eq(courses.id, courseId) });
  if (!course || (actor.role !== "ADMIN" && course.teacherId !== actor.id)) {
    throw new Error("Not found or not authorized.");
  }
  return course;
}

export async function assertSectionOwner(sectionId: string, actor: CourseActor) {
  const db = await getDb();
  const section = await db.query.sections.findFirst({ where: eq(sections.id, sectionId) });
  if (!section) throw new Error("Section not found.");
  const course = await assertCourseOwner(section.courseId, actor);
  return { section, course };
}

export async function assertLessonOwner(lessonId: string, actor: CourseActor) {
  const db = await getDb();
  const lesson = await db.query.lessons.findFirst({ where: eq(lessons.id, lessonId) });
  if (!lesson) throw new Error("Lesson not found.");
  const { section, course } = await assertSectionOwner(lesson.sectionId, actor);
  return { lesson, section, course };
}

/** Teacher (or a teacher an admin is managing) — validates the target is a teacher. */
export async function resolveTeacherId(actor: CourseActor, requestedTeacherId?: string | null) {
  if (actor.role !== "ADMIN") return actor.id;
  if (!requestedTeacherId) throw new Error("Choose which teacher this course belongs to.");
  const db = await getDb();
  const t = await db.query.users.findFirst({
    where: eq(users.id, requestedTeacherId),
    columns: { id: true, role: true },
  });
  if (!t || t.role !== "TEACHER") throw new Error("Teacher not found.");
  return t.id;
}

/** Where a course's editor lives for this actor. */
export function workspaceBaseFor(actor: CourseActor, teacherId: string) {
  return actor.role === "ADMIN" ? `/admin/teachers/${teacherId}` : "/teacher";
}
