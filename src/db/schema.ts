/**
 * CodeLava — database schema (Drizzle ORM, PostgreSQL).
 *
 * Conventions
 * - Every user-facing text field is `Localized` jsonb: { en: string; ar: string }.
 *   Adding a locale later = add a key, no migration.
 * - Publishable content uses `status` (draft | published | archived) + `publishedAt`.
 *   Structural content uses `visible` + `sortOrder`.
 * - Media is referenced by id; files live behind the storage adapter (src/server/storage).
 * - `domainEvents` is an outbox for future automation / the AI sales platform (phase 2).
 *   Write an event whenever a lead or content item changes; nothing consumes it yet.
 */
import {
  pgTable, pgEnum, text, varchar, integer, boolean, timestamp, jsonb, uuid,
  primaryKey, index, uniqueIndex, real,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/* ------------------------------------------------------------------ types */

export type Locale = "en" | "ar";
export type Localized = { en: string; ar: string };
export type LocalizedList = { en: string[]; ar: string[] };
export type Seo = {
  title?: Localized;
  description?: Localized;
  ogImageId?: string | null;
  noindex?: boolean;
  canonical?: string;
};

const L = (name: string) => jsonb(name).$type<Localized>().notNull().default({ en: "", ar: "" });
const Lopt = (name: string) => jsonb(name).$type<Localized>();
const seo = () => jsonb("seo").$type<Seo>().notNull().default({});
const ts = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
};
const id = () => uuid("id").primaryKey().defaultRandom();
const sortOrder = () => integer("sort_order").notNull().default(0);

/* ------------------------------------------------------------------ enums */

export const contentStatus = pgEnum("content_status", ["draft", "published", "archived"]);
export const mediaKind = pgEnum("media_kind", ["image", "video", "document", "other"]);
export const testimonialSource = pgEnum("testimonial_source", ["upwork", "mostaql", "direct", "other"]);
export const leadType = pgEnum("lead_type", ["contact", "quote"]);
export const leadStatus = pgEnum("lead_status", ["new", "contacted", "qualified", "proposal", "won", "lost", "spam"]);

/* ------------------------------------------------------- auth & access */

/** Permission strings, e.g. "projects:write", "leads:read", "users:manage", "*" */
export const roles = pgTable("roles", {
  id: id(),
  key: varchar("key", { length: 48 }).notNull().unique(), // owner | admin | editor | sales | viewer | custom
  name: varchar("name", { length: 96 }).notNull(),
  permissions: jsonb("permissions").$type<string[]>().notNull().default([]),
  system: boolean("system").notNull().default(false),
  ...ts,
});

