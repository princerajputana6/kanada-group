"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  users,
  courses,
  categories,
  enrollments,
  lessonProgress,
  lessons,
  sections,
  reviews,
  passwordResetTokens,
  courseNotes,
  liveClasses,
  supportTickets,
  supportMessages,
  coupons,
  ROLES,
  type Role,
} from "@kanada/db";
import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { slugify } from "@/lib/utils";
import type { ActionState } from "./auth-actions";

// Server actions are public POST endpoints: every one re-checks the admin
// role and validates its inputs, regardless of what the UI allows.

const idSchema = z.string().min(1).max(64);

/** Admins may not lock themselves out via role/ban/reset on their own row. */
async function requireAdminActingOnOther(userId: string) {
  const admin = await requireRole(["ADMIN"]);
  idSchema.parse(userId);
  if (admin.id === userId) throw new Error("Use the Account page to manage your own account.");
  return admin;
}

function revalidateUser(userId: string) {
  revalidatePath("/admin/users");
  revalidatePath("/admin/students");
  revalidatePath(`/admin/users/${userId}`);
}

export async function setUserRoleAction(userId: string, role: Role) {
  await requireAdminActingOnOther(userId);
  const parsedRole = z.enum(ROLES).parse(role);
  const db = await getDb();
  await db.update(users).set({ role: parsedRole }).where(eq(users.id, userId));
  revalidateUser(userId);
}

const adminCreateUserSchema = z.object({
  name: z.string().min(2, "Name is too short").max(100),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(ROLES),
});

/**
 * Admin creates a user (student, tutor or admin) to manage the portal.
 * Redirects to the new user's detail page on success.
 */
export async function adminCreateUserAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(["ADMIN"]);
  const parsed = adminCreateUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const email = parsed.data.email.toLowerCase();
  const db = await getDb();
  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) return { error: "An account with this email already exists." };

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const rows = await db
    .insert(users)
    .values({ name: parsed.data.name, email, passwordHash, role: parsed.data.role })
    .returning({ id: users.id });

  revalidatePath("/admin/users");
  revalidatePath("/admin/students");
  redirect(`/admin/users/${rows[0]!.id}`);
}

export async function setUserBannedAction(userId: string, banned: boolean) {
  await requireAdminActingOnOther(userId);
  const db = await getDb();
  await db
    .update(users)
    // Banning also cuts existing sessions (the auth jwt callback enforces both).
    .set(banned ? { banned: true, sessionsValidAfter: new Date() } : { banned: false })
    .where(eq(users.id, userId));
  revalidateUser(userId);
}

/** Ends every active session of the user; they must sign in again. */
export async function signOutUserEverywhereAction(userId: string) {
  await requireAdminActingOnOther(userId);
  const db = await getDb();
  await db.update(users).set({ sessionsValidAfter: new Date() }).where(eq(users.id, userId));
  revalidateUser(userId);
}

/**
 * Permanently deletes a user and every row that belongs only to them
 * (enrollments, lesson progress, reviews, reset tokens, uploaded notes, their
 * own support tickets and messages). Rows that merely reference them as an
 * author (support replies on others' tickets, coupons they created) are kept
 * with the link nulled. A teacher who still owns courses is refused — reassign
 * or delete those courses first, so deleting an account can never silently wipe
 * other students' enrollments and progress.
 */
export async function deleteUserAction(userId: string) {
  await requireAdminActingOnOther(userId);
  const db = await getDb();

  const target = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!target) return;

  const ownedCourse = await db.query.courses.findFirst({
    where: eq(courses.teacherId, userId),
    columns: { id: true },
  });
  if (ownedCourse) {
    throw new Error(
      "This user still owns courses. Reassign or delete their courses before deleting the account.",
    );
  }

  const ownTickets = await db
    .select({ id: supportTickets.id })
    .from(supportTickets)
    .where(eq(supportTickets.userId, userId));
  const ticketIds = ownTickets.map((t) => t.id);

  // Detach references that should outlive the user.
  await db
    .update(supportMessages)
    .set({ authorId: null })
    .where(eq(supportMessages.authorId, userId));
  await db.update(coupons).set({ createdBy: null }).where(eq(coupons.createdBy, userId));

  // Remove rows owned by the user.
  await db.delete(lessonProgress).where(eq(lessonProgress.userId, userId));
  await db.delete(enrollments).where(eq(enrollments.userId, userId));
  await db.delete(reviews).where(eq(reviews.userId, userId));
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
  await db.delete(courseNotes).where(eq(courseNotes.uploadedBy, userId));
  await db.delete(liveClasses).where(eq(liveClasses.teacherId, userId));
  if (ticketIds.length > 0) {
    await db.delete(supportMessages).where(inArray(supportMessages.ticketId, ticketIds));
    await db.delete(supportTickets).where(eq(supportTickets.userId, userId));
  }

  await db.delete(users).where(eq(users.id, userId));

  revalidatePath("/admin/users");
  revalidatePath("/admin/students");
  revalidatePath("/admin/teachers");
  redirect("/admin/users");
}

