import "server-only";

import { createHash } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { defaultSectionsRows, sectionRegistry, type SectionPageKey } from "@/content/sections";
import { db } from "@/db";
import { pageSections, siteSettings } from "@/db/schema";
import { localized } from "./fields";

export const pageKeySchema = z.custom<SectionPageKey>(
  (value) => typeof value === "string" && Object.hasOwn(sectionRegistry, value),
);
export const sectionKeySchema = z.string().min(1).max(64);
export const layoutSchema = z.array(z.object({ key: sectionKeySchema, visible: z.boolean() })).min(1).max(2000)
  .refine((items) => new Set(items.map(({ key }) => key)).size === items.length);
export const layoutDraftKey = (page: string) => `layout_draft:${page}`;
export type PageLayout = z.infer<typeof layoutSchema>;
type SectionRow = typeof pageSections.$inferSelect;
const defaults = defaultSectionsRows();

export async function readPageBuilder(page: SectionPageKey, database: Pick<typeof db, "select"> = db) {
  const [rows, [draft]] = await Promise.all([
    database.select().from(pageSections).where(inArray(pageSections.pageKey, page === "work" ? ["work", "portfolio"] : [page])),
    database.select().from(siteSettings).where(eq(siteSettings.key, layoutDraftKey(page))),
  ]);
  const definitions = sectionRegistry[page] as Record<string, { label: string }>;
  const byKey = new Map<string, SectionRow>();
  for (const row of rows) {
    if (row.pageKey === page || !byKey.has(row.sectionKey)) byKey.set(row.sectionKey, row);
  }
  const fallback = new Map(defaults.filter((row) => row.pageKey === page).map((row) => [row.sectionKey, row]));
  const sections = [...new Set([...fallback.keys(), ...byKey.keys()])].map((key) => {
    const row = byKey.get(key);
    return {
      key, row, label: Object.hasOwn(definitions, key) ? definitions[key].label : key,
      sortOrder: row?.sortOrder ?? fallback.get(key)?.sortOrder ?? 0,
      visible: row?.visible ?? true,
      defaults: fallback.get(key)?.content ?? {},
    };
  }).sort((a, b) => a.sortOrder - b.sortOrder || a.key.localeCompare(b.key));

  const live = sections.map(({ key, visible }) => ({ key, visible }));
  const saved = layoutSchema.safeParse(draft?.value).data;
  const savedKeys = new Set(saved?.map(({ key }) => key));
  const liveKeys = new Set(live.map(({ key }) => key));
  const layout = saved
    ? [...saved.filter(({ key }) => liveKeys.has(key)), ...live.filter(({ key }) => !savedKeys.has(key))]
    : live;
  const version = createHash("sha256").update(JSON.stringify({ sections, saved })).digest("hex");
  return { sections, layout, live, version, hasLayoutDraft: Boolean(saved) };
}

const safeField = (key: string) => !["__proto__", "prototype", "constructor"].includes(key);
const copyKey = z.string().min(1).max(150).refine(safeField);
export const pageCopySchema = z.record(copyKey, localized(5000))
  .refine((value) => Object.keys(value).length <= 100 && JSON.stringify(value).length <= 120_000);

export function editableCopy(base: Record<string, unknown>, published?: Record<string, unknown>, draft?: Record<string, unknown>) {
  const result: Record<string, { en: string; ar: string }> = {};
  const partial = z.object({ en: z.string().optional(), ar: z.string().optional() });
  for (const layer of [base, published, draft]) {
    for (const [key, value] of Object.entries(layer ?? {})) {
      const copy = partial.safeParse(value);
      if (!safeField(key) || !copy.success || (!("en" in copy.data) && !("ar" in copy.data))) continue;
      result[key] = { en: copy.data.en ?? result[key]?.en ?? "", ar: copy.data.ar ?? result[key]?.ar ?? "" };
    }
  }
  return result;
}

export function mergePublishedCopy(published: Record<string, unknown>, draft: Record<string, unknown>) {
  const result = { ...published };
  for (const [key, value] of Object.entries(draft)) {
    if (!safeField(key)) continue;
    const original = Object.hasOwn(result, key) ? result[key] : undefined;
    const object = (item: unknown): item is Record<string, unknown> => Boolean(item && typeof item === "object" && !Array.isArray(item));
    result[key] = object(original) && object(value) && ("en" in value || "ar" in value)
      ? { ...original, ...value }
      : value;
  }
  return result;
}
