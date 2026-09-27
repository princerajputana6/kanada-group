import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { getStudentDirectory, parseStudentFilters } from "@/lib/admin-queries";

/**
 * CSV of the (optionally filtered) student directory. Route handlers aren't
 * covered by the admin layout's guard, so the role check happens here.
 */
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (session?.user.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const filters = parseStudentFilters(Object.fromEntries(request.nextUrl.searchParams));
  const { rows } = await getStudentDirectory(filters);

  const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");
  const header = [
    "Name",
    "Email",
    "Status",
    "Joined",
    "Last active",
    "Courses enrolled",
    "Courses completed",
    "Lessons completed",
    "Average progress %",
    "Courses (progress)",
  ];
  const lines = rows.map((r) => [
    r.name,
    r.email,
    r.banned ? "Banned" : "Active",
    iso(r.joinedAt),
    iso(r.lastActiveAt),
    r.enrolledCount,
    r.completedCount,
    r.lessonsCompleted,
    r.avgProgress,
    r.courses.map((c) => `${c.title} (${c.completed ? "completed" : `${c.percent}%`})`).join("; "),
  ]);

  const csv = [header, ...lines].map((row) => row.map(csvCell).join(",")).join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);
  // BOM so Excel opens UTF-8 names correctly.
  return new NextResponse(`﻿${csv}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="kanada-students-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

function csvCell(value: string | number) {
  let s = String(value);
  // Neutralise spreadsheet formula injection from user-supplied names.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
