import type { ReactNode } from "react";
import { requireRole } from "@/lib/session";
import { SidebarNav } from "@/components/sidebar-nav";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Overview" },
  { href: "/admin/students", label: "Students" },
  { href: "/admin/users", label: "All users" },
  { href: "/admin/enrollments", label: "Payments" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/account", label: "My account" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireRole(["ADMIN"]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-8 lg:flex-row lg:gap-10">
      <aside className="shrink-0 lg:w-48">
        <p className="mb-3 px-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Admin
        </p>
        <SidebarNav items={NAV_ITEMS} layoutId="admin-nav-pill" />
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