export const users = pgTable("users", {
  id: id(),
  email: varchar("email", { length: 254 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  roleId: uuid("role_id").notNull().references(() => roles.id),
  active: boolean("active").notNull().default(true),
  locale: varchar("locale", { length: 8 }).notNull().default("en"),
  failedLogins: integer("failed_logins").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  ...ts,
});

/** id = sha256(token); the raw token only lives in the httpOnly cookie. */
export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ip: varchar("ip", { length: 64 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("sessions_user_idx").on(t.userId)]);

export const auditLogs = pgTable("audit_logs", {
  id: id(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 64 }).notNull(), // create | update | delete | publish | login | ...
  entity: varchar("entity", { length: 64 }).notNull(),
  entityId: varchar("entity_id", { length: 64 }),
  meta: jsonb("meta").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("audit_entity_idx").on(t.entity, t.entityId)]);

/* ------------------------------------------------------------------ media */

export type MediaVariant = { width: number; height: number; key: string; url: string; format: string };

export const media = pgTable("media", {
  id: id(),
  kind: mediaKind("kind").notNull(),
  storageKey: text("storage_key").notNull().unique(),
  url: text("url").notNull(),
  originalName: text("original_name").notNull(),
  mime: varchar("mime", { length: 128 }).notNull(),
  size: integer("size").notNull(),
  width: integer("width"),
  height: integer("height"),
  durationSec: real("duration_sec"),
  alt: L("alt"),
  blurDataUrl: text("blur_data_url"),
  variants: jsonb("variants").$type<MediaVariant[]>().notNull().default([]),
  folder: varchar("folder", { length: 96 }).notNull().default("general"),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  ...ts,
});

/* ------------------------------------------------------------ services */

export type ServiceFeature = { title: Localized; description: Localized; icon?: string };

export const services = pgTable("services", {
  id: id(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  status: contentStatus("status").notNull().default("draft"),
  sortOrder: sortOrder(),
  featured: boolean("featured").notNull().default(false),
  icon: varchar("icon", { length: 64 }),
  accent: varchar("accent", { length: 16 }), // token name: lava | cyan | green | yellow | blue
  title: L("title"),
  tagline: L("tagline"),
  summary: L("summary"),
  body: L("body"), // markdown
  features: jsonb("features").$type<ServiceFeature[]>().notNull().default([]),
  deliverables: jsonb("deliverables").$type<LocalizedList>().notNull().default({ en: [], ar: [] }),
  coverMediaId: uuid("cover_media_id").references(() => media.id, { onDelete: "set null" }),
  seo: seo(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  ...ts,
});

/* ---------------------------------------------------------- technologies */

export const technologies = pgTable("technologies", {
  id: id(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 80 }).notNull(),
  category: varchar("category", { length: 48 }).notNull().default("other"), // frontend | backend | mobile | ai | cloud | database | design | other
  description: L("description"),
  iconMediaId: uuid("icon_media_id").references(() => media.id, { onDelete: "set null" }),
  iconSlug: varchar("icon_slug", { length: 80 }), // fallback simple-icons slug
  color: varchar("color", { length: 16 }),
  visible: boolean("visible").notNull().default(true),
  sortOrder: sortOrder(),
  ...ts,
});

/* -------------------------------------------------------------- portfolio */

export const projectCategories = pgTable("project_categories", {
  id: id(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  name: L("name"),
  sortOrder: sortOrder(),
  visible: boolean("visible").notNull().default(true),
  ...ts,
});

export type ProjectMetric = { value: string; label: Localized };
export type ProjectFeature = { title: Localized; description: Localized };

export const projects = pgTable("projects", {
  id: id(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  status: contentStatus("status").notNull().default("draft"),
  sortOrder: sortOrder(),
  featured: boolean("featured").notNull().default(false),
  categoryId: uuid("category_id").references(() => projectCategories.id, { onDelete: "set null" }),
  title: L("title"),
  summary: L("summary"),
  clientName: varchar("client_name", { length: 120 }),
  clientCountry: varchar("client_country", { length: 2 }), // ISO-3166 alpha-2
  industry: Lopt("industry"),
  year: integer("year"),
  duration: Lopt("duration"),
  // case study
  challenge: L("challenge"), // markdown
  solution: L("solution"),   // markdown
  results: L("results"),     // markdown
  features: jsonb("features").$type<ProjectFeature[]>().notNull().default([]),
  metrics: jsonb("metrics").$type<ProjectMetric[]>().notNull().default([]),
  liveUrl: text("live_url"),
  appStoreUrl: text("app_store_url"),
  playStoreUrl: text("play_store_url"),
  coverMediaId: uuid("cover_media_id").references(() => media.id, { onDelete: "set null" }),
  videoMediaId: uuid("video_media_id").references(() => media.id, { onDelete: "set null" }),
  accent: varchar("accent", { length: 16 }),
  seo: seo(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  ...ts,
}, (t) => [index("projects_status_idx").on(t.status, t.sortOrder)]);

export const projectMedia = pgTable("project_media", {
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  mediaId: uuid("media_id").notNull().references(() => media.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 24 }).notNull().default("gallery"), // gallery | mockup | screenshot
  caption: Lopt("caption"),
  sortOrder: sortOrder(),
}, (t) => [primaryKey({ columns: [t.projectId, t.mediaId] })]);

export const projectTechnologies = pgTable("project_technologies", {
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  technologyId: uuid("technology_id").notNull().references(() => technologies.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.projectId, t.technologyId] })]);

export const projectServices = pgTable("project_services", {
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  serviceId: uuid("service_id").notNull().references(() => services.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.projectId, t.serviceId] })]);

