import { headers } from "next/headers";

/**
 * Origin for links in emails. Uses only the Host header — the hostname the
 * request was actually routed on (Cloudflare routes by it) — and never the
 * client-controllable X-Forwarded-Host, so a forged header can't redirect
 * e.g. a password-reset link to someone else's domain.
 */
export async function trustedOrigin(): Promise<string> {
  const host = (await headers()).get("host") ?? "localhost:3000";
  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host);
  return `${isLocal ? "http" : "https"}://${host}`;
}
