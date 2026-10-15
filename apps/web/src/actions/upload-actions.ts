"use server";

import { getPresignedUploadUrl } from "@/lib/storage";
import { requireRole } from "@/lib/session";
import { assertLessonOwner } from "@/lib/course-auth";

export async function requestUploadUrlAction(
  lessonId: string,
  filename: string,
  contentType: string,
) {
  const user = await requireRole(["TEACHER", "ADMIN"]);
  const { course } = await assertLessonOwner(lessonId, user);

  if (!contentType.startsWith("video/")) {
    throw new Error("Only video files are supported.");
  }

  return getPresignedUploadUrl(course.id, lessonId, filename, contentType);
}
