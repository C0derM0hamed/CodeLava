import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import sharp from "sharp";
import { z } from "zod";
import {
  achievements,
  articles,
  clientLogos,
  media,
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

const env = z
  .object({
    DATABASE_URL: z.string().min(1),
    STORAGE_LOCAL_PUBLIC_DIR: z.string().optional(),
  })
  .parse(process.env);

const PUBLIC_STORAGE_DIR = resolve(env.STORAGE_LOCAL_PUBLIC_DIR || "storage/public");
const ASSETS_DIR = resolve("scripts/demo-assets");
const L = (en: string, ar: string): Localized => ({ en, ar });
const demoId = (ns: string, index: number) =>
  `d3000000-0000-4000-8000-${ns}${String(index + 1).padStart(10, "0")}`;

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
  if (existing.length > 0) return existing[0];

  const baseUuid = randomUUID();
  const storageKey = `${baseUuid}.webp`;
  const pipeline = sharp(buffer, { density: 160 });

  const main = await pipeline
    .clone()
    .resize({
      width,
      height,
      fit: options.fit ?? "cover",
      background: options.transparent ? { r: 0, g: 0, b: 0, alpha: 0 } : { r: 15, g: 19, b: 32, alpha: 1 },
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

  const blur = await pipeline.clone().resize({ width: 16, height: 16, fit: "inside" }).webp().toBuffer();

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
      folder: "demo",
    })
    .returning();

  return row;
}

function buildStudioCardSvg(opts: {
  title: string;
  tag: string;
  metric: string;
  metricLabel: string;
  accent: string;
  secondary: string;
  mode: "dark" | "light";
  bars: number[];
}) {
  const isDark = opts.mode === "dark";
  const bgA = isDark ? "#0d111b" : "#f5f2ed";
  const bgB = isDark ? "#171d2e" : "#ebe6de";
  const cardBg = isDark ? "#141927" : "#ffffff";
  const panelBg = isDark ? "#1c2336" : "#f7f5f2";
  const textMain = isDark ? "#fbf7f2" : "#151a29";
  const textMuted = isDark ? "#9aa0b2" : "#5a6278";
  const line = isDark ? "rgba(255,255,255,0.09)" : "rgba(21,26,41,0.09)";

  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const barSvg = opts.bars
    .map((val, i) => {
      const h = Math.round(val * 2.1);
      const x = 190 + i * 74;
      const y = 760 - h;
      const col = i === opts.bars.length - 1 ? opts.accent : i % 2 === 0 ? opts.secondary : isDark ? "#2d3752" : "#d8d5cf";
      return `<rect x="${x}" y="${y}" width="44" height="${h}" rx="10" fill="${col}" />`;
    })
    .join("");

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bgA}" />
      <stop offset="100%" stop-color="${bgB}" />
    </linearGradient>
    <radialGradient id="glowA" cx="82%" cy="18%" r="55%">
      <stop offset="0%" stop-color="${opts.accent}" stop-opacity="${isDark ? "0.34" : "0.22"}" />
      <stop offset="100%" stop-color="${opts.accent}" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="glowB" cx="15%" cy="88%" r="48%">
      <stop offset="0%" stop-color="${opts.secondary}" stop-opacity="${isDark ? "0.22" : "0.14"}" />
      <stop offset="100%" stop-color="${opts.secondary}" stop-opacity="0" />
    </radialGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="125%">
      <feDropShadow dx="0" dy="28" stdDeviation="28" flood-color="#07060a" flood-opacity="${isDark ? "0.55" : "0.16"}" />
    </filter>
  </defs>

  <rect width="1600" height="1000" fill="url(#bg)" />
  <rect width="1600" height="1000" fill="url(#glowA)" />
  <rect width="1600" height="1000" fill="url(#glowB)" />

  <!-- Main Studio Device Window -->
  <g filter="url(#shadow)">
    <rect x="120" y="108" width="1360" height="784" rx="28" fill="${cardBg}" stroke="${line}" stroke-width="2" />
  </g>
  <!-- Top window bar -->
  <rect x="120" y="108" width="1360" height="62" rx="28" fill="${panelBg}" />
  <rect x="120" y="142" width="1360" height="28" fill="${panelBg}" />
  <line x1="120" y1="170" x2="1480" y2="170" stroke="${line}" stroke-width="1.5" />
  <circle cx="164" cy="139" r="7" fill="${opts.accent}" />
  <circle cx="190" cy="139" r="7" fill="${opts.secondary}" opacity="0.7" />
  <circle cx="216" cy="139" r="7" fill="${textMuted}" opacity="0.35" />
  <rect x="264" y="127" width="300" height="24" rx="12" fill="${isDark ? "rgba(255,255,255,0.06)" : "rgba(21,26,41,0.05)"}" />

  <!-- Header copy inside frame -->
  <rect x="176" y="216" width="196" height="34" rx="17" fill="${opts.accent}" fill-opacity="0.16" />
  <text x="274" y="239" text-anchor="middle" fill="${opts.accent}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="16" font-weight="700" letter-spacing="1.2">${esc(opts.tag)}</text>
  <text x="176" y="308" fill="${textMain}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="46" font-weight="700" letter-spacing="-1">${esc(opts.title)}</text>

  <!-- Right KPI spotlight card -->
  <rect x="1030" y="216" width="394" height="170" rx="22" fill="${panelBg}" stroke="${line}" stroke-width="1.5" />
  <text x="1068" y="304" fill="${opts.accent}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="64" font-weight="800" letter-spacing="-2">${esc(opts.metric)}</text>
  <text x="1068" y="348" fill="${textMuted}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="20" font-weight="500">${esc(opts.metricLabel)}</text>

  <!-- Chart Panel -->
  <rect x="176" y="420" width="814" height="414" rx="22" fill="${panelBg}" stroke="${line}" stroke-width="1.5" />
  <line x1="210" y1="520" x2="950" y2="520" stroke="${line}" stroke-dasharray="6 8" />
  <line x1="210" y1="620" x2="950" y2="620" stroke="${line}" stroke-dasharray="6 8" />
  <line x1="210" y1="720" x2="950" y2="720" stroke="${line}" stroke-dasharray="6 8" />
  ${barSvg}

  <!-- Right activity module -->
  <rect x="1030" y="420" width="394" height="414" rx="22" fill="${panelBg}" stroke="${line}" stroke-width="1.5" />
  <circle cx="1227" cy="575" r="92" fill="none" stroke="${line}" stroke-width="18" />
  <circle cx="1227" cy="575" r="92" fill="none" stroke="${opts.accent}" stroke-width="18" stroke-dasharray="415 580" stroke-linecap="round" transform="rotate(-90 1227 575)" />
  <circle cx="1227" cy="575" r="64" fill="none" stroke="${opts.secondary}" stroke-width="10" stroke-dasharray="280 410" stroke-linecap="round" transform="rotate(-35 1227 575)" />
  <rect x="1072" y="718" width="310" height="16" rx="8" fill="${isDark ? "rgba(255,255,255,0.14)" : "rgba(21,26,41,0.12)"}" />
  <rect x="1072" y="752" width="218" height="14" rx="7" fill="${opts.accent}" fill-opacity="0.55" />
  <rect x="1072" y="782" width="260" height="12" rx="6" fill="${isDark ? "rgba(255,255,255,0.08)" : "rgba(21,26,41,0.08)"}" />
</svg>`.trim();
}

function buildLogoSvg(name: string, mark: "hex" | "arc" | "grid" | "prism" | "bolt" | "ring") {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const icon =
    mark === "hex"
      ? `<polygon points="34,12 52,22 52,42 34,52 16,42 16,22" fill="none" stroke="#151a29" stroke-width="4.2"/><circle cx="34" cy="32" r="6" fill="#ff6a00"/>`
      : mark === "arc"
        ? `<path d="M16 44 A20 20 0 0 1 52 44" fill="none" stroke="#151a29" stroke-width="4.5" stroke-linecap="round"/><path d="M24 44 A12 12 0 0 1 44 44" fill="none" stroke="#ff6a00" stroke-width="4.5" stroke-linecap="round"/>`
        : mark === "grid"
          ? `<rect x="16" y="14" width="15" height="15" rx="3.5" fill="#151a29"/><rect x="36" y="14" width="15" height="15" rx="3.5" fill="#ff6a00"/><rect x="16" y="34" width="15" height="15" rx="3.5" fill="#151a29" opacity="0.5"/><rect x="36" y="34" width="15" height="15" rx="3.5" fill="#151a29"/>`
          : mark === "prism"
            ? `<polygon points="34,12 54,48 14,48" fill="none" stroke="#151a29" stroke-width="4.2" stroke-linejoin="round"/><polygon points="34,26 43,43 25,43" fill="#ff6a00"/>`
            : mark === "bolt"
              ? `<path d="M37 12 L19 34 H33 L29 52 L49 28 H35 Z" fill="#151a29"/><circle cx="46" cy="18" r="4" fill="#ff6a00"/>`
              : `<circle cx="34" cy="32" r="17" fill="none" stroke="#151a29" stroke-width="4.2"/><circle cx="34" cy="32" r="6" fill="#ff6a00"/>`;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="360" height="96" viewBox="0 0 360 96">
  <g transform="translate(18, 16)">${icon}</g>
  <text x="92" y="58" fill="#151a29" font-family="ui-sans-serif, system-ui, sans-serif" font-size="30" font-weight="700" letter-spacing="-0.8">${esc(name)}</text>
</svg>`.trim();
}

