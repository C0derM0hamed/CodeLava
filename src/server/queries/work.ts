import "server-only";
import { and, asc, count, eq, inArray, ne, or } from "drizzle-orm";
import { db } from "@/db";
import { media, projectCategories, projects, projectServices, services } from "@/db/schema";
import type { AppLocale } from "@/i18n/routing";
import { countryName, t } from "@/lib/i18n-content";
import { renderMarkdown } from "@/lib/markdown";
import { publicQuery } from "./cache";
import { testimonialView } from "./company";
import { mediaView, published, seoView } from "./shared";

type MediaRow = typeof media.$inferSelect | null;
type CategoryRow = typeof projectCategories.$inferSelect | null;

function categoryView(row: CategoryRow, locale: AppLocale, draft: boolean) {
  if (!row || (!draft && !row.visible)) return null;
  return { id: row.id, slug: row.slug, name: t(row.name, locale) ?? "" };
}

function serviceView(
  row: typeof services.$inferSelect & { cover: MediaRow },
  locale: AppLocale,
  projectCount = 0,
) {
  return {
    id: row.id,
    slug: row.slug,
    title: t(row.title, locale) ?? "",
    tagline: t(row.tagline, locale) ?? "",
    summary: t(row.summary, locale) ?? "",
    icon: row.icon,
    accent: row.accent,
    featured: row.featured,
    cover: mediaView(row.cover, locale),
    projectCount,
  };
}

type ProjectRow = typeof projects.$inferSelect & { cover: MediaRow; category: CategoryRow };

function projectView(row: ProjectRow, locale: AppLocale, draft: boolean) {
  return {
    id: row.id,
    slug: row.slug,
    title: t(row.title, locale) ?? "",
    summary: t(row.summary, locale) ?? "",
    category: categoryView(row.category, locale, draft),
    cover: mediaView(row.cover, locale),
    featured: row.featured,
    accent: row.accent,
    year: row.year,
    clientName: row.clientName,
    clientCountry: row.clientCountry,
    clientCountryName: row.clientCountry ? countryName(row.clientCountry, locale) : null,
    industry: t(row.industry, locale) || null,
    highlightMetric: row.metrics[0]
      ? { value: row.metrics[0].value, label: t(row.metrics[0].label, locale) ?? "" }
      : null,
  };
}

export type ProjectFilters = { category?: string; featured?: boolean; limit?: number; serviceSlug?: string };

async function readProjects(draft: boolean, filters: ProjectFilters, locale: AppLocale) {
  const category = filters.category
    ? db
        .select({ id: projectCategories.id })
        .from(projectCategories)
        .where(
          and(
            eq(projectCategories.slug, filters.category),
            draft ? undefined : eq(projectCategories.visible, true),
          ),
        )
    : undefined;
  const service = filters.serviceSlug
    ? db
        .select({ id: projectServices.projectId })
        .from(projectServices)
        .innerJoin(services, eq(services.id, projectServices.serviceId))
        .where(and(eq(services.slug, filters.serviceSlug), published(services.status, draft)))
    : undefined;
  const rows = await db.query.projects.findMany({
    where: (table) =>
      and(
        published(table.status, draft),
        category ? inArray(table.categoryId, category) : undefined,
        service ? inArray(table.id, service) : undefined,
        filters.featured === undefined ? undefined : eq(table.featured, filters.featured),
      ),
    with: { cover: true, category: true },
    orderBy: (table, { asc }) => [asc(table.sortOrder), asc(table.slug)],
    limit: filters.limit,
  });
  return rows.map((row) => projectView(row, locale, draft));
}

export const getProjects = publicQuery(
  "public-projects-v2",
  ["projects", "project-categories", "services", "media"],
  (draft, filters: ProjectFilters = {}, locale: AppLocale = "en") => readProjects(draft, filters, locale),
  [],
);

export const getServices = publicQuery(
  "public-services-v2",
  ["services", "projects", "media"],
  async (draft, locale: AppLocale = "en") => {
    const [rows, counts] = await Promise.all([
      db.query.services.findMany({
        where: (table) => published(table.status, draft),
        with: { cover: true },
        orderBy: (table, { asc }) => [asc(table.sortOrder), asc(table.slug)],
      }),
      db
        .select({ serviceId: projectServices.serviceId, count: count(projects.id) })
        .from(projectServices)
        .innerJoin(projects, and(eq(projects.id, projectServices.projectId), published(projects.status, draft)))
        .groupBy(projectServices.serviceId),
    ]);
    const countMap = new Map(counts.map((c) => [c.serviceId, Number(c.count)]));
    return rows.map((row) => serviceView(row, locale, countMap.get(row.id) ?? 0));
  },
  [],
);

async function findSeoImage(id: string | null | undefined, locale: AppLocale) {
  if (!id) return null;
  const row = await db.query.media.findFirst({ where: eq(media.id, id) });
  return mediaView(row, locale);
}

export const getServiceBySlug = publicQuery(
  "public-service-v2",
  ["services", "projects", "project-categories", "media"],
  async (draft, slug: string, locale: AppLocale = "en") => {
    const row = await db.query.services.findFirst({
      where: (table) => and(eq(table.slug, slug), published(table.status, draft)),
      with: { cover: true },
    });
    if (!row) return null;
    const [image, relatedProjects] = await Promise.all([
      findSeoImage(row.seo.ogImageId, locale),
      readProjects(draft, { serviceSlug: slug, limit: 12 }, locale),
    ]);
    return {
      ...serviceView(row, locale, relatedProjects.length),
      bodyHtml: renderMarkdown(t(row.body, locale) ?? "").html,
      features: row.features.map(({ title, description, icon }) => ({
        title: t(title, locale) ?? "",
        description: t(description, locale) ?? "",
        icon,
      })),
      deliverables: t(row.deliverables, locale) ?? [],
      relatedProjects,
      seo: seoView(row.seo, locale, image),
    };
  },
  null,
);

