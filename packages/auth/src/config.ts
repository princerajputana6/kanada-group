import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { users, type Db, type Role } from "@kanada/db";
import type { AppJWT } from "./types";
import "./types";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

/**
 * Builds the Auth.js config. Takes a `getDb` accessor rather than a `Db`
 * instance directly because on Cloudflare the D1 binding is only reachable
 * inside a request's execution context — the app wires this up by calling
 * `getCloudflareContext()` inside the closure it passes here.
 */
export function buildAuthConfig(getDb: () => Db | Promise<Db>): NextAuthConfig {
  return {
    session: { strategy: "jwt" },
    trustHost: true,
    pages: {
      signIn: "/sign-in",
    },
    providers: [
      Credentials({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(raw) {
          const parsed = credentialsSchema.safeParse(raw);
          if (!parsed.success) return null;

          const db = await getDb();
          const email = parsed.data.email.toLowerCase().trim();
          const user = await db.query.users.findFirst({
            where: eq(users.email, email),
          });
          if (!user || user.banned) return null;

          const valid = await bcrypt.compare(
            parsed.data.password,
            user.passwordHash,
          );
          if (!valid) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image ?? undefined,
          };
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        const t = token as unknown as AppJWT;
        if (user) {
          // Always set by our own authorize() above — never actually undefined.
          t.id = user.id!;
          t.role = user.role as Role;
          t.authTime = Math.floor(Date.now() / 1000);
          return t;
        }

        // JWTs are otherwise stateless, so re-check the account on every
        // session read: bans, deletions, password resets and "sign out
        // everywhere" take effect immediately, and role changes apply
        // without the user signing in again. Returning null clears the
        // session cookie.
        const db = await getDb();
        const current = await db.query.users.findFirst({
          where: eq(users.id, t.id),
          columns: { role: true, banned: true, sessionsValidAfter: true },
        });
        if (!current || current.banned) return null;
        if (
          current.sessionsValidAfter &&
          (t.authTime ?? 0) < Math.floor(current.sessionsValidAfter.getTime() / 1000)
        ) {
          return null;
        }
        t.role = current.role;
        return t;
      },
      async session({ session, token }) {
        const t = token as unknown as AppJWT;
        session.user.id = t.id;
        session.user.role = t.role;
        return session;
      },
    },
  };
}

export function hasRole(
  role: Role | null | undefined,
  allowed: Role[],
): role is Role {
  return !!role && allowed.includes(role);
}
