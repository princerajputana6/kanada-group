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
  ROLES,
  type Role,
} from "@kanada/db";
import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { slugify } from "@/lib/utils";
import { signOut } from "@/auth";
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

const changePasswordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password."),
    next: z.string().min(12, "Use at least 12 characters.").max(200),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { message: "The new passwords don't match." })
  .refine((v) => v.next !== v.current, { message: "Choose a different password." });

/** Admin changes their own password; all their sessions (this one too) end. */
export async function changeOwnPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireRole(["ADMIN"]);
  const parsed = changePasswordSchema.safeParse({
    current: formData.get("current"),
    next: formData.get("next"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const db = await getDb();
  const row = await db.query.users.findFirst({ where: eq(users.id, admin.id) });
  if (!row || !(await bcrypt.compare(parsed.data.current, row.passwordHash))) {
    return { error: "Your current password is incorrect." };
  }
  await db
    .update(users)
    .set({ passwordHash: await bcrypt.hash(parsed.data.next, 10), sessionsValidAfter: new Date() })
    .where(eq(users.id, admin.id));
  await signOut({ redirectTo: "/sign-in?passwordChanged=1" });
  return { success: true };
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
