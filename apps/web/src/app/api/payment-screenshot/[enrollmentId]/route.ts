import { eq } from "drizzle-orm";
import { enrollments } from "@kanada/db";
import { streamR2Object } from "@kanada/storage";
import { getDb } from "@/lib/db";
import { getEnv } from "@/lib/cloudflare";
import { auth } from "@/auth";

/** Streams a payment screenshot. Admins, or the student who uploaded it. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ enrollmentId: string }> },
) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const { enrollmentId } = await params;
  const db = await getDb();
  const enrollment = await db.query.enrollments.findFirst({
    where: eq(enrollments.id, enrollmentId),
  });
  if (!enrollment?.paymentScreenshotKey) {
    return new Response("Not found", { status: 404 });
  }

  const isAdmin = session.user.role === "ADMIN";
  const isOwner = session.user.id === enrollment.userId;
  if (!isAdmin && !isOwner) return new Response("Forbidden", { status: 403 });

  const env = await getEnv();
  return streamR2Object(
    env.VIDEO_BUCKET,
    enrollment.paymentScreenshotKey,
    request.headers.get("range"),
  );
}
