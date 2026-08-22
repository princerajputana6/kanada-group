import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@kanada/ui", "@kanada/db", "@kanada/auth", "@kanada/storage"],
  eslint: {
    ignoreDuringBuilds: false,
  },
};

// Lets `next dev` (not just `wrangler dev`) resolve Cloudflare bindings
// (D1, R2) defined in wrangler.toml, so `getCloudflareContext()` works
// during normal local development without needing the full OpenNext build.
initOpenNextCloudflareForDev();

export default nextConfig;