/* ---------------------------------------------------------- social proof */

export const testimonials = pgTable("testimonials", {
  id: id(),
  status: contentStatus("status").notNull().default("draft"),
  sortOrder: sortOrder(),
  featured: boolean("featured").notNull().default(false),
  source: testimonialSource("source").notNull().default("direct"),
  sourceUrl: text("source_url"), // link to the public review for verification
  authorName: varchar("author_name", { length: 120 }).notNull(),
  authorRole: Lopt("author_role"),
  company: varchar("company", { length: 120 }),
  country: varchar("country", { length: 2 }),
  rating: real("rating"), // 0-5
  quote: L("quote"),
  quoteLocale: varchar("quote_locale", { length: 8 }).notNull().default("en"), // language the client originally wrote in
  avatarMediaId: uuid("avatar_media_id").references(() => media.id, { onDelete: "set null" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  reviewDate: timestamp("review_date", { withTimezone: true }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  ...ts,
});

export const clientLogos = pgTable("client_logos", {
  id: id(),
  name: varchar("name", { length: 120 }).notNull(),
  logoMediaId: uuid("logo_media_id").references(() => media.id, { onDelete: "set null" }),
  url: text("url"),
  country: varchar("country", { length: 2 }),
  visible: boolean("visible").notNull().default(true),
  sortOrder: sortOrder(),
  ...ts,
});

export const achievements = pgTable("achievements", {
  id: id(),
  value: varchar("value", { length: 32 }).notNull(), // "120", "4.9", "8"
  prefix: varchar("prefix", { length: 8 }),
  suffix: varchar("suffix", { length: 8 }), // "+", "%", "/5"
  label: L("label"),
  description: Lopt("description"),
  icon: varchar("icon", { length: 64 }),
  visible: boolean("visible").notNull().default(true),
  sortOrder: sortOrder(),
  ...ts,
});

/* -------------------------------------------------------------- company */

export type SocialLinks = Partial<Record<"linkedin" | "github" | "x" | "behance" | "dribbble" | "website" | "upwork" | "mostaql", string>>;

export const teamMembers = pgTable("team_members", {
  id: id(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  name: L("name"),
  role: L("role"),
  bio: L("bio"),
  photoMediaId: uuid("photo_media_id").references(() => media.id, { onDelete: "set null" }),
  socials: jsonb("socials").$type<SocialLinks>().notNull().default({}),
  visible: boolean("visible").notNull().default(true),
  sortOrder: sortOrder(),
  ...ts,
});

export const processSteps = pgTable("process_steps", {
  id: id(),
  title: L("title"),
  description: L("description"),
  duration: Lopt("duration"),
  icon: varchar("icon", { length: 64 }),
  visible: boolean("visible").notNull().default(true),
  sortOrder: sortOrder(),
  ...ts,
});

export const faqs = pgTable("faqs", {
  id: id(),
  status: contentStatus("status").notNull().default("draft"),
  category: varchar("category", { length: 48 }).notNull().default("general"),
  question: L("question"),
  answer: L("answer"), // markdown
  sortOrder: sortOrder(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  ...ts,
});

/* ----------------------------------------------------------------- blog */

export const articles = pgTable("articles", {
  id: id(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  status: contentStatus("status").notNull().default("draft"),
  title: L("title"),
  excerpt: L("excerpt"),
  body: L("body"), // markdown
  coverMediaId: uuid("cover_media_id").references(() => media.id, { onDelete: "set null" }),
  authorId: uuid("author_id").references(() => teamMembers.id, { onDelete: "set null" }),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  readingMinutes: integer("reading_minutes"),
  featured: boolean("featured").notNull().default(false),
  seo: seo(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  ...ts,
}, (t) => [index("articles_status_idx").on(t.status, t.publishedAt)]);

/* ------------------------------------------------- pages, sections, SEO */

/**
 * Editable copy + visibility + order for every page section.
 * pageKey: home | services | portfolio | about | process | blog | faq | contact | quote | global
 * sectionKey: e.g. "hero", "services", "work", "proof", "process", "cta"
 * content: free-form per section, all text values Localized. Shape documented in src/content/sections.ts
 */
export const pageSections = pgTable("page_sections", {
  id: id(),
  pageKey: varchar("page_key", { length: 48 }).notNull(),
  sectionKey: varchar("section_key", { length: 64 }).notNull(),
  visible: boolean("visible").notNull().default(true),
  sortOrder: sortOrder(),
  content: jsonb("content").$type<Record<string, unknown>>().notNull().default({}),
  draftContent: jsonb("draft_content").$type<Record<string, unknown> | null>(),
  ...ts,
}, (t) => [uniqueIndex("page_section_uq").on(t.pageKey, t.sectionKey)]);

export const pageMeta = pgTable("page_meta", {
  pageKey: varchar("page_key", { length: 48 }).primaryKey(),
  seo: seo(),
  ...ts,
});

/** UI string overrides. Defaults live in src/i18n/messages/{en,ar}.json; DB rows win. */
export const uiTranslations = pgTable("ui_translations", {
  key: varchar("key", { length: 160 }).primaryKey(), // dot path e.g. "nav.services"
  en: text("en"),
  ar: text("ar"),
  ...ts,
});

/** Key/value settings: contact (email, phone, whatsapp, address, hours, map), socials, seo defaults, analytics, features. */
export const siteSettings = pgTable("site_settings", {
  key: varchar("key", { length: 64 }).primaryKey(),
  value: jsonb("value").$type<unknown>().notNull(),
  ...ts,
});

/* ------------------------------------------------------------------ leads */

export const leads = pgTable("leads", {
  id: id(),
  type: leadType("type").notNull(),
  status: leadStatus("status").notNull().default("new"),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 254 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  company: varchar("company", { length: 160 }),
  country: varchar("country", { length: 2 }),
  locale: varchar("locale", { length: 8 }).notNull().default("en"),
  serviceIds: jsonb("service_ids").$type<string[]>().notNull().default([]),
  budget: varchar("budget", { length: 48 }),
  currency: varchar("currency", { length: 3 }),
  timeline: varchar("timeline", { length: 48 }),
  message: text("message").notNull(),
  details: jsonb("details").$type<Record<string, unknown>>().notNull().default({}), // extra quote answers
  sourcePath: text("source_path"),
  utm: jsonb("utm").$type<Record<string, string>>().notNull().default({}),
  referrer: text("referrer"),
  ipHash: varchar("ip_hash", { length: 64 }),
  assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),
  score: integer("score"), // reserved for phase-2 AI qualification
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  ...ts,
}, (t) => [index("leads_status_idx").on(t.status, t.createdAt)]);

export const leadNotes = pgTable("lead_notes", {
  id: id(),
  leadId: uuid("lead_id").notNull().references(() => leads.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Private files: never served publicly; downloaded through an authenticated route. */
export const leadAttachments = pgTable("lead_attachments", {
  id: id(),
  leadId: uuid("lead_id").notNull().references(() => leads.id, { onDelete: "cascade" }),
  originalName: text("original_name").notNull(),
  storageKey: text("storage_key").notNull().unique(),
  mime: varchar("mime", { length: 128 }).notNull(),
  size: integer("size").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------- outbox for future automation */

export const domainEvents = pgTable("domain_events", {
  id: id(),
  type: varchar("type", { length: 96 }).notNull(), // lead.created | lead.status_changed | content.published ...
  aggregate: varchar("aggregate", { length: 64 }).notNull(),
  aggregateId: varchar("aggregate_id", { length: 64 }),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
}, (t) => [index("domain_events_pending_idx").on(t.processedAt, t.createdAt)]);

/* ------------------------------------------------------------- relations */

export const usersRelations = relations(users, ({ one }) => ({ role: one(roles, { fields: [users.roleId], references: [roles.id] }) }));
export const projectsRelations = relations(projects, ({ one, many }) => ({
  category: one(projectCategories, { fields: [projects.categoryId], references: [projectCategories.id] }),
  cover: one(media, { fields: [projects.coverMediaId], references: [media.id], relationName: "projectCover" }),
  video: one(media, { fields: [projects.videoMediaId], references: [media.id], relationName: "projectVideo" }),
  gallery: many(projectMedia),
  technologies: many(projectTechnologies),
  services: many(projectServices),
  testimonials: many(testimonials),
}));
export const projectMediaRelations = relations(projectMedia, ({ one }) => ({
  project: one(projects, { fields: [projectMedia.projectId], references: [projects.id] }),
  media: one(media, { fields: [projectMedia.mediaId], references: [media.id] }),
}));
export const projectTechnologiesRelations = relations(projectTechnologies, ({ one }) => ({
  project: one(projects, { fields: [projectTechnologies.projectId], references: [projects.id] }),
  technology: one(technologies, { fields: [projectTechnologies.technologyId], references: [technologies.id] }),
}));
export const projectServicesRelations = relations(projectServices, ({ one }) => ({
  project: one(projects, { fields: [projectServices.projectId], references: [projects.id] }),
  service: one(services, { fields: [projectServices.serviceId], references: [services.id] }),
}));
export const projectCategoriesRelations = relations(projectCategories, ({ many }) => ({ projects: many(projects) }));
export const servicesRelations = relations(services, ({ one, many }) => ({
  cover: one(media, { fields: [services.coverMediaId], references: [media.id] }),
  projects: many(projectServices),
}));
export const technologiesRelations = relations(technologies, ({ one, many }) => ({
  icon: one(media, { fields: [technologies.iconMediaId], references: [media.id] }),
  projects: many(projectTechnologies),
}));
export const testimonialsRelations = relations(testimonials, ({ one }) => ({
  avatar: one(media, { fields: [testimonials.avatarMediaId], references: [media.id] }),
  project: one(projects, { fields: [testimonials.projectId], references: [projects.id] }),
}));
export const clientLogosRelations = relations(clientLogos, ({ one }) => ({ logo: one(media, { fields: [clientLogos.logoMediaId], references: [media.id] }) }));
export const teamMembersRelations = relations(teamMembers, ({ one, many }) => ({
  photo: one(media, { fields: [teamMembers.photoMediaId], references: [media.id] }),
  articles: many(articles),
}));
export const articlesRelations = relations(articles, ({ one }) => ({
  cover: one(media, { fields: [articles.coverMediaId], references: [media.id] }),
  author: one(teamMembers, { fields: [articles.authorId], references: [teamMembers.id] }),
}));
export const leadsRelations = relations(leads, ({ one, many }) => ({
  assignee: one(users, { fields: [leads.assignedTo], references: [users.id] }),
  notes: many(leadNotes),
  attachments: many(leadAttachments),
}));
export const leadNotesRelations = relations(leadNotes, ({ one }) => ({
  lead: one(leads, { fields: [leadNotes.leadId], references: [leads.id] }),
  user: one(users, { fields: [leadNotes.userId], references: [users.id] }),
}));
export const leadAttachmentsRelations = relations(leadAttachments, ({ one }) => ({ lead: one(leads, { fields: [leadAttachments.leadId], references: [leads.id] }) }));

/** Shared fixed-window counters for login and public submissions. Keys are HMACs. */
export const rateLimits = pgTable("rate_limits", {
  key: varchar("key", { length: 64 }).primaryKey(),
  count: integer("count").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
}, (t) => [index("rate_limits_expiry_idx").on(t.expiresAt)]);
