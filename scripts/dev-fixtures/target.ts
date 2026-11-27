import { resolve } from "node:path";

import { fixtureDatabase, localDatabaseUrl } from "../../src/lib/developer-fixtures";

export { fixtureDatabase };
export const fixtureStorage = resolve("storage/dev-fixtures/public");

export function readFixtureTarget(args: string[]) {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Developer fixtures require NODE_ENV=development.");
  }
  const clean = args.length === 1 && args[0] === "--clean";
  if (args.length && !clean) throw new Error("Usage: pnpm db:fixtures [--clean]");
  const databaseUrl = process.env.DATABASE_URL;
  const url = localDatabaseUrl(databaseUrl ?? "");
  if (!databaseUrl || !url) {
    throw new Error("Developer fixtures require a loopback PostgreSQL URL without connection parameters.");
  }
  const dedicated = url.pathname === `/${fixtureDatabase}`;
  if (!dedicated && !clean) {
    throw new Error(`Create a separate local ${fixtureDatabase} database before seeding developer fixtures.`);
  }
  return {
    clean,
    databaseUrl,
    storage: dedicated ? fixtureStorage : resolve(process.env.STORAGE_LOCAL_PUBLIC_DIR || "storage/public"),
  };
}
