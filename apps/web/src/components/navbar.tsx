import Link from "next/link";
import { Button, buttonVariants, cn } from "@kanada/ui";
import { getSession } from "@/lib/session";
import { signOutAction } from "@/actions/auth-actions";

const DASHBOARD_BY_ROLE: Record<string, string> = {
  STUDENT: "/student/dashboard",
  TEACHER: "/teacher/dashboard",
  ADMIN: "/admin/dashboard",
};

export async function Navbar() {
  const session = await getSession();
  const user = session?.user;

  return (
    <header className="animate-fade-slide-down border-b border-border">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Kanada Group <span className="text-primary">LMS</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link
            href="/courses"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Courses
          </Link>

          {user ? (
            <>
              <Link
                href={DASHBOARD_BY_ROLE[user.role] ?? "/"}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Dashboard
              </Link>
              <form action={signOutAction}>
                <Button variant="outline" size="sm" type="submit">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign in
              </Link>
              <Link href="/sign-up" className={cn(buttonVariants({ size: "sm" }))}>
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
