import "server-only";
import { and, eq, inArray, notBetween } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import type { AppLocale } from "@/i18n/routing";
import { fixtureIdPrefix, usesFixtureDatabase } from "@/lib/developer-fixtures";
import { t } from "@/lib/i18n-content";
import type { articles, faqs, media, projects, services, testimonials, Seo } from "@/db/schema";

type PublishStatusColumn =
  typeof articles.status | typeof faqs.status | typeof projects.status | typeof services.status | typeof testimonials.status;

export function excludeFixtures(id: PgColumn, draft: boolean) {
  if (draft && usesFixtureDatabase()) return undefined;
  return notBetween(id, `${fixtureIdPrefix}000000000000`, `${fixtureIdPrefix}ffffffffffff`);
}

export function published(
  { id, status }: { id: PgColumn; status: PublishStatusColumn },
  draft: boolean,
) {
  return and(excludeFixtures(id, draft), draft ? inArray(status, ["published", "draft"]) : eq(status, "published"));
}

export function mediaView(row: typeof media.$inferSelect | null | undefined, locale: AppLocale) {
  if (!row || !row.url || row.folder === "private" || row.url.startsWith("/api/")) return null;
  if (row.id.startsWith(fixtureIdPrefix) && !usesFixtureDatabase()) return null;
  const { id, url, width, height, blurDataUrl, variants, mime, kind } = row;
  return { id, url, width, height, alt: t(row.alt, locale) ?? "", blurDataUrl,
    variants: variants.map(({ url, width, height, format }) => ({ url, width, height, format })), mime, kind };
}

export function seoView(seo: Seo, locale: AppLocale, image: ReturnType<typeof mediaView> = null) {
  return {
    title: t(seo.title, locale) || undefined,
    description: t(seo.description, locale) || undefined,
    canonical: seo.canonical,
    noindex: seo.noindex ?? false,
    image,
  };
}
