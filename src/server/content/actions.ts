"use server";

import { asc, eq, getTableColumns, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { media, projectMedia, projectServices, projectTechnologies } from "@/db/schema";
import { permits } from "@/server/auth/permissions";
import { requireUser } from "@/server/auth/session";
import { invalidate, recordChange, type ActionResult, type Transaction } from "@/server/changes";
import { catalog, isEntity, type Entity } from "./catalog";
import { contentId, groupContent, keyColumn } from "./data";
import { localized, shape, slugify, type Field } from "./fields";

const idList = z.array(z.uuid()).max(100).transform((ids) => [...new Set(ids)]);
const gallerySchema = z.array(z.object({
  mediaId: z.uuid(), caption: localized(1000).nullable(), role: z.enum(["gallery", "mockup", "screenshot"]),
})).max(60).refine((gallery) => new Set(gallery.map((item) => item.mediaId)).size === gallery.length, "Choose each asset once.");
const fail = (error: string): ActionResult => ({ ok: false, error });
const denied = () => fail("You do not have permission to make this change.");

export async function saveContent(entityName: string, inputId: string | null, input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  if (!isEntity(entityName)) return fail("Unknown content type.");
  const entity = entityName;
  const config = catalog[entity];
  if (!permits(user.permissions, `${entity}:write`)) return denied();
  const canPublish = permits(user.permissions, `${entity}:publish`);
  const primary = config.key ?? "id";
  const id = inputId === null ? null : validId(entity, inputId);
  if (inputId !== null && !id) return fail("Invalid record.");
  const submitted = z.record(z.string(), z.unknown()).safeParse(input);
  if (!submitted.success) return fail("Invalid form.");
  const values = submitted.data;
  if (config.fields.some((field) => field.key === "slug") && !values.slug) {
    const source = values[config.title];
    const copy = localized(1000).safeParse(source).data;
    values.slug = slugify(typeof source === "string" ? source : copy?.en || copy?.ar || "");
  }
  const parsed = shape(config.fields).safeParse(values);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const label = config.fields.find((field) => field.key === issue.path[0])?.label ?? "Form";
    return fail(`${label} — ${issue.message}`);
  }
  const gallery = gallerySchema.safeParse(values.gallery ?? []);
  const technologyIds = idList.safeParse(parsed.data.technologyIds ?? []);
  const serviceIds = idList.safeParse(parsed.data.serviceIds ?? []);
  if (entity === "projects" && (!gallery.success || !technologyIds.success || !serviceIds.success)) return fail("Check the project gallery and linked records.");

  try {
    const result = await db.transaction(async (tx): Promise<ActionResult> => {
      await tx.execute(sql`select pg_advisory_xact_lock(420233)`);
      const existing = id ? (await tx.select().from(config.table).where(eq(keyColumn(entity), id)).for("update"))[0] as Record<string, unknown> | undefined : undefined;
      if (id && !existing) return fail("This record no longer exists.");
      if (existing && config.key && parsed.data[primary] !== id) return fail("A saved key cannot be renamed.");
      const values = { ...parsed.data };
      delete values.technologyIds;
      delete values.serviceIds;
      for (const key of ["seo", "socials"]) {
        if (values[key] && typeof values[key] === "object") {
          values[key] = Object.fromEntries(Object.entries(values[key]).filter(([, value]) => value !== null));
        }
      }
      if (requiresPublish(entity, existing, values) && !canPublish) return denied();
      if (values.status === "published") values.publishedAt = existing?.status === "published" && existing.publishedAt ? existing.publishedAt : new Date();
      if (values.status && values.status !== "published") values.publishedAt = existing?.publishedAt ?? null;
      if (entity === "articles") {
        const body = localized(40_000).parse(values.body);
        values.readingMinutes = Math.max(1, Math.ceil(Math.max(...Object.values(body).map((language) => language.match(/[\p{L}\p{N}]+/gu)?.length ?? 0)) / 220));
      }
      if (config.ordered && (!existing || (config.groupBy && existing[config.groupBy] !== values[config.groupBy]))) {
        const orderedBy = getTableColumns(config.table).sortOrder;
        const partition = config.groupBy ? eq(getTableColumns(config.table)[config.groupBy], values[config.groupBy]) : undefined;
        const [row] = await tx.select({ order: sql<number>`coalesce(max(${orderedBy}), -1)::int` }).from(config.table).where(partition);
        values.sortOrder = row.order + 1;
      }
      const assets = findMedia(config.fields, values);
      if (entity === "projects" && gallery.success) for (const item of gallery.data) assets.push({ id: item.mediaId });
      if (!await checkAssets(tx, assets)) return fail("A selected asset is missing or has the wrong media type.");

      const [row] = existing
        ? await tx.update(config.table).set(values).where(eq(keyColumn(entity), id!)).returning()
        : await tx.insert(config.table).values(values).returning();
      const rowId = String(row[primary]);
      if (entity === "projects" && gallery.success && technologyIds.success && serviceIds.success) {
        await tx.delete(projectMedia).where(eq(projectMedia.projectId, rowId));
        await tx.delete(projectTechnologies).where(eq(projectTechnologies.projectId, rowId));
        await tx.delete(projectServices).where(eq(projectServices.projectId, rowId));
        if (gallery.data.length) await tx.insert(projectMedia).values(gallery.data.map((item, sortOrder) => ({ ...item, sortOrder, projectId: rowId })));
        if (technologyIds.data.length) await tx.insert(projectTechnologies).values(technologyIds.data.map((technologyId) => ({ technologyId, projectId: rowId })));
        if (serviceIds.data.length) await tx.insert(projectServices).values(serviceIds.data.map((serviceId) => ({ serviceId, projectId: rowId })));
      }
      const published = (values.status === "published" && existing?.status !== "published") ||
        (values.visible === true && existing?.visible !== true);
      const action = published ? "publish" : existing ? "update" : "create";
      await recordChange(tx, { userId: user.id, entity, id: rowId, action, type: published ? "content.published" : existing ? "content.updated" : "content.created" });
      return { ok: true, id: rowId };
    });
    if (result.ok) refresh(entity);
    return result;
  } catch (error) {
    return writeFailure(error);
  }
}

