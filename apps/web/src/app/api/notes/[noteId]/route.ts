import { eq } from "drizzle-orm";
import { courseNotes } from "@kanada/db";
import { streamR2Object } from "@kanada/storage";
import { getDb } from "@/lib/db";
import { getEnv } from "@/lib/cloudflare";
import { canAccessCourseContent } from "@/lib/access";
import { auth } from "@/auth";

/** Downloads a course note — same access rule as lesson videos. */
export async function GET(request: Request, { params }: { params: Promise<{ noteId: string }> }) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const { noteId } = await params;
  const db = await getDb();
  const note = await db.query.courseNotes.findFirst({ where: eq(courseNotes.id, noteId) });
  if (!note) return new Response("Not found", { status: 404 });
  if (!(await canAccessCourseContent(session.user, note.courseId))) {
    return new Response("Forbidden", { status: 403 });
  }

  const env = await getEnv();
  const res = await streamR2Object(env.VIDEO_BUCKET, note.fileKey, request.headers.get("range"));
  // Never let a browser sniff an uploaded document into something executable.
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}
