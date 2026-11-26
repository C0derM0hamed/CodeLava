import "server-only";
import { asc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { pageMeta, pageSections, siteSettings, uiTranslations } from "@/db/schema";
import { defaultSectionsRows } from "@/content/sections";
import type { AppLocale } from "@/i18n/routing";
import { t } from "@/lib/i18n-content";
import { publishedQuery, publicQuery } from "./cache";
import { mediaView, seoView } from "./shared";

const defaultRows = defaultSectionsRows();
const sectionField = z.object({ en: z.string().optional(), ar: z.string().optional() });
type SectionContent = Record<string, z.infer<typeof sectionField>>;

function mergeSection(base: SectionContent, content: unknown): SectionContent {
  if (!content || typeof content !== "object" || Array.isArray(content)) return base;
  const result = { ...base };
  // Parse fields independently so a malformed value cannot discard its valid siblings.
  for (const [key, value] of Object.entries(content)) {
    if (["__proto__", "prototype", "constructor"].includes(key)) continue;
    const parsed = sectionField.safeParse(value);
    if (parsed.success) result[key] = { ...result[key], ...parsed.data };
  }
  return result;
}

const readSections = publicQuery("public-page-sections", ["page-sections"], async (draft, pageKey: string) => {
  const keys = pageKey === "work" || pageKey === "portfolio" ? ["work", "portfolio"] : [pageKey];
  return db.select({
    id: pageSections.id, pageKey: pageSections.pageKey, sectionKey: pageSections.sectionKey,
    visible: pageSections.visible, sortOrder: pageSections.sortOrder, content: pageSections.content,
    ...(draft ? { draftContent: pageSections.draftContent } : {}),
  }).from(pageSections).where(inArray(pageSections.pageKey, keys));
}, []);

export async function getPageSections(pageKey: string, locale: AppLocale) {
  const rows = await readSections(pageKey);
  const canonicalKey = pageKey === "portfolio" ? "work" : pageKey;
  const bySection = new Map(rows.filter((row) => row.pageKey !== canonicalKey).map((row) => [row.sectionKey, row]));
  for (const row of rows.filter((row) => row.pageKey === canonicalKey)) bySection.set(row.sectionKey, row);
  const defaults = new Map(defaultRows.filter((row) => row.pageKey === canonicalKey).map((row) => [row.sectionKey, row]));
  return [...new Set([...defaults.keys(), ...bySection.keys()])].flatMap((sectionKey) => {
    const row = bySection.get(sectionKey);
    const fallback = defaults.get(sectionKey);
    if (row && !row.visible) return [];
    const base = mergeSection({}, fallback?.content);
    const merged = mergeSection(mergeSection(base, row?.content), row?.draftContent);
    const content = Object.fromEntries(Object.entries(merged).map(([key, value]) => [key, t(value, locale) ?? ""]));
    return [{ id: row?.id ?? null, pageKey: canonicalKey, sectionKey, sortOrder: row?.sortOrder ?? fallback?.sortOrder ?? 0, content }];
  }).sort((a, b) => a.sortOrder - b.sortOrder || a.sectionKey.localeCompare(b.sectionKey));
}

export const getPageMeta = publicQuery("public-page-meta", ["page-meta", "media"], async (
  _draft, pageKey: string, locale: AppLocale = "en",
) => {
  const keys = pageKey === "work" || pageKey === "portfolio" ? ["work", "portfolio"] : [pageKey];
  const rows = await db.select().from(pageMeta).where(inArray(pageMeta.pageKey, keys));
  const row = rows.find(({ pageKey: key }) => key === pageKey) ?? rows[0];
  if (!row) return null;
  const image = row.seo.ogImageId
    ? await db.query.media.findFirst({ where: (media) => eq(media.id, row.seo.ogImageId!) })
    : null;
  return seoView(row.seo, locale, mediaView(image, locale));
}, null);

const localizedSetting = z.object({ en: z.string().optional(), ar: z.string().optional() });
const localizedOrString = z.union([localizedSetting, z.string()]);
const contactSchema = z.object({
  email: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  address: localizedOrString.optional(),
  hours: localizedOrString.optional(),
  map: z.string().optional(),
  mapUrl: z.string().optional(),
});
const socialKeys = ["linkedin", "github", "x", "behance", "dribbble", "website", "upwork", "mostaql"] as const;
const seoSchema = z.object({
  title: localizedOrString.optional(),
  description: localizedOrString.optional(),
  ogImageId: z.uuid().nullish(),
  noindex: z.boolean().optional(),
});
const emptySettings = { contact: {}, socials: {}, seo: { image: null, noindex: false } };

export const getSiteSettings = publicQuery("public-site-settings", ["settings", "media"], async (
  _draft, locale: AppLocale = "en",
) => {
  const rows = await db.select().from(siteSettings).where(inArray(siteSettings.key, ["contact", "socials", "seo"]));
  const settings = new Map(rows.map(({ key, value }) => [key, value]));
  const contact = contactSchema.safeParse(settings.get("contact")).data ?? {};
  const socials = z.partialRecord(z.enum(socialKeys), z.string()).safeParse(settings.get("socials")).data ?? {};
  const seo = seoSchema.safeParse(settings.get("seo")).data ?? {};
  const resolve = (value?: string | { en?: string; ar?: string }) => typeof value === "string" ? value : t(value, locale);
  const imageId = seo.ogImageId;
  const image = imageId ? await db.query.media.findFirst({ where: (media) => eq(media.id, imageId) }) : null;
  return {
    contact: { ...contact, address: resolve(contact.address), hours: resolve(contact.hours) },
    socials,
    seo: { title: resolve(seo.title), description: resolve(seo.description), noindex: seo.noindex ?? false, image: mediaView(image, locale) },
  };
}, {
  ...emptySettings,
  contact: { address: undefined, hours: undefined },
  seo: { ...emptySettings.seo, title: undefined, description: undefined },
});

export const getTranslationOverrides = publishedQuery("public-translation-overrides", ["translations"],
  (locale: AppLocale) => db.select({ key: uiTranslations.key, value: uiTranslations[locale] })
    .from(uiTranslations).orderBy(asc(uiTranslations.key)), []);
