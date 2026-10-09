import "server-only";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { users } from "@kanada/db";
import { getDb } from "./db";
import { requireRole } from "./session";

/**
 * Whose teaching workspace a page renders, and where it lives. The teacher
 * portal (/teacher/…) and an admin managing a teacher
 * (/admin/teachers/[id]/…) render the same views with different contexts.
 */
export type Workspace = {
  teacherId: string;
  teacherName: string;
  base: string;
  isAdmin: boolean;
};

export async function teacherSelfWorkspace(): Promise<Workspace> {
  const user = await requireRole(["TEACHER"]);
  return { teacherId: user.id, teacherName: user.name ?? "Instructor", base: "/teacher", isAdmin: false };
}

export async function adminTeacherWorkspace(teacherId: string): Promise<Workspace> {
  await requireRole(["ADMIN"]);
  const db = await getDb();
  const teacher = await db.query.users.findFirst({
    where: eq(users.id, teacherId),
    columns: { id: true, name: true, role: true },
  });
  if (!teacher || teacher.role !== "TEACHER") notFound();
  return { teacherId: teacher.id, teacherName: teacher.name, base: `/admin/teachers/${teacher.id}`, isAdmin: true };
}
