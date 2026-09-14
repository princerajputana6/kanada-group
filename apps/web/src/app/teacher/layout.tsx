import type { ReactNode } from "react";
import { requireRole } from "@/lib/session";
import { SidebarNav } from "@/components/sidebar-nav";

const NAV_ITEMS = [
  { href: "/teacher/dashboard", label: "My Courses" },
  { href: "/teacher/students", label: "Students" },
  { href: "/teacher/analytics", label: "Analytics" },
  { href: "/teacher/courses/new", label: "New Course" },
];

export default async function TeacherLayout({ children }: { children: ReactNode }) {
  await requireRole(["TEACHER"]);

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8">
      <aside className="w-48 shrink-0">
        <SidebarNav items={NAV_ITEMS} layoutId="teacher-nav-pill" />
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
