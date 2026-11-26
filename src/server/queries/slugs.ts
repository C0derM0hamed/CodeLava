import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, projects, services } from "@/db/schema";
import { publishedQuery } from "./cache";

export type SitemapSlug = { slug: string; updatedAt: string; noindex: boolean };

function sitemapSlugs(rows: { slug: string; updatedAt: Date; seo: { noindex?: boolean } }[]): SitemapSlug[] {
  return rows.map(({ slug, updatedAt, seo }) => ({ slug, updatedAt: updatedAt.toISOString(), noindex: seo.noindex ?? false }));
}

const readServiceSlugs = publishedQuery("public-service-slugs", ["services"], async () => sitemapSlugs(
  await db.select({ slug: services.slug, updatedAt: services.updatedAt, seo: services.seo })
    .from(services).where(eq(services.status, "published")).orderBy(asc(services.slug)),
), []);
const readProjectSlugs = publishedQuery("public-project-slugs", ["projects"], async () => sitemapSlugs(
  await db.select({ slug: projects.slug, updatedAt: projects.updatedAt, seo: projects.seo })
    .from(projects).where(eq(projects.status, "published")).orderBy(asc(projects.slug)),
), []);
const readArticleSlugs = publishedQuery("public-article-slugs", ["articles"], async () => sitemapSlugs(
  await db.select({ slug: articles.slug, updatedAt: articles.updatedAt, seo: articles.seo })
    .from(articles).where(eq(articles.status, "published")).orderBy(asc(articles.slug)),
), []);

// Search engines only receive published URLs, even when the request carries a draft cookie.
export async function getAllSlugs() {
  const [services, projects, articles] = await Promise.all([readServiceSlugs(), readProjectSlugs(), readArticleSlugs()]);
  return { services, projects, articles };
}
