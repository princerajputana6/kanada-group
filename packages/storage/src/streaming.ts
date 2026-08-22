import type { R2Bucket } from "@cloudflare/workers-types";

export interface ResolvedRange {
  offset: number;
  length: number;
}

/**
 * Resolves an HTTP `Range: bytes=...` header against a known object size.
 * Handles all three forms the spec allows: `start-end`, `start-` (open-ended),
 * and `-suffixLength`. Returns undefined when there's no range, it's malformed,
 * or it's unsatisfiable — callers should fall back to a full 200 response.
 */
export function parseRangeHeader(
  header: string | null,
  size: number,
): ResolvedRange | undefined {
  if (!header) return undefined;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return undefined;

  const [, startStr, endStr] = match;
  if (startStr === "" && endStr === "") return undefined;

  let start: number;
  let end: number;

  if (startStr === "") {
    const suffixLength = Number(endStr);
    start = Math.max(size - suffixLength, 0);
    end = size - 1;
  } else {
    start = Number(startStr);
    end = endStr === "" ? size - 1 : Math.min(Number(endStr), size - 1);
  }

  if (!Number.isFinite(start) || !Number.isFinite(end)) return undefined;
  if (start > end || start >= size || start < 0) return undefined;

  return { offset: start, length: end - start + 1 };
}

/**
 * Streams an R2 object as a Response, honoring an incoming Range header
 * (returns 206 Partial Content) so a native <video> element can seek.
 * Runs entirely off the R2 binding — no S3 SDK, no signing.
 */
export async function streamR2Object(
  bucket: R2Bucket,
  key: string,
  rangeHeader: string | null,
): Promise<Response> {
  const head = await bucket.head(key);
  if (!head) {
    return new Response("Not found", { status: 404 });
  }

  const size = head.size;
  const resolved = parseRangeHeader(rangeHeader, size);

  // This file gets type-checked both under its own (DOM-free, workers-types)
  // tsconfig and, via direct workspace source imports, under consuming apps'
  // tsconfigs that *do* include DOM — whose Headers/Response/ReadableStream
  // structurally conflict with workers-types' versions of the same globals.
  // They're the same objects at runtime in a Workers isolate; the `as` casts
  // below just paper over the two ambient lib definitions never fully
  // agreeing. Separately, `head.writeHttpMetadata(headers)` — the API R2
  // exposes for this — fails across the Node/Miniflare realm boundary under
  // plain `next dev` (a Node-native Headers instance isn't what Miniflare's
  // R2 shim expects there), so metadata is copied field-by-field from the
  // plain `httpMetadata` object instead, which has no such boundary issue.
  const headers = new Headers();
  if (head.httpMetadata?.contentType) {
    headers.set("content-type", head.httpMetadata.contentType);
  }
  if (head.httpMetadata?.contentDisposition) {
    headers.set("content-disposition", head.httpMetadata.contentDisposition);
  }
  if (head.httpMetadata?.contentEncoding) {
    headers.set("content-encoding", head.httpMetadata.contentEncoding);
  }
  if (head.httpMetadata?.contentLanguage) {
    headers.set("content-language", head.httpMetadata.contentLanguage);
  }
  if (head.httpMetadata?.cacheControl) {
    headers.set("cache-control", head.httpMetadata.cacheControl);
  } else {
    headers.set("cache-control", "private, max-age=3600");
  }
  headers.set("etag", head.httpEtag);
  headers.set("accept-ranges", "bytes");

  if (!resolved) {
    const object = await bucket.get(key);
    if (!object) return new Response("Not found", { status: 404 });
    headers.set("content-length", String(size));
    return new Response(object.body as unknown as BodyInit, { status: 200, headers });
  }

  const { offset, length } = resolved;
  const object = await bucket.get(key, { range: { offset, length } });
  if (!object) return new Response("Not found", { status: 404 });

  headers.set("content-range", `bytes ${offset}-${offset + length - 1}/${size}`);
  headers.set("content-length", String(length));
  return new Response(object.body as unknown as BodyInit, { status: 206, headers });
}
