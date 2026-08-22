"use server";

import { getPresignedUploadUrl } from "@/lib/storage";
import { requireRole } from "@/lib/session";
import { assertLessonOwner } from "./course-actions";

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
