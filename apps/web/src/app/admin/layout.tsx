import type { ReactNode } from "react";
import { requireRole } from "@/lib/session";
import { SidebarNav } from "@/components/sidebar-nav";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Overview" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/categories", label: "Categories" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireRole(["ADMIN"]);

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8">
      <aside className="w-48 shrink-0">
        <SidebarNav items={NAV_ITEMS} layoutId="admin-nav-pill" />
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
