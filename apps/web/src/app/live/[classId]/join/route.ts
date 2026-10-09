import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { liveClasses } from "@kanada/db";
import { getDb } from "@/lib/db";
import { canAccessCourseContent } from "@/lib/access";
import { liveState } from "@/lib/time";
import { auth } from "@/auth";

/**
 * Redirects to a live class's meeting link. The link itself never appears
 * in page HTML, so only signed-in students with course access — inside the
 * join window — can reach it. Teachers/admins can open it any time.
 */
export async function GET(request: Request, { params }: { params: Promise<{ classId: string }> }) {
  const session = await auth();
  const url = new URL(request.url);
  if (!session?.user) {
    return NextResponse.redirect(new URL(`/sign-in?callbackUrl=${encodeURIComponent(url.pathname)}`, url));
  }

  const { classId } = await params;
  const db = await getDb();
  const cls = await db.query.liveClasses.findFirst({ where: eq(liveClasses.id, classId) });
  if (!cls || !(await canAccessCourseContent(session.user, cls.courseId))) {
    return new Response("Live class not found.", { status: 404 });
  }
  if (cls.status === "CANCELLED") return new Response("This class was cancelled.", { status: 410 });

  const isStaff = session.user.role !== "STUDENT";
  const state = liveState(cls.startsAt, cls.durationMinutes);
  if (!isStaff && state === "upcoming") {
    return new Response("This class isn't open yet — the Join button activates 15 minutes before it starts.", { status: 425 });
  }
  if (!isStaff && state === "ended") {
    return new Response("This class has ended.", { status: 410 });
  }
  return NextResponse.redirect(cls.meetingUrl, 303);
}
