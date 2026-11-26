import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { eq, inArray, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import sharp from "sharp";
import { z } from "zod";
import {
  media,
  projectCategories,
  projectMedia,
  projects,
  projectServices,
  projectTechnologies,
  services,
  technologies,
  testimonials,
  type Localized,
  type MediaVariant,
} from "../../src/db/schema";

const env = z
  .object({
    DATABASE_URL: z.string().min(1),
    STORAGE_LOCAL_PUBLIC_DIR: z.string().optional(),
  })
  .parse(process.env);

const PUBLIC_STORAGE_DIR = resolve(env.STORAGE_LOCAL_PUBLIC_DIR || "storage/public");
const KEY_PATTERN = /^[a-f0-9-]{36}(?:-\d{1,4})?\.[a-z0-9]{2,8}$/;
const L = (en: string, ar: string): Localized => ({ en, ar });

type ArtTheme = {
  seed: number;
  accentHue: string;
  secondaryHue: string;
  label: string;
  subLabel: string;
  metricTag: string;
};

function buildArtSvg(width: number, height: number, theme: ArtTheme): string {
  const angle = (theme.seed * 37) % 360;
  const cx1 = 22 + ((theme.seed * 19) % 56);
  const cy1 = 25 + ((theme.seed * 23) % 50);
  const cx2 = 15 + ((theme.seed * 41) % 70);
  const cy2 = 60 + ((theme.seed * 13) % 32);

  // Abstract Obsidian & Magma generative topology (no external assets)
  const fissures = Array.from({ length: 5 }, (_, i) => {
    const x0 = Math.round(((theme.seed * 73 + i * 240) % (width - 200)) + 100);
    const y0 = Math.round(((theme.seed * 47 + i * 160) % (height - 200)) + 100);
    const x1 = x0 + ((i % 2 === 0 ? 1 : -1) * (180 + i * 40));
    const y1 = y0 + (i % 3 === 0 ? -140 : 120);
    const xm = Math.round((x0 + x1) / 2 + (i % 2 === 0 ? 45 : -55));
    const ym = Math.round((y0 + y1) / 2 - 35);
    return `M ${x0} ${y0} Q ${xm} ${ym} ${x1} ${y1}`;
  });

  const gridLines = Array.from({ length: 9 }, (_, i) => {
    const y = Math.round(((i + 1) * height) / 10);
    return `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="rgba(251,247,242,0.035)" stroke-width="1" />`;
  }).join("");

  const vLines = Array.from({ length: 11 }, (_, i) => {
    const x = Math.round(((i + 1) * width) / 12);
    return `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="rgba(251,247,242,0.035)" stroke-width="1" />`;
  }).join("");

  const embers = Array.from({ length: 28 }, (_, i) => {
    const x = Math.round(((theme.seed * 97 + i * 137) % (width - 120)) + 60);
    const y = Math.round(((theme.seed * 53 + i * 89) % (height - 120)) + 60);
    const r = 1.5 + (i % 4) * 1.1;
    const opacity = (0.25 + (i % 5) * 0.14).toFixed(2);
    const color = i % 3 === 0 ? "#ffcf4a" : i % 2 === 0 ? theme.accentHue : theme.secondaryHue;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" fill-opacity="${opacity}" />`;
  }).join("");

  const safeLabel = theme.label.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const safeSub = theme.subLabel.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const safeMetric = theme.metricTag.replace(/&/g, "&amp;").replace(/</g, "&lt;");

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(${angle} 0.5 0.5)">
      <stop offset="0%" stop-color="#07060a" />
      <stop offset="52%" stop-color="#121117" />
      <stop offset="100%" stop-color="#0c0b10" />
    </linearGradient>
    <radialGradient id="glow1" cx="${cx1}%" cy="${cy1}%" r="58%">
      <stop offset="0%" stop-color="${theme.accentHue}" stop-opacity="0.46" />
      <stop offset="45%" stop-color="#b8360a" stop-opacity="0.18" />
      <stop offset="100%" stop-color="#07060a" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="glow2" cx="${cx2}%" cy="${cy2}%" r="44%">
      <stop offset="0%" stop-color="${theme.secondaryHue}" stop-opacity="0.22" />
      <stop offset="100%" stop-color="#07060a" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="seam" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#4a1405" stop-opacity="0" />
      <stop offset="48%" stop-color="#ff6a00" stop-opacity="0.95" />
      <stop offset="52%" stop-color="#ffcf4a" stop-opacity="1" />
      <stop offset="100%" stop-color="#4a1405" stop-opacity="0" />
    </linearGradient>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#bg)" />
  <rect width="${width}" height="${height}" fill="url(#glow1)" />
  <rect width="${width}" height="${height}" fill="url(#glow2)" />
  ${gridLines}
  ${vLines}

  <!-- Faceted basalt silhouette planes -->
  <polygon points="0,${height} ${Math.round(width * 0.28)},${Math.round(height * 0.44)} ${Math.round(width * 0.56)},${height}" fill="#0c0b10" fill-opacity="0.72" stroke="rgba(251,247,242,0.08)" stroke-width="1" />
  <polygon points="${Math.round(width * 0.36)},${height} ${Math.round(width * 0.68)},${Math.round(height * 0.34)} ${width},${height}" fill="#18161e" fill-opacity="0.62" stroke="rgba(255,106,0,0.16)" stroke-width="1" />

  <!-- Glowing magma fissures -->
  ${fissures
    .map(
      (d, idx) =>
        `<path d="${d}" fill="none" stroke="${idx % 2 === 0 ? "#ff6a00" : "#ffcf4a"}" stroke-width="${idx === 0 ? 3.2 : 1.6}" stroke-opacity="${idx === 0 ? 0.88 : 0.48}" stroke-linecap="round" />`,
    )
    .join("")}

  <!-- Architectural HUD frame -->
  <rect x="76" y="76" width="${width - 152}" height="${height - 152}" rx="18" fill="rgba(12,11,16,0.52)" stroke="rgba(251,247,242,0.12)" stroke-width="1.2" />
  <rect x="76" y="76" width="${width - 152}" height="2" fill="url(#seam)" />

  <!-- Code-like telemetry wireframe bars -->
  <rect x="128" y="148" width="220" height="10" rx="5" fill="${theme.accentHue}" fill-opacity="0.78" />
  <rect x="128" y="180" width="460" height="6" rx="3" fill="rgba(251,247,242,0.18)" />
  <rect x="128" y="200" width="380" height="6" rx="3" fill="rgba(94,231,240,0.28)" />
  <rect x="128" y="220" width="520" height="6" rx="3" fill="rgba(251,247,242,0.12)" />

  <!-- Node visualization cluster -->
  <circle cx="${Math.round(width * 0.68)}" cy="${Math.round(height * 0.48)}" r="118" fill="none" stroke="rgba(255,106,0,0.34)" stroke-width="1.5" stroke-dasharray="6 8" />
  <circle cx="${Math.round(width * 0.68)}" cy="${Math.round(height * 0.48)}" r="72" fill="rgba(255,106,0,0.08)" stroke="${theme.secondaryHue}" stroke-opacity="0.48" stroke-width="1.2" />
  <circle cx="${Math.round(width * 0.68)}" cy="${Math.round(height * 0.48)}" r="16" fill="#ffcf4a" fill-opacity="0.88" />

  ${embers}

  <!-- Subtle typography anchor inside artwork -->
  <text x="128" y="${height - 184}" fill="#fbf7f2" font-family="ui-sans-serif, system-ui, sans-serif" font-size="44" font-weight="600" letter-spacing="-1">${safeLabel}</text>
  <text x="128" y="${height - 138}" fill="#b3a99f" font-family="ui-monospace, monospace" font-size="20" letter-spacing="2">${safeSub}</text>
  <text x="${width - 128}" y="156" text-anchor="end" fill="#ffb066" font-family="ui-monospace, monospace" font-size="24" font-weight="600">${safeMetric}</text>
</svg>`.trim();
}

async function generateFixtureImage(
  tx: Parameters<Parameters<ReturnType<typeof drizzle>["transaction"]>[0]>[0],
  options: {
    originalName: string;
    alt: Localized;
    theme: ArtTheme;
    width?: number;
    height?: number;
  },
) {
  const width = options.width ?? 1600;
  const height = options.height ?? 1000;
  const svgBuffer = Buffer.from(buildArtSvg(width, height, options.theme), "utf8");
  const baseUuid = randomUUID();
  const storageKey = `${baseUuid}.webp`;

  await mkdir(PUBLIC_STORAGE_DIR, { recursive: true });

  const image = sharp(svgBuffer, { density: 144 });
  const main = await image
    .clone()
    .resize({ width, height, fit: "cover" })
    .webp({ quality: 86 })
    .toBuffer({ resolveWithObject: true });

  await writeFile(resolve(PUBLIC_STORAGE_DIR, storageKey), main.data);

  const variants: MediaVariant[] = [];
  for (const w of [480, 960, 1600]) {
    const targetW = Math.min(w, main.info.width);
    for (const format of ["avif", "webp"] as const) {
      if (format === "webp" && targetW === main.info.width) {
        variants.push({
          width: targetW,
          height: main.info.height,
          key: storageKey,
          url: `/media/${storageKey}`,
          format,
        });
        continue;
      }
      const key = `${baseUuid}-${targetW}.${format}`;
      const result = await image
        .clone()
        .resize({ width: targetW, withoutEnlargement: true })
        .toFormat(format, { quality: format === "avif" ? 55 : 82 })
        .toBuffer({ resolveWithObject: true });
      await writeFile(resolve(PUBLIC_STORAGE_DIR, key), result.data);
      variants.push({
        width: result.info.width,
        height: result.info.height,
        key,
        url: `/media/${key}`,
        format,
      });
    }
  }

  const blur = await image
    .clone()
    .resize({ width: 16, height: 16, fit: "inside" })
    .webp()
    .toBuffer();

  const [row] = await tx
    .insert(media)
    .values({
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
      folder: "fixtures",
    })
    .returning();

  return row;
}

async function cleanFixtures(db: ReturnType<typeof drizzle>) {
  const filesToDelete = new Set<string>();

  await db.transaction(async (tx) => {
    const fixtureProjects = await tx
      .select({
        id: projects.id,
        coverMediaId: projects.coverMediaId,
        videoMediaId: projects.videoMediaId,
      })
      .from(projects)
      .where(like(projects.slug, "fixture-%"));

    const fixtureProjectIds = fixtureProjects.map((p) => p.id);

    const linkedMediaIds = new Set<string>();
    for (const p of fixtureProjects) {
      if (p.coverMediaId) linkedMediaIds.add(p.coverMediaId);
      if (p.videoMediaId) linkedMediaIds.add(p.videoMediaId);
    }

    if (fixtureProjectIds.length > 0) {
      const galleryRows = await tx
        .select({ mediaId: projectMedia.mediaId })
        .from(projectMedia)
        .where(inArray(projectMedia.projectId, fixtureProjectIds));
      for (const g of galleryRows) linkedMediaIds.add(g.mediaId);

      await tx.delete(projectMedia).where(inArray(projectMedia.projectId, fixtureProjectIds));
      await tx
        .delete(projectTechnologies)
        .where(inArray(projectTechnologies.projectId, fixtureProjectIds));
      await tx.delete(projectServices).where(inArray(projectServices.projectId, fixtureProjectIds));
      await tx.delete(testimonials).where(inArray(testimonials.projectId, fixtureProjectIds));
    }

    await tx.delete(testimonials).where(eq(testimonials.authorName, "Fixture Client"));
    if (fixtureProjectIds.length > 0) {
      await tx.delete(projects).where(inArray(projects.id, fixtureProjectIds));
    }
    await tx.delete(projectCategories).where(like(projectCategories.slug, "fixture-%"));

    const mediaRows = await tx
      .select({
        id: media.id,
        storageKey: media.storageKey,
        variants: media.variants,
      })
      .from(media)
      .where(
        or(
          eq(media.folder, "fixtures"),
          like(media.originalName, "fixture-%"),
          linkedMediaIds.size > 0 ? inArray(media.id, [...linkedMediaIds]) : undefined,
        ),
      );

    for (const m of mediaRows) {
      if (KEY_PATTERN.test(m.storageKey)) filesToDelete.add(m.storageKey);
      for (const v of m.variants) {
        if (KEY_PATTERN.test(v.key)) filesToDelete.add(v.key);
      }
    }

    if (mediaRows.length > 0) {
      await tx.delete(media).where(inArray(media.id, mediaRows.map((m) => m.id)));
    }
  });

  await Promise.allSettled(
    [...filesToDelete].map((key) => rm(resolve(PUBLIC_STORAGE_DIR, key), { force: true })),
  );

  console.log(`Cleaned fixture DB rows and ${filesToDelete.size} storage files.`);
}

async function loadFixtures(db: ReturnType<typeof drizzle>) {
  await cleanFixtures(db);

  const [techRows, serviceRows] = await Promise.all([
    db.select({ id: technologies.id, slug: technologies.slug }).from(technologies),
    db.select({ id: services.id, slug: services.slug }).from(services),
  ]);

  await db.transaction(async (tx) => {
    const categoryData = [
      {
        slug: "fixture-ai-systems",
        name: L("AI & Neural Systems", "أنظمة الذكاء الاصطناعي"),
        sortOrder: 901,
      },
      {
        slug: "fixture-fintech-platforms",
        name: L("FinTech Platforms", "منصات التقنية المالية"),
        sortOrder: 902,
      },
      {
        slug: "fixture-cloud-commerce",
        name: L("Enterprise Commerce", "التجارة المؤسسية"),
        sortOrder: 903,
      },
      {
        slug: "fixture-spatial-compute",
        name: L("Digital Twins & IoT", "التوائم الرقمية وإنترنت الأشياء"),
        sortOrder: 904,
      },
    ];

    const insertedCats = await tx.insert(projectCategories).values(categoryData).returning();
    const catBySlug = new Map(insertedCats.map((c) => [c.slug, c.id]));

    const specs = [
      {
        slug: "fixture-sovereign-ai-vault",
        featured: true,
        sortOrder: 1,
        categorySlug: "fixture-ai-systems",
        title: L(
          "Bilingual Sovereign RAG Core for Gulf Regulatory Compliance",
          "نواة ذكاء اصطناعي سيادية ثنائية اللغة للامتثال التنظيمي في الخليج",
        ),
        summary: L(
          "Air-gapped Arabic & English retrieval engine indexing 4.2M legal directives with deterministic citation tracing and sub-second latency.",
          "محرك بحث واسترجاع معرفي يعمل في بيئة معزولة يفهرس ٤.٢ مليون وثيقة تنظيمية باللغتين العربية والإنجليزية مع توثيق المصادر بدقة.",
        ),
        clientName: "Fixture Sovereign Authority",
        clientCountry: "SA",
        industry: L("GovTech & Applied AI", "التقنية الحكومية والذكاء الاصطناعي"),
        year: 2025,
        duration: L("16 weeks", "١٦ أسبوعاً"),
        liveUrl: "https://example.com/fixture-sovereign-ai",
        appStoreUrl: null,
        playStoreUrl: null,
        accent: "lava",
        metrics: [
          { value: "380 ms", label: L("Median citation-verified answer latency", "متوسط زمن الاستجابة الموثّقة") },
          { value: "99.4%", label: L("Arabic morphological recall precision", "دقة استرجاع الجذور العربية") },
          { value: "4.2M", label: L("Indexed regulatory clauses", "بند تنظيمي مفهرس") },
          { value: "-68%", label: L("Analyst compliance review time", "خفض وقت المراجعة القانونية") },
        ],
        features: [
          {
            title: L("Dual-Script Arabic Root Tokenizer", "محلل صرفي مزدوج للغة العربية"),
            description: L(
              "Custom morphological normalizer bridging classical legal terminology and modern Gulf financial filings.",
              "معالج صرفي مخصص يربط المصطلحات النظامية الكلاسيكية بالوثائق المالية الخليجية الحديثة.",
            ),
          },
          {
            title: L("Zero-Hallucination Citation Fence", "حاجز استشهاد يمنع الهلوسة"),
            description: L(
              "Every generated synthesis binds paragraph-level anchors directly to immutable clause hashes.",
              "كل إجابة مولّدة ترتبط مباشرة بمقاطع موثّقة وبصمات تحقق ثابتة للمواد النظامية.",
            ),
          },
          {
            title: L("Air-Gapped On-Prem Orchestrator", "منسّق تشغيل محلي معزول"),
            description: L(
              "Packaged as signed GPU containers deployed within sovereign tier-4 Riyadh data centers.",
              "منشور عبر حاويات معالجة رسومية موقّعة داخل مراكز بيانات سيادية في الرياض.",
            ),
          },
          {
            title: L("Role-Scoped Audit Ledger", "سجل تدقيق مقيد بالصلاحيات"),
            description: L(
              "Row-level policy enforcement ensures analysts only retrieve documents cleared for their ministry.",
              "ضبط الصلاحيات على مستوى السطر يضمن وصول المحللين للوثائق المصرح بها فقط.",
            ),
          },
        ],
        challenge: L(
          "## Fragmented Regulatory Archives\n\nPolicy analysts across multiple directorates needed instant cross-referencing across decades of **bilingual decrees, circulars, and amendments**.\n\n- Generic cloud LLMs failed data residency mandates.\n- Standard embeddings collapsed distinct Arabic legal roots.\n\n> \"Speed without verifiable provenance is unusable in regulatory supervision.\"",
          "## أرشيفات تنظيمية متفرقة\n\nاحتاج المحللون عبر عدة إدارات إلى ربط فوري لعقود من **المراسيم والتعاميم والتعديلات ثنائية اللغة**.\n\n- النماذج السحابية العامة لم تستوفِ متطلبات السيادة الرقمية.\n- التمثيل الدلالي التقليدي أضعف دقة الجذور القانونية العربية.\n\n> \"السرعة دون توثيق موثوق للمصدر لا تصلح للعمل الرقابي.\"",
        ),
        solution: L(
          "## Hybrid Sparse-Dense Retrieval Architecture\n\nWe engineered a dual-stage pipeline combining BM25 Arabic stem matching with fine-tuned bilingual dense vectors.\n\n```ts\nconst citations = await vault.query({\n  locale: \"ar\",\n  requireExactAnchor: true,\n  residency: \"me-central-1\",\n});\n```\n\nEvery response streams alongside interactive source cards highlighting exact clause spans.",
          "## معمارية استرجاع هجينة\n\nقمنا بهندسة مسار مزدوج يجمع بين البحث المعجمي للجذور العربية والمتجهات الدلالية المدربة ثنائياً.\n\n```ts\nconst citations = await vault.query({\n  locale: \"ar\",\n  requireExactAnchor: true,\n  residency: \"me-central-1\",\n});\n```\n\nيتدفق كل رد متزامناً مع بطاقات مصدر تبرز النص النظامي الدقيق.",
        ),
        results: L(
          "## Sovereign Production Rollout\n\nDeployed across **420 senior reviewers** within 16 weeks with zero external telemetry egress and full WCAG 2.2 AA RTL keyboard accessibility.",
          "## إطلاق إنتاجي سيادي\n\nتم نشر المنصة لأكثر من **٤٢٠ مراجعاً** خلال ١٦ أسبوعاً دون أي تسرب للبيانات الخارجية ومع توافق كامل لسهولة الوصول باللغة العربية.",
        ),
        techSlugs: ["next-js", "typescript", "postgresql", "python", "pytorch", "docker"],
        serviceSlugs: ["ai-solutions-automation", "custom-web-platforms"],
        theme: { seed: 11, accentHue: "#ff6a00", secondaryHue: "#5ee7f0", label: "SOVEREIGN RAG", subLabel: "ME-CENTRAL · 4.2M CLAUSES", metricTag: "380 MS" },
      },
      {
        slug: "fixture-gulf-treasury-os",
        featured: true,
        sortOrder: 2,
        categorySlug: "fixture-fintech-platforms",
        title: L(
          "Real-Time Liquidity & Multi-Currency Treasury Cockpit",
          "لوحة السيولة الفورية وإدارة الخزينة متعددة العملات",
        ),
        summary: L(
          "Cross-border SAR, AED, KWD, and USD cash-positioning workspace processing $1.4B in daily institutional settlement flows.",
          "منصة موحدة لمراقبة السيولة والتسويات اليومية عبر الريال السعودي والدرهم والدينار والدولار بحجم تداول ١.٤ مليار دولار يومياً.",
        ),
        clientName: "Fixture Meridian Capital",
        clientCountry: "AE",
        industry: L("Institutional FinTech", "التقنية المالية المؤسسية"),
        year: 2025,
        duration: L("20 weeks", "٢٠ أسبوعاً"),
        liveUrl: "https://example.com/fixture-treasury-os",
        appStoreUrl: "https://apps.apple.com",
        playStoreUrl: "https://play.google.com",
        accent: "cyan",
        metrics: [
          { value: "$1.4B", label: L("Daily reconciled settlement volume", "حجم التسويات اليومية المدارة") },
          { value: "99.99%", label: L("Ledger availability SLA", "نسبة توفر سجل العمليات") },
          { value: "12 ms", label: L("FX exposure recalculation", "زمن إعادة حساب مخاطر الصرف") },
        ],
        features: [
          {
            title: L("Instant Bank API Aggregation", "تجميع فوري لواجهات البنوك"),
            description: L(
              "Normalizes ISO 20022 statements and regional open-banking feeds in real time.",
              "يوحّد كشوفات ISO 20022 وتدفقات المصرفية المفتوحة الإقليمية لحظياً.",
            ),
          },
          {
            title: L("Dual-Approval Signing Workflows", "مسارات اعتماد ثنائية التوقيع"),
            description: L(
              "Hardware-key verified treasury disbursements across web and mobile executive sign-off apps.",
              "اعتماد التحويلات بمفاتيح أمان عتادية عبر الويب وتطبيقات الجوال التنفيذية.",
            ),
          },
        ],
        challenge: L(
          "## Overnight Blind Spots\n\nCorporate treasurers relied on end-of-day CSV reconciliations across 14 regional banks, delaying capital allocation decisions by up to 18 hours.",
          "## فجوات الرؤية اليومية\n\nاعتمد مديرو الخزينة على مطابقة يدوية لملفات نهاية اليوم عبر ١٤ بنكاً إقليمياً، مما أخّر قرارات توجيه السيولة.",
        ),
        solution: L(
          "## Event-Sourced Ledger Stream\n\nBuilt an append-only ledger engine backed by PostgreSQL partitioning and Redis real-time exposure caches with bilingual mobile companion apps.",
          "## محرك تدفق محاسبي لحظي\n\nبنينا سجل عمليات غير قابل للتعديل مدعوماً بقاعدة PostgreSQL وذاكرة Redis لحساب المراكز المالية لحظياً مع تطبيق جوال ثنائي اللغة.",
        ),
        results: L(
          "## Unified GCC Visibility\n\nCut daily treasury close from 4.5 hours to **11 minutes** across Riyadh, Dubai, and Kuwait City desks.",
          "## رؤية موحدة عبر الخليج\n\nانخفض وقت إغلاق الخزينة اليومي من ٤.٥ ساعات إلى **١١ دقيقة** عبر مكاتب الرياض ودبي والكويت.",
        ),
        techSlugs: ["next-js", "react", "typescript", "node-js", "postgresql", "redis", "flutter"],
        serviceSlugs: ["custom-web-platforms", "mobile-apps"],
        theme: { seed: 23, accentHue: "#5ee7f0", secondaryHue: "#ff6a00", label: "TREASURY OS", subLabel: "DIFC · ISO 20022 STREAM", metricTag: "$1.4B/D" },
      },
      {
        slug: "fixture-desert-grid-telemetry",
        featured: false,
        sortOrder: 3,
        categorySlug: "fixture-spatial-compute",
        title: L(
          "Solar Microgrid Predictive Telemetry & Dispatch Twin",
          "توأم رقمي وتنبؤي لإدارة شبكات الطاقة الشمسية",
        ),
        summary: L(
          "Edge-to-cloud digital twin predicting inverter thermal drift and dust attenuation across 180 MW desert solar arrays.",
          "منصة توأم رقمي تتنبأ بارتفاع حرارة العواكس وتراكم الغبار عبر محطات طاقة شمسية بقدرة ١٨٠ ميغاواط.",
        ),
        clientName: "Fixture Helios Energy",
        clientCountry: "QA",
        industry: L("CleanTech & Energy", "الطاقة النظيفة"),
        year: 2024,
        duration: L("14 weeks", "١٤ أسبوعاً"),
        liveUrl: "https://example.com/fixture-desert-grid",
        appStoreUrl: null,
        playStoreUrl: null,
        accent: "yellow",
        metrics: [
          { value: "+14.2%", label: L("Recovered peak generation yield", "زيادة كفاءة الإنتاج الذروي") },
          { value: "180 MW", label: L("Monitored solar capacity", "السعة المراقبة لحظياً") },
          { value: "48 hr", label: L("Predictive maintenance lead window", "نافذة التنبؤ بالأعطال مسبقاً") },
        ],
        features: [
          {
            title: L("Thermal Anomaly Heatmap", "خرائط الشذوذ الحراري"),
            description: L(
              "Pinpoints underperforming string clusters before inverter trip thresholds trigger.",
              "تحديد الألواح المتأثرة حرارياً قبل توقف العواكس عن العمل.",
            ),
          },
          {
            title: L("Autonomous Wash Dispatch", "جدولة التنظيف الذاتي"),
            description: L(
              "Ranks cleaning schedules by irradiance gain per liter of reclaimed water.",
              "ترتيب أولويات التنظيف وفق العائد الفعلي للطاقة مقابل استهلاك المياه.",
            ),
          },
        ],
        challenge: L(
          "## Harsh Desert Operating Conditions\n\nFine particulate storms dropped generation efficiency silently between scheduled maintenance cycles.",
          "## ظروف تشغيل صحراوية قاسية\n\nتسببت العواصف الغبارية الدقيقة في انخفاض خفي بكفاءة الإنتاج بين دورات الصيانة.",
        ),
        solution: L(
          "## Time-Series Inference Pipeline\n\nStreaming MQTT telemetry combined with FastAPI anomaly scoring alerts field crews 48 hours ahead of degradation.",
          "## مسار تنبؤ للسلاسل الزمنية\n\nتحليل تدفقات MQTT عبر FastAPI لإصدار تنبيهات استباقية للفرق الميدانية قبل ٤٨ ساعة من تراجع الأداء.",
        ),
        results: L(
          "## Measurable Yield Lift\n\nRecovered **14.2% peak summer output** across three utility installations.",
          "## ارتفاع ملموس في الإنتاج\n\nاستعادة **١٤.٢٪ من إنتاج الذروة الصيفية** عبر ثلاث محطات طاقة.",
        ),
        techSlugs: ["python", "fastapi", "postgresql", "docker", "cloudflare"],
        serviceSlugs: ["ai-solutions-automation", "cloud-devops"],
        theme: { seed: 37, accentHue: "#ffd866", secondaryHue: "#ff6a00", label: "DESERT GRID", subLabel: "DOHA · 180 MW TWIN", metricTag: "+14.2%" },
      },
      {
        slug: "fixture-oasis-commerce-engine",
        featured: false,
        sortOrder: 4,
        categorySlug: "fixture-cloud-commerce",
        title: L(
          "Headless Bilingual Luxury Flagship & Same-Day Fulfillment",
          "منصة تجارة فاخرة ثنائية اللغة مع شحن في نفس اليوم",
        ),
        summary: L(
          "RTL-native headless commerce architecture integrating Mada, Apple Pay, Tamara, and dark-store inventory orchestration.",
          "متجر إلكتروني ثنائي اللغة يدعم مدى وApple Pay وتمارا مع ربط لحظي بمراكز التوزيع السريع.",
        ),
        clientName: "Fixture Maison Oasis",
        clientCountry: "KW",
        industry: L("Luxury Retail", "التجزئة الفاخرة"),
        year: 2024,
        duration: L("12 weeks", "١٢ أسبوعاً"),
        liveUrl: "https://example.com/fixture-oasis-commerce",
        appStoreUrl: "https://apps.apple.com",
        playStoreUrl: null,
        accent: "green",
        metrics: [
          { value: "+46%", label: L("Mobile checkout conversion", "نمو إتمام الشراء عبر الجوال") },
          { value: "0.9 s", label: L("P95 edge storefront LCP", "زمن التحميل عند الحافة") },
        ],
        features: [
          {
            title: L("True RTL Editorial Merchandising", "عرض تحريري أصيل للعربية"),
            description: L(
              "Separate Arabic & English campaign art direction without layout breakage.",
              "توجيه فني مستقل لكل من العربية والإنجليزية دون أي كسر في التخطيط.",
            ),
          },
        ],
        challenge: L(
          "## Monolithic Theme Bottlenecks\n\nLegacy storefront templates broke Arabic typography and took over 5 seconds to render product pages on mobile.",
          "## قيود القوالب التقليدية\n\nتسببت القوالب الجاهزة في تشوّه النصوص العربية وبطء تحميل صفحات المنتجات على الجوال.",
        ),
        solution: L(
          "## Edge-Cached Next.js Storefront\n\nRebuilt checkout and catalog delivery on Next.js App Router with regional payment gateways and instant stock reservation.",
          "## واجهة متجر فورية عبر Next.js\n\nإعادة بناء الكتالوج والدفع على Next.js مع ربط بوابات الدفع الإقليمية وحجز المخزون الفوري.",
        ),
        results: L(
          "## Sub-Second Checkout\n\nIncreased GCC mobile conversion by **46%** during Ramadan peak traffic.",
          "## إتمام شراء في أقل من ثانية\n\nارتفعت نسبة إتمام الشراء عبر الجوال بمقدار **٤٦٪** خلال ذروة الموسم.",
        ),
        techSlugs: ["next-js", "react", "tailwind-css", "redis", "cloudflare"],
        serviceSlugs: ["ecommerce", "product-design"],
        theme: { seed: 49, accentHue: "#7fe08a", secondaryHue: "#ff8a2a", label: "MAISON OASIS", subLabel: "KUWAIT · HEADLESS GCC", metricTag: "+46% CVR" },
      },
      {
        slug: "fixture-cairo-neural-dispatch",
        featured: false,
        sortOrder: 5,
        categorySlug: "fixture-ai-systems",
        title: L(
          "Dynamic Courier Routing & Arabic Voice Address Parser",
          "توجيه أساطيل التوصيل وتحليل العناوين الصوتية باللهجة المصرية",
        ),
        summary: L(
          "AI voice-to-coordinate pipeline converting colloquial Egyptian Arabic landmark descriptions into routable GPS drops.",
          "نظام ذكاء اصطناعي يحوّل أوصاف العناوين الصوتية باللهجة المحلية إلى إحداثيات دقيقة لفرق التوصيل.",
        ),
        clientName: "Fixture Nile Express",
        clientCountry: "EG",
        industry: L("Logistics & Mobility", "اللوجستيات والنقل"),
        year: 2025,
        duration: L("10 weeks", "١٠ أسابيع"),
        liveUrl: null,
        appStoreUrl: "https://apps.apple.com",
        playStoreUrl: "https://play.google.com",
        accent: "lava",
        metrics: [
          { value: "-31%", label: L("Failed first-attempt deliveries", "خفض محاولات التوصيل الفاشلة") },
          { value: "24/7", label: L("Autonomous dispatch uptime", "تشغيل التوجيه المستمر") },
        ],
        features: [
          {
            title: L("Dialect-Aware Geolocation", "تحديد مواقع يفهم اللهجة المحلية"),
            description: L(
              "Trained on colloquial Cairo & Alexandria landmark phrasing alongside street graph embeddings.",
              "مدرّب على توصيف المعالم باللهجة المصرية وربطها بخرائط الشوارع الفعلية.",
            ),
          },
        ],
        challenge: L(
          "## Unstructured Address Pinning\n\nOver 40% of deliveries lacked standardized postal pins, forcing costly courier phone calls.",
          "## عناوين غير مهيكلة\n\nأكثر من ٤٠٪ من الطلبات افتقرت لإحداثيات دقيقة مما اضطر المندوبين لمكالمات متكررة.",
        ),
        solution: L(
          "## Speech-to-Polygon Disambiguation\n\nFine-tuned speech recognition paired with spatial reranking proposes exact drop coordinates before dispatch.",
          "## تفكيك صوتي وربط مكاني\n\nنموذج تعرف صوتي مدرب محلياً يقترح نقطة التسليم الدقيقة قبل انطلاق السائق.",
        ),
        results: L(
          "## Leaner Last-Mile Operations\n\nReduced repeat delivery attempts by **31%** across Greater Cairo.",
          "## كفاءة أعلى للميل الأخير\n\nخفض محاولات التوصيل المتكررة بنسبة **٣١٪** في القاهرة الكبرى.",
        ),
        techSlugs: ["python", "pytorch", "hugging-face", "kotlin", "swift", "postgresql"],
        serviceSlugs: ["ai-solutions-automation", "mobile-apps"],
        theme: { seed: 61, accentHue: "#ff8a2a", secondaryHue: "#6aa8ff", label: "NILE DISPATCH", subLabel: "CAIRO · VOICE-TO-GEO AI", metricTag: "-31% FAIL" },
      },
      {
        slug: "fixture-crescent-clinical-ai",
        featured: false,
        sortOrder: 6,
        categorySlug: "fixture-ai-systems",
        title: L(
          "Bilingual Clinical Triage & Physician Note Copilot",
          "مساعد الفرز السريري وتوثيق ملاحظات الأطباء ثنائي اللغة",
        ),
        summary: L(
          "Ambient consultation summarizer structured directly into HL7 FHIR records while physicians speak in Arabic or English.",
          "نظام توثيق طبي فوري يحوّل الحوار السريري بالعربية والإنجليزية إلى سجلات FHIR منظمة.",
        ),
        clientName: "Fixture Crescent Care",
        clientCountry: "SA",
        industry: L("Healthcare", "الرعاية الصحية"),
        year: 2024,
        duration: L("15 weeks", "١٥ أسبوعاً"),
        liveUrl: "https://example.com/fixture-crescent",
        appStoreUrl: null,
        playStoreUrl: null,
        accent: "blue",
        metrics: [], // Deliberately empty to verify metrics band hides gracefully when absent
        features: [
          {
            title: L("Code-Switching Medical ASR", "التعرف على المصطلحات الطبية المختلطة"),
            description: L(
              "Handles natural switching between Arabic patient dialogue and English clinical terminology.",
              "يتعامل بسلاسة مع التبديل التلقائي بين حديث المريض بالعربية والمصطلحات الطبية الإنجليزية.",
            ),
          },
        ],
        challenge: L(
          "## Physician Burnout from Documentation\n\nSpecialists spent nearly two hours after clinic hours transcribing bilingual notes into EHR portals.",
          "## عبء التوثيق الطبي\n\nقضى الأطباء قرابة ساعتين يومياً بعد انتهاء العيادات في إدخال الملاحظات يدوياً.",
        ),
        solution: L(
          "## Human-in-the-Loop FHIR Drafts\n\nGenerates structured SOAP summaries within 8 seconds for physician one-tap verification.",
          "## مسودات FHIR بمراجعة الطبيب\n\nتوليد ملخصات طبية منظمة خلال ٨ ثوانٍ لاعتمادها بضغطة واحدة من الطبيب.",
        ),
        results: L(
          "## Restored Patient Face-Time\n\nAdopted across 14 outpatient clinics with full NPHIES interoperability.",
          "## وقت أطول للمريض\n\nتم اعتماده في ١٤ عيادة خارجية مع تكامل كامل مع معايير NPHIES.",
        ),
        techSlugs: ["typescript", "next-js", "python", "fastapi", "postgresql"],
        serviceSlugs: ["ai-solutions-automation", "product-design"],
        theme: { seed: 74, accentHue: "#6aa8ff", secondaryHue: "#5ee7f0", label: "CRESCENT FHIR", subLabel: "RIYADH · CLINICAL COPILOT", metricTag: "HL7 FHIR" },
      },
      {
        slug: "fixture-qamar-spatial-twin",
        featured: false,
        sortOrder: 7,
        categorySlug: "fixture-spatial-compute",
        title: L(
          "Port Terminal Yard Orchestration & WebGL Command Deck",
          "إدارة ساحات الموانئ ومنصة القيادة ثلاثية الأبعاد عبر الويب",
        ),
        summary: L(
          "Browser-native WebGL twin tracking 18,000 container bays and autonomous crane telemetry at 60 fps.",
          "توأم رقمي ثلاثي الأبعاد عبر المتصفح يتابع ١٨,٠٠٠ حاوية والرافعات الآلية بسرعة ٦٠ إطاراً في الثانية.",
        ),
        clientName: "Fixture Qamar Maritime",
        clientCountry: "GB",
        industry: L("Maritime Logistics", "اللوجستيات البحرية"),
        year: 2025,
        duration: L("18 weeks", "١٨ أسبوعاً"),
        liveUrl: "https://example.com/fixture-qamar-twin",
        appStoreUrl: null,
        playStoreUrl: null,
        accent: "lava",
        metrics: [
          { value: "60 fps", label: L("WebGL yard telemetry frame rate", "معدل تحديث التوأم ثلاثي الأبعاد") },
          { value: "-22%", label: L("Vessel turnaround dwell time", "خفض زمن بقاء السفن بالميناء") },
        ],
        features: [
          {
            title: L("Instanced Container Rendering", "رسم آلاف الحاويات بأداء فائق"),
            description: L(
              "Custom shader picking allows instant inspection of manifests, reefer temperatures, and customs holds.",
              "تظليل رسومي مخصص يتيح فحص بيانات الشحنات وحرارة التبريد فوراً.",
            ),
          },
        ],
        challenge: L(
          "## Siloed Terminal Operating Screens\n\nDispatchers juggled 6 legacy tables to diagnose crane bottlenecks during peak vessel arrivals.",
          "## شاشات تشغيل منفصلة\n\nاضطر المشرفون للتنقل بين ٦ جداول تقليدية لتشخيص اختناقات الرافعات.",
        ),
        solution: L(
          "## Unified Spatial Command Surface\n\nStreamed live TOS events into an instanced Three.js deck paired with keyboard-first operator workflows.",
          "## منصة قيادة مكانية موحدة\n\nربط تدفقات التشغيل الحية بواجهة Three.js تفاعلية تدعم الاختصارات الفورية للمشغلين.",
        ),
        results: L(
          "## Faster Berth Turnaround\n\nCut berth congestion delays by **22%** within the first quarter.",
          "## دوران أسرع للأرصفة\n\nتراجع زمن تأخير الأرصفة بنسبة **٢٢٪** خلال الربع الأول.",
        ),
        techSlugs: ["typescript", "react", "next-js", "node-js", "redis", "docker"],
        serviceSlugs: ["custom-web-platforms", "cloud-devops"],
        theme: { seed: 88, accentHue: "#ff6a00", secondaryHue: "#ffd866", label: "QAMAR TWIN", subLabel: "PORT OPS · 60 FPS WEBGL", metricTag: "-22% DWELL" },
      },
    ];

    const techMap = new Map(techRows.map((t) => [t.slug, t.id]));
    const serviceMap = new Map(serviceRows.map((s) => [s.slug, s.id]));

    let firstFeaturedProjectId: string | null = null;

    for (const spec of specs) {
      const cover = await generateFixtureImage(tx, {
        originalName: `${spec.slug}-cover.webp`,
        alt: L(`${spec.title.en} showcase cover`, `غلاف مشروع ${spec.title.ar}`),
        theme: spec.theme,
        width: 1600,
        height: 1000,
      });

      const [insertedProject] = await tx
        .insert(projects)
        .values({
          slug: spec.slug,
          status: "published",
          sortOrder: spec.sortOrder,
          featured: spec.featured,
          categoryId: catBySlug.get(spec.categorySlug) ?? null,
          title: spec.title,
          summary: spec.summary,
          clientName: spec.clientName,
          clientCountry: spec.clientCountry,
          industry: spec.industry,
          year: spec.year,
          duration: spec.duration,
          challenge: spec.challenge,
          solution: spec.solution,
          results: spec.results,
          features: spec.features,
          metrics: spec.metrics,
          liveUrl: spec.liveUrl,
          appStoreUrl: spec.appStoreUrl,
          playStoreUrl: spec.playStoreUrl,
          coverMediaId: cover.id,
          accent: spec.accent,
          seo: {
            title: spec.title,
            description: spec.summary,
            ogImageId: cover.id,
          },
          publishedAt: new Date(),
        })
        .returning();

      if (spec.featured && !firstFeaturedProjectId) {
        firstFeaturedProjectId = insertedProject.id;
      }

      // Link technologies if seeded rows match
      const matchedTechIds = spec.techSlugs
        .map((s) => techMap.get(s))
        .filter((id): id is string => Boolean(id));
      if (matchedTechIds.length > 0) {
        await tx.insert(projectTechnologies).values(
          matchedTechIds.map((technologyId) => ({
            projectId: insertedProject.id,
            technologyId,
          })),
        );
      }

      // Link services if seeded rows match
      const matchedServiceIds = spec.serviceSlugs
        .map((s) => serviceMap.get(s))
        .filter((id): id is string => Boolean(id));
      if (matchedServiceIds.length > 0) {
        await tx.insert(projectServices).values(
          matchedServiceIds.map((serviceId) => ({
            projectId: insertedProject.id,
            serviceId,
          })),
        );
      }

      // Gallery items (3 items on featured projects, 2 items on standard)
      const galleryCount = spec.featured ? 3 : 2;
      const roles = ["mockup", "screenshot", "gallery"] as const;
      for (let gIdx = 0; gIdx < galleryCount; gIdx++) {
        const gMedia = await generateFixtureImage(tx, {
          originalName: `${spec.slug}-gallery-${gIdx + 1}.webp`,
          alt: L(
            `${spec.title.en} — view ${gIdx + 1}`,
            `${spec.title.ar} — لقطة ${gIdx + 1}`,
          ),
          theme: {
            ...spec.theme,
            seed: spec.theme.seed + (gIdx + 1) * 19,
            subLabel: `${spec.theme.label} · ${roles[gIdx].toUpperCase()} 0${gIdx + 1}`,
          },
          width: gIdx === 0 ? 1600 : 1280,
          height: gIdx === 0 ? 960 : 860,
        });

        await tx.insert(projectMedia).values({
          projectId: insertedProject.id,
          mediaId: gMedia.id,
          role: roles[gIdx],
          caption: L(
            `Architecture surface ${gIdx + 1} — ${spec.clientName} telemetry and workflow interface.`,
            `واجهة النظام ${gIdx + 1} — شاشة التشغيل والتقارير لدى ${spec.clientName}.`,
          ),
          sortOrder: gIdx,
        });
      }
    }

    if (firstFeaturedProjectId) {
      await tx.insert(testimonials).values({
        status: "published",
        sortOrder: 1,
        featured: true,
        source: "direct",
        authorName: "Fixture Client",
        authorRole: L("Chief Technology Officer", "الرئيس التنفيذي للتقنية"),
        company: "Fixture Sovereign Authority",
        country: "SA",
        rating: 4.9,
        quote: L(
          "CodeLava delivered our sovereign Arabic-English AI core ahead of schedule with deterministic citation auditing our legal regulators trusted from day one.",
          "قدّمت CodeLava نواة الذكاء الاصطناعي السيادية باللغتين قبل الموعد المحدد مع دقة توثيق نالت ثقة فرقنا التنظيمية منذ اليوم الأول.",
        ),
        quoteLocale: "en",
        projectId: firstFeaturedProjectId,
        reviewDate: new Date(),
        publishedAt: new Date(),
      });
    }
  });

  console.log("Loaded 7 fixture projects, 4 fixture categories, sharp WebP/AVIF media, and 1 fixture testimonial.");
}

async function main() {
  const cleanOnly = process.argv.includes("--clean");
  const sqlClient = postgres(env.DATABASE_URL, { max: 1 });
  try {
    const db = drizzle(sqlClient);
    if (cleanOnly) {
      await cleanFixtures(db);
    } else {
      await loadFixtures(db);
    }
  } finally {
    await sqlClient.end();
  }
}

void main().catch((error: unknown) => {
  console.error("Work dev-fixtures script failed:", error);
  process.exitCode = 1;
});
