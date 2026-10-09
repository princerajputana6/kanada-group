import type { ReactNode } from "react";
import { requireRole } from "@/lib/session";
import { getTeacherOverview } from "@/lib/teacher-queries";
import { TeacherNav } from "@/components/teacher/teacher-nav";

export default async function TeacherLayout({ children }: { children: ReactNode }) {
  const user = await requireRole(["TEACHER"]);
  const { stats } = await getTeacherOverview(user.id);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-8 lg:flex-row lg:gap-10">
      <aside className="shrink-0 lg:sticky lg:top-24 lg:h-fit lg:w-64">
        <TeacherNav
          name={user.name ?? "Instructor"}
          upcomingClasses={stats.upcomingClasses}
          pendingPayments={stats.pendingPayments}
        />
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