export async function deleteContent(entityName: string, inputId: string): Promise<ActionResult> {
  const user = await requireUser();
  if (!isEntity(entityName)) return fail("Unknown content type.");
  const entity = entityName;
  if (!permits(user.permissions, `${entity}:delete`)) return denied();
  const id = validId(entity, inputId);
  if (!id) return fail("Invalid record.");
  try {
    const result = await db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(420233)`);
      if (entity === "page_sections" && !permits(user.permissions, "page_sections:publish")) return denied();
      const [deleted] = await tx.delete(catalog[entity].table).where(eq(keyColumn(entity), id)).returning();
      if (!deleted) return fail("This record no longer exists.");
      await recordChange(tx, { userId: user.id, entity, id, action: "delete", type: "content.deleted" });
      return { ok: true } as const;
    });
    if (result.ok) refresh(entity);
    return result;
  } catch (error) {
    return writeFailure(error);
  }
}

export async function reorderContent(entityName: string, rawGroup: string, rawIds: unknown): Promise<ActionResult> {
  const user = await requireUser();
  if (!isEntity(entityName)) return fail("Unknown content type.");
  const entity = entityName;
  const config = catalog[entity];
  if (!permits(user.permissions, `${entity}:write`) || !permits(user.permissions, `${entity}:publish`)) return denied();
  const input = z.array(z.uuid()).min(1).max(2000).safeParse(rawIds);
  const group = z.string().max(48).safeParse(rawGroup);
  if (!config.ordered || !input.success || !group.success || new Set(input.data).size !== input.data.length) return fail("Invalid order.");
  try {
    const result = await db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(420233)`);
      const rows = await tx.select().from(config.table).where(config.groupBy
        ? eq(getTableColumns(config.table)[config.groupBy], group.data) : undefined)
        .orderBy(asc(getTableColumns(config.table).sortOrder)).for("update");
      const ids = new Set(rows.filter((row) => groupContent(entity, row) === group.data).map((row) => contentId(entity, row)));
      if (ids.size !== input.data.length || input.data.some((id) => !ids.has(id))) return fail("The list changed. Reload it before reordering.");
      const key = keyColumn(entity);
      await tx.update(config.table).set({
        sortOrder: sql`case ${key} ${sql.join(input.data.map((id, index) => sql`when ${id}::uuid then ${index}::int`), sql` `)} end`,
      }).where(inArray(key, input.data));
      await recordChange(tx, { userId: user.id, entity, action: "reorder", type: "content.reordered", meta: { group: group.data, ids: input.data } });
      return { ok: true } as const;
    });
    if (result.ok) refresh(entity);
    return result;
  } catch (error) {
    return writeFailure(error);
  }
}

