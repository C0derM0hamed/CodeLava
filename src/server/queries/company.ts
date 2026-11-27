import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { fixtureContentAllowed } from "@/lib/developer-fixtures";
import { t, countryName } from "@/lib/i18n-content";
import { renderMarkdown } from "@/lib/markdown";
import type { AppLocale } from "@/i18n/routing";
import type { testimonials } from "@/db/schema";
import { publicQuery } from "./cache";
import { excludeFixtures, mediaView, published } from "./shared";

export type TestimonialFilters = {
  featured?: boolean;
  source?: typeof testimonials.$inferSelect.source;
  limit?: number;
};

export const getTestimonials = publicQuery("public-testimonials-v2", ["testimonials", "projects", "media"], async (
  draft, filters: TestimonialFilters = {}, locale: AppLocale = "en",
) => {
  const rows = await db.query.testimonials.findMany({
    where: (table) => and(
      published(table, draft),
      filters.featured === undefined ? undefined : eq(table.featured, filters.featured),
      filters.source ? eq(table.source, filters.source) : undefined,
    ),
    with: { avatar: true, project: { columns: { id: true, slug: true, title: true, status: true } } },
    orderBy: (table, { asc }) => [asc(table.sortOrder), asc(table.id)],
    limit: filters.limit,
  });
  return rows.map((row) => testimonialView(row, locale, draft));
}, []);

export function testimonialView(
  row: typeof testimonials.$inferSelect & {
    avatar: Parameters<typeof mediaView>[0];
    project?: { id: string; slug: string; title: { en: string; ar: string }; status: string } | null;
  },
  locale: AppLocale,
  draft = false,
) {
  const linkedProject =
    row.project && fixtureContentAllowed(row.project.id, draft) &&
    (row.project.status === "published" || (draft && row.project.status === "draft"))
      ? { slug: row.project.slug, title: t(row.project.title, locale) ?? "" }
      : null;
  const quoteLocale = row.quote[locale]?.trim() ? locale : locale === "en" ? "ar" : "en";
  const rawSource = row.sourceUrl?.trim() ?? "";
  const source = URL.canParse(rawSource) ? new URL(rawSource) : null;
  const sourceUrl = source && ["https:", "http:"].includes(source.protocol) && !source.username && !source.password
    ? source.href : null;
  const rating = row.rating !== null && Number.isFinite(row.rating) && row.rating >= 0 && row.rating <= 5
    ? row.rating : null;
  return {
    id: row.id, featured: row.featured, source: row.source, sourceUrl, authorName: row.authorName,
    authorRole: t(row.authorRole, locale) || null, company: row.company, country: row.country,
    countryName: row.country ? countryName(row.country, locale) : null, rating,
    quote: t(row.quote, locale) ?? "", quoteLocale, avatar: mediaView(row.avatar, locale),
    reviewDate: row.reviewDate?.toISOString() ?? null,
    project: linkedProject,
  };
}

export const getClientLogos = publicQuery("public-client-logos", ["client-logos", "media"], async (
  draft, locale: AppLocale = "en",
) => {
  const rows = await db.query.clientLogos.findMany({
    where: (table) => and(excludeFixtures(table.id, draft), draft ? undefined : eq(table.visible, true)),
    with: { logo: true },
    orderBy: (table, { asc }) => [asc(table.sortOrder), asc(table.id)],
  });
  return rows.map(({ id, name, logo, url, country }) => ({ id, name, logo: mediaView(logo, locale), url, country }));
}, []);

export const getAchievements = publicQuery("public-achievements", ["achievements"], async (
  draft, locale: AppLocale = "en",
) => {
  const rows = await db.query.achievements.findMany({
    where: (table) => and(excludeFixtures(table.id, draft), draft ? undefined : eq(table.visible, true)),
    orderBy: (table, { asc }) => [asc(table.sortOrder), asc(table.id)],
  });
  return rows.map(({ id, value, prefix, suffix, label, description, icon }) => ({
    id, value, prefix, suffix, label: t(label, locale) ?? "", description: t(description, locale) || null, icon,
  }));
}, []);

export const getTeam = publicQuery("public-team", ["team", "media"], async (
  draft, locale: AppLocale = "en",
) => {
  const rows = await db.query.teamMembers.findMany({
    where: (table) => and(excludeFixtures(table.id, draft), draft ? undefined : eq(table.visible, true)),
    with: { photo: true },
    orderBy: (table, { asc }) => [asc(table.sortOrder), asc(table.id)],
  });
  return rows.map(({ id, slug, name, role, bio, photo, socials }) => ({
    id, slug, name: t(name, locale) ?? "", role: t(role, locale) ?? "", bio: t(bio, locale) ?? "",
    photo: mediaView(photo, locale), socials,
  }));
}, []);

export const getProcessSteps = publicQuery("public-process", ["process"], async (
  draft, locale: AppLocale = "en",
) => {
  const rows = await db.query.processSteps.findMany({
    where: (table) => draft ? undefined : eq(table.visible, true),
    orderBy: (table, { asc }) => [asc(table.sortOrder), asc(table.id)],
  });
  return rows.map(({ id, title, description, duration, icon }) => ({
    id, title: t(title, locale) ?? "", description: t(description, locale) ?? "",
    duration: t(duration, locale) || null, icon,
  }));
}, []);

export const getFaqs = publicQuery("public-faqs", ["faqs"], async (
  draft, { category }: { category?: string } = {}, locale: AppLocale = "en",
) => {
  const rows = await db.query.faqs.findMany({
    where: (table) => and(published(table, draft), category ? eq(table.category, category) : undefined),
    orderBy: (table, { asc }) => [asc(table.sortOrder), asc(table.id)],
  });
  return rows.map((row) => ({
    id: row.id, category: row.category, question: t(row.question, locale) ?? "",
    answerHtml: renderMarkdown(t(row.answer, locale) ?? "").html,
  }));
}, []);

type TechnologyFilters = { grouped?: boolean };

const readTechnologies = publicQuery("public-technologies", ["technologies", "media"], async (
  draft, locale: AppLocale,
) => {
  const rows = await db.query.technologies.findMany({
    where: (table) => draft ? undefined : eq(table.visible, true),
    with: { icon: true },
    orderBy: (table, { asc }) => [asc(table.sortOrder), asc(table.slug)],
  });
  return rows.map((row) => ({
    id: row.id, slug: row.slug, name: row.name, category: row.category,
    description: t(row.description, locale) ?? "", icon: mediaView(row.icon, locale),
    iconSlug: row.iconSlug, color: row.color,
  }));
}, []);

export type Technology = Awaited<ReturnType<typeof readTechnologies>>[number];
export type TechnologyGroup = { category: string; technologies: Technology[] };

export function getTechnologies(filters: { grouped: true }, locale?: AppLocale): Promise<TechnologyGroup[]>;
export function getTechnologies(filters?: { grouped?: false }, locale?: AppLocale): Promise<Technology[]>;
export function getTechnologies(filters: TechnologyFilters, locale?: AppLocale): Promise<Technology[] | TechnologyGroup[]>;
export async function getTechnologies({ grouped }: TechnologyFilters = {}, locale: AppLocale = "en") {
  const rows = await readTechnologies(locale);
  if (!grouped) return rows;
  const groups = new Map<string, Technology[]>();
  for (const technology of rows) {
    const group = groups.get(technology.category) ?? [];
    group.push(technology);
    groups.set(technology.category, group);
  }
  return Array.from(groups, ([category, technologies]) => ({ category, technologies }));
}
