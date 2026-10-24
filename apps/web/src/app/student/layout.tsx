import type { ReactNode } from "react";
import { requireRole } from "@/lib/session";
import { SidebarNav } from "@/components/sidebar-nav";

const NAV_ITEMS = [
  { href: "/student/dashboard", label: "My Learning" },
  { href: "/courses", label: "Browse Courses" },
  { href: "/support", label: "Support" },
  { href: "/account", label: "Account" },
];

export default async function StudentLayout({ children }: { children: ReactNode }) {
  await requireRole(["STUDENT"]);

  return (
    // Phones: nav becomes a horizontal, scrollable strip above the content.
    // Desktop (lg+): a sidebar beside it.
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-8 lg:py-8">
      <aside className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:w-48 lg:shrink-0 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
        <SidebarNav items={NAV_ITEMS} layoutId="student-nav-pill" />
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