function validId(entity: Entity, value: unknown) {
  return (catalog[entity].key ? z.string().min(1).max(160) : z.uuid()).safeParse(value).data;
}

function requiresPublish(entity: Entity, existing: Record<string, unknown> | undefined, values: Record<string, unknown>) {
  if (entity === "page_sections") {
    return existing
      ? values.visible !== existing.visible || values.pageKey !== existing.pageKey || values.sectionKey !== existing.sectionKey ||
        sqlComparable(values.content) !== sqlComparable(existing.content)
      : true;
  }
  return entity === "page_meta" || entity === "ui_translations" || values.status === "published" || existing?.status === "published"
    || values.visible === true || existing?.visible === true;
}
function sqlComparable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(sqlComparable).join(",")}]`;
  if (value && typeof value === "object") return JSON.stringify(Object.fromEntries(
    Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => [key, sqlComparable(child)]),
  ));
  return JSON.stringify(value) ?? "";
}

function findMedia(fields: Field[], values: Record<string, unknown>) {
  const ids: { id: string; kind?: Field["mediaKind"] }[] = [];
  for (const field of fields) {
    const value = values[field.key];
    if (field.type === "media" && typeof value === "string") ids.push({ id: value, kind: field.mediaKind });
    if (field.type === "group" && value && typeof value === "object") ids.push(...findMedia(field.fields ?? [], value as Record<string, unknown>));
  }
  return ids;
}

async function checkAssets(tx: Transaction, assets: { id: string; kind?: Field["mediaKind"] }[]) {
  if (!assets.length) return true;
  const rows = await tx.select({ id: media.id, kind: media.kind }).from(media).where(inArray(media.id, assets.map((asset) => asset.id)));
  const kindById = new Map(rows.map((row) => [row.id, row.kind]));
  return assets.every(({ id, kind }) => kind ? kindById.get(id) === kind : kindById.get(id) === "image");
}

function refresh(entity: Entity) {
  invalidate(entity, `/admin/content/${entity}`);
  const publicTag: Partial<Record<Entity, string>> = {
    project_categories: "project-categories", client_logos: "client-logos", team_members: "team",
    process_steps: "process", page_sections: "page-sections", page_meta: "page-meta", ui_translations: "translations",
  };
  if (publicTag[entity]) invalidate(publicTag[entity]);
  if (["project_categories", "technologies", "services"].includes(entity)) invalidate("projects");
  if (entity === "team_members") invalidate("articles");
}

function writeFailure(error: unknown) {
  let cause = error;
  while (cause && typeof cause === "object") {
    if ("code" in cause && cause.code === "23505") return fail("A record with that slug or key already exists.");
    if ("code" in cause && cause.code === "23503") return fail("A linked record no longer exists.");
    cause = "cause" in cause ? cause.cause : undefined;
  }
  console.error("Content write failed", error);
  return fail("Changes could not be saved. Try again.");
}
