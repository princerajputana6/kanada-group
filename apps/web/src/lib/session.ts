import { redirect } from "next/navigation";
import type { Role } from "@kanada/auth";
import { auth } from "@/auth";

export async function getSession() {
  return auth();
}

export async function requireUser() {
  const session = await getSession();
  if (!session?.user) redirect("/sign-in");
  return session.user;
}

export async function requireRole(allowed: Role[]) {
  const user = await requireUser();
  if (!allowed.includes(user.role)) {
    redirect("/");
  }
  return user;
}
