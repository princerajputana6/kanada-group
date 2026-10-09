import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { adminTeacherWorkspace } from "@/lib/workspace";
import { getTeacherOverview } from "@/lib/teacher-queries";
import { TeacherNav } from "@/components/teacher/teacher-nav";

export default async function AdminTeacherWorkspaceLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ teacherId: string }>;
}) {
  const { teacherId } = await params;
  const ws = await adminTeacherWorkspace(teacherId);
  const { stats } = await getTeacherOverview(ws.teacherId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-3xl border border-primary/25 bg-primary/[0.05] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Link href="/admin/teachers" className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> All teachers
          </Link>
          <p className="mt-1 truncate text-sm">
            Managing <span className="font-semibold">{ws.teacherName}</span>&apos;s workspace as admin
          </p>
        </div>
        <Link href={`/admin/users/${ws.teacherId}`} className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline">
          Account &amp; access <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
      <TeacherNav
        name={ws.teacherName}
        upcomingClasses={stats.upcomingClasses}
        pendingPayments={stats.pendingPayments}
        base={ws.base}
        variant="tabs"
      />
      {children}
    </div>
  );
}
