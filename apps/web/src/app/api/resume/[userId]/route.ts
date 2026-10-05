import { eq } from "drizzle-orm";
import { users } from "@kanada/db";
import { streamR2Object } from "@kanada/storage";
import { getDb } from "@/lib/db";
import { getEnv } from "@/lib/cloudflare";
import { auth } from "@/auth";

/** Streams a registrant's resume PDF. Admins only (or the user themselves). */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const { userId } = await params;
  const isAdmin = session.user.role === "ADMIN";
  if (!isAdmin && session.user.id !== userId) {
    return new Response("Forbidden", { status: 403 });
  }

  const db = await getDb();
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user?.resumeKey) return new Response("Not found", { status: 404 });

  const env = await getEnv();
  return streamR2Object(env.VIDEO_BUCKET, user.resumeKey, request.headers.get("range"));
}
