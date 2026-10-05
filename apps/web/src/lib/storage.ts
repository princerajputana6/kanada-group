import {
  createUploadUrl,
  videoKeyFor,
  resumeKeyFor,
  paymentKeyFor,
  deleteVideo,
} from "@kanada/storage";
import { getEnv } from "./cloudflare";

async function signUpload(key: string, contentType: string) {
  const env = await getEnv();
  const url = await createUploadUrl(
    {
      accountId: env.R2_ACCOUNT_ID,
      accessKeyId: env.R2_UPLOAD_ACCESS_KEY_ID,
      secretAccessKey: env.R2_UPLOAD_SECRET_ACCESS_KEY,
      bucketName: env.R2_BUCKET_NAME,
    },
    key,
    contentType,
  );
  return { url, key };
}

export async function getPresignedUploadUrl(
  courseId: string,
  lessonId: string,
  filename: string,
  contentType: string,
) {
  return signUpload(videoKeyFor(courseId, lessonId, filename), contentType);
}

export async function getPresignedResumeUrl(filename: string, contentType: string) {
  return signUpload(resumeKeyFor(crypto.randomUUID(), filename), contentType);
}

export async function getPresignedPaymentUrl(
  enrollmentId: string,
  filename: string,
  contentType: string,
) {
  return signUpload(paymentKeyFor(enrollmentId, crypto.randomUUID(), filename), contentType);
}

export async function removeVideo(key: string) {
  const env = await getEnv();
  await deleteVideo(env.VIDEO_BUCKET, key);
}
