// Hand-written to match wrangler.toml's bindings/vars. Once real Cloudflare
// resources exist, `pnpm cf-typegen` (see package.json) regenerates this
// precisely from the live wrangler.toml via `wrangler types`.
//
// Deliberately scoped with `import type` + `declare global` rather than
// listing "@cloudflare/workers-types" in tsconfig's `types` array: that
// package's ambient Headers/Response/ReadableStream conflict with the DOM
// lib the rest of this Next.js app needs. Runtime code that touches R2/D1
// method bodies directly (packages/storage) stays isolated in its own
// DOM-free tsconfig; here we only need the binding shapes.

import type { D1Database, R2Bucket, Fetcher } from "@cloudflare/workers-types";

declare global {
  interface CloudflareEnv {
    DB: D1Database;
    VIDEO_BUCKET: R2Bucket;
    ASSETS: Fetcher;
    R2_BUCKET_NAME: string;
    AUTH_SECRET: string;
    R2_ACCOUNT_ID: string;
    R2_UPLOAD_ACCESS_KEY_ID: string;
    R2_UPLOAD_SECRET_ACCESS_KEY: string;
    RESEND_API_KEY?: string;
    RESEND_FROM?: string;
  }
}
