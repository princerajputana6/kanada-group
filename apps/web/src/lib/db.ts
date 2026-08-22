import { createDb, type Db } from "@kanada/db";
import { getEnv } from "./cloudflare";

export async function getDb(): Promise<Db> {
  const env = await getEnv();
  return createDb(env.DB);
}
