import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import postgres from "postgres";
import { z } from "zod";
import {
  DEMO_CONTACT,
  DEMO_ID_PREFIX,
  DEMO_MEDIA_FOLDER,
  DEMO_PROCESS_DURATIONS,
  DEMO_SERVICE_ENRICHMENTS,
  DEMO_SLUG_PREFIX,
  DEMO_SOCIALS,
  DEMO_TECH_DESCRIPTIONS,
} from "./demo-data";

const env = z
  .object({
    DATABASE_URL: z.string().min(1),
    STORAGE_LOCAL_PUBLIC_DIR: z.string().optional(),
  })
  .parse(process.env);

const PUBLIC_STORAGE_DIR = resolve(env.STORAGE_LOCAL_PUBLIC_DIR || "storage/public");
const KEY_PATTERN = /^[a-f0-9-]{36}(?:-\d{1,4})?\.(?:webp|avif)$/;
const ID_PATTERN = `${DEMO_ID_PREFIX}%`;
const SLUG_PATTERN = `${DEMO_SLUG_PREFIX}%`;

async function clearDemo() {
  const sql = postgres(env.DATABASE_URL, { max: 1 });
  const filesToDelete = new Set<string>();

  try {
    const counts = await sql.begin(async (tx) => {
      await tx`select pg_advisory_xact_lock(420234)`;

      // 1. Revert ONLY untouched demo-backfilled fields on starter rows (preserves any real edits)
      let starterReverted = 0;

      for (const [slug, { features, deliverables }] of Object.entries(DEMO_SERVICE_ENRICHMENTS)) {
        const f = await tx`
          update services set features = '[]'::jsonb
          where slug = ${slug} and features = ${tx.json(features)}
        `;
        const d = await tx`
          update services set deliverables = '{"en":[],"ar":[]}'::jsonb
          where slug = ${slug} and deliverables = ${tx.json(deliverables)}
        `;
        const c = await tx`
          update services set cover_media_id = null
          where slug = ${slug} and cover_media_id::text like ${ID_PATTERN}
        `;
        if (f.count + d.count + c.count > 0) starterReverted++;
      }

      for (const [stepId, duration] of Object.entries(DEMO_PROCESS_DURATIONS)) {
        const res = await tx`
          update process_steps set duration = null
          where id = ${stepId}::uuid and duration = ${tx.json(duration)}
        `;
        starterReverted += res.count;
      }

      for (const [slug, description] of Object.entries(DEMO_TECH_DESCRIPTIONS)) {
        const res = await tx`
          update technologies set description = '{"en":"","ar":""}'::jsonb
          where slug = ${slug} and description = ${tx.json(description)}
        `;
        starterReverted += res.count;
      }

      for (const [key, value] of Object.entries(DEMO_CONTACT)) {
        const empty = typeof value === "string" ? "" : { en: "", ar: "" };
        await tx`
          update site_settings
          set value = jsonb_set(value, array[${key}::text], ${tx.json(empty)})
          where key = 'contact' and value -> ${key}::text = ${tx.json(value)}
        `;
      }

      for (const [key, value] of Object.entries(DEMO_SOCIALS)) {
        await tx`
          update site_settings
          set value = value - ${key}::text
          where key = 'socials' and value -> ${key}::text = ${tx.json(value)}
        `;
      }

      // 2. Delete ONLY demo rows (by DEMO_ID_PREFIX or demo- slug) in FK-safe order.
      // Never touches users, roles, sessions, leads, audit_logs, page_sections, or real content.
      const deleted: Record<string, number> = {};

      const delTestimonials = await tx`delete from testimonials where id::text like ${ID_PATTERN}`;
      deleted.testimonials = delTestimonials.count;

      const delArticles = await tx`delete from articles where id::text like ${ID_PATTERN} or slug like ${SLUG_PATTERN}`;
      deleted.articles = delArticles.count;

      const delProjects = await tx`delete from projects where id::text like ${ID_PATTERN} or slug like ${SLUG_PATTERN}`;
      deleted.projects = delProjects.count;

      const delClients = await tx`delete from client_logos where id::text like ${ID_PATTERN}`;
      deleted.client_logos = delClients.count;

      const delAchievements = await tx`delete from achievements where id::text like ${ID_PATTERN}`;
      deleted.achievements = delAchievements.count;

      const delTeam = await tx`delete from team_members where id::text like ${ID_PATTERN} or slug like ${SLUG_PATTERN}`;
      deleted.team_members = delTeam.count;

      const delFaqs = await tx`delete from faqs where id::text like ${ID_PATTERN}`;
      deleted.faqs = delFaqs.count;

      const delCats = await tx`delete from project_categories where id::text like ${ID_PATTERN} or slug like ${SLUG_PATTERN}`;
      deleted.project_categories = delCats.count;

      const delMedia = await tx<{ storage_key: string; variants: { key: string }[] }[]>`
        delete from media
        where id::text like ${ID_PATTERN} and folder = ${DEMO_MEDIA_FOLDER}
        returning storage_key, variants
      `;
      deleted.media = delMedia.length;

      for (const row of delMedia) {
        if (KEY_PATTERN.test(row.storage_key) && row.storage_key.startsWith(DEMO_ID_PREFIX)) {
          filesToDelete.add(row.storage_key);
        }
        for (const v of row.variants ?? []) {
          if (KEY_PATTERN.test(v.key) && v.key.startsWith(DEMO_ID_PREFIX)) {
            filesToDelete.add(v.key);
          }
        }
      }

      return { deleted, starterReverted };
    });

    await Promise.allSettled(
      [...filesToDelete].map((key) => rm(resolve(PUBLIC_STORAGE_DIR, key), { force: true })),
    );

    console.log("Demo data cleared (real content and admin users untouched):");
    for (const [table, count] of Object.entries(counts.deleted)) {
      console.log(`  - ${table}: ${count} deleted`);
    }
    console.log(`  - starter fields reverted (if untouched): ${counts.starterReverted}`);
    console.log(`  - storage files removed: ${filesToDelete.size}`);
  } finally {
    await sql.end();
  }
}

void clearDemo().catch((error: unknown) => {
  console.error("clear-demo failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
