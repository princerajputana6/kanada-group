import { AwsClient } from "aws4fetch";
import type { R2Bucket } from "@cloudflare/workers-types";

export interface R2Credentials {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}

/**
 * Signs a presigned PUT URL against R2's S3-compatible endpoint so the
 * browser can upload a video file directly to R2, bypassing the Worker
 * (which has request body size/CPU limits unsuitable for large videos).
 * Requires an R2 API token (Account > R2 > Manage API Tokens), which is a
 * separate credential from the R2 binding used for reads.
 */
export async function createUploadUrl(
  creds: R2Credentials,
  key: string,
  contentType: string,
  expiresInSeconds = 60 * 15,
): Promise<string> {
  const client = new AwsClient({
    accessKeyId: creds.accessKeyId,
    secretAccessKey: creds.secretAccessKey,
  });

  const url = new URL(
    `https://${creds.accountId}.r2.cloudflarestorage.com/${creds.bucketName}/${encodeURIComponent(key)}`,
  );
  url.searchParams.set("X-Amz-Expires", String(expiresInSeconds));

  const signed = await client.sign(
    new Request(url, {
      method: "PUT",
      headers: { "content-type": contentType },
    }),
    { aws: { signQuery: true } },
  );

  return signed.url;
}

export function videoKeyFor(courseId: string, lessonId: string, filename: string) {
  const ext = filename.split(".").pop() ?? "mp4";
  return `videos/${courseId}/${lessonId}.${ext}`;
}

function extOf(filename: string, fallback: string) {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ext && /^[a-z0-9]{1,5}$/.test(ext) ? ext : fallback;
}

/** Resume PDFs, namespaced by a server-generated token (no user id yet at
 * registration time), e.g. `resumes/<token>.pdf`. */
export function resumeKeyFor(token: string, filename: string) {
  return `resumes/${token}.${extOf(filename, "pdf")}`;
}

/** Payment screenshots, namespaced per enrollment, e.g.
 * `payments/<enrollmentId>/<token>.png`. */
export function paymentKeyFor(enrollmentId: string, token: string, filename: string) {
  return `payments/${enrollmentId}/${token}.${extOf(filename, "png")}`;
}

export async function deleteVideo(bucket: R2Bucket, key: string): Promise<void> {
  await bucket.delete(key);
}
