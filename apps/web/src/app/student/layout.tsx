import type { ReactNode } from "react";
import { requireRole } from "@/lib/session";
import { SidebarNav } from "@/components/sidebar-nav";

const NAV_ITEMS = [
  { href: "/student/dashboard", label: "My Learning" },
  { href: "/courses", label: "Browse Courses" },
];

export default async function StudentLayout({ children }: { children: ReactNode }) {
  await requireRole(["STUDENT"]);

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8">
      <aside className="w-48 shrink-0">
        <SidebarNav items={NAV_ITEMS} layoutId="student-nav-pill" />
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
