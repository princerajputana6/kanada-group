import { createUploadUrl, videoKeyFor, deleteVideo } from "@kanada/storage";
import { getEnv } from "./cloudflare";

export async function getPresignedUploadUrl(
  courseId: string,
  lessonId: string,
  filename: string,
  contentType: string,
) {
  const env = await getEnv();
  const key = videoKeyFor(courseId, lessonId, filename);
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

export async function removeVideo(key: string) {
  const env = await getEnv();
  await deleteVideo(env.VIDEO_BUCKET, key);
}
