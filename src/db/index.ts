import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

// Reuse the client across HMR reloads in dev.
const g = globalThis as unknown as { __codelavaSql?: ReturnType<typeof postgres> };
const sql = g.__codelavaSql ?? postgres(url, { max: 10, idle_timeout: 20, prepare: true });
if (process.env.NODE_ENV !== "production") g.__codelavaSql = sql;

export const db = drizzle(sql, { schema, casing: "snake_case" });
export type DB = typeof db;
export { schema };
