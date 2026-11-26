import type { MetadataRoute } from "next";
import { locales } from "@/i18n/routing";
import { absoluteUrl, languageAlternates, localizedPath } from "@/lib/seo";
import { getAllSlugs } from "@/server/queries/slugs";

const staticPaths = [
  "/", "/services", "/work", "/about", "/process", "/technologies", "/blog", "/faq", "/contact", "/quote", "/privacy",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { services, projects, articles } = await getAllSlugs();
  const paths: { path: string; lastModified?: string }[] = staticPaths.map((path) => ({ path }));
  for (const [prefix, rows] of [["services", services], ["work", projects], ["blog", articles]] as const) {
    for (const row of rows) {
      if (!row.noindex) paths.push({ path: `/${prefix}/${encodeURIComponent(row.slug)}`, lastModified: row.updatedAt });
    }
  }
  return paths.flatMap(({ path, lastModified }) => locales.map((locale) => ({
    url: absoluteUrl(localizedPath(locale, path)),
    lastModified,
    alternates: { languages: languageAlternates(path) },
  })));
}
