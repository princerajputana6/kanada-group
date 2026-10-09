import Link from "next/link";
import { Button, buttonVariants, cn } from "@kanada/ui";
import { getSession } from "@/lib/session";
import { getPublishedCourseTitles } from "@/lib/queries";
import { signOutAction } from "@/actions/auth-actions";
import { NavShell } from "./nav-shell";
import { EnquiryButton } from "./enquiry-modal";

const DASHBOARD_BY_ROLE: Record<string, string> = {
  STUDENT: "/student/dashboard",
  TEACHER: "/teacher/dashboard",
  ADMIN: "/admin/dashboard",
};

const linkClass = "text-muted-foreground transition-colors hover:text-foreground";

export async function Navbar() {
  const session = await getSession();
  const user = session?.user;
  const courseOptions = await getPublishedCourseTitles();

  return (
    <NavShell
      links={
        <>
          <Link href="/about" className={linkClass}>
            About us
          </Link>
          <Link href="/courses" className={linkClass}>
            Courses
          </Link>
          {user && (
            <>
              <Link href={DASHBOARD_BY_ROLE[user.role] ?? "/"} className={linkClass}>
                Dashboard
              </Link>
              <Link href={user.role === "ADMIN" ? "/admin/account" : "/account"} className={linkClass}>
                Account
              </Link>
            </>
          )}
        </>
      }
      actions={
        <>
          <EnquiryButton courseOptions={courseOptions} />
          {user ? (
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
              <Link href="/registration" className={cn(buttonVariants({ size: "sm" }), "px-4")}>
                Register Yourself
              </Link>
            </>
          )}
        </>
      }
    />
  );
}
