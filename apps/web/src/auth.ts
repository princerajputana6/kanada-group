import NextAuth from "next-auth";
import { buildAuthConfig } from "@kanada/auth";
import { getDb } from "./lib/db";
import { getEnv } from "./lib/cloudflare";

export const { handlers, auth, signIn, signOut } = NextAuth(async () => {
  const env = await getEnv();
  return {
    ...buildAuthConfig(getDb),
    secret: env.AUTH_SECRET,
  };
});
