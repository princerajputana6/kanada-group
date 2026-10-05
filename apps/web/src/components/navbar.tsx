import Link from "next/link";
import { Button, buttonVariants, cn } from "@kanada/ui";
import { getSession } from "@/lib/session";
import { signOutAction } from "@/actions/auth-actions";
import { NavShell } from "./nav-shell";

const DASHBOARD_BY_ROLE: Record<string, string> = {
  STUDENT: "/student/dashboard",
  TEACHER: "/teacher/dashboard",
  ADMIN: "/admin/dashboard",
};

const linkClass = "text-muted-foreground transition-colors hover:text-foreground";

export async function Navbar() {
  const session = await getSession();
  const user = session?.user;

  return (
    <NavShell
      links={
        <>
          <Link href="/courses" className={linkClass}>
            Courses
          </Link>
          {user && (
            <Link href={DASHBOARD_BY_ROLE[user.role] ?? "/"} className={linkClass}>
              Dashboard
            </Link>
          )}
        </>
      }
      actions={
        user ? (
          <form action={signOutAction}>
            <Button variant="outline" size="sm" type="submit">
              Sign out
            </Button>
          </form>
        ) : (
          <>
            <Link href="/sign-in" className={linkClass}>
              Sign in
            </Link>
            <Link href="/sign-up" className={cn(buttonVariants({ size: "sm" }), "px-4")}>
              Register Yourself
            </Link>
          </>
        )
      }
    />
  );
}