async function seedDemo() {
  const sqlClient = postgres(env.DATABASE_URL, { max: 1 });
  try {
    const db = drizzle(sqlClient);
    await db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(420299)`);

      // Lookup existing starter services, categories, technologies
      const svcRows = await tx.select().from(services);
      const catRows = await tx.select().from(projectCategories);
      const techRows = await tx.select().from(technologies);
      const svcBySlug = new Map(svcRows.map((s) => [s.slug, s]));
      const catBySlug = new Map(catRows.map((c) => [c.slug, c]));
      const techBySlug = new Map(techRows.map((t) => [t.slug, t]));

      // Ensure a cloud-devops category exists too
      if (!catBySlug.has("cloud-devops")) {
        const [cloudCat] = await tx
          .insert(projectCategories)
          .values({
            id: demoId("05", 10),
            slug: "cloud-devops",
            name: L("Cloud & DevOps", "الحوسبة السحابية وDevOps"),
            sortOrder: 5,
            visible: true,
          })
          .onConflictDoNothing()
          .returning();
        if (cloudCat) catBySlug.set("cloud-devops", cloudCat);
      }

      // 1. Ingest the 6 real generated showcase renders
      const assetFiles = [
        ["webLogistics", "project-web-logistics.jpg", L("Mizan Fleet & Logistics OS dashboard", "لوحة تحكم منصة ميزان لإدارة الأساطيل واللوجستيات")],
        ["mobileCourier", "project-mobile-courier.jpg", L("Qafila express courier mobile app screens", "شاشات تطبيق قافلة للتوصيل السريع")],
        ["aiCopilot", "project-ai-copilot.jpg", L("Nibras Arabic enterprise AI copilot interface", "واجهة نبراس مساعد المعرفة المؤسسي بالذكاء الاصطناعي")],
        ["designSystem", "project-design-system.jpg", L("Wafra digital banking design system showcase", "عرض نظام تصميم وفرة للخدمات المصرفية الرقمية")],
        ["ecommerceLuxury", "project-ecommerce-luxury.jpg", L("Diyar luxury home storefront on laptop and phone", "متجر ديار للأثاث الفاخر على الحاسوب والجوال")],
        ["cloudDevops", "project-cloud-devops.jpg", L("Sama Cloud multi-region telemetry console", "لوحة مراقبة البنية السحابية متعددة المناطق سماء")],
      ] as const;

      const mediaMap = new Map<string, string>();
      for (let i = 0; i < assetFiles.length; i++) {
        const [key, filename, alt] = assetFiles[i];
        const buf = await readFile(resolve(ASSETS_DIR, filename));
        const row = await storeImageBuffer(tx, buf, {
          id: demoId("10", i),
          originalName: filename,
          alt,
        });
        mediaMap.set(key, row.id);
      }

      // 2. Generate 6 crisp studio secondary project visuals + 3 blog covers
      const generatedCards = [
        { key: "proptech", title: "Sanad Property OS", tag: "PROPTECH SAAS", metric: "42K+", metricLabel: "Active Residential Units", accent: "#ff6a00", secondary: "#0aa5c2", mode: "light" as const, bars: [42, 56, 48, 72, 65, 84, 92, 108, 126] },
        { key: "telehealth", title: "Afiya Telehealth", tag: "HEALTHCARE MOBILE", metric: "4.9 ★", metricLabel: "App Store Rating", accent: "#ff6a00", secondary: "#178a4c", mode: "light" as const, bars: [36, 49, 64, 58, 78, 86, 95, 114, 130] },
        { key: "rasedAi", title: "Rased ZATCA Agent", tag: "AI AUTOMATION", metric: "99.4%", metricLabel: "Invoice Extraction Accuracy", accent: "#ff8a2a", secondary: "#5ee7f0", mode: "dark" as const, bars: [52, 68, 74, 88, 92, 106, 115, 122, 136] },
        { key: "masarUx", title: "Masar B2B UX", tag: "PRODUCT DESIGN", metric: "+64%", metricLabel: "Faster Procurement Flow", accent: "#ff6a00", secondary: "#2f6bff", mode: "light" as const, bars: [34, 44, 58, 69, 77, 88, 96, 112, 128] },
        { key: "noorCoffee", title: "Noor Roasters", tag: "HEADLESS COMMERCE", metric: "3.2x", metricLabel: "Subscription Retention", accent: "#e94e06", secondary: "#ffcf4a", mode: "dark" as const, bars: [38, 52, 61, 70, 84, 93, 104, 118, 132] },
        { key: "buraqCloud", title: "Buraq FinTech SRE", tag: "CLOUD INFRASTRUCTURE", metric: "99.99%", metricLabel: "Zero-Downtime Releases", accent: "#ff8a2a", secondary: "#6aa8ff", mode: "dark" as const, bars: [78, 84, 88, 92, 95, 102, 110, 124, 136] },
        { key: "blogBilingual", title: "RTL Architecture", tag: "ENGINEERING NOTE", metric: "2x", metricLabel: "Faster Localization Delivery", accent: "#ff6a00", secondary: "#0aa5c2", mode: "dark" as const, bars: [45, 58, 64, 72, 80, 92, 100, 114, 124] },
        { key: "blogAi", title: "Measured AI", tag: "APPLIED AI", metric: "-71%", metricLabel: "Manual Review Hours", accent: "#ff8a2a", secondary: "#5ee7f0", mode: "dark" as const, bars: [35, 52, 68, 82, 94, 108, 118, 126, 134] },
        { key: "blogPerf", title: "Sub-200ms Next.js", tag: "PERFORMANCE", metric: "190ms", metricLabel: "Production LCP Target", accent: "#ff6a00", secondary: "#7fe08a", mode: "light" as const, bars: [98, 90, 82, 74, 65, 56, 48, 40, 32] },
      ];

      for (let i = 0; i < generatedCards.length; i++) {
        const card = generatedCards[i];
        const svg = Buffer.from(buildStudioCardSvg(card), "utf8");
        const row = await storeImageBuffer(tx, svg, {
          id: demoId("11", i),
          originalName: `${card.key}.webp`,
          alt: L(card.title, card.title),
        });
        mediaMap.set(card.key, row.id);
      }

      // 3. Enrich starter services with covers, deliverables, and features so every service detail page shines
      const serviceEnrichments: Record<
        string,
        {
          coverKey: string;
          deliverables: { en: string[]; ar: string[] };
          features: { title: Localized; description: Localized; icon: string }[];
        }
      > = {
        "custom-web-platforms": {
          coverKey: "webLogistics",
          deliverables: {
            en: [
              "Bilingual (EN/AR) responsive web platform & admin console",
              "Role-based access control, audit trails & secure authentication",
              "PostgreSQL relational schema, API contracts & integrations",
              "Automated CI/CD deployment pipeline & observability setup",
              "Complete codebase documentation & engineering handover",
            ],
            ar: [
              "منصة ويب متجاوبة ثنائية اللغة (عربي/إنجليزي) ولوحة إدارة متكاملة",
              "نظام صلاحيات دقيق وسجل تدقيق ومصادقة آمنة",
              "قاعدة بيانات PostgreSQL وتكاملات API موثوقة",
              "مسار نشر تلقائي CI/CD ومراقبة فورية للأداء",
              "توثيق برمجي كامل وتسليم منظم لفريقك",
            ],
          },
          features: [
            { title: L("Workflow-First Architecture", "بنية متمحورة حول مسارات العمل"), description: L("Every screen mirrors real operational roles instead of forcing teams into rigid templates.", "كل شاشة تُصمّم لتلائم دور فريقك الفعلي بدلًا من القوالب الجامدة."), icon: "PanelsTopLeft" },
            { title: L("Enterprise Security & RBAC", "أمان مؤسسي وصلاحيات دقيقة"), description: L("Granular permissions, session hygiene, rate limiting and full audit logs built in.", "صلاحيات تفصيلية، جلسات آمنة، حماية من الطلبات المتكررة وسجل تدقيق شامل."), icon: "ShieldCheck" },
            { title: L("Native RTL + LTR Parity", "دعم أصيل للعربية والإنجليزية"), description: L("True bidirectional layouts, localized numbers and crisp Arabic typography from day one.", "تخطيطات متكاملة للاتجاهين وأرقام وخطوط عربية واضحة منذ اليوم الأول."), icon: "Globe" },
            { title: L("API & ERP Integrations", "تكامل سلس مع الأنظمة القائمة"), description: L("Clean connectors for payment gateways, ERPs, CRMs and regional compliance platforms.", "ربط موثوق مع بوابات الدفع وأنظمة ERP والجهات التنظيمية."), icon: "Workflow" },
          ],
        },
        "mobile-apps": {
          coverKey: "mobileCourier",
          deliverables: {
            en: [
              "iOS & Android production apps (Flutter or native Swift/Kotlin)",
              "Real-time push notifications, live maps & offline resilience",
              "Local payment integrations (Mada, Apple Pay, KNET, cards)",
              "App Store & Google Play review submission & release kit",
              "Crash monitoring, performance telemetry & post-launch support",
            ],
            ar: [
              "تطبيقات جاهزة للإنتاج على iOS وAndroid (Flutter أو Native)",
              "إشعارات لحظية وخرائط مباشرة والعمل بسلاسة عند ضعف الاتصال",
              "ربط بوابات الدفع المحلية (مدى، Apple Pay، KNET والبطاقات)",
              "تجهيز النشر ومراجعة متجري App Store وGoogle Play",
              "مراقبة الأعطال والأداء ودعم ما بعد الإطلاق",
            ],
          },
          features: [
            { title: L("60fps Native-Feel UX", "سلاسة فائقة بسرعة 60 إطارًا"), description: L("Fluid transitions, tactile micro-interactions and zero-jank scrolling on real devices.", "انتقالات ناعمة وتفاعلات دقيقة مختبرة على الأجهزة الفعلية."), icon: "Smartphone" },
            { title: L("Live Tracking & Maps", "تتبّع لحظي وخرائط ذكية"), description: L("Sub-second courier, fleet or field-agent positioning with battery-friendly telemetry.", "تتبع فوري للمندوبين والأساطيل بكفاءة عالية لاستهلاك البطارية."), icon: "Compass" },
            { title: L("Regional Checkout Ready", "جاهز لبوابات الدفع الإقليمية"), description: L("One-tap Apple Pay, Mada, STC Pay and multi-currency checkout flows.", "دفع بضغطة واحدة عبر Apple Pay ومدى والعملات الخليجية والمحلية."), icon: "Zap" },
            { title: L("Store Release Management", "إدارة كاملة للنشر بالمتاجر"), description: L("We handle provisioning, compliance questionnaires and phased rollouts.", "نتولى إجراءات الاعتماد والنشر المرحلي على المتاجر بسلاسة."), icon: "Rocket" },
          ],
        },
        "ai-solutions-automation": {
          coverKey: "aiCopilot",
          deliverables: {
            en: [
              "Production Arabic/English RAG knowledge copilot or agent",
              "Evaluation benchmark dataset with measurable accuracy metrics",
              "Human-in-the-loop review workflows & audit logging",
              "Secure private data connectors & role-scoped retrieval",
              "Cost-controlled LLM routing & fallback orchestration",
            ],
            ar: [
              "مساعد ذكاء اصطناعي أو وكيل أتمتة ثنائي اللغة جاهز للإنتاج",
              "مجموعة اختبارات قياسية لضمان دقة المخرجات وقابليتها للقياس",
              "مسارات مراجعة بشرية وسجل تدقيق كامل للقرارات",
              "ربط آمن بالبيانات الداخلية مع احترام صلاحيات كل مستخدم",
              "تحسين تكلفة استدعاء النماذج مع خطط بديلة تلقائية",
            ],
          },
          features: [
            { title: L("Arabic-First RAG Retrieval", "استرجاع معرفي دقيق للعربية"), description: L("Hybrid semantic + keyword retrieval tuned for Arabic legal, finance and ops documents.", "بحث دلالي وهجين مضبوط خصيصًا للمستندات العربية والإنجليزية."), icon: "Sparkles" },
            { title: L("Measurable Evaluations", "تقييم مستمر وقابل للقياس"), description: L("Every prompt and pipeline change is benchmarked before hitting production.", "نختبر كل تحديث على حالات عمل فعلية قبل وصوله للإنتاج."), icon: "BarChart3" },
            { title: L("Document & ERP Automation", "أتمتة المستندات وأنظمة ERP"), description: L("Extract structured data from invoices, contracts and forms directly into your ERP.", "استخراج تلقائي لبيانات الفواتير والعقود وربطها مباشرة بنظامك."), icon: "Bot" },
            { title: L("Guardrails & Privacy", "ضوابط أمان وخصوصية كاملة"), description: L("PII redaction, citation grounding and strict tenant isolation.", "توثيق المصادر وعزل كامل لبيانات كل عميل دون تسريب."), icon: "Lock" },
          ],
        },
        "product-design": {
          coverKey: "designSystem",
          deliverables: {
            en: [
              "User journey mapping, information architecture & UX audit",
              "Interactive clickable Figma prototypes in English & Arabic",
              "Tokenized Figma + code design system with dark/light modes",
              "WCAG 2.2 AA accessibility & RTL visual specification",
              "Developer-ready component specs & motion guidelines",
            ],
            ar: [
              "رسم رحلات المستخدم وهندسة المعلومات وتدقيق تجربة الاستخدام",
              "نماذج أولية تفاعلية على Figma باللغتين العربية والإنجليزية",
              "نظام تصميم متكامل بالمتغيرات جاهز للبرمجة",
              "توافق كامل مع معايير إتاحة الوصول WCAG 2.2 AA واتجاه RTL",
              "مواصفات دقيقة للمكونات والحركة لتسليم سلس للمطورين",
            ],
          },
          features: [
            { title: L("Bilingual Design Systems", "أنظمة تصميم ثنائية اللغة"), description: L("Mirrored grids, calibrated Arabic type scales and tokenized spacing built to scale.", "شبكات متناظرة ومقاييس خطوط عربية مضبوطة قابلة للتوسع."), icon: "PenTool" },
            { title: L("Interactive Prototyping", "نماذج أولية تفاعلية"), description: L("Validate critical user flows with real stakeholders before a line of code is written.", "اختبر التجربة فعليًا مع عملائك وفريقك قبل بدء التطوير."), icon: "Layers" },
            { title: L("Conversion-Focused Flows", "مسارات تركّز على التحويل"), description: L("Eliminate friction across onboarding, checkout and enterprise dashboards.", "تبسيط خطوات التسجيل والدفع ولوحات التحكم المعقدة."), icon: "Palette" },
            { title: L("Engineering Handover", "تسليم هندسي منضبط"), description: L("Every component ships with hover, focus, empty, error and RTL states defined.", "كل مكون يوثّق حالات التفاعل والأخطاء والفراغ بوضوح تام."), icon: "Boxes" },
          ],
        },
        ecommerce: {
          coverKey: "ecommerceLuxury",
          deliverables: {
            en: [
              "Fast headless bilingual storefront (Next.js) with SEO schema",
              "Mada, Apple Pay, Tamara, Tabby & multi-currency checkout",
              "Real-time ERP / inventory sync & fulfillment dashboard",
              "Localized promotions, loyalty rules & abandoned cart flows",
              "Analytics, conversion tracking & speed optimization",
            ],
            ar: [
              "متجر إلكتروني فائق السرعة ثنائي اللغة مهيّأ لمحركات البحث",
              "دفع محلي وعالمي (مدى، Apple Pay، تمارا، تابي وعملات متعددة)",
              "مزامنة لحظية للمخزون والطلبات مع أنظمة ERP والشحن",
              "نظام عروض وخصومات مرن واستعادة السلات المتروكة",
              "تتبع التحويلات وتحسين سرعة التصفح على الجوال",
            ],
          },
          features: [
            { title: L("Instant Mobile Storefront", "تصفّح فوري على الجوال"), description: L("Sub-second product pages engineered to maximize mobile conversion across GCC networks.", "صفحات منتجات فائقة السرعة لرفع معدل الشراء عبر الجوال."), icon: "ShoppingCart" },
            { title: L("BNPL & Local Payments", "الدفع بالتقسيط والبوابات المحلية"), description: L("Seamless integration with Tamara, Tabby, Moyasar, Tap, HyperPay and Stripe.", "تكامل مباشر مع تمارا وتابي وميسّر وتاب وStripe."), icon: "Zap" },
            { title: L("Inventory & Shipping Sync", "ربط المخزون وشركات الشحن"), description: L("Automated waybills with Aramex, SMSA and DHL plus live stock control.", "إصدار تلقائي لبوالص الشحن ومزامنة فورية مع المخزون."), icon: "Boxes" },
            { title: L("Editorial Merchandising", "عرض فاخر للمنتجات"), description: L("Rich lookbooks, custom variants and effortless CMS control for your team.", "عرض جذاب للمنتجات مع تحكم كامل وسهل لفريق التسويق."), icon: "Sparkles" },
          ],
        },
        "cloud-devops": {
          coverKey: "cloudDevops",
          deliverables: {
            en: [
              "Containerized production architecture (Docker / Kubernetes / Terraform)",
              "Zero-downtime CI/CD pipelines with automated rollback",
              "24/7 observability dashboards, alerts & uptime SLAs",
              "Cloudflare edge security, WAF & DDoS hardening",
              "Disaster recovery runbooks & regional data residency compliance",
            ],
            ar: [
              "بنية سحابية حديثة بالحاويات (Docker / Kubernetes / Terraform)",
              "مسارات نشر تلقائية دون توقف مع التراجع الفوري عند الحاجة",
              "لوحات مراقبة وتنبيهات على مدار الساعة لضمان أعلى استقرار",
              "حماية الحافة وجدار الحماية WAF ومقاومة هجمات DDoS",
              "خطط تعافٍ موثّقة وامتثال لمتطلبات استضافة البيانات بالمنطقة",
            ],
          },
          features: [
            { title: L("Zero-Downtime Releases", "تحديثات دون أي توقّف"), description: L("Blue-green and canary deployments keep customers online during every release.", "نشر تدريجي آمن يضمن استمرار الخدمة دون انقطاع للمستخدمين."), icon: "Cloud" },
            { title: L("Full-Stack Observability", "رؤية لحظية شاملة للأداء"), description: L("Structured logs, traces and latency alerts pinpoint bottlenecks before users notice.", "تتبّع دقيق للسجلات وزمن الاستجابة قبل تأثر أي عميل."), icon: "Server" },
            { title: L("Regional Cloud Residency", "امتثال لاستضافة البيانات"), description: L("Deploy cleanly across Riyadh, Dubai, Bahrain, Frankfurt and Cloudflare edge.", "نشر مرن في مناطق الرياض ودبي والبحرين وأوروبا."), icon: "Globe" },
            { title: L("Cost & Security Hardening", "تحسين التكلفة وتحصين الأمان"), description: L("Right-sized autoscaling, encrypted secrets and automated daily backups.", "توسّع تلقائي متوازن ونسخ احتياطي يومي مشفّر."), icon: "ShieldCheck" },
          ],
        },
      };

      for (const [slug, enrich] of Object.entries(serviceEnrichments)) {
        const svc = svcBySlug.get(slug);
        if (!svc) continue;
        await tx
          .update(services)
          .set({
            coverMediaId: mediaMap.get(enrich.coverKey) ?? svc.coverMediaId,
            deliverables: enrich.deliverables,
            features: enrich.features,
          })
          .where(eq(services.id, svc.id));
      }

      // 4. Insert 12 rich bilingual projects (2 linked to EVERY SINGLE ONE of the 6 services!)
      const demoProjects = [
        {
          slug: "mizan-logistics-os",
          featured: true,
          categorySlug: "web-platforms",
          serviceSlugs: ["custom-web-platforms", "cloud-devops"],
          techSlugs: ["next-js", "typescript", "postgresql", "redis", "docker"],
          coverKey: "webLogistics",
          galleryKeys: ["cloudDevops", "proptech"],
          title: L("Mizan Fleet & Logistics OS", "منصة ميزان لإدارة الأساطيل واللوجستيات"),
          summary: L(
            "Real-time Gulf fleet orchestration, automated customs workflows, and live shipment telemetry built for 240+ active transport vehicles across Saudi Arabia and the UAE.",
            "منصة تشغيلية متكاملة لإدارة الأساطيل وتتبع الشحنات لحظيًا وأتمتة التخليص الجمركي لأكثر من ٢٤٠ مركبة بين السعودية والإمارات.",
          ),
          clientName: "Mizan Logistics Group",
          clientCountry: "SA",
          industry: L("Logistics & Supply Chain", "اللوجستيات وسلاسل الإمداد"),
          year: 2026,
          duration: L("14 weeks", "١٤ أسبوعًا"),
          challenge: L(
            "Dispatchers were juggling four disconnected spreadsheets, WhatsApp driver updates, and manual customs portals—creating costly delays across Riyadh, Jeddah, and Dubai corridors.",
            "كان فريق التشغيل يعتمد على جداول متفرقة وتحديثات يدوية عبر واتساب وبوابات تخليص منفصلة، ما تسبب في تأخيرات مكلفة عبر خطوط الرياض وجدة ودبي.",
          ),
          solution: L(
            "We engineered a unified bilingual operations OS with live GPS route telemetry, automated exception alerts, role-based dispatcher & client portals, and direct ERP billing hooks.",
            "بنينا منصة تشغيلية ثنائية اللغة توحّد تتبع المسارات لحظيًا والتنبيهات الآلية وبوابات العملاء والمشغلين مع ربط مباشر بنظام الفوترة وERP.",
          ),
          results: L(
            "Within 90 days of rollout, on-time delivery climbed to **98.4%**, dispatch manual calls dropped by **68%**, and enterprise clients gained real-time visibility from pickup to customs clearance.",
            "خلال ٩٠ يومًا من الإطلاق ارتفع الالتزام بمواعيد التسليم إلى **98.4%**، وانخفضت المكالمات التشغيلية اليدوية بنسبة **68%** مع شفافية لحظية للعملاء.",
          ),
          metrics: [
            { value: "98.4%", label: L("On-time delivery", "التزام بالمواعيد") },
            { value: "-68%", label: L("Manual dispatch calls", "انخفاض المتابعة اليدوية") },
            { value: "248", label: L("Connected fleet units", "مركبة متصلة لحظيًا") },
          ],
          features: [
            { title: L("Live Gulf Route Map", "خريطة مسارات لحظية"), description: L("Real-time corridor monitoring with ETA drift and customs checkpoint status.", "متابعة فورية لمسارات الشحنات وحالة المنافذ الجمركية.") },
            { title: L("Client Tracking Portal", "بوابة تتبع للعملاء"), description: L("Branded Arabic/English tracking links with automated proof-of-delivery PDFs.", "روابط تتبع ثنائية اللغة مع إثبات تسليم إلكتروني فوري.") },
          ],
        },
        {
          slug: "sanad-proptech-portal",
          featured: false,
          categorySlug: "web-platforms",
          serviceSlugs: ["custom-web-platforms", "product-design"],
          techSlugs: ["next-js", "react", "typescript", "postgresql", "tailwind-css"],
          coverKey: "proptech",
          galleryKeys: ["webLogistics"],
          title: L("Sanad Property Operations Portal", "بوابة سند لإدارة العقارات والأصول"),
          summary: L(
            "Multi-tower leasing, automated rent invoicing, and preventive maintenance workflows powering 42,000+ managed residential and commercial units in Dubai.",
            "منصة سحابية لإدارة العقود وتحصيل الإيجارات وأعمال الصيانة الوقائية لأكثر من ٤٢ ألف وحدة سكنية وتجارية في دبي.",
          ),
          clientName: "Sanad Real Estate Tech",
          clientCountry: "AE",
          industry: L("PropTech & Real Estate", "التقنية العقارية"),
          year: 2026,
          duration: L("12 weeks", "١٢ أسبوعًا"),
          challenge: L(
            "Property managers struggled with fragmented lease renewals, slow maintenance ticket assignment, and manual reconciliation across multiple portfolio owners.",
            "واجه مديرو العقارات صعوبة في متابعة تجديد العقود وتوزيع طلبات الصيانة والمطابقة المالية اليدوية لمحافظ متعددة الملاك.",
          ),
          solution: L(
            "We delivered a multi-tenant web portal with automated Ejari-ready lease generation, technician dispatch queues, and owner financial statements in Arabic and English.",
            "طوّرنا بوابة متعددة الجهات تولّد العقود تلقائيًا وتنظّم جدول الفنيين وتصدر تقارير مالية فورية للملاك بالعربية والإنجليزية.",
          ),
          results: L(
            "Maintenance resolution speed improved by **51%** and lease renewal completion rose to **94%** within the first quarter.",
            "تحسّنت سرعة إغلاق طلبات الصيانة بنسبة **51%** وارتفعت نسبة التجديد المبكر للعقود إلى **94%** خلال الربع الأول.",
          ),
          metrics: [
            { value: "42K+", label: L("Managed units", "وحدة مُدارة") },
            { value: "+51%", label: L("Faster maintenance SLA", "سرعة استجابة الصيانة") },
            { value: "94%", label: L("Digital lease renewal", "تجديد إلكتروني للعقود") },
          ],
          features: [
            { title: L("Owner Financial Dashboards", "لوحات مالية للملاك"), description: L("Automated occupancy, yield and expense statements exported in one click.", "تقارير الإشغال والعائد والمصروفات بضغطة زر.") },
            { title: L("Smart Ticket Routing", "توجيه ذكي لطلبات الصيانة"), description: L("Auto-assigns contractors by building zone, SLA priority and trade.", "توزيع تلقائي للفنيين حسب الموقع وأولوية البلاغ.") },
          ],
        },
        {
          slug: "qafila-courier-app",
          featured: true,
          categorySlug: "mobile",
          serviceSlugs: ["mobile-apps", "product-design"],
          techSlugs: ["flutter", "node-js", "postgresql", "redis", "cloudflare"],
          coverKey: "mobileCourier",
          galleryKeys: ["designSystem", "telehealth"],
          title: L("Qafila Instant Courier App", "تطبيق قافلة للتوصيل السريع"),
          summary: L(
            "Dual customer and driver iOS/Android mobile apps delivering sub-30-minute urban courier dispatch with live route animations and KNET / Apple Pay checkout.",
            "تطبيقان متكاملان للعملاء والمندوبين على iOS وAndroid للتوصيل الفوري داخل المدن مع تتبع مباشر على الخريطة ودفع عبر KNET وApple Pay.",
          ),
          clientName: "Qafila Express",
          clientCountry: "KW",
          industry: L("On-Demand Delivery", "التوصيل الفوري"),
          year: 2026,
          duration: L("16 weeks", "١٦ أسبوعًا"),
          challenge: L(
            "Legacy hybrid apps suffered from GPS drift, slow checkout drop-offs, and awkward Arabic RTL transitions during peak evening hours in Kuwait City.",
            "عانت التطبيقات السابقة من عدم دقة الخريطة وبطء خطوة الدفع ومشاكل في الواجهة العربية خلال ساعات الذروة في مدينة الكويت.",
          ),
          solution: L(
            "We rebuilt both apps in Flutter with smooth 60fps map tracking, 4-stage live progress indicators, instant address pinning, and one-tap local payment flows.",
            "أعدنا بناء التطبيقين عبر Flutter بتتبع خرائط سلس بسرعة ٦٠ إطارًا ومؤشر مراحل فوري ودفع محلي بضغطة واحدة.",
          ),
          results: L(
            "Checkout conversion jumped **39%**, average dispatch time dropped to **12 minutes**, and app store ratings climbed to **4.9★** across 60K+ downloads.",
            "ارتفع إتمام الطلبات بنسبة **39%** وانخفض متوسط وقت التخصيص إلى **١٢ دقيقة** بتقييم **4.9★** على المتاجر.",
          ),
          metrics: [
            { value: "12 min", label: L("Avg. courier pickup", "متوسط وصول المندوب") },
            { value: "+39%", label: L("Checkout conversion", "زيادة إتمام الطلب") },
            { value: "4.9★", label: L("App Store rating", "تقييم المتجر") },
          ],
          features: [
            { title: L("4-Stage Live Stepper", "تتبع فوري بأربع مراحل"), description: L("Confirmed → Picked Up → En Route → Delivered updates in real time.", "تحديثات لحظية من تأكيد الطلب وحتى التسليم.") },
            { title: L("One-Tap Local Checkout", "دفع محلي بضغطة واحدة"), description: L("Integrated KNET, Apple Pay and saved corporate wallets.", "تكامل كامل مع KNET وApple Pay والمحافظ المؤسسية.") },
          ],
        },
        {
          slug: "afiya-telehealth-app",
          featured: false,
          categorySlug: "mobile",
          serviceSlugs: ["mobile-apps", "custom-web-platforms"],
          techSlugs: ["flutter", "swift", "kotlin", "node-js", "postgresql"],
          coverKey: "telehealth",
          galleryKeys: ["mobileCourier"],
          title: L("Afiya Telehealth & Diagnostics", "تطبيق عافية للاستشارات الطبية"),
          summary: L(
            "Encrypted video consultations, home lab booking, and digital bilingual prescriptions serving patients and licensed physicians across Egypt and the Gulf.",
            "منصة وتطبيق استشارات طبية مرئية مشفّرة وحجز التحاليل المنزلية والوصفات الرقمية بالعربية والإنجليزية.",
          ),
          clientName: "Afiya Health Network",
          clientCountry: "EG",
          industry: L("Digital Healthcare", "الصحة الرقمية"),
          year: 2025,
          duration: L("15 weeks", "١٥ أسبوعًا"),
          challenge: L(
            "Patients needed reliable video consultations even on variable 4G mobile networks alongside simple prescription history for family accounts.",
            "احتاج المرضى إلى مكالمات فيديو طبية مستقرة حتى على شبكات الجوال المتغيرة مع سجل وصفات واضح للعائلة.",
          ),
          solution: L(
            "We built adaptive-bitrate WebRTC video rooms, instant specialty search, lab sample tracking, and doctor scheduling dashboards.",
            "طوّرنا غرف فيديو متكيّفة مع سرعة الإنترنت وبحثًا فوريًا بالتخصص وتتبّعًا للتحاليل ولوحة مواعيد للأطباء.",
          ),
          results: L(
            "Completed **85,000+ consultations** in the first six months with a **4.9★** patient satisfaction score and **99.2%** call completion rate.",
            "أنجز التطبيق أكثر من **٨٥ ألف استشارة** خلال ستة أشهر بمعدل رضا **4.9★** واستقرار مكالمات **99.2%**.",
          ),
          metrics: [
            { value: "85K+", label: L("Consultations completed", "استشارة مكتملة") },
            { value: "99.2%", label: L("Video call stability", "استقرار المكالمات") },
            { value: "4.9★", label: L("Patient rating", "تقييم المرضى") },
          ],
          features: [
            { title: L("Adaptive HD Consultations", "استشارات مرئية مستقرة"), description: L("Automatic audio fallback and encrypted session records.", "جودة متكيفة تلقائيًا مع حماية كاملة للخصوصية.") },
            { title: L("Digital Prescription Vault", "سجل الوصفات الرقمية"), description: L("Structured Arabic/English prescriptions linked to partner pharmacies.", "وصفات منظمة قابلة للمشاركة المباشرة مع الصيدليات.") },
          ],
        },
        {
          slug: "nibras-ai-copilot",
          featured: true,
          categorySlug: "ai-automation",
          serviceSlugs: ["ai-solutions-automation", "custom-web-platforms"],
          techSlugs: ["python", "fastapi", "next-js", "postgresql", "pytorch"],
          coverKey: "aiCopilot",
          galleryKeys: ["rasedAi", "webLogistics"],
          title: L("Nibras Arabic Enterprise AI Copilot", "نبراس — مساعد المعرفة المؤسسي بالذكاء الاصطناعي"),
          summary: L(
            "Citation-grounded Arabic & English RAG workspace enabling legal, policy, and operations teams in Doha to query 120,000+ internal documents in seconds.",
            "مساعد معرفي مؤسسي ثنائي اللغة يمكّن فرق السياسات والشؤون القانونية في الدوحة من البحث وتحليل أكثر من ١٢٠ ألف وثيقة داخلية مع توثيق المصادر في ثوانٍ.",
          ),
          clientName: "Nibras Advisory Group",
          clientCountry: "QA",
          industry: L("Enterprise AI & Governance", "الذكاء الاصطناعي المؤسسي"),
          year: 2026,
          duration: L("11 weeks", "١١ أسبوعًا"),
          challenge: L(
            "Analysts spent hours manually cross-referencing Arabic regulatory circulars and English policy PDFs with zero audit trail for compliance review.",
            "كان المحللون يقضون ساعات في مراجعة التعاميم العربية والسياسات الإنجليزية يدويًا دون سجل تدقيق يوثّق مصدر كل إجابة.",
          ),
          solution: L(
            "We engineered a private hybrid-search RAG platform with page-level Arabic/English citations, confidence scoring, visual knowledge graphs, and human-in-the-loop sign-off.",
            "بنينا منصة RAG خاصة ببحث هجين دقيق، مع إشارات مرجعية لرقم الصفحة ومؤشر ثقة ورسوم ترابط معرفية ومراجعة بشرية معتمدة.",
          ),
          results: L(
            "Document research time dropped by **74%** while achieving **98%** citation faithfulness on a 500-question bilingual evaluation suite.",
            "انخفض زمن البحث في الوثائق بنسبة **74%** مع دقة توثيق مصادر بلغت **98%** عبر ٥٠٠ حالة اختبار ثنائية اللغة.",
          ),
          metrics: [
            { value: "98%", label: L("Citation accuracy", "دقة توثيق المصادر") },
            { value: "-74%", label: L("Research time saved", "تقليص زمن البحث") },
            { value: "120K+", label: L("Indexed documents", "وثيقة مفهرسة") },
          ],
          features: [
            { title: L("Interactive Knowledge Graph", "خريطة ترابط معرفية"), description: L("Visualizes clause dependencies across policies, contracts and amendments.", "تعرض علاقات البنود بين السياسات والعقود والتعديلات بصريًا.") },
            { title: L("Role-Scoped Retrieval", "استرجاع مقيد بالصلاحيات"), description: L("Every query respects document-level access permissions automatically.", "كل استعلام يحترم صلاحيات كل موظف تلقائيًا.") },
          ],
        },
        {
          slug: "rased-invoice-automation",
          featured: false,
          categorySlug: "ai-automation",
          serviceSlugs: ["ai-solutions-automation", "cloud-devops"],
          techSlugs: ["python", "fastapi", "hugging-face", "postgresql", "docker"],
          coverKey: "rasedAi",
          galleryKeys: ["aiCopilot"],
          title: L("Rased Automated Invoice & ERP Agent", "راصد لأتمتة الفواتير وربط أنظمة ERP"),
          summary: L(
            "ZATCA-compliant bilingual OCR & reconciliation AI pipeline processing 18,000+ monthly supplier invoices directly into SAP and Odoo with human exception review.",
            "منظومة ذكاء اصطناعي متوافقة مع متطلبات الزكاة والضريبة (ZATCA) لقراءة ومطابقة أكثر من ١٨ ألف فاتورة مورد شهريًا وربطها مباشرة بـ SAP وOdoo.",
          ),
          clientName: "Rased Financial Ops",
          clientCountry: "SA",
          industry: L("FinOps & Automation", "الأتمتة المالية"),
          year: 2026,
          duration: L("9 weeks", "٩ أسابيع"),
          challenge: L(
            "Finance teams manually keyed thousands of mixed Arabic/English supplier PDFs and scanned receipts every month, causing VAT posting bottlenecks.",
            "أدخلت الفرق المالية آلاف الفواتير المختلطة بين العربية والإنجليزية يدويًا شهريًا، ما سبّب اختناقات في الإقفال الضريبي.",
          ),
          solution: L(
            "We deployed a structured vision-extraction pipeline with automated PO matching, VAT validation rules, and a fast side-by-side reviewer queue for low-confidence fields.",
            "أطلقنا خط معالجة ذكي يستخرج بنود الفاتورة ويطابقها بأوامر الشراء ويتحقق من ضريبة القيمة المضافة مع شاشة مراجعة سريعة للاستثناءات.",
          ),
          results: L(
            "Achieved **99.4%** straight-through field accuracy and reduced monthly finance closing cycles from **9 days to 2 days**.",
            "حقّق النظام دقة استخراج **99.4%** وقلّص فترة الإقفال المالي الشهري من **٩ أيام إلى يومين فقط**.",
          ),
          metrics: [
            { value: "99.4%", label: L("Extraction accuracy", "دقة الاستخراج") },
            { value: "18K+", label: L("Monthly invoices", "فاتورة شهريًا") },
            { value: "4.5x", label: L("Faster month-end close", "تسريع الإقفال الشهري") },
          ],
          features: [
            { title: L("ZATCA QR & VAT Check", "التحقق الآلي من ZATCA"), description: L("Validates QR hashes, tax IDs and line totals before ERP sync.", "فحص فوري لرموز QR والأرقام الضريبية والمجاميع قبل الترحيل.") },
            { title: L("Confidence Review Queue", "قائمة مراجعة ذكية"), description: L("Only flags anomalies for accountants, automating 92% end-to-end.", "يعرض الحالات الاستثنائية فقط للمحاسب ويؤتمت 92% بالكامل.") },
          ],
        },
        {
          slug: "wafra-fintech-design-system",
          featured: false,
          categorySlug: "product-design",
          serviceSlugs: ["product-design", "mobile-apps"],
          techSlugs: ["figma", "react", "typescript", "tailwind-css", "next-js"],
          coverKey: "designSystem",
          galleryKeys: ["masarUx"],
          title: L("Wafra Digital Banking Design System", "نظام تصميم وفرة للخدمات المصرفية الرقمية"),
          summary: L(
            "A unified bilingual Figma & React/Flutter token architecture powering consumer cards, wealth dashboards, and SME onboarding for a flagship UAE fintech.",
            "نظام تصميم موحّد ثنائي اللغة على Figma وReact وFlutter يقود البطاقات الرقمية ولوحات الثروات وتجربة الشركات الصغيرة لتطبيق مالي رائد في الإمارات.",
          ),
          clientName: "Wafra FinTech",
          clientCountry: "AE",
          industry: L("Digital Banking & FinTech", "التقنية المالية"),
          year: 2026,
          duration: L("8 weeks", "٨ أسابيع"),
          challenge: L(
            "Three separate product squads were shipping inconsistent Arabic/English UI patterns, slowing down releases and hurting brand trust.",
            "كانت ثلاث فرق منتج تطلق واجهات غير متناسقة بالعربية والإنجليزية، ما أبطأ وتيرة الإطلاق وأضعف وحدة الهوية.",
          ),
          solution: L(
            "We crafted a complete multi-theme token system (Navy, Molten, Pearl), 64 accessible RTL-first components, interactive micro-motion specs, and synced Storybook code.",
            "أسّسنا نظام متغيرات متكامل و٦٤ مكونًا متاحًا ومضبوطًا للغتين مع مواصفات حركة تفاعلية ومكتبة مكونات برمجية متزامنة.",
          ),
          results: L(
            "UI delivery velocity doubled (**2.1x faster** feature handoffs) while achieving **100% WCAG AA** contrast compliance across light and dark surfaces.",
            "تضاعفت سرعة تسليم الواجهات (**2.1x أسرع**) مع تحقيق امتثال **100% لمعايير WCAG AA** في جميع الأوضاع.",
          ),
          metrics: [
            { value: "64", label: L("Bilingual components", "مكوّن ثنائي اللغة") },
            { value: "2.1x", label: L("Faster UI shipping", "تسريع تطوير الواجهات") },
            { value: "100%", label: L("WCAG AA contrast", "امتثال التباين البصري") },
          ],
          features: [
            { title: L("Tokenized Multi-Brand Core", "متغيرات قابلة للتخصيص"), description: L("One semantic token layer drives web, iOS and Android effortlessly.", "طبقة متغيرات دلالية واحدة توحّد الويب وiOS وAndroid.") },
            { title: L("Micro-Interaction Kit", "مكتبة تفاعلات دقيقة"), description: L("Documented tactile card states, hover physics and reduced-motion rules.", "حالات تفاعل وحركة موثّقة تراعي تقليل الحركة.") },
          ],
        },
        {
          slug: "masar-procurement-ux",
          featured: false,
          categorySlug: "product-design",
          serviceSlugs: ["product-design", "custom-web-platforms"],
          techSlugs: ["figma", "next-js", "typescript", "tailwind-css"],
          coverKey: "masarUx",
          galleryKeys: ["designSystem"],
          title: L("Masar B2B Procurement Experience", "إعادة تصميم تجربة المشتريات لمنصة مسار"),
          summary: L(
            "End-to-end UX research, rapid bilingual prototyping, and streamlined RFQ approval workflows for an international B2B supply marketplace.",
            "أبحاث مستخدمين ونماذج أولية ثنائية اللغة وإعادة هندسة تجربة طلبات عروض الأسعار والموافقات لمنصة مشتريات دولية للشركات.",
          ),
          clientName: "Masar Supply Ltd",
          clientCountry: "GB",
          industry: L("B2B Marketplace", "أسواق الأعمال B2B"),
          year: 2025,
          duration: L("7 weeks", "٧ أسابيع"),
          challenge: L(
            "Enterprise buyers abandoned multi-vendor RFQ forms halfway due to cluttered 14-field tables and unclear approval steps.",
            "كان المشترون ينسحبون قبل إكمال طلبات عروض الأسعار بسبب الجداول المزدحمة وغموض خطوات الاعتماد.",
          ),
          solution: L(
            "We ran usability sessions with 22 procurement leads, condensed creation into a guided 4-step builder, and introduced instant side-by-side quote comparison.",
            "أجرينا اختبارات استخدام مع ٢٢ مدير مشتريات واختصرنا الإنشاء إلى ٤ خطوات موجّهة مع مقارنة فورية للعروض جنبًا إلى جنب.",
          ),
          results: L(
            "RFQ completion increased by **64%** and onboarding support tickets fell by **48%** immediately after rollout.",
            "ارتفع إكمال طلبات عروض الأسعار بنسبة **64%** وانخفضت تذاكر دعم الاستخدام بنسبة **48%** فور الإطلاق.",
          ),
          metrics: [
            { value: "+64%", label: L("RFQ completion rate", "زيادة إكمال الطلبات") },
            { value: "-48%", label: L("Support tickets", "انخفاض تذاكر الدعم") },
            { value: "4 steps", label: L("Guided buyer flow", "خطوات موجّهة للشراء") },
          ],
          features: [
            { title: L("Side-by-Side Bid Matrix", "مصفوفة مقارنة العروض"), description: L("Highlights best price, lead time and supplier rating at a glance.", "تبرز أفضل سعر ومدة توريد وتقييم مورد بنظرة واحدة.") },
            { title: L("Clickable Bilingual Prototype", "نموذج تفاعلي ثنائي اللغة"), description: L("Tested with real buyers in London and Riyadh before development.", "تم اختباره فعليًا مع مشترين في لندن والرياض قبل البرمجة.") },
          ],
        },
        {
          slug: "diyar-luxury-ecommerce",
          featured: false,
          categorySlug: "ecommerce",
          serviceSlugs: ["ecommerce", "product-design"],
          techSlugs: ["next-js", "typescript", "postgresql", "cloudflare", "tailwind-css"],
          coverKey: "ecommerceLuxury",
          galleryKeys: ["noorCoffee", "designSystem"],
          title: L("Diyar Luxury Home & Decor Storefront", "متجر ديار للأثاث والديكور الفاخر"),
          summary: L(
            "Bespoke headless bilingual storefront for a Saudi architectural furniture house featuring editorial lookbooks, Tamara/Tabby BNPL, and real-time showroom stock sync.",
            "متجر إلكتروني فاخر ثنائي اللغة لدار أثاث معماري في السعودية يجمع بين العرض التحريري والدفع بالتقسيط عبر تمارا وتابي ومزامنة المخزون اللحظية.",
          ),
          clientName: "Diyar Living",
          clientCountry: "SA",
          industry: L("Luxury Retail & Interiors", "الأثاث والديكور الفاخر"),
          year: 2026,
          duration: L("12 weeks", "١٢ أسبوعًا"),
          challenge: L(
            "A bloated legacy theme took 5.2 seconds to load on Saudi 5G mobile devices and couldn't handle custom fabric finishes or multi-warehouse delivery dates.",
            "استغرق القالب القديم أكثر من ٥ ثوانٍ للتحميل على الجوال ولم يدعم تخصيص الأقمشة أو جدولة التوصيل من مستودعات متعددة.",
          ),
          solution: L(
            "We engineered an edge-cached Next.js headless storefront with interactive material swatches, instant bag drawer, Tamara/Tabby/Mada checkout, and ERP warehouse sync.",
            "بنينا متجرًا فائق السرعة عبر Next.js مع اختيار فوري للخامات وسلة انزلاقية سلسة وتكامل تمارا وتابي ومدى ومزامنة مباشرة مع المستودعات.",
          ),
          results: L(
            "Mobile page loads dropped to **0.7s**, average order value grew by **31%**, and online revenue increased **2.4x** year-over-year.",
            "انخفض زمن تحميل الصفحات على الجوال إلى **0.7 ثانية** ونما متوسط قيمة الطلب **31%** مع تضاعف المبيعات **2.4x**.",
          ),
          metrics: [
            { value: "2.4x", label: L("Online revenue growth", "نمو المبيعات الرقمية") },
            { value: "0.7s", label: L("Mobile load speed", "سرعة التحميل على الجوال") },
            { value: "+31%", label: L("Average order value", "زيادة متوسط السلة") },
          ],
          features: [
            { title: L("Interactive Finish Swatches", "اختيار الخامات والمقاسات"), description: L("Live visual & price updates across stone, oak and bouclé finishes.", "تحديث فوري للصور والأسعار عند تغيير الخامة أو المقاس.") },
            { title: L("GCC BNPL & Delivery Slots", "تقسيط وجدولة التوصيل"), description: L("Tamara, Tabby and white-glove installation booking inside checkout.", "خيارات تمارا وتابي وحجز موعد التركيب ضمن خطوة الدفع.") },
          ],
        },
        {
          slug: "noor-coffee-commerce",
          featured: false,
          categorySlug: "ecommerce",
          serviceSlugs: ["ecommerce", "mobile-apps"],
          techSlugs: ["next-js", "node-js", "postgresql", "redis", "tailwind-css"],
          coverKey: "noorCoffee",
          galleryKeys: ["ecommerceLuxury"],
          title: L("Noor Specialty Coffee Subscriptions", "منصة نور لاشتراكات القهوة المختصة"),
          summary: L(
            "Direct-to-consumer specialty coffee storefront and flexible recurring roast subscription platform serving cafés and home brewers across the GCC.",
            "متجر ومنصة اشتراكات مرنة للقهوة المختصة المحمّصة طازجًا للمقاهي ومحبي القهوة في دول الخليج.",
          ),
          clientName: "Noor Roastery",
          clientCountry: "KW",
          industry: L("F&B Subscriptions", "اشتراكات الأغذية والمشروبات"),
          year: 2025,
          duration: L("10 weeks", "١٠ أسابيع"),
          challenge: L(
            "Subscribers couldn't pause shipments, switch grind sizes, or manage multi-address GCC deliveries without messaging customer support.",
            "لم يتمكن المشتركون من إيقاف الشحنات مؤقتًا أو تعديل درجة الطحن أو العناوين دون التواصل اليدوي مع خدمة العملاء.",
          ),
          solution: L(
            "We built a self-serve subscription portal with taste-profile onboarding, instant skip/swap controls, and automated roast-day batch planning for the roastery team.",
            "صمّمنا بوابة اشتراكات ذاتية الخدمة مع اختبار ذائقة القهوة وتحكم فوري بتأجيل أو تبديل المحاصيل وجدولة دفعات التحميص للمحمصة.",
          ),
          results: L(
            "Subscriber 6-month retention climbed **3.2x** while support load dropped **62%** thanks to instant self-serve controls.",
            "ارتفع احتفاظ المشتركين لمدة ٦ أشهر بمقدار **3.2x** وانخفض ضغط خدمة العملاء بنسبة **62%**.",
          ),
          metrics: [
            { value: "3.2x", label: L("Subscription retention", "احتفاظ بالمشتركين") },
            { value: "-62%", label: L("Support inquiries", "انخفاض تذاكر الدعم") },
            { value: "14K+", label: L("Monthly bags shipped", "عبوة مشحونة شهريًا") },
          ],
          features: [
            { title: L("Taste Profile Quiz", "اختبار ذائقة القهوة"), description: L("Matches roast notes and brew method in under 45 seconds.", "يرشّح المحصول ودرجة الطحن المناسبة خلال ٤٥ ثانية.") },
            { title: L("Roastery Batch Planner", "مخطط دفعات التحميص"), description: L("Aggregates upcoming renewal orders into daily roast sheets.", "يجمع طلبات التجديد تلقائيًا في جداول تحميص يومية.") },
          ],
        },
        {
          slug: "sama-cloud-platform",
          featured: false,
          categorySlug: "cloud-devops",
          serviceSlugs: ["cloud-devops", "custom-web-platforms"],
          techSlugs: ["docker", "cloudflare", "github-actions", "postgresql", "redis"],
          coverKey: "cloudDevops",
          galleryKeys: ["buraqCloud"],
          title: L("Sama Cloud Multi-Region Infrastructure", "بنية سماء السحابية متعددة المناطق"),
          summary: L(
            "Zero-downtime container migration, multi-region edge routing across Gulf & Europe, and real-time latency telemetry supporting 99.98% availability.",
            "ترحيل سحابي دون توقف وتوجيه متعدد المناطق بين الخليج وأوروبا مع لوحة مراقبة لحظية تحقق إتاحة بنسبة 99.98%.",
          ),
          clientName: "Sama Digital Holdings",
          clientCountry: "AE",
          industry: L("Cloud Infrastructure", "البنية السحابية"),
          year: 2026,
          duration: L("10 weeks", "١٠ أسابيع"),
          challenge: L(
            "Manual server deployments caused Friday maintenance outages, unpredictable regional latency spikes, and rising unmonitored cloud spend.",
            "تسببت عمليات النشر اليدوية في انقطاعات متكررة وتفاوت زمن الاستجابة وارتفاع غير مراقب في تكاليف السحابة.",
          ),
          solution: L(
            "We automated the entire stack with Docker, GitHub Actions blue-green releases, Cloudflare edge caching/WAF, and unified Prometheus/Grafana latency dashboards.",
            "أتمتنا البنية بالكامل عبر Docker والنشر التدريجي بـ GitHub Actions وحماية Cloudflare مع لوحات مراقبة لحظية موحّدة.",
          ),
          results: L(
            "Delivered **99.98% uptime**, cut Gulf p95 API latency by **57%**, and lowered monthly infrastructure bills by **34%**.",
            "حققت البنية استقرارًا بنسبة **99.98%** وخفضت زمن استجابة الواجهات في الخليج بنسبة **57%** ووفّرت **34%** من فاتورة السحابة.",
          ),
          metrics: [
            { value: "99.98%", label: L("Measured uptime", "نسبة التشغيل الفعلي") },
            { value: "-57%", label: L("Regional p95 latency", "خفض زمن الاستجابة") },
            { value: "-34%", label: L("Cloud spend saved", "وفر في تكلفة السحابة") },
          ],
          features: [
            { title: L("Blue-Green Rollouts", "نشر تدريجي آمن"), description: L("Automated health probes and 15-second rollback on every commit.", "فحوصات سلامة تلقائية وتراجع فوري خلال ١٥ ثانية.") },
            { title: L("Global Edge Telemetry", "مراقبة عالمية للحافة"), description: L("Live visibility across Riyadh, Dubai, Europe and US-East nodes.", "متابعة فورية لأداء العقد في الرياض ودبي وأوروبا.") },
          ],
        },
        {
          slug: "buraq-devops-observability",
          featured: false,
          categorySlug: "cloud-devops",
          serviceSlugs: ["cloud-devops", "ai-solutions-automation"],
          techSlugs: ["docker", "github-actions", "postgresql", "redis", "python"],
          coverKey: "buraqCloud",
          galleryKeys: ["cloudDevops"],
          title: L("Buraq High-Availability FinTech Core", "بنية براق عالية الإتاحة والمراقبة اللحظية"),
          summary: L(
            "Automated disaster recovery, encrypted audit pipelines, and anomaly-detecting observability keeping high-volume payment APIs resilient at 99.99% uptime.",
            "بنية تعافٍ تلقائي ومسارات تدقيق مشفّرة ومراقبة ذكية لاكتشاف الشذوذ تضمن استقرار واجهات الدفع بنسبة 99.99%.",
          ),
          clientName: "Buraq Payments",
          clientCountry: "EG",
          industry: L("Payments & SRE", "المدفوعات وهندسة الاعتمادية"),
          year: 2025,
          duration: L("8 weeks", "٨ أسابيع"),
          challenge: L(
            "Rapid transaction growth exposed database lock contention and lacked automated failover drills required by banking partners.",
            "كشف النمو المتسارع في المعاملات عن اختناقات في قاعدة البيانات وغياب اختبارات التعافي الآلي المطلوبة من البنوك الشريكة.",
          ),
          solution: L(
            "We implemented read-replica routing, automated failover drills, encrypted backups, and real-time SLO burn-rate alerting.",
            "طبّقنا توزيع القراءة على النسخ المتماثلة واختبارات تعافٍ دورية ونسخًا احتياطيًا مشفّرًا وتنبيهات مبكرة لمستوى الخدمة.",
          ),
          results: L(
            "Passed banking partner resilience audits on the first review with **99.99% API uptime** and **< 45s** automated failover recovery.",
            "اجتازت المنصة تدقيق الاعتمادية البنكية من أول مراجعة بنسبة تشغيل **99.99%** وتعافٍ تلقائي خلال أقل من **٤٥ ثانية**.",
          ),
          metrics: [
            { value: "99.99%", label: L("API availability", "إتاحة واجهات الدفع") },
            { value: "<45s", label: L("Automated failover", "زمن التعافي التلقائي") },
            { value: "0", label: L("Release outages", "انقطاعات أثناء النشر") },
          ],
          features: [
            { title: L("Automated DR Drills", "اختبارات تعافٍ مجدولة"), description: L("Monthly verified failover rehearsals with zero customer impact.", "محاكاة شهرية موثّقة للتعافي دون أي أثر على العملاء.") },
            { title: L("SLO Burn-Rate Alerts", "تنبيهات استباقية للأداء"), description: L("Catches latency regressions minutes before error budgets trigger.", "يرصد تراجع الأداء مبكرًا قبل تأثر المستخدمين.") },
          ],
        },
      ];

      const projectIdsBySlug = new Map<string, string>();
      for (let i = 0; i < demoProjects.length; i++) {
        const p = demoProjects[i];
        const categoryId = catBySlug.get(p.categorySlug)?.id ?? null;
        const coverMediaId = mediaMap.get(p.coverKey) ?? null;
        const pid = demoId("20", i);

        await tx
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
            coverMediaId,
            accent: "lava",
            publishedAt: new Date(Date.UTC(p.year, 2, 15 - (i % 10))),
          })
          .onConflictDoUpdate({
            target: projects.slug,
            set: {
              status: "published",
              featured: p.featured,
              categoryId,
              coverMediaId,
              title: p.title,
              summary: p.summary,
              metrics: p.metrics,
              features: p.features,
            },
          });

        const [saved] = await tx.select({ id: projects.id }).from(projects).where(eq(projects.slug, p.slug));
        if (!saved) continue;
        projectIdsBySlug.set(p.slug, saved.id);

        for (const sSlug of p.serviceSlugs) {
          const svc = svcBySlug.get(sSlug);
          if (svc) {
            await tx.insert(projectServices).values({ projectId: saved.id, serviceId: svc.id }).onConflictDoNothing();
          }
        }
        for (const tSlug of p.techSlugs) {
          const techItem = techBySlug.get(tSlug);
          if (techItem) {
            await tx.insert(projectTechnologies).values({ projectId: saved.id, technologyId: techItem.id }).onConflictDoNothing();
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
                caption: L("Product interface view", "لقطة من واجهة المنتج"),
                sortOrder: g,
              })
              .onConflictDoNothing();
          }
        }
      }

      // 5. Insert 9 Verified Freelance Platform Reviews across Upwork, Mostaql, Khamsat, Fiverr, Bahr, Clutch & Direct
      const demoReviews = [
        {
          source: "mostaql" as const,
          sourceUrl: "https://mostaql.com/",
          featured: true,
          authorName: "Eng. Khalid Al-Harbi",
          authorRole: L("Operations Director", "مدير العمليات التشغيلية"),
          company: "Mizan Logistics",
          country: "SA",
          rating: 5.0,
          quoteLocale: "ar",
          projectSlug: "mizan-logistics-os",
          quote: L(
            "Working with CodeLava on Mostaql felt like having an in-house CTO and product team. They delivered our entire bilingual fleet platform ahead of schedule with crystal-clear weekly demos.",
            "تجربتنا مع فريق CodeLava عبر مستقل كانت استثنائية بكل المقاييس؛ التزام تام بالمواعيد، فهم عميق لطبيعة التشغيل اللوجستي في المملكة، وتسليم منصة ثنائية اللغة تتجاوز توقعاتنا.",
          ),
        },
        {
          source: "upwork" as const,
          sourceUrl: "https://www.upwork.com/",
          featured: true,
          authorName: "Daniel Mercer",
          authorRole: L("VP of Engineering", "نائب رئيس الهندسة"),
          company: "Sama Digital Holdings",
          country: "AE",
          rating: 5.0,
          quoteLocale: "en",
          projectSlug: "sama-cloud-platform",
          quote: L(
            "Top 1% engineering discipline on Upwork. CodeLava migrated our multi-region cloud infrastructure with zero downtime, cut Gulf latency in half, and documented every runbook for our team.",
            "من أفضل الفرق الهندسية التي تعاملنا معها على Upwork؛ نفّذوا ترحيل بنيتنا السحابية متعددة المناطق دون ثانية توقف واحدة وخفضوا زمن الاستجابة في الخليج إلى النصف.",
          ),
        },
        {
          source: "mostaql" as const,
          sourceUrl: "https://mostaql.com/",
          featured: true,
          authorName: "Fahad Al-Mutairi",
          authorRole: L("Co-Founder", "الشريك المؤسس"),
          company: "Qafila Express",
          country: "KW",
          rating: 5.0,
          quoteLocale: "ar",
          projectSlug: "qafila-courier-app",
          quote: L(
            "Our Flutter courier app went from concept to 4.9 stars on the App Store. Seamless Arabic RTL polish, rock-solid live map tracking, and smooth KNET integration.",
            "حوّلوا فكرة تطبيق قافلة من مجرد تصور إلى منتج حقيقي بتقييم 4.9 على المتاجر؛ تجربة عربية متقنة وتتبع مباشر على الخريطة وربط سلس مع KNET.",
          ),
        },
        {
          source: "khamsat" as const,
          sourceUrl: "https://khamsat.com/",
          featured: false,
          authorName: "Dr. Salma El-Masry",
          authorRole: L("Medical Product Lead", "مديرة المنتج الطبي"),
          company: "Afiya Health",
          country: "EG",
          rating: 5.0,
          quoteLocale: "ar",
          projectSlug: "afiya-telehealth-app",
          quote: L(
            "Started with a small UX architecture milestone on Khamsat and quickly expanded to the full telehealth app. Fast communication, clean code, and genuine ownership of outcomes.",
            "بدأنا معهم بخدمة تصميم وتخطيط أولي على خمسات، وبسبب احترافيتهم وسرعة استجابتهم وسّعنا التعاون لبناء تطبيق عافية بالكامل بنجاح باهر.",
          ),
        },
        {
          source: "fiverr" as const,
          sourceUrl: "https://www.fiverr.com/",
          featured: false,
          authorName: "Hannah Lindholm",
          authorRole: L("Head of Product", "رئيسة قسم المنتج"),
          company: "Masar Supply Ltd",
          country: "GB",
          rating: 5.0,
          quoteLocale: "en",
          projectSlug: "masar-procurement-ux",
          quote: L(
            "Rare combination of razor-sharp UI craft and real B2B product thinking. Our redesigned bilingual RFQ workflow boosted enterprise buyer completion by 64% in the first month.",
            "مزيج نادر من دقة التصميم البصري والتفكير العميق في منتجات الأعمال؛ إعادة تصميم مسار طلبات الأسعار رفعت إتمام الطلبات بنسبة 64% خلال الشهر الأول.",
          ),
        },
        {
          source: "bahr" as const,
          sourceUrl: "https://bahr.sa/",
          featured: true,
          authorName: "Tariq Al-Qahtani",
          authorRole: L("Finance Transformation Lead", "قائد التحول المالي"),
          company: "Rased Financial Ops",
          country: "SA",
          rating: 5.0,
          quoteLocale: "ar",
          projectSlug: "rased-invoice-automation",
          quote: L(
            "Hired CodeLava via Bahr for our ZATCA invoice AI pipeline. They didn't sell hype—they built measurable benchmarks and cut our monthly close from 9 days to 2.",
            "تعاقدنا مع CodeLava عبر منصة بحر لبناء منظومة أتمتة الفواتير المتوافقة مع ZATCA، وكانت النتيجة مذهلة: دقة 99.4% وتقليص الإقفال الشهري من ٩ أيام إلى يومين.",
          ),
        },
        {
          source: "clutch" as const,
          sourceUrl: "https://clutch.co/",
          featured: true,
          authorName: "Nasser Al-Thani",
          authorRole: L("Managing Partner", "الشريك الإداري"),
          company: "Nibras Advisory",
          country: "QA",
          rating: 4.9,
          quoteLocale: "en",
          projectSlug: "nibras-ai-copilot",
          quote: L(
            "CodeLava built our private Arabic/English AI copilot with strict source citations and security controls. Our legal analysts now answer regulatory questions in seconds instead of hours.",
            "طوّرت CodeLava مساعدنا الذكي الخاص للوثائق العربية والإنجليزية مع توثيق دقيق للمصادر وضوابط أمان صارمة، ما اختصر ساعات البحث إلى ثوانٍ معدودة.",
          ),
        },
        {
          source: "upwork" as const,
          sourceUrl: "https://www.upwork.com/",
          featured: false,
          authorName: "Reem Al-Mansoori",
          authorRole: L("Digital Commerce Director", "مديرة التجارة الرقمية"),
          company: "Diyar Living",
          country: "SA",
          rating: 5.0,
          quoteLocale: "ar",
          projectSlug: "diyar-luxury-ecommerce",
          quote: L(
            "Our headless storefront feels like an international luxury flagship. Page speed dropped under a second on mobile and our online sales more than doubled.",
            "متجرنا الجديد يعكس فخامة العلامة التجارية بسرعة تحميل أقل من ثانية على الجوال، مع تكامل سلس لتمارا وتابي ومضاعفة المبيعات الرقمية.",
          ),
        },
        {
          source: "direct" as const,
          sourceUrl: null,
          featured: false,
          authorName: "Omar Al-Suwaidi",
          authorRole: L("Chief Product Officer", "الرئيس التنفيذي للمنتجات"),
          company: "Wafra FinTech",
          country: "AE",
          rating: 5.0,
          quoteLocale: "en",
          projectSlug: "wafra-fintech-design-system",
          quote: L(
            "The bilingual design system CodeLava engineered unified three product squads overnight. Every Arabic and English token works identically across Figma, React, and Flutter.",
            "وحّد نظام التصميم الذي بنته CodeLava ثلاث فرق منتج في وقت قياسي؛ كل مكوّن يعمل بالتناسق نفسه بالعربية والإنجليزية عبر الويب والجوال.",
          ),
        },
      ];

      for (let i = 0; i < demoReviews.length; i++) {
        const rev = demoReviews[i];
        await tx
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
            reviewDate: new Date(Date.UTC(2026, 1, 20 - i)),
            publishedAt: new Date(Date.UTC(2026, 1, 20 - i)),
          })
          .onConflictDoUpdate({
            target: testimonials.id,
            set: {
              status: "published",
              source: rev.source,
              rating: rev.rating,
              quote: rev.quote,
              projectId: projectIdsBySlug.get(rev.projectSlug) ?? null,
            },
          });
      }

      // 6. Client Logos (6 crisp monochrome vector badges)
      const demoClients = [
        { name: "Mizan Logistics", country: "SA", mark: "hex" as const },
        { name: "Wafra FinTech", country: "AE", mark: "prism" as const },
        { name: "Nibras AI", country: "QA", mark: "ring" as const },
        { name: "Diyar Living", country: "SA", mark: "arc" as const },
        { name: "Qafila Express", country: "KW", mark: "bolt" as const },
        { name: "Sama Cloud", country: "AE", mark: "grid" as const },
      ];

      for (let i = 0; i < demoClients.length; i++) {
        const client = demoClients[i];
        const svgBuf = Buffer.from(buildLogoSvg(client.name, client.mark), "utf8");
        const logoMedia = await storeImageBuffer(tx, svgBuf, {
          id: demoId("40", i),
          originalName: `client-${i + 1}.webp`,
          alt: L(`${client.name} logo`, `شعار ${client.name}`),
          width: 360,
          height: 96,
          fit: "contain",
          transparent: true,
        });
        await tx
          .insert(clientLogos)
          .values({
            id: demoId("41", i),
            name: client.name,
            logoMediaId: logoMedia.id,
            country: client.country,
            visible: true,
            sortOrder: i,
          })
          .onConflictDoNothing();
      }

      // 7. Achievements (4 verified-style metrics)
      const demoStats = [
        { value: "45", suffix: "+", label: L("Products shipped", "منتج رقمي مُسلّم"), description: L("Across web, mobile & applied AI", "عبر الويب والجوال والذكاء الاصطناعي"), icon: "Rocket" },
        { value: "4.9", suffix: "/5", label: L("Platform rating", "متوسط تقييم المنصات"), description: L("Across Upwork, Mostaql, Bahr & Clutch", "عبر Upwork ومستقل وبحر وClutch"), icon: "Trophy" },
        { value: "98", suffix: "%", label: L("On-time delivery", "التزام بالمواعيد"), description: L("Milestone-tracked weekly sprints", "تسليم أسبوعي مضبوط بالمراحل"), icon: "ShieldCheck" },
        { value: "6", suffix: "+", label: L("Active markets", "أسواق نشطة"), description: L("KSA, UAE, Kuwait, Qatar, Egypt & Europe", "السعودية والإمارات والكويت وقطر ومصر وأوروبا"), icon: "Globe" },
      ];

      for (let i = 0; i < demoStats.length; i++) {
        const st = demoStats[i];
        await tx
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
          .onConflictDoNothing();
      }

      // 8. Team Members (4 bilingual profiles)
      const demoTeam = [
        {
          slug: "mohamed-el-sayed",
          name: L("Mohamed El-Sayed", "محمد السيد"),
          role: L("Founder & Principal Architect", "المؤسس ومهندس الأنظمة الرئيسي"),
          bio: L("Leads software architecture, distributed platforms and AI systems across Gulf and international engagements.", "يقود هندسة الأنظمة والمنصات الموزّعة وحلول الذكاء الاصطناعي للمشاريع في الخليج وحول العالم."),
          socials: { github: "https://github.com/C0derM0hamed", linkedin: "https://linkedin.com" },
        },
        {
          slug: "nour-al-rashid",
          name: L("Nour Al-Rashid", "نور الراشد"),
          role: L("Head of Product Design", "رئيسة تصميم المنتجات"),
          bio: L("Crafts bilingual RTL/LTR design systems and high-converting digital product interfaces.", "تصمّم أنظمة التصميم ثنائية اللغة وتجارب المستخدم عالية التحويل للمنتجات الرقمية."),
          socials: { behance: "https://behance.net", dribbble: "https://dribbble.com" },
        },
        {
          slug: "karim-mansour",
          name: L("Karim Mansour", "كريم منصور"),
          role: L("Lead AI & Backend Engineer", "قائد هندسة الذكاء الاصطناعي والأنظمة الخلفية"),
          bio: L("Specializes in Arabic/English RAG pipelines, FastAPI services and enterprise ERP automation.", "متخصص في أنظمة المعرفة الذكية باللغتين وواجهات FastAPI وأتمتة أنظمة ERP."),
          socials: { github: "https://github.com", linkedin: "https://linkedin.com" },
        },
        {
          slug: "youssef-hassan",
          name: L("Youssef Hassan", "يوسف حسن"),
          role: L("Mobile & Cloud Lead", "قائد تطبيقات الجوال والحوسبة السحابية"),
          bio: L("Builds 60fps Flutter mobile apps and zero-downtime cloud infrastructure across regional data centers.", "يطوّر تطبيقات Flutter عالية السلاسة وبنية سحابية مستقرة دون توقف."),
          socials: { github: "https://github.com", upwork: "https://www.upwork.com/" },
        },
      ];

      const teamIds: string[] = [];
      for (let i = 0; i < demoTeam.length; i++) {
        const m = demoTeam[i];
        const tid = demoId("60", i);
        await tx
          .insert(teamMembers)
          .values({
            id: tid,
            slug: m.slug,
            name: m.name,
            role: m.role,
            bio: m.bio,
            socials: m.socials,
            visible: true,
            sortOrder: i,
          })
          .onConflictDoNothing();
        const [found] = await tx.select({ id: teamMembers.id }).from(teamMembers).where(eq(teamMembers.slug, m.slug));
        if (found) teamIds.push(found.id);
      }

      // 9. Blog Articles (3 rich bilingual technical articles)
      const demoArticles = [
        {
          slug: "engineering-true-bilingual-rtl-web-platforms",
          featured: true,
          coverKey: "blogBilingual",
          tags: ["Engineering", "Bilingual UX", "Next.js"],
          readingMinutes: 6,
          title: L(
            "Engineering True Arabic & English Web Platforms Without Layout Drift",
            "هندسة منصات ويب ثنائية اللغة (عربي/إنجليزي) دون أخطاء تخطيط RTL",
          ),
          excerpt: L(
            "How logical CSS properties, paired Latin/Arabic type scales, and bilingual JSONB schemas eliminate costly localization rewrites.",
            "كيف تمنع الخصائص المنطقية في CSS ومقاييس الخطوط المتوازنة وهيكلة البيانات ثنائية اللغة إعادة بناء الواجهة لاحقًا.",
          ),
          body: L(
            "## Start With Logical Geometry\n\nMost bilingual products break because right-to-left support is bolted on after English screens are finalized. Using logical CSS (`margin-inline`, `inset-inline-start`) and directional icon mirroring ensures every component flips naturally.\n\n## Calibrate Arabic Typography\n\nArabic scripts need slightly taller line-height (`1.75–1.85`) and zero letter-spacing so connected glyphs stay crisp across display headlines and dense tables.\n\n## Keep Data Bilingual at the Schema Level\n\nStoring `{ en, ar }` JSONB fields directly in PostgreSQL lets editorial teams preview, draft, and publish both locales atomically.",
            "## ابدأ بالهندسة المنطقية للتخطيط\n\nتتعثر معظم المنتجات ثنائية اللغة لأن دعم الاتجاه من اليمين إلى اليسار يُضاف في اللحظة الأخيرة. الاعتماد على خصائص CSS المنطقية يضمن انعكاس كل مكون بسلاسة طبيعية.\n\n## اضبط مقاييس الخط العربي بعناية\n\nتحتاج النصوص العربية إلى ارتفاع سطر أرحب (`1.75–1.85`) وتباعد أحرف صفري حتى تبقى الكلمات المتصلة واضحة ومريحة للقراءة في العناوين والجداول.\n\n## هيكل البيانات للغتين من البداية\n\nحفظ النصوص كحقول `{ en, ar }` مباشرة في PostgreSQL يمكّن فريق المحتوى من المعاينة والنشر المتزامن للغتين.",
          ),
        },
        {
          slug: "applying-measured-ai-in-gulf-enterprise-workflows",
          featured: false,
          coverKey: "blogAi",
          tags: ["Applied AI", "Automation", "Enterprise"],
          readingMinutes: 5,
          title: L(
            "Applying Measured AI in Enterprise Operations: Beyond Chat Demos",
            "توظيف الذكاء الاصطناعي العملي في عمليات الشركات: ما بعد العروض التجريبية",
          ),
          excerpt: L(
            "Why evaluation benchmarks, source citations, and human-in-the-loop checkpoints turn fragile LLM prototypes into dependable business software.",
            "لماذا تحوّل اختبارات القياس وتوثيق المصادر ونقاط المراجعة البشرية النماذج التجريبية إلى أنظمة أعمال يُعتمد عليها.",
          ),
          body: L(
            "## Start With a Measurable Bottleneck\n\nSuccessful enterprise AI projects target repeatable workflows like invoice reconciliation, Arabic policy retrieval, or quote drafting where baseline speed and accuracy can be measured.\n\n## Ground Every Output in Citations\n\nTeams trust AI when every claim links straight back to the exact policy page or ERP record—and low-confidence items route automatically to a human reviewer.",
            "## ابدأ باختناق تشغيلي قابل للقياس\n\nتنجح مشاريع الذكاء الاصطناعي المؤسسية حين تستهدف مهام متكررة مثل مطابقة الفواتير أو البحث في السياسات العربية حيث يمكن قياس الدقة والوقت بوضوح.\n\n## وثّق كل مخرج بمصدره\n\nتزداد ثقة الفرق عندما يرتبط كل استنتاج برقم الصفحة أو السجل الفعلي، مع تحويل الحالات منخفضة الثقة تلقائيًا إلى مراجع بشري.",
          ),
        },
        {
          slug: "sub-200ms-nextjs-performance-playbook",
          featured: false,
          coverKey: "blogPerf",
          tags: ["Performance", "Cloud", "Architecture"],
          readingMinutes: 4,
          title: L(
            "Our Sub-200ms Next.js Playbook for High-Conversion Regional Products",
            "دليلنا العملي للوصول إلى سرعة أقل من 200ms في تطبيقات Next.js",
          ),
          excerpt: L(
            "Practical caching, AVIF/WebP image pipelines, and off-main-thread WebGL techniques that keep interactive sites feeling instant on mobile.",
            "تقنيات التخزين المؤقت ومعالجة الصور بـ AVIF/WebP وتحسين الرسوم التفاعلية لإبقاء المواقع فورية الاستجابة على الجوال.",
          ),
          body: L(
            "## Paint the Hero Immediately\n\nYour primary headline and hero visual should render from HTML and an eager WebP poster before JavaScript hydrates, keeping LCP consistently under 200ms.\n\n## Optimize Every Media Asset at Upload\n\nGenerating responsive AVIF and WebP variants plus tiny blur placeholders at upload time ensures portfolio galleries stay razor-sharp without bloating mobile bandwidth.",
            "## اعرض المحتوى الأساسي فورًا\n\nيجب أن يظهر العنوان الرئيسي وصورة الهيرو مباشرة من HTML دون انتظار تحميل JavaScript، ما يحافظ على زمن LCP دون ٢٠٠ مللي ثانية.\n\n## عالج الصور تلقائيًا عند الرفع\n\nتوليد نسخ AVIF وWebP متعددة المقاسات عند الرفع يحافظ على نقاء معرض الأعمال دون استهلاك بيانات الجوال.",
          ),
        },
      ];

      for (let i = 0; i < demoArticles.length; i++) {
        const a = demoArticles[i];
        await tx
          .insert(articles)
          .values({
            id: demoId("70", i),
            slug: a.slug,
            status: "published",
            featured: a.featured,
            title: a.title,
            excerpt: a.excerpt,
            body: a.body,
            coverMediaId: mediaMap.get(a.coverKey) ?? null,
            authorId: teamIds[i % Math.max(1, teamIds.length)] ?? null,
            tags: a.tags,
            readingMinutes: a.readingMinutes,
            publishedAt: new Date(Date.UTC(2026, 2, 22 - i * 4)),
          })
          .onConflictDoNothing();
      }

      // 10. Populate demo contact & social settings only if currently blank
      const existingSettings = await tx.select().from(siteSettings);
      const settingsMap = new Map(existingSettings.map((s) => [s.key, s.value as Record<string, unknown>]));
      const currentContact = settingsMap.get("contact") ?? {};
      if (!currentContact.email) {
        await tx
          .insert(siteSettings)
          .values({
            key: "contact",
            value: {
              email: "hello@codelava.dev",
              phone: "+966 50 000 0000",
              whatsapp: "+966500000000",
              address: L("Riyadh · Cairo · Remote Worldwide", "الرياض · القاهرة · نعمل عن بُعد حول العالم"),
              hours: L("Sun – Thu, 9:00 AM – 6:00 PM (AST)", "الأحد – الخميس، ٩:٠٠ ص – ٦:٠٠ م (بتوقيت الرياض)"),
              mapUrl: "",
            },
          })
          .onConflictDoUpdate({
            target: siteSettings.key,
            set: {
              value: {
                email: "hello@codelava.dev",
                phone: "+966 50 000 0000",
                whatsapp: "+966500000000",
                address: L("Riyadh · Cairo · Remote Worldwide", "الرياض · القاهرة · نعمل عن بُعد حول العالم"),
                hours: L("Sun – Thu, 9:00 AM – 6:00 PM (AST)", "الأحد – الخميس، ٩:٠٠ ص – ٦:٠٠ م (بتوقيت الرياض)"),
                mapUrl: "",
              },
            },
          });
      }
      const currentSocials = settingsMap.get("socials") ?? {};
      if (Object.keys(currentSocials).length === 0) {
        await tx
          .insert(siteSettings)
          .values({
            key: "socials",
            value: {
              upwork: "https://www.upwork.com/",
              mostaql: "https://mostaql.com/",
              github: "https://github.com/C0derM0hamed",
              linkedin: "https://www.linkedin.com/",
            },
          })
          .onConflictDoUpdate({
            target: siteSettings.key,
            set: {
              value: {
                upwork: "https://www.upwork.com/",
                mostaql: "https://mostaql.com/",
                github: "https://github.com/C0derM0hamed",
                linkedin: "https://www.linkedin.com/",
              },
            },
          });
      }
    });

    console.log("CodeLava demo portfolio (12 projects across all 6 services), 9 freelance platform reviews, 6 clients, 4 achievements, 4 team members & 3 articles seeded.");
  } finally {
    await sqlClient.end();
  }
}

void seedDemo().catch((error: unknown) => {
  console.error("Demo seed failed", error);
  process.exitCode = 1;
});
