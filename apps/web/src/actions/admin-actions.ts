"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { users, courses, categories, type Role } from "@kanada/db";
import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { slugify } from "@/lib/utils";
import type { ActionState } from "./auth-actions";

export async function setUserRoleAction(userId: string, role: Role) {
  await requireRole(["ADMIN"]);
  const db = await getDb();
  await db.update(users).set({ role }).where(eq(users.id, userId));
  revalidatePath("/admin/users");
}

export async function setUserBannedAction(userId: string, banned: boolean) {
  await requireRole(["ADMIN"]);
  const db = await getDb();
  await db.update(users).set({ banned }).where(eq(users.id, userId));
  revalidatePath("/admin/users");
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
