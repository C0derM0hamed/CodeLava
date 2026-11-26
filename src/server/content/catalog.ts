import "server-only";
import type { PgTable } from "drizzle-orm/pg-core";
import * as t from "@/db/schema";
import type { contentEntities } from "@/server/auth/permissions";
import {
  type Field, checkField as check, countryField, dateField, groupField as group, keyField, linesField,
  localField as local, localizedLines, mediaField as asset, numberField as num, relationField as link,
  repeatField as repeat, sectionField, selectField as select, seoFields, slugField, socialFields, textField as text, urlField as url,
} from "./fields";

export type Entity = typeof contentEntities[number];
type Config = {
  table: PgTable;
  label: string;
  title: string;
  key?: "key" | "pageKey";
  ordered?: boolean;
  groupBy?: "pageKey";
  publicPath?: string;
  fields: Field[];
};

const visibility = check("visible", "Visible on the site");
const featured = check("featured", "Featured");
const status = select("status", "Status", ["draft", "published", "archived"]);
const seo = group("seo", "Search and sharing", seoFields);
const title = local("title", "Title", 160, true);
const name = local("name", "Name", 120, true);
const accent = text("accent", "Accent token", 16);
const icon = text("icon", "Icon name", 64);
const copy = (key: string, label: string, required = false) => local(key, label, 40_000, required, true);
const features = [local("title", "Title", 160, true), local("description", "Description", 1000)];

export const catalog: Record<Entity, Config> = {
  services: { table: t.services, label: "Services", title: "title", ordered: true, publicPath: "services/{slug}", fields: [
    title, slugField(), status, featured, local("tagline", "Tagline"), local("summary", "Summary", 1800),
    copy("body", "Body"), repeat("features", "Features", [...features, icon]),
    localizedLines("deliverables", "Deliverables"), asset("coverMediaId", "Cover"), icon, accent, seo,
  ] },
  projects: { table: t.projects, label: "Projects", title: "title", ordered: true, publicPath: "work/{slug}", fields: [
    title, slugField(), status, featured, link("categoryId", "Category", "project_categories"), local("summary", "Summary", 1800),
    text("clientName", "Client"), countryField("clientCountry"), local("industry", "Industry", 160),
    num("year", "Year", 1900, 2200, true), local("duration", "Duration", 120), asset("coverMediaId", "Cover"),
    asset("videoMediaId", "Video", "video"), link("technologyIds", "Technologies", "technologies", true),
    link("serviceIds", "Services", "services", true), copy("challenge", "Challenge"), copy("solution", "Solution"), copy("results", "Results"),
    repeat("metrics", "Metrics", [text("value", "Value", 48, true), local("label", "Label", 160, true)]),
    repeat("features", "Features", features), url("liveUrl", "Website"), url("appStoreUrl", "App Store"),
    url("playStoreUrl", "Google Play"), accent, seo,
  ] },
  project_categories: { table: t.projectCategories, label: "Project categories", title: "name", ordered: true, publicPath: "work", fields: [name, slugField(80), visibility] },
  technologies: { table: t.technologies, label: "Technologies", title: "name", ordered: true, publicPath: "technologies", fields: [
    text("name", "Name", 80, true), slugField(80), text("category", "Category", 48, true), visibility,
    local("description", "Description", 1800), asset("iconMediaId", "Icon image"), text("iconSlug", "Simple Icons slug", 80), text("color", "Color", 16),
  ] },
  testimonials: { table: t.testimonials, label: "Testimonials", title: "authorName", ordered: true, publicPath: "about", fields: [
    text("authorName", "Author name", 120, true), status, featured, local("authorRole", "Author role", 160),
    text("company", "Company"), countryField(), copy("quote", "Quote", true),
    select("quoteLocale", "Original language", ["en", "ar"]), num("rating", "Rating (out of 5)", 0, 5),
    select("source", "Source", ["direct", "upwork", "mostaql", "other"]), url("sourceUrl", "Source link"),
    asset("avatarMediaId", "Avatar"), link("projectId", "Project", "projects"), dateField("reviewDate", "Review date"),
  ] },
  client_logos: { table: t.clientLogos, label: "Client logos", title: "name", ordered: true, publicPath: "about", fields: [
    text("name", "Client name", 120, true), asset("logoMediaId", "Logo", "image", true), url("url", "Website"), countryField(), visibility,
  ] },
  achievements: { table: t.achievements, label: "Achievements", title: "label", ordered: true, publicPath: "about", fields: [
    local("label", "Label", 160, true), text("value", "Value", 32, true), text("prefix", "Prefix", 8), text("suffix", "Suffix", 8),
    local("description", "Description", 1800), icon, visibility,
  ] },
  team_members: { table: t.teamMembers, label: "Team members", title: "name", ordered: true, publicPath: "about", fields: [
    name, slugField(), local("role", "Role", 160), local("bio", "Bio", 3000), asset("photoMediaId", "Photo"),
    group("socials", "Social links", socialFields), visibility,
  ] },
  process_steps: { table: t.processSteps, label: "Process steps", title: "title", ordered: true, publicPath: "process", fields: [
    title, local("description", "Description", 3000), local("duration", "Duration", 120), icon, visibility,
  ] },
  faqs: { table: t.faqs, label: "FAQs", title: "question", ordered: true, publicPath: "faq", fields: [
    local("question", "Question", 500, true), copy("answer", "Answer", true), text("category", "Category", 48, true), status,
  ] },
  articles: { table: t.articles, label: "Articles", title: "title", publicPath: "blog/{slug}", fields: [
    title, slugField(160), status, featured, local("excerpt", "Excerpt", 1800), copy("body", "Article", true),
    asset("coverMediaId", "Cover"), link("authorId", "Author", "team_members"), linesField("tags", "Tags"), seo,
  ] },
  page_sections: { table: t.pageSections, label: "Page sections", title: "sectionKey", ordered: true, groupBy: "pageKey", fields: [
    keyField("pageKey", "Page", 48), keyField("sectionKey", "Section key", 64), visibility,
    sectionField("content", "Published content"), sectionField("draftContent", "Draft content", true),
  ] },
  page_meta: { table: t.pageMeta, label: "Page SEO", key: "pageKey", title: "pageKey", fields: [keyField("pageKey", "Page", 48), seo] },
  ui_translations: { table: t.uiTranslations, label: "UI translations", key: "key", title: "key", fields: [
    keyField("key", "Translation key", 160), text("en", "English override", 10_000), text("ar", "Arabic override", 10_000),
  ] },
};

export function isEntity(value: string): value is Entity {
  return Object.hasOwn(catalog, value);
}

export function contentTitle(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "en" in value && "ar" in value) return String(value.en || value.ar || "");
  return "";
}
