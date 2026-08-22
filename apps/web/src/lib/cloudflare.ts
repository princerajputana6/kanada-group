import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * The async form works uniformly across RSC, route handlers, server actions,
 * and middleware — the sync form has timing caveats early in a cold start,
 * so every server-side accessor in this app goes through this one function.
 */
export async function getEnv(): Promise<CloudflareEnv> {
  const { env } = await getCloudflareContext({ async: true });
  return env;
}