export const getProjectCategories = publicQuery(
  "public-project-categories",
  ["project-categories", "projects"],
  async (draft, locale: AppLocale = "en") => {
    const rows = await db
      .select({
        id: projectCategories.id,
        slug: projectCategories.slug,
        name: projectCategories.name,
        count: count(projects.id),
      })
      .from(projectCategories)
      .leftJoin(projects, and(eq(projects.categoryId, projectCategories.id), published(projects.status, draft)))
      .where(draft ? undefined : eq(projectCategories.visible, true))
      .groupBy(projectCategories.id)
      .orderBy(asc(projectCategories.sortOrder), asc(projectCategories.slug));
    return rows.map((row) => ({ ...row, name: t(row.name, locale) ?? "" }));
  },
  [],
);

export const getProjectBySlug = publicQuery(
  "public-project-v2",
  ["projects", "project-categories", "services", "technologies", "testimonials", "media"],
  async (draft, slug: string, locale: AppLocale = "en") => {
    const row = await db.query.projects.findFirst({
      where: (table) => and(eq(table.slug, slug), published(table.status, draft)),
      with: {
        category: true,
        cover: true,
        video: true,
        gallery: {
          with: { media: true },
          orderBy: (table, { asc }) => [asc(table.sortOrder), asc(table.mediaId)],
        },
        technologies: { with: { technology: { with: { icon: true } } } },
        services: { with: { service: { with: { cover: true } } } },
        testimonials: {
          where: (table) => published(table.status, draft),
          with: { avatar: true },
          orderBy: (table, { asc, desc }) => [desc(table.featured), asc(table.sortOrder), asc(table.id)],
          limit: 1,
        },
      },
    });
    if (!row) return null;
    const adjacent = (direction: "prev" | "next") =>
      db.query.projects.findFirst({
        columns: { slug: true, title: true },
        where: (table, { gt, lt }) => {
          const compare = direction === "prev" ? lt : gt;
          return and(
            published(table.status, draft),
            or(
              compare(table.sortOrder, row.sortOrder),
              and(eq(table.sortOrder, row.sortOrder), compare(table.slug, row.slug)),
            ),
          );
        },
        orderBy: (table, { asc, desc }) =>
          direction === "prev"
            ? [desc(table.sortOrder), desc(table.slug)]
            : [asc(table.sortOrder), asc(table.slug)],
      });
    const [prev, next, related, image] = await Promise.all([
      adjacent("prev"),
      adjacent("next"),
      db.query.projects.findMany({
        where: (table) =>
          and(
            published(table.status, draft),
            ne(table.id, row.id),
            row.categoryId && (draft || row.category?.visible)
              ? eq(table.categoryId, row.categoryId)
              : undefined,
          ),
        with: { category: true, cover: true },
        orderBy: (table, { asc }) => [asc(table.sortOrder), asc(table.slug)],
        limit: 3,
      }),
      findSeoImage(row.seo.ogImageId, locale),
    ]);
    const neighbor = (value: typeof prev) =>
      value ? { slug: value.slug, title: t(value.title, locale) ?? "" } : null;
    return {
      ...projectView(row, locale, draft),
      duration: t(row.duration, locale) || null,
      challengeHtml: renderMarkdown(t(row.challenge, locale) ?? "").html,
      solutionHtml: renderMarkdown(t(row.solution, locale) ?? "").html,
      resultsHtml: renderMarkdown(t(row.results, locale) ?? "").html,
      features: row.features.map(({ title, description }) => ({
        title: t(title, locale) ?? "",
        description: t(description, locale) ?? "",
      })),
      metrics: row.metrics.map(({ label, value }) => ({ label: t(label, locale) ?? "", value })),
      liveUrl: row.liveUrl,
      appStoreUrl: row.appStoreUrl,
      playStoreUrl: row.playStoreUrl,
      video: mediaView(row.video, locale),
      gallery: row.gallery.flatMap((item) => {
        const media = mediaView(item.media, locale);
        return media ? [{ role: item.role, caption: t(item.caption, locale) || null, media }] : [];
      }),
      technologies: row.technologies
        .filter(({ technology }) => draft || technology.visible)
        .sort(
          (a, b) =>
            a.technology.sortOrder - b.technology.sortOrder ||
            a.technology.slug.localeCompare(b.technology.slug),
        )
        .map(({ technology }) => ({
          slug: technology.slug,
          name: technology.name,
          icon: mediaView(technology.icon, locale),
          iconSlug: technology.iconSlug,
          color: technology.color,
        })),
      services: row.services
        .filter(({ service }) => service.status === "published" || (draft && service.status === "draft"))
        .sort(
          (a, b) =>
            a.service.sortOrder - b.service.sortOrder ||
            a.service.slug.localeCompare(b.service.slug),
        )
        .map(({ service }) => serviceView(service, locale)),
      testimonial: row.testimonials[0] ? testimonialView(row.testimonials[0], locale) : null,
      prev: neighbor(prev),
      next: neighbor(next),
      related: related.map((project) => projectView(project, locale, draft)),
      seo: seoView(row.seo, locale, image),
    };
  },
  null,
);