/** Unambiguous temporary password (no 0/O/1/l/I), shown once to the admin. */
function generateTempPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  // Rejection sampling keeps every character equally likely.
  const chars: string[] = [];
  const limit = 256 - (256 % alphabet.length);
  while (chars.length < 14) {
    for (const b of crypto.getRandomValues(new Uint8Array(32))) {
      if (b < limit && chars.length < 14) chars.push(alphabet[b % alphabet.length]!);
    }
  }
  const s = chars.join("");
  return `${s.slice(0, 5)}-${s.slice(5, 10)}-${s.slice(10, 14)}`;
}

export type ResetPasswordState = { error?: string; password?: string };

export async function resetUserPasswordAction(userId: string): Promise<ResetPasswordState> {
  try {
    await requireAdminActingOnOther(userId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Not allowed." };
  }
  const password = generateTempPassword();
  const db = await getDb();
  await db
    .update(users)
    .set({ passwordHash: await bcrypt.hash(password, 10), sessionsValidAfter: new Date() })
    .where(eq(users.id, userId));
  revalidateUser(userId);
  return { password };
}

export async function adminEnrollAction(
  userId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(["ADMIN"]);
  const parsed = z
    .object({ userId: idSchema, courseId: idSchema })
    .safeParse({ userId, courseId: formData.get("courseId") });
  if (!parsed.success) return { error: "Choose a course." };

  const db = await getDb();
  const existing = await db.query.enrollments.findFirst({
    where: and(eq(enrollments.userId, userId), eq(enrollments.courseId, parsed.data.courseId)),
  });
  if (existing) return { error: "Already enrolled in that course." };
  await db.insert(enrollments).values({ userId, courseId: parsed.data.courseId });
  revalidateUser(userId);
  return { success: true };
}

/** Enrolls the user in every course they are not already enrolled in. */
export async function adminEnrollAllAction(userId: string) {
  await requireRole(["ADMIN"]);
  idSchema.parse(userId);
  const db = await getDb();
  const [allCourses, mine] = await Promise.all([
    db.select({ id: courses.id }).from(courses),
    db
      .select({ courseId: enrollments.courseId })
      .from(enrollments)
      .where(eq(enrollments.userId, userId)),
  ]);
  const have = new Set(mine.map((m) => m.courseId));
  const missing = allCourses.filter((c) => !have.has(c.id));
  if (missing.length === 0) return;
  await db.insert(enrollments).values(missing.map((c) => ({ userId, courseId: c.id })));
  revalidateUser(userId);
}

async function lessonIdsOfCourse(courseId: string) {
  const db = await getDb();
  const rows = await db
    .select({ id: lessons.id })
    .from(lessons)
    .innerJoin(sections, eq(lessons.sectionId, sections.id))
    .where(eq(sections.courseId, courseId));
  return rows.map((r) => r.id);
}

async function clearProgress(userId: string, courseId: string) {
  const ids = await lessonIdsOfCourse(courseId);
  if (ids.length === 0) return;
  const db = await getDb();
  await db
    .delete(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), inArray(lessonProgress.lessonId, ids)));
}

/** Removes the enrollment and the student's progress in that course. */
export async function adminUnenrollAction(enrollmentId: string) {
  await requireRole(["ADMIN"]);
  idSchema.parse(enrollmentId);
  const db = await getDb();
  const e = await db.query.enrollments.findFirst({ where: eq(enrollments.id, enrollmentId) });
  if (!e) return;
  await clearProgress(e.userId, e.courseId);
  await db.delete(enrollments).where(eq(enrollments.id, enrollmentId));
  revalidateUser(e.userId);
}

/** Keeps the enrollment but wipes lesson progress and the completion date. */
export async function adminResetProgressAction(enrollmentId: string) {
  await requireRole(["ADMIN"]);
  idSchema.parse(enrollmentId);
  const db = await getDb();
  const e = await db.query.enrollments.findFirst({ where: eq(enrollments.id, enrollmentId) });
  if (!e) return;
  await clearProgress(e.userId, e.courseId);
  await db.update(enrollments).set({ completedAt: null }).where(eq(enrollments.id, enrollmentId));
  revalidateUser(e.userId);
}

export async function setCoursePublishedAction(courseId: string, published: boolean) {
  await requireRole(["ADMIN"]);
  const db = await getDb();
  await db.update(courses).set({ published }).where(eq(courses.id, courseId));
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
}

export async function createCategoryAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(["ADMIN"]);
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "Name is too short." };

  const db = await getDb();
  await db.insert(categories).values({ name, slug: slugify(name) });
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategoryAction(categoryId: string) {
  await requireRole(["ADMIN"]);
  const db = await getDb();
  await db.delete(categories).where(eq(categories.id, categoryId));
  revalidatePath("/admin/categories");
}
