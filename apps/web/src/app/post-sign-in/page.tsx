import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

const DASHBOARD_BY_ROLE: Record<string, string> = {
  STUDENT: "/student/dashboard",
  TEACHER: "/teacher/dashboard",
  ADMIN: "/admin/dashboard",
};

export default async function PostSignInPage() {
  const session = await getSession();
  redirect(session?.user ? (DASHBOARD_BY_ROLE[session.user.role] ?? "/") : "/sign-in");
}
