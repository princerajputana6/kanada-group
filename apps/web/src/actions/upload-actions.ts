"use server";

import { resumeKeyFor } from "@kanada/storage";
import { getPresignedUploadUrl, putObject } from "@/lib/storage";
import { requireRole } from "@/lib/session";
import { assertLessonOwner } from "./course-actions";

const MAX_RESUME_BYTES = 10 * 1024 * 1024; // 10 MB

export async function requestUploadUrlAction(
  lessonId: string,
  filename: string,
  contentType: string,
) {
  const user = await requireRole(["TEACHER"]);
  const { course } = await assertLessonOwner(lessonId, user.id);

  if (!contentType.startsWith("video/")) {
    throw new Error("Only video files are supported.");
  }

  return getPresignedUploadUrl(course.id, lessonId, filename, contentType);
}

/**
 * Uploads a registration resume (PDF) straight to R2 via the Worker binding
 * and returns its object key. Unauthenticated by necessity (the account
 * doesn't exist yet) — restricted to PDFs under 10 MB with a random key.
 */
export async function uploadResumeAction(formData: FormData): Promise<{ key: string }> {
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("No file provided.");
  if (file.type !== "application/pdf") throw new Error("Resume must be a PDF file.");
  if (file.size > MAX_RESUME_BYTES) throw new Error("Resume must be 10 MB or smaller.");

  const key = resumeKeyFor(crypto.randomUUID(), file.name);
  await putObject(key, await file.arrayBuffer(), file.type);
  return { key };
}
