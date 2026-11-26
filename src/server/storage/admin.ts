"use server";

import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { articles, clientLogos, media, pageMeta, pageSections, projectMedia, projects, services, siteSettings, teamMembers, technologies, testimonials } from "@/db/schema";
import { permits } from "@/server/auth/permissions";
import { requireUser } from "@/server/auth/session";
import { invalidate, recordChange, type ActionResult, type Transaction } from "@/server/changes";
import { catalog } from "@/server/content/catalog";
import { localized } from "@/server/content/fields";
import { removePublicFiles } from "./media";
import { mediaFolder } from "./schema";

const metadata = z.object({
  id: z.uuid(), alt: localized(500), folder: mediaFolder,
});

export async function updateMedia(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  if (!permits(user.permissions, "media:write")) return { ok: false, error: "Media write permission required." };
  const parsed = metadata.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Enter a valid folder and alt text." };
  const { id, ...values } = parsed.data;
  try {
    const updated = await db.transaction(async (tx) => {
      const [row] = await tx.update(media).set(values).where(eq(media.id, id)).returning({ id: media.id });
      if (!row) return false;
      await recordChange(tx, { userId: user.id, entity: "media", id, action: "update", type: "content.updated" });
      return true;
    });
    if (!updated) return { ok: false, error: "Asset not found." };
    invalidate("media", "/admin/media");
    return { ok: true };
  } catch (error) {
    console.error("Media update failed", error);
    return { ok: false, error: "Could not update the asset." };
  }
}

async function isReferenced(tx: Transaction, id: string, url: string) {
  const checks = [
    sql`select 1 from ${services} where ${services.coverMediaId} = ${id} or ${services.seo}->>'ogImageId' = ${id}`,
    sql`select 1 from ${projects} where ${projects.coverMediaId} = ${id} or ${projects.videoMediaId} = ${id} or ${projects.seo}->>'ogImageId' = ${id}`,
    sql`select 1 from ${projectMedia} where ${projectMedia.mediaId} = ${id}`,
    sql`select 1 from ${articles} where ${articles.coverMediaId} = ${id} or ${articles.seo}->>'ogImageId' = ${id}`,
    sql`select 1 from ${clientLogos} where ${clientLogos.logoMediaId} = ${id}`,
    sql`select 1 from ${technologies} where ${technologies.iconMediaId} = ${id}`,
    sql`select 1 from ${teamMembers} where ${teamMembers.photoMediaId} = ${id}`,
    sql`select 1 from ${testimonials} where ${testimonials.avatarMediaId} = ${id}`,
    sql`select 1 from ${pageMeta} where ${pageMeta.seo}->>'ogImageId' = ${id}`,
    sql`select 1 from ${pageSections} where jsonb_path_exists(${pageSections.content}, '$.** ? (@ == $id)', jsonb_build_object('id', ${id}::text))
      or jsonb_path_exists(${pageSections.draftContent}, '$.** ? (@ == $id)', jsonb_build_object('id', ${id}::text))`,
    sql`select 1 from ${siteSettings} where jsonb_path_exists(${siteSettings.value}, '$.** ? (@ == $id)', jsonb_build_object('id', ${id}::text))`,
  ];
  // Rich text can refer to the original URL or a responsive variant.
  const urlBase = url.replace(/\.[a-z0-9]+$/i, "");
  const embedded = urlBase ? [...Object.values(catalog).map(({ table }) => table), siteSettings]
    .map((table) => sql`select 1 from ${table} as entry where strpos(to_jsonb(entry)::text, ${urlBase}) > 0`) : [];
  const [row] = await tx.execute<{ referenced: boolean }>(sql`select exists(${sql.join([...checks, ...embedded], sql` union all `)}) as referenced`);
  return row.referenced;
}

export async function deleteMedia(rawId: unknown): Promise<ActionResult> {
  const user = await requireUser();
  if (!permits(user.permissions, "media:delete")) return { ok: false, error: "Media delete permission required." };
  const id = z.uuid().safeParse(rawId).data;
  if (!id) return { ok: false, error: "Invalid asset." };
  try {
    const outcome = await db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(420233)`);
      const [row] = await tx.select().from(media).where(eq(media.id, id)).for("update");
      if (!row) return { error: "Asset not found." };
      if (await isReferenced(tx, id, row.url)) return { error: "Remove this asset from the content that uses it first." };
      await tx.delete(media).where(eq(media.id, id));
      await recordChange(tx, { userId: user.id, entity: "media", id, action: "delete", type: "content.deleted" });
      return { keys: [...new Set([row.storageKey, ...row.variants.map((variant) => variant.key)])] };
    });
    if (!outcome.keys) return { ok: false, error: outcome.error };
    await removePublicFiles(outcome.keys);
    invalidate("media", "/admin/media");
    return { ok: true };
  } catch (error) {
    console.error("Media deletion failed", error);
    return { ok: false, error: "Could not delete the asset." };
  }
}
