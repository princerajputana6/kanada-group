import { and, eq } from "drizzle-orm";
import { courses, enrollments } from "@kanada/db";
import { getDb } from "./db";

export interface Viewer {
  id: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
}

/**
 * The one rule for gated course content (lesson videos, notes, live
 * classes): admins and the course's own teacher always; students need an
 * enrollment, plus a verified payment when the course is paid.
 */
export async function canAccessCourseContent(viewer: Viewer, courseId: string): Promise<boolean> {
  if (viewer.role === "ADMIN") return true;
  const db = await getDb();
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    columns: { teacherId: true, isFree: true },
  });
  if (!course) return false;
  if (viewer.role === "TEACHER") return course.teacherId === viewer.id;

  const enrollment = await db.query.enrollments.findFirst({
    where: and(eq(enrollments.userId, viewer.id), eq(enrollments.courseId, courseId)),
    columns: { paymentStatus: true },
  });
  return !!enrollment && (course.isFree || enrollment.paymentStatus === "PAID");
}

/** Course ids the student can currently access (enrolled, and paid if needed). */
export async function accessibleCourseIds(studentId: string): Promise<string[]> {
  const db = await getDb();
  const rows = await db.query.enrollments.findMany({
    where: eq(enrollments.userId, studentId),
    columns: { courseId: true, paymentStatus: true },
    with: { course: { columns: { isFree: true } } },
  });
  return rows.filter((r) => r.course.isFree || r.paymentStatus === "PAID").map((r) => r.courseId);
}

/** Emails of students with access to the course (for class notifications). */
export async function studentsWithAccess(courseId: string) {
  const db = await getDb();
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    columns: { isFree: true },
  });
  if (!course) return [];
  const rows = await db.query.enrollments.findMany({
    where: eq(enrollments.courseId, courseId),
    columns: { paymentStatus: true },
    with: { user: { columns: { name: true, email: true, banned: true } } },
  });
  return rows
    .filter((r) => !r.user.banned && (course.isFree || r.paymentStatus === "PAID"))
    .map((r) => r.user);
}
