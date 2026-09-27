import type { Role } from "@kanada/db";

declare module "next-auth" {
  interface User {
    role: Role;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSessionUser;
  }
}

// Re-declared minimally to avoid importing the full DefaultSession type graph here.
type DefaultSessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

/**
 * next-auth's package.json exposes subpaths (like "next-auth/jwt") purely via
 * an "exports" map with no legacy "types"/"typesVersions" fields, which trips
 * up TypeScript's `declare module "next-auth/jwt"` augmentation resolution.
 * Rather than fight that, callers that need JWT fields use this local type.
 */
export interface AppJWT {
  id: string;
  role: Role;
  /** Unix seconds of the actual sign-in. Unlike `iat`, Auth.js doesn't reset
   * it when it re-signs the token on each request. */
  authTime?: number;
  [key: string]: unknown;
}
