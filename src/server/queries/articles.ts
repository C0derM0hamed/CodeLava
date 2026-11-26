import "server-only";
import { and, count, desc, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { articles, media, teamMembers } from "@/db/schema";
import type { AppLocale } from "@/i18n/routing";
import { t } from "@/lib/i18n-content";
import { renderMarkdown } from "@/lib/markdown";
import { publicQuery } from "./cache";
import { mediaView, published, seoView } from "./shared";

type ArticleRow = typeof articles.$inferSelect & {
  cover: typeof media.$inferSelect | null;
  author: typeof teamMembers.$inferSelect | null;
};

function articleView(row: ArticleRow, locale: AppLocale, draft: boolean) {
  const author = row.author && (draft || row.author.visible) ? row.author : null;
  return {
    id: row.id, slug: row.slug, title: t(row.title, locale) ?? "", excerpt: t(row.excerpt, locale) ?? "",
    author: author ? { slug: author.slug, name: t(author.name, locale) ?? "", role: t(author.role, locale) ?? "" } : null,
    tags: row.tags, readingMinutes: row.readingMinutes, featured: row.featured,
    cover: mediaView(row.cover, locale), publishedAt: row.publishedAt?.toISOString() ?? null,
  };
}

export type ArticleFilters = { page?: number; pageSize?: number; tag?: string };

const readArticles = publicQuery("public-articles", ["articles", "team", "media"], async (
  draft, page: number, pageSize: number, tag: string | undefined, locale: AppLocale,
) => {
  const filter = and(published(articles.status, draft),
    tag ? sql`${articles.tags} @> ${JSON.stringify([tag])}::jsonb` : undefined);
  const [rows, totals] = await Promise.all([
    db.query.articles.findMany({
      where: filter, with: { cover: true, author: true },
      orderBy: (table, { asc }) => [sql`${table.publishedAt} desc nulls last`, asc(table.slug)],
      offset: (page - 1) * pageSize, limit: pageSize,
    }),
    db.select({ total: count() }).from(articles).where(filter),
  ]);
  return { items: rows.map((row) => articleView(row, locale, draft)), total: totals[0]?.total ?? 0 };
}, { items: [], total: 0 });

export async function getArticles(filters: ArticleFilters = {}, locale: AppLocale = "en") {
  const page = Number.isSafeInteger(filters.page) ? Math.max(1, Math.min(filters.page!, 1_000_000)) : 1;
  const pageSize = Number.isSafeInteger(filters.pageSize) ? Math.max(1, Math.min(filters.pageSize!, 100)) : 12;
  const result = await readArticles(page, pageSize, filters.tag, locale);
  return { ...result, page, pageSize, pageCount: Math.ceil(result.total / pageSize) };
}

export const getArticleBySlug = publicQuery("public-article", ["articles", "team", "media"], async (
  draft, slug: string, locale: AppLocale = "en",
) => {
  const row = await db.query.articles.findFirst({
    where: (table) => and(eq(table.slug, slug), published(table.status, draft)),
    with: { cover: true, author: true },
  });
  if (!row) return null;
  const [related, seoImage] = await Promise.all([
    db.query.articles.findMany({
      where: (table) => and(ne(table.id, row.id), published(table.status, draft)),
      with: { cover: true, author: true },
      orderBy: (table, { asc }) => [
        ...(row.tags.length ? [desc(sql`${table.tags} ?| array[${sql.join(row.tags.map((tag) => sql`${tag}`), sql`, `)}]::text[]`)] : []),
        sql`${table.publishedAt} desc nulls last`, asc(table.slug),
      ],
      limit: 3,
    }),
    row.seo.ogImageId ? db.query.media.findFirst({ where: eq(media.id, row.seo.ogImageId) }) : null,
  ]);
  const { html, toc } = renderMarkdown(t(row.body, locale) ?? "");
  return {
    ...articleView(row, locale, draft), bodyHtml: html, toc, updatedAt: row.updatedAt.toISOString(),
    related: related.map((article) => articleView(article, locale, draft)),
    seo: seoView(row.seo, locale, mediaView(seoImage, locale)),
  };
}, null);
