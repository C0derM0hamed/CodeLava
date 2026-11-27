import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { z } from "zod";
import {
  achievements,
  articles,
  clientLogos,
  media,
  projectCategories,
  projects,
  services,
  teamMembers,
  testimonials,
} from "../src/db/schema";

const env = z
  .object({
    DATABASE_URL: z.string().min(1),
    STORAGE_LOCAL_PUBLIC_DIR: z.string().optional(),
  })
  .parse(process.env);

const PUBLIC_STORAGE_DIR = resolve(env.STORAGE_LOCAL_PUBLIC_DIR || "storage/public");

async function clearDemo() {
  const sqlClient = postgres(env.DATABASE_URL, { max: 1 });
  const files = new Set<string>();
  try {
    const db = drizzle(sqlClient);
    await db.transaction(async (tx) => {
      const demoMedia = await tx.select().from(media).where(eq(media.folder, "demo"));
      for (const row of demoMedia) {
        files.add(row.storageKey);
        for (const v of row.variants) files.add(v.key);
      }

      // Remove demo records cleanly by deterministic d3000000 UUID prefix
      await tx.delete(testimonials).where(sql`${testimonials.id}::text LIKE 'd3000000-%'`);
      await tx.delete(articles).where(sql`${articles.id}::text LIKE 'd3000000-%'`);
      await tx.delete(projects).where(sql`${projects.id}::text LIKE 'd3000000-%'`);
      await tx.delete(clientLogos).where(sql`${clientLogos.id}::text LIKE 'd3000000-%'`);
      await tx.delete(achievements).where(sql`${achievements.id}::text LIKE 'd3000000-%'`);
      await tx.delete(teamMembers).where(sql`${teamMembers.id}::text LIKE 'd3000000-%'`);
      await tx.delete(projectCategories).where(sql`${projectCategories.id}::text LIKE 'd3000000-%'`);

      // Clear demo cover links from starter services
      await tx
        .update(services)
        .set({ coverMediaId: null })
        .where(sql`${services.coverMediaId}::text LIKE 'd3000000-%'`);

      await tx.delete(media).where(eq(media.folder, "demo"));
    });

    for (const key of files) {
      await rm(resolve(PUBLIC_STORAGE_DIR, key), { force: true }).catch(() => {});
    }
    console.log(`Cleared all CodeLava demo records and ${files.size} storage files.`);
  } finally {
    await sqlClient.end();
  }
}

void clearDemo().catch((error: unknown) => {
  console.error("Clear demo failed", error);
  process.exitCode = 1;
});
