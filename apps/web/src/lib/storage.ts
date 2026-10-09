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
  contentDisposition?: string,
) {
  const env = await getEnv();
  await env.VIDEO_BUCKET.put(key, data, {
    httpMetadata: { contentType, ...(contentDisposition && { contentDisposition }) },
  });
  return key;
}

export async function deleteObject(key: string) {
  const env = await getEnv();
  await env.VIDEO_BUCKET.delete(key);
}

/** `attachment` disposition with an RFC 5987 UTF-8 filename. */
export function attachmentDisposition(fileName: string) {
  const ascii = fileName.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fileName).replace(/['()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)}`;
}
