import { readdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import postgres from "postgres";
import { fixtureIdPrefix } from "../../src/lib/developer-fixtures";
import { serviceEnrichments } from "./legacy-services";
import { fixtureStorage } from "./target";

const prefix = `${fixtureIdPrefix}%`;
const fixtureTables = [
  "testimonials", "articles", "projects", "client_logos", "achievements", "team_members", "project_categories",
];
const legacyContact = {
  email: "hello@codelava.dev",
  phone: "+966 50 000 0000",
  whatsapp: "+966500000000",
  address: { en: "Riyadh · Cairo · Remote Worldwide", ar: "الرياض · القاهرة · نعمل عن بُعد حول العالم" },
  hours: { en: "Sun – Thu, 9:00 AM – 6:00 PM (AST)", ar: "الأحد – الخميس، ٩:٠٠ ص – ٦:٠٠ م (بتوقيت الرياض)" },
  mapUrl: "",
};
const legacySocials = {
  upwork: "https://www.upwork.com/",
  mostaql: "https://mostaql.com/",
  github: "https://github.com/C0derM0hamed",
  linkedin: "https://www.linkedin.com/",
};

export async function clearFixtures(databaseUrl: string, storage: string) {
  const db = postgres(databaseUrl, { max: 1 });
  try {
    const counts = await db.begin(async (tx) => {
      await tx`select pg_advisory_xact_lock(420233)`;

      // Restore only values written by the old seeder, including when a service was edited later.
      for (const [slug, { features, deliverables }] of Object.entries(serviceEnrichments)) {
        await tx`update services set features = '[]'::jsonb where slug = ${slug} and features = ${tx.json(features)}`;
        await tx`update services set deliverables = '{"en":[],"ar":[]}'::jsonb
          where slug = ${slug} and deliverables = ${tx.json(deliverables)}`;
      }
      await tx`update site_settings set value = '{}'::jsonb
        where key = 'socials' and value = ${tx.json(legacySocials)}`;
      for (const [key, value] of Object.entries(legacySocials)) {
        if (key === "github") continue;
        await tx`update site_settings set value = value - ${key}::text
          where key = 'socials' and value -> ${key}::text = ${tx.json(value)}`;
      }
      for (const [key, value] of Object.entries(legacyContact)) {
        if (key === "mapUrl") continue;
        const empty = typeof value === "string" ? "" : { en: "", ar: "" };
        await tx`update site_settings set value = jsonb_set(value, array[${key}::text], ${tx.json(empty)})
          where key = 'contact' and value -> ${key}::text = ${tx.json(value)}`;
      }

      let rows = 0;
      for (const table of fixtureTables) {
        const deleted = await tx`delete from ${tx(table)} where id::text like ${prefix}`;
        rows += deleted.count;
      }
      const deletedMedia = await tx<{ storage_key: string; variants: { key: string }[] }[]>`
        delete from media where id::text like ${prefix} returning storage_key, variants`;
      const keys = new Set(deletedMedia.flatMap(({ storage_key, variants }) => [storage_key, ...variants.map(({ key }) => key)]));
      // Deterministic file names also cover writes from a fixture transaction that rolled back.
      if (storage === fixtureStorage) {
        const names = await readdir(storage).catch((error: NodeJS.ErrnoException) => {
          if (error.code === "ENOENT") return [];
          throw error;
        });
        for (const name of names) if (name.startsWith(fixtureIdPrefix)) keys.add(name);
      }
      for (const key of keys) {
        if (!/^[a-f0-9-]{36}(?:-\d{1,4})?\.(?:webp|avif)$/.test(key)) {
          throw new Error("Unexpected fixture media key. Check the media records before retrying cleanup.");
        }
      }
      for (const key of keys) await rm(resolve(storage, key), { force: true });
      return { rows, media: deletedMedia.length, files: keys.size };
    });
    console.log(`Removed ${counts.rows} fixture content rows, ${counts.media} media rows and ${counts.files} storage files.`);
  } finally {
    await db.end();
  }
}
