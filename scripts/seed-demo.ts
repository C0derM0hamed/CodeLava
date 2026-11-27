import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { count, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import sharp from "sharp";
import { z } from "zod";
import { defaultSectionsRows } from "../src/content/sections";
import {
  achievements,
  articles,
  clientLogos,
  faqs,
  media,
  pageSections,
  processSteps,
  projectCategories,
  projectMedia,
  projects,
  projectServices,
  projectTechnologies,
  services,
  siteSettings,
  teamMembers,
  technologies,
  testimonials,
  type Localized,
  type MediaVariant,
} from "../src/db/schema";
import {
  buildLogoSvg,
  buildPortraitSvg,
  buildStudioCardSvg,
  DEMO_ACHIEVEMENTS,
  DEMO_ARTICLES,
  DEMO_CATEGORIES,
  DEMO_CLIENTS,
  DEMO_CONTACT,
  DEMO_FAQS,
  DEMO_MEDIA_FOLDER,
  DEMO_PROCESS_DURATIONS,
  DEMO_PROJECTS,
  DEMO_SERVICE_ENRICHMENTS,
  DEMO_SOCIALS,
  DEMO_TEAM,
  DEMO_TECH_DESCRIPTIONS,
  DEMO_TESTIMONIALS,
  demoId,
  L,
} from "./demo-data";

const env = z
  .object({
    DATABASE_URL: z.string().min(1),
    STORAGE_LOCAL_PUBLIC_DIR: z.string().optional(),
  })
  .parse(process.env);

const PUBLIC_STORAGE_DIR = resolve(env.STORAGE_LOCAL_PUBLIC_DIR || "storage/public");
const ASSETS_DIR = resolve("scripts/dev-fixtures/assets");

type Db = ReturnType<typeof drizzle>;
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

async function storeImageBuffer(
  tx: Tx,
  buffer: Buffer,
  options: {
    id: string;
    originalName: string;
    alt: Localized;
    width?: number;
    height?: number;
    fit?: "cover" | "contain";
    transparent?: boolean;
  },
) {
  const width = options.width ?? 1600;
  const height = options.height ?? 1000;
  await mkdir(PUBLIC_STORAGE_DIR, { recursive: true });

  const existing = await tx.select().from(media).where(eq(media.id, options.id));
  if (existing.length > 0) return { row: existing[0], inserted: false };

  const baseUuid = options.id;
  const storageKey = `${baseUuid}.webp`;
  const pipeline = sharp(buffer, { density: 160 });

  const main = await pipeline
    .clone()
    .resize({
      width,
      height,
      fit: options.fit ?? "cover",
      background: options.transparent
        ? { r: 0, g: 0, b: 0, alpha: 0 }
        : { r: 15, g: 19, b: 32, alpha: 1 },
    })
    .webp({ quality: 88 })
    .toBuffer({ resolveWithObject: true });

  await writeFile(resolve(PUBLIC_STORAGE_DIR, storageKey), main.data);

  const variants: MediaVariant[] = [];
  const widths = width <= 500 ? [width] : [480, 960, Math.min(1600, width)];
  for (const targetW of widths) {
    for (const format of ["avif", "webp"] as const) {
      if (format === "webp" && targetW === main.info.width) {
        variants.push({
          width: main.info.width,
          height: main.info.height,
          key: storageKey,
          url: `/media/${storageKey}`,
          format,
        });
        continue;
      }
      const key = `${baseUuid}-${targetW}.${format}`;
      const out = await pipeline
        .clone()
        .resize({ width: targetW, withoutEnlargement: true })
        .toFormat(format, { quality: format === "avif" ? 58 : 84 })
        .toBuffer({ resolveWithObject: true });
      await writeFile(resolve(PUBLIC_STORAGE_DIR, key), out.data);
      variants.push({
        width: out.info.width,
        height: out.info.height,
        key,
        url: `/media/${key}`,
        format,
      });
    }
  }

  const blur = await pipeline
    .clone()
    .resize({ width: 16, height: 16, fit: "inside" })
    .webp()
    .toBuffer();

  const [row] = await tx
    .insert(media)
    .values({
      id: options.id,
      kind: "image",
      storageKey,
      url: `/media/${storageKey}`,
      originalName: options.originalName,
      mime: "image/webp",
      size: main.data.length,
      width: main.info.width,
      height: main.info.height,
      alt: options.alt,
      blurDataUrl: `data:image/webp;base64,${blur.toString("base64")}`,
      variants,
      folder: DEMO_MEDIA_FOLDER,
    })
    .returning();

  return { row, inserted: true };
}

function isEmptyLocalized(value: unknown): boolean {
  if (!value || typeof value !== "object") return true;
  const record = value as Record<string, unknown>;
  const en = typeof record.en === "string" ? record.en.trim() : "";
  const ar = typeof record.ar === "string" ? record.ar.trim() : "";
  return !en && !ar;
}

async function seedDemo() {
  const sqlClient = postgres(env.DATABASE_URL, { max: 1 });
  const summary: Record<string, number> = {};

  try {
    const db = drizzle(sqlClient);
    await db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(420234)`);

      // 0. Ensure page_sections only if table is completely empty (never touch existing hero or sections)
      const [{ total: sectionCount }] = await tx.select({ total: count() }).from(pageSections);
      if (sectionCount === 0) {
        const inserted = await tx
          .insert(pageSections)
          .values(defaultSectionsRows())
          .onConflictDoNothing()
          .returning({ id: pageSections.id });
        summary.page_sections = inserted.length;
      }

      // 1. Seed demo media from existing local showcase assets + Daylight Magma SVG renders
      const mediaMap = new Map<string, string>();
      let mediaInserted = 0;

      const localAssets = [
        ["webLogistics", "project-web-logistics.jpg", L("Mizan Fleet & Logistics OS dashboard", "لوحة تحكم منصة ميزان لإدارة الأساطيل واللوجستيات")],
        ["mobileCourier", "project-mobile-courier.jpg", L("Qafila express courier mobile app screens", "شاشات تطبيق قافلة للتوصيل السريع")],
        ["aiCopilot", "project-ai-copilot.jpg", L("Nibras Arabic enterprise AI copilot interface", "واجهة نبراس مساعد المعرفة المؤسسي بالذكاء الاصطناعي")],
        ["designSystem", "project-design-system.jpg", L("Wafra digital banking design system showcase", "عرض نظام تصميم وفرة للخدمات المصرفية الرقمية")],
        ["ecommerceLuxury", "project-ecommerce-luxury.jpg", L("Diyar luxury home storefront on laptop and phone", "متجر ديار للأثاث الفاخر على الحاسوب والجوال")],
        ["cloudDevops", "project-cloud-devops.jpg", L("Sama Cloud multi-region telemetry console", "لوحة مراقبة البنية السحابية متعددة المناطق سماء")],
      ] as const;

      for (let i = 0; i < localAssets.length; i++) {
        const [key, filename, alt] = localAssets[i];
        const buf = await readFile(resolve(ASSETS_DIR, filename));
        const { row, inserted } = await storeImageBuffer(tx, buf, {
          id: demoId("10", i),
          originalName: `demo-${filename}`,
          alt,
        });
        if (inserted) mediaInserted++;
        mediaMap.set(key, row.id);
      }

      const generatedVisuals = [
        { key: "proptech", title: "Sanad Property OS", tag: "PROPTECH SAAS", metric: "42K+", metricLabel: "Managed Units", accent: "#ff6a00", secondary: "#0aa5c2", mode: "light" as const, bars: [42, 56, 48, 72, 65, 84, 92, 108, 126] },
        { key: "rasedAi", title: "Rased ZATCA Agent", tag: "AI AUTOMATION", metric: "99.4%", metricLabel: "Extraction Accuracy", accent: "#ff8a2a", secondary: "#5ee7f0", mode: "dark" as const, bars: [52, 68, 74, 88, 92, 106, 115, 122, 136] },
        { key: "blogBilingual", title: "RTL Architecture", tag: "ENGINEERING NOTE", metric: "2x", metricLabel: "Faster Bilingual UI", accent: "#ff6a00", secondary: "#0aa5c2", mode: "dark" as const, bars: [45, 58, 64, 72, 80, 92, 100, 114, 124] },
        { key: "blogAi", title: "Measured AI", tag: "APPLIED AI", metric: "-74%", metricLabel: "Research Hours Saved", accent: "#ff8a2a", secondary: "#5ee7f0", mode: "dark" as const, bars: [35, 52, 68, 82, 94, 108, 118, 126, 134] },
        { key: "blogPerf", title: "Sub-200ms Next.js", tag: "PERFORMANCE", metric: "190ms", metricLabel: "Production LCP Target", accent: "#ff6a00", secondary: "#178a4c", mode: "light" as const, bars: [98, 90, 82, 74, 65, 56, 48, 40, 32] },
        { key: "blogDesign", title: "FinTech Tokens", tag: "PRODUCT DESIGN", metric: "100%", metricLabel: "WCAG AA Contrast", accent: "#e94e06", secondary: "#2f6bff", mode: "light" as const, bars: [40, 52, 60, 74, 86, 94, 104, 116, 128] },
        { key: "blogCommerce", title: "GCC Checkout UX", tag: "E-COMMERCE", metric: "2.4x", metricLabel: "Revenue Lift", accent: "#ff6a00", secondary: "#ffcf4a", mode: "dark" as const, bars: [38, 48, 62, 74, 82, 96, 108, 118, 130] },
        { key: "blogCloud", title: "Zero-Downtime Ops", tag: "CLOUD & SRE", metric: "99.98%", metricLabel: "Measured Uptime", accent: "#ff8a2a", secondary: "#6aa8ff", mode: "dark" as const, bars: [78, 84, 88, 92, 96, 104, 112, 124, 136] },
        { key: "blogMobile", title: "60fps Flutter RTL", tag: "MOBILE ENGINEERING", metric: "4.9★", metricLabel: "App Store Rating", accent: "#ff6a00", secondary: "#0aa5c2", mode: "light" as const, bars: [42, 54, 66, 78, 88, 96, 110, 126] },
      ];

      for (let i = 0; i < generatedVisuals.length; i++) {
        const card = generatedVisuals[i];
        const svg = Buffer.from(buildStudioCardSvg(card), "utf8");
        const { row, inserted } = await storeImageBuffer(tx, svg, {
          id: demoId("11", i),
          originalName: `demo-${card.key}.webp`,
          alt: L(card.title, card.title),
        });
        if (inserted) mediaInserted++;
        mediaMap.set(card.key, row.id);
      }

      // 2. Project categories (preserve existing, add demo cloud-devops category)
      let categoriesInserted = 0;
      for (const cat of DEMO_CATEGORIES) {
        const inserted = await tx
          .insert(projectCategories)
          .values({ ...cat, visible: true })
          .onConflictDoNothing()
          .returning({ id: projectCategories.id });
        categoriesInserted += inserted.length;
      }
      summary.project_categories_added = categoriesInserted;

      // Lookup all services, categories, technologies
      const [svcRows, catRows, techRows] = await Promise.all([
        tx.select().from(services),
        tx.select().from(projectCategories),
        tx.select().from(technologies),
      ]);
      const svcBySlug = new Map(svcRows.map((s) => [s.slug, s]));
      const catBySlug = new Map(catRows.map((c) => [c.slug, c]));
      const techBySlug = new Map(techRows.map((t) => [t.slug, t]));

      // 3. Non-destructive backfill of empty fields on starter services, process steps, technologies & site_settings
      let servicesEnriched = 0;
      for (const [slug, enrichment] of Object.entries(DEMO_SERVICE_ENRICHMENTS)) {
        const existing = svcBySlug.get(slug);
        if (!existing) continue;
        const updates: Partial<typeof services.$inferInsert> = {};
        if (!existing.coverMediaId && mediaMap.has(enrichment.coverKey)) {
          updates.coverMediaId = mediaMap.get(enrichment.coverKey) ?? null;
        }
        if (existing.features.length === 0) {
          updates.features = enrichment.features;
        }
        if (existing.deliverables.en.length === 0 && existing.deliverables.ar.length === 0) {
          updates.deliverables = enrichment.deliverables;
        }
        if (Object.keys(updates).length > 0) {
          await tx.update(services).set(updates).where(eq(services.id, existing.id));
          servicesEnriched++;
        }
      }
      summary.services_backfilled_empty_fields = servicesEnriched;

      let processEnriched = 0;
      const existingSteps = await tx.select().from(processSteps);
      for (const step of existingSteps) {
        const demoDuration = DEMO_PROCESS_DURATIONS[step.id];
        if (demoDuration && !step.duration) {
          await tx
            .update(processSteps)
            .set({ duration: demoDuration })
            .where(eq(processSteps.id, step.id));
          processEnriched++;
        }
      }
      summary.process_steps_backfilled_duration = processEnriched;

      let techEnriched = 0;
      for (const techItem of techRows) {
        const demoDesc = DEMO_TECH_DESCRIPTIONS[techItem.slug];
        if (demoDesc && isEmptyLocalized(techItem.description)) {
          await tx
            .update(technologies)
            .set({ description: demoDesc })
            .where(eq(technologies.id, techItem.id));
          techEnriched++;
        }
      }
      summary.technologies_backfilled_description = techEnriched;

      // Site settings: fill only empty contact fields and missing social keys
      const settingRows = await tx.select().from(siteSettings);
      const settingMap = new Map(settingRows.map((s) => [s.key, s.value]));

      const currentContact =
        (settingMap.get("contact") as Record<string, unknown> | undefined) ?? {};
      const nextContact: Record<string, unknown> = { ...currentContact };
      let contactChanged = false;
      for (const [key, value] of Object.entries(DEMO_CONTACT)) {
        const existingVal = currentContact[key];
        if (typeof value === "string") {
          if (typeof existingVal !== "string" || !existingVal.trim()) {
            nextContact[key] = value;
            contactChanged = true;
          }
        } else if (isEmptyLocalized(existingVal)) {
          nextContact[key] = value;
          contactChanged = true;
        }
      }
      if (contactChanged) {
        await tx
          .insert(siteSettings)
          .values({ key: "contact", value: nextContact })
          .onConflictDoUpdate({ target: siteSettings.key, set: { value: nextContact } });
        summary.site_settings_contact_filled = 1;
      }

      const currentSocials =
        (settingMap.get("socials") as Record<string, unknown> | undefined) ?? {};
      const nextSocials: Record<string, unknown> = { ...currentSocials };
      let socialsChanged = false;
      for (const [key, value] of Object.entries(DEMO_SOCIALS)) {
        const existingVal = currentSocials[key];
        if (typeof existingVal !== "string" || !existingVal.trim()) {
          nextSocials[key] = value;
          socialsChanged = true;
        }
      }
      if (socialsChanged) {
        await tx
          .insert(siteSettings)
          .values({ key: "socials", value: nextSocials })
          .onConflictDoUpdate({ target: siteSettings.key, set: { value: nextSocials } });
        summary.site_settings_socials_filled = 1;
      }

      // 4. Projects (8 published case studies linked to services, technologies & gallery media)
      const projectIdsBySlug = new Map<string, string>();
      let projectsInserted = 0;
      for (let i = 0; i < DEMO_PROJECTS.length; i++) {
        const p = DEMO_PROJECTS[i];
        const pid = demoId("20", i);
        const categoryId = catBySlug.get(p.categorySlug)?.id ?? null;
        const coverMediaId = mediaMap.get(p.coverKey) ?? null;

        const inserted = await tx
          .insert(projects)
          .values({
            id: pid,
            slug: p.slug,
            status: "published",
            sortOrder: i,
            featured: p.featured,
            categoryId,
            title: p.title,
            summary: p.summary,
            clientName: p.clientName,
            clientCountry: p.clientCountry,
            industry: p.industry,
            year: p.year,
            duration: p.duration,
            challenge: p.challenge,
            solution: p.solution,
            results: p.results,
            features: p.features,
            metrics: p.metrics,
            liveUrl: p.liveUrl,
            appStoreUrl: p.appStoreUrl,
            playStoreUrl: p.playStoreUrl,
            coverMediaId,
            accent: p.accent,
            seo: { title: p.title, description: p.summary, ogImageId: coverMediaId },
            publishedAt: new Date(Date.UTC(2026, 9, 25 - i * 3)),
          })
          .onConflictDoNothing()
          .returning({ id: projects.id });

        projectsInserted += inserted.length;
        const [saved] = await tx
          .select({ id: projects.id })
          .from(projects)
          .where(eq(projects.id, pid));
        if (!saved) continue;
        projectIdsBySlug.set(p.slug, saved.id);

        for (const sSlug of p.serviceSlugs) {
          const svc = svcBySlug.get(sSlug);
          if (svc) {
            await tx
              .insert(projectServices)
              .values({ projectId: saved.id, serviceId: svc.id })
              .onConflictDoNothing();
          }
        }
        for (const tSlug of p.techSlugs) {
          const techItem = techBySlug.get(tSlug);
          if (techItem) {
            await tx
              .insert(projectTechnologies)
              .values({ projectId: saved.id, technologyId: techItem.id })
              .onConflictDoNothing();
          }
        }
        for (let g = 0; g < p.galleryKeys.length; g++) {
          const mid = mediaMap.get(p.galleryKeys[g]);
          if (mid) {
            await tx
              .insert(projectMedia)
              .values({
                projectId: saved.id,
                mediaId: mid,
                role: "screenshot",
                caption:
                  g === 0
                    ? L("Primary operational interface view", "لقطة من الواجهة التشغيلية الرئيسية")
                    : L("Secondary analytics and mobile experience", "لقطة للوحة التحليلات وتجربة الجوال"),
                sortOrder: g,
              })
              .onConflictDoNothing();
          }
        }
      }
      summary.projects = projectsInserted;

      // 5. Testimonials (8 published reviews across 6 platforms, linked to demo projects)
      let testimonialsInserted = 0;
      for (let i = 0; i < DEMO_TESTIMONIALS.length; i++) {
        const rev = DEMO_TESTIMONIALS[i];
        const inserted = await tx
          .insert(testimonials)
          .values({
            id: demoId("30", i),
            status: "published",
            sortOrder: i,
            featured: rev.featured,
            source: rev.source,
            sourceUrl: rev.sourceUrl,
            authorName: rev.authorName,
            authorRole: rev.authorRole,
            company: rev.company,
            country: rev.country,
            rating: rev.rating,
            quote: rev.quote,
            quoteLocale: rev.quoteLocale,
            projectId: projectIdsBySlug.get(rev.projectSlug) ?? null,
            reviewDate: new Date(Date.UTC(2026, 9, 24 - i * 4)),
            publishedAt: new Date(Date.UTC(2026, 9, 24 - i * 4)),
          })
          .onConflictDoNothing()
          .returning({ id: testimonials.id });
        testimonialsInserted += inserted.length;
      }
      summary.testimonials = testimonialsInserted;

      // 6. Client logos (6 visible vector marks)
      let clientsInserted = 0;
      for (let i = 0; i < DEMO_CLIENTS.length; i++) {
        const client = DEMO_CLIENTS[i];
        const svgBuf = Buffer.from(buildLogoSvg(client.name, client.mark), "utf8");
        const { row: logoMedia, inserted: mIns } = await storeImageBuffer(tx, svgBuf, {
          id: demoId("40", i),
          originalName: `demo-client-${i + 1}.webp`,
          alt: L(`${client.name} logo`, `شعار ${client.name}`),
          width: 360,
          height: 96,
          fit: "contain",
          transparent: true,
        });
        if (mIns) mediaInserted++;
        const inserted = await tx
          .insert(clientLogos)
          .values({
            id: demoId("41", i),
            name: client.name,
            logoMediaId: logoMedia.id,
            url: client.url,
            country: client.country,
            visible: true,
            sortOrder: i,
          })
          .onConflictDoNothing()
          .returning({ id: clientLogos.id });
        clientsInserted += inserted.length;
      }
      summary.client_logos = clientsInserted;

      // 7. Achievements (4 visible metrics)
      let achievementsInserted = 0;
      for (let i = 0; i < DEMO_ACHIEVEMENTS.length; i++) {
        const st = DEMO_ACHIEVEMENTS[i];
        const inserted = await tx
          .insert(achievements)
          .values({
            id: demoId("50", i),
            value: st.value,
            suffix: st.suffix,
            label: st.label,
            description: st.description,
            icon: st.icon,
            visible: true,
            sortOrder: i,
          })
          .onConflictDoNothing()
          .returning({ id: achievements.id });
        achievementsInserted += inserted.length;
      }
      summary.achievements = achievementsInserted;

      // 8. Team members (5 visible profiles with Daylight Magma portrait cards)
      const teamIds: string[] = [];
      let teamInserted = 0;
      for (let i = 0; i < DEMO_TEAM.length; i++) {
        const member = DEMO_TEAM[i];
        const portraitSvg = Buffer.from(
          buildPortraitSvg({
            initials: member.initials,
            accent: member.accent,
            secondary: member.secondary,
            seed: i + 1,
          }),
          "utf8",
        );
        const { row: photoMedia, inserted: mIns } = await storeImageBuffer(tx, portraitSvg, {
          id: demoId("61", i),
          originalName: `${member.slug}-portrait.webp`,
          alt: L(`${member.name.en} — ${member.role.en}`, `${member.name.ar} — ${member.role.ar}`),
          width: 800,
          height: 880,
          fit: "cover",
        });
        if (mIns) mediaInserted++;

        const tid = demoId("60", i);
        const inserted = await tx
          .insert(teamMembers)
          .values({
            id: tid,
            slug: member.slug,
            name: member.name,
            role: member.role,
            bio: member.bio,
            photoMediaId: photoMedia.id,
            socials: member.socials,
            visible: true,
            sortOrder: i,
          })
          .onConflictDoNothing()
          .returning({ id: teamMembers.id });
        teamInserted += inserted.length;

        const [found] = await tx
          .select({ id: teamMembers.id })
          .from(teamMembers)
          .where(eq(teamMembers.id, tid));
        if (found) teamIds.push(found.id);
      }
      summary.team_members = teamInserted;

      // 9. FAQs (8 published category-specific + general demo FAQs; preserves 4 starter FAQs)
      let faqsInserted = 0;
      for (let i = 0; i < DEMO_FAQS.length; i++) {
        const item = DEMO_FAQS[i];
        const inserted = await tx
          .insert(faqs)
          .values({
            id: demoId("80", i),
            status: "published",
            category: item.category,
            question: item.question,
            answer: item.answer,
            sortOrder: 10 + i,
            publishedAt: new Date(Date.UTC(2026, 9, 15)),
          })
          .onConflictDoNothing()
          .returning({ id: faqs.id });
        faqsInserted += inserted.length;
      }
      summary.faqs_added = faqsInserted;

      // 10. Articles (6 published bilingual blog posts with covers & team authors)
      let articlesInserted = 0;
      for (let i = 0; i < DEMO_ARTICLES.length; i++) {
        const article = DEMO_ARTICLES[i];
        const publishedAt = new Date(Date.UTC(2026, 10, 27 - article.daysAgo));
        const coverId = mediaMap.get(article.coverKey) ?? null;
        const inserted = await tx
          .insert(articles)
          .values({
            id: demoId("70", i),
            slug: article.slug,
            status: "published",
            featured: article.featured,
            title: article.title,
            excerpt: article.excerpt,
            body: article.body,
            coverMediaId: coverId,
            authorId: teamIds[article.authorIndex % Math.max(1, teamIds.length)] ?? null,
            tags: article.tags,
            readingMinutes: article.readingMinutes,
            seo: { title: article.title, description: article.excerpt, ogImageId: coverId },
            publishedAt,
          })
          .onConflictDoNothing()
          .returning({ id: articles.id });
        articlesInserted += inserted.length;
      }
      summary.articles = articlesInserted;
      summary.media = mediaInserted;
    });

    console.log("Demo data seeded successfully (idempotent, existing real rows preserved):");
    for (const [key, value] of Object.entries(summary)) {
      console.log(`  - ${key}: ${value}`);
    }
  } finally {
    await sqlClient.end();
  }
}

void seedDemo().catch((error: unknown) => {
  console.error("seed-demo failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
