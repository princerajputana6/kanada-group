import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

/** @type {import('next').NextConfig} */
// Identifies this build. Inlined into both the client and server bundles, so
// an old tab's value differs from the live server's after a deploy — see
// components/stale-build-guard.tsx and app/api/version.
const BUILD_ID = process.env.WORKERS_CI_COMMIT_SHA || `local-${Date.now()}`;

const nextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_ID: BUILD_ID,
  },
  transpilePackages: ["@kanada/ui", "@kanada/db", "@kanada/auth", "@kanada/storage"],
  eslint: {
    ignoreDuringBuilds: false,
  },
  experimental: {
    // Resumes, payment screenshots and course notes (≤20 MB) post files to server actions.
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
};

// Lets `next dev` (not just `wrangler dev`) resolve Cloudflare bindings
// (D1, R2) defined in wrangler.toml, so `getCloudflareContext()` works
// during normal local development without needing the full OpenNext build.
initOpenNextCloudflareForDev();

export default nextConfig;
