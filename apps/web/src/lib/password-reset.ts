import { and, eq, gt, isNull } from "drizzle-orm";
import { passwordResetTokens } from "@kanada/db";
import { getDb } from "./db";

export const RESET_TTL_MINUTES = 60;
export const RESET_MAX_PER_HOUR = 3;

/** 256-bit URL-safe random token (the only copy goes in the email). */
export function newResetToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** The live (unused, unexpired) token row for a raw token, if any. */
export async function findValidResetToken(token: string | undefined | null) {
  if (!token || token.length < 20 || token.length > 100) return null;
  const db = await getDb();
  return (
    (await db.query.passwordResetTokens.findFirst({
      where: and(
        eq(passwordResetTokens.tokenHash, await hashToken(token)),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date()),
      ),
    })) ?? null
  );
}
