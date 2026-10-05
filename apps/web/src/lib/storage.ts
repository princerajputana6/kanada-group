import { createUploadUrl, videoKeyFor, deleteVideo } from "@kanada/storage";
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

export async function removeVideo(key: string) {
  const env = await getEnv();
  await deleteVideo(env.VIDEO_BUCKET, key);
}

/**
 * Writes bytes straight to R2 through the Worker binding — no presigned S3
 * URL and no R2 API-token credentials needed. Suitable for small files
 * (resumes, payment screenshots); large videos still use presigned PUT.
 */
export async function putObject(
  key: string,
  data: ArrayBuffer,
  contentType: string,
) {
  const env = await getEnv();
  await env.VIDEO_BUCKET.put(key, data, {
    httpMetadata: { contentType },
  });
  return key;
}
