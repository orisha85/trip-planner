import { drizzle } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";
import * as schema from "./schema";

type Drizzle = ReturnType<typeof drizzle<typeof schema>>;

let _client: Sql | null = null;
let _db: Drizzle | null = null;

function getDb(): Drizzle {
  if (_db) return _db;
  const url = process.env.POSTGRES_URL;
  if (!url) {
    throw new Error(
      "POSTGRES_URL is not set. Add it to .env.local or your Vercel environment.",
    );
  }
  _client = postgres(url, { prepare: false });
  _db = drizzle(_client, { schema });
  return _db;
}

export const db = new Proxy({} as Drizzle, {
  get(_target, prop) {
    const d = getDb();
    // @ts-expect-error dynamic proxy
    return d[prop];
  },
});
