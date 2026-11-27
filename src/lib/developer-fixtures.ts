export const fixtureDatabase = "codelava_dev_fixtures";
export const fixtureIdPrefix = "d3000000-0000-4000-8000-";

export function localDatabaseUrl(value: string) {
  if (!URL.canParse(value)) return null;
  const url = new URL(value);
  return ["postgres:", "postgresql:"].includes(url.protocol) &&
    ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) && !url.search && !url.hash ? url : null;
}

export function usesFixtureDatabase() {
  return process.env.NODE_ENV === "development" &&
    localDatabaseUrl(process.env.DATABASE_URL ?? "")?.pathname === `/${fixtureDatabase}`;
}

export function fixtureContentAllowed(id: string, draft: boolean) {
  return !id.startsWith(fixtureIdPrefix) || (draft && usesFixtureDatabase());
}
