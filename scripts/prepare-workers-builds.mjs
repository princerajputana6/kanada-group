// Runs at the end of the root `pnpm run build`. Inside Cloudflare Workers
// Builds (WORKERS_CI=1) it places the deploy config at the repo root so the
// dashboard's default deploy command, `npx wrangler deploy`, can find it.
// Anywhere else it does nothing — see deploy/workers-builds.wrangler.jsonc
// for why that file must not exist at the root during local development.
import { copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

if (process.env.WORKERS_CI) {
  const root = new URL("../", import.meta.url);
  copyFileSync(
    fileURLToPath(new URL("deploy/workers-builds.wrangler.jsonc", root)),
    fileURLToPath(new URL("wrangler.jsonc", root)),
  );
  console.log("Workers Builds: wrote wrangler.jsonc at the repo root for `wrangler deploy`.");
} else {
  console.log("Not in Workers Builds (WORKERS_CI unset): skipping root wrangler.jsonc.");
}
