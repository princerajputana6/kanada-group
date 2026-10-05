"use server";

import {
  getPresignedUploadUrl,
  getPresignedResumeUrl,
  getPresignedPaymentUrl,
} from "@/lib/storage";
import { requireRole, requireUser } from "@/lib/session";
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

/**
 * Presigned URL for a resume upload during registration. Unauthenticated by
 * necessity (the account doesn't exist yet) — restricted to PDFs and a
 * random object key, so it can't overwrite anything.
 */
export async function requestResumeUploadUrlAction(
  filename: string,
  contentType: string,
) {
  if (contentType !== "application/pdf") {
    throw new Error("Resume must be a PDF file.");
  }
  return getPresignedResumeUrl(filename, contentType);
}

/**
 * Presigned URL for a payment-screenshot upload. The student must be signed
 * in and own the enrollment; images only.
 */
export async function requestPaymentUploadUrlAction(
  enrollmentId: string,
  filename: string,
  contentType: string,
) {
  await requireUser();
  if (!contentType.startsWith("image/")) {
    throw new Error("Payment proof must be an image.");
  }
  return getPresignedPaymentUrl(enrollmentId, filename, contentType);
}
