"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { Logo, LogoMark, CodeLavaOgTemplate } from "@/components/brand";
import { FlameCursor } from "@/experience/cursor";
import {
  SmoothScrollProvider,
  Reveal,
  MagneticLink,
  LavaDivider,
  HeatEdge,
  CodeTexture,
  Counter,
  Marquee,
} from "@/experience/fx";
import {
  ActionLink,
  SectionHeading,
  Tag,
  TextInput,
  Textarea,
  Select,
  Checkbox,
  RadioCards,
  FileDropZone,
  Accordion,
  Tabs,
  FilterChips,
  Dialog,
  ToastProvider,
  useToast,
  ArrowUpRightIcon,
} from "@/components/ui";
import {
  SkipLink,
  SiteHeader,
  SiteFooter,
  PageTransition,
  designSystemMessages,
} from "@/components/site";

const OBSIDIAN_SWATCHES = [
  { token: "--obsidian-950", role: "Canvas / --bg" },
  { token: "--obsidian-900", role: "Elevated / --bg-elevated" },
  { token: "--obsidian-850", role: "Surface / --surface" },
  { token: "--obsidian-800", role: "Surface 2" },
  { token: "--obsidian-700", role: "Basalt Ridge" },
  { token: "--obsidian-600", role: "Stone Edge" },
];

const ASH_SWATCHES = [
  { token: "--ash-50", role: "Primary Text" },
  { token: "--ash-200", role: "Soft White" },
  { token: "--ash-400", role: "Muted Copy" },
  { token: "--ash-500", role: "Meta / Faint" },
  { token: "--ash-600", role: "Ash Smoke" },
];

const MAGMA_SWATCHES = [
  { token: "--ember", role: "Spark Core" },
  { token: "--lava-100", role: "White Heat" },
  { token: "--lava-300", role: "Focus / Rim" },
  { token: "--lava-400", role: "Hot Accent" },
  { token: "--lava-500", role: "Primary Lava" },
  { token: "--lava-600", role: "Molten Deep" },
  { token: "--lava-700", role: "Cooling Vein" },
  { token: "--lava-900", role: "Subsurface Glow" },
];

const SYNTAX_SWATCHES = [
  { token: "--syntax-cyan", role: "Functions" },
  { token: "--syntax-blue", role: "Keywords" },
  { token: "--syntax-green", role: "Strings / Success" },
  { token: "--syntax-yellow", role: "Literals" },
  { token: "--danger", role: "Error State" },
];

const LAB_COPY = {
  en: {
    eyebrow: "Design System · Obsidian & Magma",
    heroLine1: "Volcanic craft,",
    heroLine2: "engineered in code.",
    heroLead:
      "Living token, motion, cursor, and shell specification for CodeLava. Calm basalt restraint on the surface; calibrated magma light beneath.",
    switchLabel: "Switch to Arabic (RTL)",
    cursorStageTitle: "Flame Cursor Interactive Stage",
    cursorStageHint:
      "Sweep across these surfaces with a fine pointer to verify arrow responsiveness, ember velocity scaling, interactive flare, View/عرض label, and native I-beam preservation.",
    viewCardTitle: "Editorial Case Frame",
    viewCardDesc: 'Hover triggers [data-cursor="view"] badge and warm ember flare.',
    inspectCardTitle: "Custom Label Target",
    inspectCardDesc: 'Uses [data-cursor-label="Inspect"] with magnetic response.',
    nativeInputLabel: "Native Text Input Test",
    nativeInputPlaceholder: "Hover or click here — native I-beam stays intact…",
    sections: {
      brand: {
        index: "01",
        kicker: "Identity",
        title: "Brand Mark, Wordmark & Iconography",
        lead: "Hand-built inline SVG emblem referencing only CSS design tokens, paired with geometric Outfit typography and generated sharp PNG app icons.",
      },
      palette: {
        index: "02",
        kicker: "Color System",
        title: "Obsidian Basalt & Magma Heat",
        lead: "Warm-undertone volcanic blacks carry typography and whitespace; magma behaves as directional light, never flat decoration.",
      },
      type: {
        index: "03",
        kicker: "Fluid Typography",
        title: "Bilingual Editorial Scale",
        lead: "Tight optical tracking for Outfit Latin display; zero letter-spacing and generous optical leading for Readex Pro and IBM Plex Sans Arabic.",
      },
      controls: {
        index: "04",
        kicker: "Interactive Primitives",
        title: "Signature CTAs, Filters, Tabs & Overlays",
        lead: "Underlined molten links lead the visual hierarchy; machined high-contrast primaries serve forms and high-commitment actions.",
      },
      fx: {
        index: "05",
        kicker: "Motion & Atmosphere",
        title: "Reveals, Fissures, Marquee & Counters",
        lead: "Word- and line-masked reveals preserve Arabic cursive joining; dividers and code textures pause automatically offscreen.",
      },
      forms: {
        index: "06",
        kicker: "Form Primitives",
        title: "Quotation & Contact Inputs",
        lead: "Accessible WCAG 2.2 AA inputs, radio-cards, file drop zones, and live validation feedback built for /contact and /quote.",
      },
      faq: {
        index: "07",
        kicker: "Disclosure",
        title: "Editorial Accordion",
        lead: "WAI-ARIA keyboard navigation (ArrowUp, ArrowDown, Home, End) with smooth grid-row expansion and active heat seams.",
      },
      shell: {
        index: "08",
        kicker: "Site Shell",
        title: "Footer & Dynamic Data Discipline",
        lead: "Footer contact and social slots hide gracefully when DB settings are empty. Toggle specimen props below to inspect both states.",
      },
    },
    marqueeItems: [
      "AI Systems Architecture",
      "Bilingual Product Engineering",
      "Distributed Cloud Backends",
      "Real-Time WebGL & Motion",
      "Enterprise Design Systems",
      "Arabic-First UX Precision",
    ],
    faqItems: [
      {
        id: "motion",
        meta: "Accessibility · Motion",
        question: "How does the system handle prefers-reduced-motion and touch devices?",
        answer:
          "Every motion primitive checks the reduced-motion media query. FlameCursor and MagneticLink disable themselves entirely on coarse pointers and reduced motion; Lenis falls back to native scrolling; Reveal and Counter render their settled state immediately.",
      },
      {
        id: "arabic",
        meta: "Typography · RTL",
        question: "Why are Arabic reveals never split by individual character?",
        answer:
          "Splitting Arabic text into per-letter spans breaks cursive joining and contextual glyph forms. Reveal splits strictly by word or explicit line and adds vertical mask padding so ascenders and diacritics never clip.",
      },
      {
        id: "tokens",
        meta: "Architecture · CSS",
        question: "Can other engineering lanes theme or extend primitives without raw hex values?",
        answer:
          "Yes. Every component consumes CSS variables declared in src/app/globals.css, including the inline SVG LogoMark and the FlameCursor canvas renderer (which reads computed root tokens once on mount).",
      },
    ],
  },
  ar: {
    eyebrow: "نظام التصميم · أوبسيديان وصهارة",
    heroLine1: "حرفية بركانية،",
    heroLine2: "مصاغة بالكود.",
    heroLead:
      "الدليل الحي لمتغيرات التصميم والحركة والمؤشر وهيكل الموقع في CodeLava. هدوء البازلت على السطح، وطاقة الصهارة الضوئية تحته.",
    switchLabel: "التبديل إلى الإنجليزية (LTR)",
    cursorStageTitle: "مساحة اختبار مؤشر اللهب التفاعلي",
    cursorStageHint:
      "حرّك المؤشر فوق البطاقات لاختبار سرعة السهم، تدرج الشرر حسب السرعة، توهج الروابط، شارة «عرض»، والحفاظ على مؤشر الكتابة الأصلي داخل الحقول.",
    viewCardTitle: "إطار دراسة حالة تحريري",
    viewCardDesc: 'التمرير يفعّل شارة «عرض» وتوهج الشرر الدافئ تلقائياً.',
    inspectCardTitle: "هدف بشارة مخصصة",
    inspectCardDesc: 'يستخدم سمة التسمية المخصصة مع استجابة مغناطيسية ناعمة.',
    nativeInputLabel: "اختبار حقل إدخال نصي",
    nativeInputPlaceholder: "مرّر أو انقر هنا — يبقى مؤشر النص الأصلي دون تدخل…",
    sections: {
      brand: {
        index: "01",
        kicker: "الهوية البصرية",
        title: "الشعار والعلامة والأيقونات",
        lead: "شعار SVG مرسوم يدوياً يعتمد كلياً على متغيرات التصميم، مع خط Outfit الهندسي وأيقونات تطبيقات مولّدة عبر sharp.",
      },
      palette: {
        index: "02",
        kicker: "منظومة الألوان",
        title: "سواد الأوبسيديان وتدرج الصهارة",
        lead: "درجات الأسود البركاني الدافئ تمنح الطباعة والمساحة البيضاء الصدارة، بينما تعمل الصهارة كإضاءة موجهة لا كزخرفة.",
      },
      type: {
        index: "03",
        kicker: "الطباعة المرنة",
        title: "سلّم الخطوط ثنائي اللغة",
        lead: "تقارب بصري محكم للاتينية عبر Outfit، وتباعد أحرف صفري مع ارتفاع سطور مريح للخطين Readex Pro و IBM Plex Sans Arabic.",
      },
      controls: {
        index: "04",
        kicker: "عناصر التفاعل",
        title: "روابط الصهارة، الفلاتر، التبويبات والنوافذ",
        lead: "روابط نصية بخط سفلي منصهر تتصدر المشهد، مع أزرار أساسية عالية التباين للنماذج والإجراءات الحاسمة.",
      },
      fx: {
        index: "05",
        kicker: "الحركة والأجواء",
        title: "كشف النصوص، الشقوق المنصهرة، الشريط والعدادات",
        lead: "كشف الكلمات والسطور يحافظ على اتصال الحروف العربية بالكامل، وتتوقف التأثيرات تلقائياً خارج نطاق الرؤية.",
      },
      forms: {
        index: "06",
        kicker: "عناصر النماذج",
        title: "حقول طلب عرض السعر والتواصل",
        lead: "حقول متوافقة مع WCAG 2.2 AA، بطاقات اختيار، منطقة رفع ملفات، وتنبيهات تحقق فورية مهيأة لصفحتي التواصل وطلب العرض.",
      },
      faq: {
        index: "07",
        kicker: "الأسئلة الشائعة",
        title: "أكورديون تحريري متكامل",
        lead: "دعم كامل للتنقل بلوحة المفاتيح وفق معايير WAI-ARIA مع توسع سلس وخط حراري نشط.",
      },
      shell: {
        index: "08",
        kicker: "هيكل الموقع",
        title: "التذييل وانضباط البيانات الديناميكية",
        lead: "تختفي خانات التواصل والروابط الاجتماعية تلقائياً إذا كانت فارغة في قاعدة البيانات. بدّل الحالة أدناه للمعاينة.",
      },
    },
    marqueeItems: [
      "هندسة أنظمة الذكاء الاصطناعي",
      "تطوير المنتجات الرقمية ثنائية اللغة",
      "البنية السحابية الموزعة",
      "تجارب الويب التفاعلية و WebGL",
      "أنظمة التصميم للمؤسسات",
      "دقة تجربة المستخدم العربية",
    ],
    faqItems: [
      {
        id: "motion",
        meta: "إمكانية الوصول · الحركة",
        question: "كيف يتعامل النظام مع تفضيل تقليل الحركة وشاشات اللمس؟",
        answer:
          "تتحقق جميع مكونات الحركة من تفضيل تقليل الحركة. يتوقف مؤشر اللهب والروابط المغناطيسية كلياً على أجهزة اللمس أو عند تفعيل تقليل الحركة، ويعود التمرير للوضع الأصلي مع إظهار النصوص والعدادات فوراً.",
      },
      {
        id: "arabic",
        meta: "الطباعة · RTL",
        question: "لماذا لا يتم تقسيم النصوص العربية إلى أحرف منفردة أثناء الحركة؟",
        answer:
          "تقسيم الكلمات العربية إلى عناصر لكل حرف يكسر اتصال الحروف وتشكيلها السياقي. لذلك يعتمد مكون Reveal على تقسيم الكلمات أو السطور الكاملة مع هامش رأسي يحمي الحركات والمدود من القص.",
      },
      {
        id: "tokens",
        meta: "المعمارية · CSS",
        question: "هل تستهلك جميع المكونات متغيرات التصميم دون ألوان ثابتة؟",
        answer:
          "نعم، كل مكون يقرأ متغيرات CSS المعرّفة في globals.css بما في ذلك شعار SVG الداخلي ولوحة رسم شرر المؤشر التي تقرأ المتغيرات مرة واحدة عند التحميل.",
      },
    ],
  },
} as const;

function ShowcaseBody({
  locale,
  onLocaleChange,
}: {
  locale: AppLocale;
  onLocaleChange: (next: AppLocale) => void;
}) {
  const { toast } = useToast();
  const isRtl = locale === "ar";
  const copy = LAB_COPY[locale];

  const [revealReplayKey, setRevealReplayKey] = useState(0);
  const [counterReplayKey, setCounterReplayKey] = useState(0);
  const [activeCategory, setActiveCategory] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [scopeChoice, setScopeChoice] = useState("ai-platform");
  const [showFooterContact, setShowFooterContact] = useState(true);
  const [formEmail, setFormEmail] = useState("");
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const filterOptions = useMemo(
    () =>
      isRtl
        ? [
            { value: "all", label: "الكل", count: 14 },
            { value: "ai", label: "الذكاء الاصطناعي", count: 5 },
            { value: "platforms", label: "المنصات السحابية", count: 6 },
            { value: "mobile", label: "تطبيقات الجوال", count: 3 },
          ]
        : [
            { value: "all", label: "All", count: 14 },
            { value: "ai", label: "AI Systems", count: 5 },
            { value: "platforms", label: "Cloud Platforms", count: 6 },
            { value: "mobile", label: "Mobile", count: 3 },
          ],
    [isRtl],
  );

  const tabItems = useMemo(
    () =>
      isRtl
        ? [
            {
              id: "architecture",
              label: "المعمارية",
              count: 3,
              content: (
                <div className="grid gap-6 border border-line bg-bg-elevated p-6 rounded-[var(--radius-md)] sm:grid-cols-3">
                  <div>
                    <p className="text-kicker text-accent">01</p>
                    <h4 className="mt-2 font-display text-lg text-text">حدود واضحة</h4>
                    <p className="mt-1.5 text-sm text-muted">
                      فصل تام بين طبقة العرض والبيانات وتدفق الأحداث الخارجية.
                    </p>
                  </div>
                  <div>
                    <p className="text-kicker text-accent">02</p>
                    <h4 className="mt-2 font-display text-lg text-text">أداء مدمج</h4>
                    <p className="mt-1.5 text-sm text-muted">
                      لا إعادة تصيير في كل إطار؛ حركات GPU مركبة فقط.
                    </p>
                  </div>
                  <div>
                    <p className="text-kicker text-accent">03</p>
                    <h4 className="mt-2 font-display text-lg text-text">دعم أصلي للعربية</h4>
                    <p className="mt-1.5 text-sm text-muted">
                      خصائص منطقية كاملة وعكس دقيق للرموز الاتجاهية.
                    </p>
                  </div>
                </div>
              ),
            },
            {
              id: "motion",
              label: "مبادئ الحركة",
              count: 2,
              content: (
                <div className="border border-line bg-bg-elevated p-6 rounded-[var(--radius-md)] text-sm text-muted leading-relaxed">
                  حركة هادئة وواثقة مستلهمة من تمدد الصهارة تحت الصخر: منحنى{" "}
                  <code dir="ltr" className="font-mono text-lava-300">
                    --ease-out-expo
                  </code>{" "}
                  للدخول الحاسم، ومنحنى{" "}
                  <code dir="ltr" className="font-mono text-lava-300">
                    --ease-lava
                  </code>{" "}
                  للنبض الحراري البطيء.
                </div>
              ),
            },
            {
              id: "accessibility",
              label: "إمكانية الوصول",
              count: 4,
              content: (
                <div className="border border-line bg-bg-elevated p-6 rounded-[var(--radius-md)] text-sm text-muted leading-relaxed">
                  تباين ألوان متوافق مع WCAG 2.2 AA (نسبة تباين تتجاوز 7:1 للأزرار الأساسية)، مؤشر
                  تركيز واضح، ودعم كامل للوحة المفاتيح في جميع المكونات.
                </div>
              ),
            },
          ]
        : [
            {
              id: "architecture",
              label: "Architecture",
              count: 3,
              content: (
                <div className="grid gap-6 border border-line bg-bg-elevated p-6 rounded-[var(--radius-md)] sm:grid-cols-3">
                  <div>
                    <p className="text-kicker text-accent">01</p>
                    <h4 className="mt-2 font-display text-lg text-text">Token-Pure Surfaces</h4>
                    <p className="mt-1.5 text-sm text-muted">
                      Every border, glow, and SVG gradient derives from globals.css variables.
                    </p>
                  </div>
                  <div>
                    <p className="text-kicker text-accent">02</p>
                    <h4 className="mt-2 font-display text-lg text-text">Zero Frame Churn</h4>
                    <p className="mt-1.5 text-sm text-muted">
                      Cursor and magnetic pull animate imperatively in rAF with pooled memory.
                    </p>
                  </div>
                  <div>
                    <p className="text-kicker text-accent">03</p>
                    <h4 className="mt-2 font-display text-lg text-text">True Bilingual RTL</h4>
                    <p className="mt-1.5 text-sm text-muted">
                      Logical properties throughout, mirrored arrows, and cursive-safe reveals.
                    </p>
                  </div>
                </div>
              ),
            },
            {
              id: "motion",
              label: "Motion Curves",
              count: 2,
              content: (
                <div className="border border-line bg-bg-elevated p-6 rounded-[var(--radius-md)] text-sm text-muted leading-relaxed">
                  Motion evokes thermal mass beneath volcanic stone: decisive{" "}
                  <code className="font-mono text-lava-300">--ease-out-expo</code> entrances and
                  measured <code className="font-mono text-lava-300">--ease-lava</code> surface
                  breaths — never bouncy springs or neon noise.
                </div>
              ),
            },
            {
              id: "accessibility",
              label: "WCAG 2.2 AA",
              count: 4,
              content: (
                <div className="border border-line bg-bg-elevated p-6 rounded-[var(--radius-md)] text-sm text-muted leading-relaxed">
                  Primary lava buttons pair <code className="font-mono text-lava-300">--obsidian-950</code>{" "}
                  ink on <code className="font-mono text-lava-300">--lava-500</code> (&gt;7.3:1
                  AAA contrast). Every overlay traps focus, supports Escape, and pauses Lenis.
                </div>
              ),
            },
          ],
    [isRtl],
  );

  const handleSampleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.includes("@")) {
      setFormError(
        isRtl ? "يرجى إدخال بريد إلكتروني صالح للمعاينة." : "Enter a valid work email to test validation.",
      );
      toast({
        tone: "danger",
        title: isRtl ? "تعذر الإرسال (نموذج اختبار)" : "Validation check failed",
        description: isRtl
          ? "تحقق من حقل البريد الإلكتروني وحاول مجدداً."
          : "Check the highlighted email input and retry.",
      });
      return;
    }

    setFormError(undefined);
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      toast({
        tone: "success",
        title: isRtl ? "تم استلام نموذج الاختبار بنجاح" : "Specimen brief validated",
        description: isRtl
          ? "تعمل جميع عناصر النماذج والتنبيهات بكفاءة في وضع RTL."
          : "Form states, focus rings, and live toast announcements verified.",
      });
    }, 600);
  };

  return (
    <div dir={isRtl ? "rtl" : "ltr"} lang={locale} className="relative min-h-screen bg-bg text-text">
      <SkipLink />
      <FlameCursor />

      {/* Live production SiteHeader (wired to lab locale toggle) */}
      <SiteHeader onLocaleChange={onLocaleChange} />

      <main id="main-content" className="relative pt-[var(--header-h)]">
        {/* ================================================================= */}
        {/* HERO MASTHEAD + FLAME CURSOR INTERACTIVE STAGE                    */}
        {/* ================================================================= */}
        <section className="relative overflow-hidden border-b border-line pb-20 pt-16 sm:pb-28 sm:pt-24">
          <CodeTexture opacity={0.14} />
          <div
            aria-hidden="true"
            className="grain-overlay pointer-events-none absolute inset-0"
          />
          <HeatEdge position="bottom" intensity="medium" />

          <div className="container-lava relative z-10 space-y-12">
            {/* Lab utility bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
              <div className="flex flex-wrap items-center gap-3">
                <Tag tone="lava" dot>
                  {copy.eyebrow}
                </Tag>
                <Tag tone="outline" dir="ltr">
                  {isRtl ? "DIR=RTL · AR" : "DIR=LTR · EN"}
                </Tag>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <ActionLink
                  variant="ghost"
                  size="sm"
                  onClick={() => onLocaleChange(isRtl ? "en" : "ar")}
                >
                  {copy.switchLabel}
                </ActionLink>
              </div>
            </div>

            {/* Asymmetric display hero */}
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <Reveal
                  as="h1"
                  mode="lines"
                  immediate
                  lines={[copy.heroLine1, copy.heroLine2]}
                  className="text-display-xl text-text"
                >
                  {`${copy.heroLine1}\n${copy.heroLine2}`}
                </Reveal>
              </div>

              <div className="space-y-6 lg:col-span-4 lg:pb-3">
                <p className="text-lead">{copy.heroLead}</p>
                <div className="flex flex-wrap items-center gap-5">
                  <ActionLink href="#brand-section" external variant="molten" size="md" magnetic>
                    {isRtl ? "استعرض النظام" : "Explore tokens"}
                  </ActionLink>
                  <ActionLink
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      toast({
                        tone: "lava",
                        title: isRtl ? "مؤشر اللهب نشط" : "FlameCursor active",
                        description: isRtl
                          ? "حرّك المؤشر لرؤية الشرر الفوري في طبقة Canvas."
                          : "Sweep pointer across cards to test velocity sparks & View state.",
                      })
                    }
                  >
                    {isRtl ? "اختبار التنبيه" : "Fire toast"}
                  </ActionLink>
                </div>
              </div>
            </div>

            {/* Flame Cursor interactive verification stage */}
            <div className="space-y-4 pt-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <h2 className="text-kicker text-accent">{copy.cursorStageTitle}</h2>
                <p className="max-w-xl text-xs text-muted">{copy.cursorStageHint}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* [data-cursor="view"] target */}
                <div
                  data-cursor="view"
                  tabIndex={0}
                  className="group relative overflow-hidden rounded-[var(--radius-md)] border border-line bg-bg-elevated/90 p-6 transition-colors duration-300 hover:border-line-lava-strong"
                >
                  <div className="flex items-center justify-between">
                    <span dir="ltr" className="font-mono text-[11px] text-accent">
                      data-cursor=&quot;view&quot;
                    </span>
                    <ArrowUpRightIcon
                      size={16}
                      className="text-muted transition-transform duration-300 group-hover:text-ember group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:group-hover:-translate-x-0.5"
                    />
                  </div>
                  <h3 className="mt-8 font-display text-2xl text-text">{copy.viewCardTitle}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted">{copy.viewCardDesc}</p>
                </div>

                {/* Custom label + magnetic card */}
                <div
                  data-cursor-label={isRtl ? "فحص" : "Inspect"}
                  tabIndex={0}
                  className="group relative overflow-hidden rounded-[var(--radius-md)] border border-line bg-bg-elevated/90 p-6 transition-colors duration-300 hover:border-line-lava-strong"
                >
                  <div className="flex items-center justify-between">
                    <span dir="ltr" className="font-mono text-[11px] text-syntax-cyan">
                      data-cursor-label
                    </span>
                    <Tag tone="lava">{isRtl ? "توهج" : "Flare"}</Tag>
                  </div>
                  <h3 className="mt-8 font-display text-2xl text-text">{copy.inspectCardTitle}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted">{copy.inspectCardDesc}</p>
                </div>

                {/* Native I-beam preservation test */}
                <div className="flex flex-col justify-between rounded-[var(--radius-md)] border border-line bg-bg-elevated/90 p-6">
                  <span dir="ltr" className="font-mono text-[11px] text-faint">
                    native input I-beam
                  </span>
                  <div className="mt-6">
                    <TextInput
                      label={copy.nativeInputLabel}
                      placeholder={copy.nativeInputPlaceholder}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 01 / BRAND MARK, LOCKUPS, ICONS & OG TEMPLATE                     */}
        {/* ================================================================= */}
        <section id="brand-section" className="py-20 sm:py-28">
          <div className="container-lava space-y-14">
            <SectionHeading
              index={copy.sections.brand.index}
              kicker={copy.sections.brand.kicker}
              title={copy.sections.brand.title}
              lead={copy.sections.brand.lead}
              layout="split"
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Stacked animated key-art lockup */}
              <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-[var(--radius-lg)] border border-line bg-bg-elevated p-12 lg:col-span-6">
                <div
                  aria-hidden="true"
                  className="heat-haze-radial pointer-events-none absolute inset-0 opacity-75"
                />
                <div className="relative z-10">
                  <Logo
                    size="xl"
                    layout="stacked"
                    animated
                    tagline="SOFTWARE & AI SOLUTIONS"
                  />
                </div>
                <span className="relative z-10 mt-8 font-mono text-[11px] text-faint">
                  variant=&quot;full&quot; · layout=&quot;stacked&quot; · animated
                </span>
              </div>

              {/* Variants & scale matrix */}
              <div className="flex flex-col justify-between gap-6 rounded-[var(--radius-lg)] border border-line bg-bg-elevated p-8 lg:col-span-6">
                <div className="space-y-5">
                  <span className="text-kicker text-faint">
                    {isRtl ? "تنويعات الشعار" : "Lockup Variants"}
                  </span>
                  <div className="flex flex-wrap items-center justify-between gap-6 border-b border-line pb-5">
                    <Logo size="lg" variant="full" />
                    <span dir="ltr" className="font-mono text-[11px] text-faint">
                      full · lg
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-6 border-b border-line pb-5">
                    <Logo size="lg" variant="wordmark" />
                    <span dir="ltr" className="font-mono text-[11px] text-faint">
                      wordmark · lg
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-end gap-5">
                      <LogoMark size={16} glow={false} />
                      <LogoMark size={24} />
                      <LogoMark size={38} />
                      <LogoMark size={56} animated />
                    </div>
                    <span dir="ltr" className="font-mono text-[11px] text-faint">
                      16 / 24 / 38 / 56px
                    </span>
                  </div>
                </div>

                {/* Generated sharp icon strip */}
                <div className="space-y-3 border-t border-line pt-5">
                  <span className="text-kicker text-faint">
                    {isRtl ? "أيقونات التطبيق المولّدة" : "Generated App Icons (public/brand/icons/)"}
                  </span>
                  <div className="flex flex-wrap items-end gap-4">
                    {[
                      { src: "/brand/icons/favicon.svg", label: "SVG", dim: 44 },
                      { src: "/brand/icons/icon-32.png", label: "32px", dim: 32 },
                      { src: "/brand/icons/apple-touch-icon.png", label: "180px", dim: 48 },
                      { src: "/brand/icons/icon-192.png", label: "192px", dim: 56 },
                      { src: "/brand/icons/icon-512-maskable.png", label: "512 mask", dim: 56 },
                    ].map((ic) => (
                      <div key={ic.label} className="flex flex-col items-center gap-1.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ic.src}
                          alt={`CodeLava ${ic.label} icon`}
                          width={ic.dim}
                          height={ic.dim}
                          className="rounded-[8px] border border-line bg-obsidian-950"
                        />
                        <span dir="ltr" className="font-mono text-[10px] text-faint">
                          {ic.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* OG Image 1200x630 side-by-side EN + AR live previews */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <span className="text-kicker text-muted">
                  {isRtl
                    ? "معاينة قوالب Open Graph ثنائية اللغة (1200×630)"
                    : "Bilingual Open Graph Templates (1200×630)"}
                </span>
                <span dir="ltr" className="font-mono text-[11px] text-faint">
                  src/components/brand/og.tsx
                </span>
              </div>
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {(["en", "ar"] as const).map((ogLocale) => (
                  <div
                    key={ogLocale}
                    className="overflow-x-auto rounded-[var(--radius-lg)] border border-line bg-bg-elevated p-4"
                  >
                    <div
                      dir="ltr"
                      className="mx-auto overflow-hidden rounded-[var(--radius-md)] border border-line"
                      style={{ width: 576, height: 302 }}
                    >
                      <div
                        style={{
                          transform: "scale(0.48)",
                          transformOrigin: "top left",
                          width: 1200,
                          height: 630,
                        }}
                      >
                        <CodeLavaOgTemplate
                          locale={ogLocale}
                          kicker={
                            ogLocale === "ar"
                              ? "01 / هندسة البرمجيات والذكاء الاصطناعي"
                              : "01 / SOFTWARE & AI ENGINEERING"
                          }
                          title={
                            ogLocale === "ar"
                              ? "ابتكار يتدفق برمجياً للمنتجات عالية الأثر."
                              : "Volcanic precision for mission-critical software & AI."
                          }
                          subtitle={
                            ogLocale === "ar"
                              ? "تصميم وهندسة أنظمة سحابية وتطبيقات ذكاء اصطناعي بمعايير عالمية."
                              : "Bespoke platforms, AI pipelines, and high-craft digital products built to endure."
                          }
                          tags={
                            ogLocale === "ar"
                              ? ["هندسة الذكاء الاصطناعي", "أنظمة سحابية", "ثنائي اللغة"]
                              : ["AI Engineering", "Cloud Architecture", "Bilingual UX"]
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <LavaDivider variant="seam" />

        {/* ================================================================= */}
        {/* 02 / PALETTE & TOKENS                                             */}
        {/* ================================================================= */}
        <section className="py-20 sm:py-28">
          <div className="container-lava space-y-12">
            <SectionHeading
              index={copy.sections.palette.index}
              kicker={copy.sections.palette.kicker}
              title={copy.sections.palette.title}
              lead={copy.sections.palette.lead}
              layout="split"
            />

            <div className="space-y-8">
              {[
                { label: isRtl ? "الأوبسيديان (خلفيات وأسطح)" : "Obsidian Scale", items: OBSIDIAN_SWATCHES },
                { label: isRtl ? "الرماد (نصوص ودرجات محايدة)" : "Ash Text Scale", items: ASH_SWATCHES },
                { label: isRtl ? "الصهارة (إضاءة وحرارة العلامة)" : "Magma Heat Ramp", items: MAGMA_SWATCHES },
                { label: isRtl ? "ألوان الكود والحالات (باعتدال)" : "Syntax & Semantic Accents", items: SYNTAX_SWATCHES },
              ].map((group) => (
                <div key={group.label} className="space-y-3">
                  <h3 className="text-kicker text-faint">{group.label}</h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                    {group.items.map((swatch) => (
                      <div
                        key={swatch.token}
                        className="overflow-hidden rounded-[var(--radius-sm)] border border-line bg-bg-elevated"
                      >
                        <div
                          className="h-14 w-full border-b border-line"
                          style={{ backgroundColor: `var(${swatch.token})` }}
                        />
                        <div className="space-y-0.5 p-2.5">
                          <p dir="ltr" className="truncate font-mono text-[11px] text-text">
                            {swatch.token}
                          </p>
                          <p className="truncate text-[11px] text-faint">{swatch.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <LavaDivider variant="crack" />

        {/* ================================================================= */}
        {/* 03 / FLUID TYPOGRAPHY SCALE (EN + AR)                             */}
        {/* ================================================================= */}
        <section className="py-20 sm:py-28">
          <div className="container-lava space-y-12">
            <SectionHeading
              index={copy.sections.type.index}
              kicker={copy.sections.type.kicker}
              title={copy.sections.type.title}
              lead={copy.sections.type.lead}
              layout="split"
            />

            <div className="divide-y divide-line border-y border-line">
              {[
                {
                  token: ".text-display-xl",
                  meta: "clamp(56px → 168px)",
                  en: "Obsidian & Magma",
                  ar: "أوبسيديان وصهارة",
                  cls: "text-display-xl text-text",
                },
                {
                  token: ".text-display-lg",
                  meta: "clamp(40px → 100px)",
                  en: "Built under pressure.",
                  ar: "ابتكار يتدفق برمجياً.",
                  cls: "text-display-lg text-text",
                },
                {
                  token: ".text-display-md",
                  meta: "clamp(30px → 64px)",
                  en: "Engineering systems that scale calmly.",
                  ar: "أنظمة برمجية مصممة للنمو بثبات وهدوء.",
                  cls: "text-display-md text-text",
                },
                {
                  token: ".text-display-sm",
                  meta: "clamp(22px → 38px)",
                  en: "AI pipelines, cloud architecture & bespoke interfaces.",
                  ar: "مسارات ذكاء اصطناعي، معمارية سحابية، وواجهات متقنة.",
                  cls: "text-display-sm text-text",
                },
                {
                  token: ".text-lead",
                  meta: "clamp(17px → 22px)",
                  en: "We partner with ambitious founders and enterprises across the Gulf, Egypt, and global markets to ship durable software.",
                  ar: "نتعاون مع القيادات التقنية والمؤسسات الطموحة في الخليج ومصر والأسواق العالمية لبناء برمجيات متينة وعالية الأثر.",
                  cls: "text-lead max-w-3xl",
                },
                {
                  token: ".text-body / .text-kicker",
                  meta: "Geist · IBM Plex Sans Arabic · JetBrains Mono",
                  en: "Clear hierarchy lets whitespace and typography carry the authority, keeping magma light reserved for critical focal accents.",
                  ar: "التسلسل الطباعي الواضح يمنح المحتوى هيبة وهدوءاً، مع إبقاء إضاءة الصهارة محصورة في نقاط التركيز الجوهرية.",
                  cls: "text-body text-ash-200 max-w-3xl",
                },
              ].map((row) => (
                <div
                  key={row.token}
                  className="grid grid-cols-1 gap-4 py-8 lg:grid-cols-12 lg:items-baseline"
                >
                  <div className="space-y-1 lg:col-span-3">
                    <p dir="ltr" className="font-mono text-xs text-accent">
                      {row.token}
                    </p>
                    <p dir="ltr" className="font-mono text-[11px] text-faint">
                      {row.meta}
                    </p>
                  </div>
                  <div className="lg:col-span-9">
                    <p className={row.cls}>{isRtl ? row.ar : row.en}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <LavaDivider variant="seam" />

        {/* ================================================================= */}
        {/* 04 / SIGNATURE CTAs, TAGS, FILTERS, TABS, DIALOG & TOAST          */}
        {/* ================================================================= */}
        <section className="py-20 sm:py-28">
          <div className="container-lava space-y-14">
            <SectionHeading
              index={copy.sections.controls.index}
              kicker={copy.sections.controls.kicker}
              title={copy.sections.controls.title}
              lead={copy.sections.controls.lead}
              layout="split"
            />

            {/* CTAs & Magnetic */}
            <div className="grid grid-cols-1 gap-8 rounded-[var(--radius-lg)] border border-line bg-bg-elevated p-8 lg:grid-cols-2">
              <div className="space-y-5">
                <span className="text-kicker text-faint">
                  {isRtl ? "روابط الصهارة المميزة (بديل الأزرار التقليدية)" : "Signature Molten CTAs"}
                </span>
                <div className="flex flex-wrap items-center gap-8 pt-1">
                  <ActionLink href="#forms-section" external variant="molten" size="lg" magnetic>
                    {isRtl ? "ابدأ مشروعك" : "Start a project"}
                  </ActionLink>
                  <ActionLink
                    href="#faq-section"
                    external
                    variant="molten"
                    size="md"
                    arrow="up-right"
                  >
                    {isRtl ? "استكشف الأعمال" : "Explore case studies"}
                  </ActionLink>
                  <ActionLink href="#shell-section" external variant="molten" size="sm">
                    {isRtl ? "التفاصيل" : "View spec"}
                  </ActionLink>
                </div>
              </div>

              <div className="space-y-5">
                <span className="text-kicker text-faint">
                  {isRtl ? "أزرار النماذج، الحوارات والتنبيهات" : "Form Actions, Dialog & Toasts"}
                </span>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <ActionLink variant="primary" size="md" arrow="right" onClick={() => setDialogOpen(true)}>
                    {isRtl ? "فتح النافذة الحوارية" : "Open Dialog"}
                  </ActionLink>
                  <ActionLink
                    variant="ghost"
                    size="md"
                    onClick={() =>
                      toast({
                        tone: "lava",
                        title: isRtl ? "تم نسخ الرابط" : "Architecture brief queued",
                        description: isRtl
                          ? "تنبيه تفاعلي بمؤقت يتوقف عند التمرير."
                          : "Hover or focus this toast to pause auto-dismissal.",
                      })
                    }
                  >
                    {isRtl ? "تنبيه صهارة" : "Lava Toast"}
                  </ActionLink>
                  <ActionLink
                    variant="ghost"
                    size="md"
                    onClick={() =>
                      toast({
                        tone: "success",
                        title: isRtl ? "تم الحفظ بنجاح" : "Deployment verified",
                      })
                    }
                  >
                    {isRtl ? "نجاح" : "Success"}
                  </ActionLink>
                  <MagneticLink>
                    <span className="inline-flex h-11 items-center rounded-[var(--radius-sm)] border border-line-lava bg-lava-900/25 px-4 font-mono text-xs text-lava-300">
                      {isRtl ? "سحب مغناطيسي" : "MagneticPull"}
                    </span>
                  </MagneticLink>
                </div>
              </div>
            </div>

            {/* Tags & Portfolio FilterChips */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="space-y-4">
                <span className="text-kicker text-faint">{isRtl ? "الوسوم" : "Tags"}</span>
                <div className="flex flex-wrap items-center gap-2.5">
                  <Tag>Next.js 16</Tag>
                  <Tag tone="lava" dot>
                    {isRtl ? "ذكاء اصطناعي" : "AI Engineering"}
                  </Tag>
                  <Tag tone="outline">{isRtl ? "معمارية سحابية" : "Cloud Native"}</Tag>
                  <Tag tone="syntax-cyan" dot>
                    TypeScript
                  </Tag>
                  <Tag tone="syntax-green" dot>
                    {isRtl ? "متاح للمشاريع" : "Production Ready"}
                  </Tag>
                </div>
              </div>

              <div className="space-y-4">
                <span className="text-kicker text-faint">
                  {isRtl ? "فلاتر معرض الأعمال" : "Portfolio FilterChips"}
                </span>
                <FilterChips
                  options={filterOptions}
                  value={activeCategory}
                  onChange={setActiveCategory}
                  ariaLabel={isRtl ? "تصنيف الأعمال" : "Filter portfolio"}
                />
              </div>
            </div>

            {/* WAI-ARIA Tabs */}
            <Tabs
              items={tabItems}
              ariaLabel={isRtl ? "أقسام نظام التصميم" : "Design system specifications"}
            />
          </div>
        </section>

        <LavaDivider variant="seam" />

        {/* ================================================================= */}
        {/* 05 / FX: REVEAL, MARQUEE, COUNTERS & CODE TEXTURE                 */}
        {/* ================================================================= */}
        <section className="py-20 sm:py-28">
          <div className="container-lava space-y-14">
            <SectionHeading
              index={copy.sections.fx.index}
              kicker={copy.sections.fx.kicker}
              title={copy.sections.fx.title}
              lead={copy.sections.fx.lead}
              layout="split"
              action={
                <ActionLink
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRevealReplayKey((k) => k + 1);
                    setCounterReplayKey((k) => k + 1);
                  }}
                >
                  {isRtl ? "إعادة تشغيل الحركات" : "Replay motion"}
                </ActionLink>
              }
            />

            {/* Reveal specimen */}
            <div className="rounded-[var(--radius-lg)] border border-line bg-bg-elevated p-8">
              <span className="text-kicker text-faint">
                {isRtl ? "كشف الكلمات المتوافق مع العربية" : "Bilingual Word-Split Reveal"}
              </span>
              <Reveal
                key={`rev-${locale}-${revealReplayKey}`}
                mode="words"
                immediate
                className="mt-4 text-display-md text-text"
              >
                {isRtl
                  ? "نصمم ونبني منصات رقمية عالية الاعتمادية تتحدث العربية والإنجليزية بطلاقة أصلية."
                  : "We architect resilient software and AI platforms engineered for speed, clarity, and scale."}
              </Reveal>
            </div>

            {/* Counter specimens (explicitly labeled as lab specimens, not company claims) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                {
                  val: 99.98,
                  dec: 2,
                  suffix: "%",
                  localeDigits: false,
                  label: isRtl ? "نموذج عداد · نسبة عشري" : "Specimen · Decimal roll-up",
                },
                {
                  val: 42,
                  dec: 0,
                  suffix: " ms",
                  localeDigits: false,
                  label: isRtl ? "نموذج عداد · أرقام قياسية" : "Specimen · Standard numerals",
                },
                {
                  val: 128,
                  dec: 0,
                  prefix: "+",
                  localeDigits: isRtl,
                  label: isRtl ? "نموذج عداد · أرقام عربية مشرقية" : "Specimen · Optional locale digits",
                },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-[var(--radius-md)] border border-line bg-bg-elevated p-6"
                >
                  <Counter
                    key={`cnt-${locale}-${counterReplayKey}-${metric.label}`}
                    value={metric.val}
                    decimals={metric.dec}
                    prefix={metric.prefix}
                    suffix={metric.suffix}
                    locale={locale}
                    useLocaleDigits={metric.localeDigits}
                    className="font-display text-4xl font-medium text-text sm:text-5xl"
                  />
                  <p className="mt-3 text-xs text-muted">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Full-bleed RTL-aware Marquee */}
          <div className="mt-14 border-y border-line bg-bg-elevated/60 py-6">
            <Marquee speed={32}>
              {copy.marqueeItems.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-6 font-display text-2xl font-normal text-ash-200 sm:text-3xl"
                >
                  <span>{item}</span>
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--lava-500)]"
                  />
                </span>
              ))}
            </Marquee>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 06 / FORM PRIMITIVES                                              */}
        {/* ================================================================= */}
        <section id="forms-section" className="py-20 sm:py-28">
          <div className="container-lava space-y-12">
            <SectionHeading
              index={copy.sections.forms.index}
              kicker={copy.sections.forms.kicker}
              title={copy.sections.forms.title}
              lead={copy.sections.forms.lead}
              layout="split"
            />

            <form
              onSubmit={handleSampleSubmit}
              noValidate
              className="grid grid-cols-1 gap-8 rounded-[var(--radius-lg)] border border-line bg-bg-elevated p-6 sm:p-10 lg:grid-cols-12"
            >
              <div className="space-y-6 lg:col-span-7">
                <RadioCards
                  name="project-scope"
                  legend={isRtl ? "نطاق المشروع" : "Engagement track"}
                  required
                  value={scopeChoice}
                  onChange={setScopeChoice}
                  options={
                    isRtl
                      ? [
                          {
                            value: "ai-platform",
                            title: "منصة ذكاء اصطناعي مخصصة",
                            description: "وكلاء ذكيون، بحث دلالي، وتكامل نماذج لغوية آمن.",
                            meta: "RAG · Agents · Eval",
                          },
                          {
                            value: "product-build",
                            title: "هندسة منتج رقمي متكامل",
                            description: "تطبيقات ويب وجوال عالية الأداء وبنية سحابية مرنة.",
                            meta: "Web · Mobile · API",
                          },
                        ]
                      : [
                          {
                            value: "ai-platform",
                            title: "Custom AI Platform",
                            description: "Domain agents, retrieval pipelines, and auditable model orchestration.",
                            meta: "RAG · Agents · Eval",
                          },
                          {
                            value: "product-build",
                            title: "Full-Stack Product Build",
                            description: "High-craft web, mobile, and distributed cloud infrastructure.",
                            meta: "Web · Mobile · API",
                          },
                        ]
                  }
                />

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <TextInput
                    label={isRtl ? "الاسم الكامل" : "Full name"}
                    placeholder={isRtl ? "مثال: سارة المنصور" : "e.g. Tariq Al-Harbi"}
                    required
                  />
                  <TextInput
                    type="email"
                    label={isRtl ? "البريد الإلكتروني للعمل" : "Work email"}
                    placeholder="name@company.com"
                    value={formEmail}
                    onChange={(e) => {
                      setFormEmail(e.target.value);
                      if (formError) setFormError(undefined);
                    }}
                    error={formError}
                    required
                  />
                </div>

                <Select
                  label={isRtl ? "الإطار الزمني المستهدف" : "Target timeline"}
                  optionalLabel={isRtl ? "اختياري" : "Optional"}
                  placeholder={isRtl ? "اختر المدة التقريبية" : "Select an indicative horizon"}
                  options={
                    isRtl
                      ? [
                          { value: "q1", label: "خلال 6 – 8 أسابيع" },
                          { value: "q2", label: "ربع سنوي (3 أشهر)" },
                          { value: "ongoing", label: "شراكة هندسية مستمرة" },
                        ]
                      : [
                          { value: "q1", label: "6 – 8 weeks sprint" },
                          { value: "q2", label: "Quarterly roadmap (3 months)" },
                          { value: "ongoing", label: "Dedicated engineering partner" },
                        ]
                  }
                />

                <Textarea
                  label={isRtl ? "ملخص المتطلبات" : "Project brief"}
                  placeholder={
                    isRtl
                      ? "شاركنا الأهداف، التكاملات القائمة، أو أي قيود أمنية..."
                      : "Outline architecture goals, integrations, or compliance needs…"
                  }
                  hint={
                    isRtl
                      ? "تُعامل جميع المرفقات والتفاصيل بسرية تامة."
                      : "All specifications and uploaded files remain strictly private."
                  }
                />
              </div>

              <div className="flex flex-col justify-between gap-6 lg:col-span-5">
                <FileDropZone
                  label={isRtl ? "المرفقات الفنية (RFP / التصاميم)" : "Technical attachments"}
                  optionalLabel={isRtl ? "اختياري" : "Optional"}
                  dropTitle={
                    isRtl ? "اسحب الملفات هنا أو اضغط للاختيار" : "Drop files here or click to browse"
                  }
                  dropHint={
                    isRtl
                      ? "ملفات PDF أو صور أو مستندات بحد أقصى 10 ميجابايت"
                      : "PDF, PNG, or specs · up to 10 MB each"
                  }
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.docx"
                />

                <div className="space-y-5 border-t border-line pt-6">
                  <Checkbox
                    label={
                      isRtl
                        ? "أوافق على معالجة بيانات هذا النموذج للرد على طلبي."
                        : "I consent to processing this inquiry strictly to prepare a response."
                    }
                    description={
                      isRtl
                        ? "لا يتم مشاركة بياناتك مع أي طرف ثالث."
                        : "Zero third-party tracking or unsolicited sequences."
                    }
                  />

                  <div className="flex flex-wrap items-center gap-4">
                    <ActionLink type="submit" variant="primary" size="md" arrow="right" loading={submitting}>
                      {isRtl ? "اختبار إرسال النموذج" : "Validate Specimen Form"}
                    </ActionLink>
                    <ActionLink
                      type="button"
                      variant="ghost"
                      size="md"
                      onClick={() => {
                        setFormEmail("");
                        setFormError(undefined);
                      }}
                    >
                      {isRtl ? "إعادة ضبط" : "Reset"}
                    </ActionLink>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </section>

        <LavaDivider variant="seam" />

        {/* ================================================================= */}
        {/* 07 / EDITORIAL ACCORDION                                          */}
        {/* ================================================================= */}
        <section id="faq-section" className="py-20 sm:py-28">
          <div className="container-lava space-y-12">
            <SectionHeading
              index={copy.sections.faq.index}
              kicker={copy.sections.faq.kicker}
              title={copy.sections.faq.title}
              lead={copy.sections.faq.lead}
              layout="split"
            />
            <Accordion items={[...copy.faqItems]} defaultOpenIds={["motion"]} />
          </div>
        </section>

        <LavaDivider variant="seam" />

        {/* ================================================================= */}
        {/* 08 / FOOTER & DYNAMIC DATA CONTROL                                */}
        {/* ================================================================= */}
        <section id="shell-section" className="pt-20">
          <div className="container-lava pb-8">
            <SectionHeading
              index={copy.sections.shell.index}
              kicker={copy.sections.shell.kicker}
              title={copy.sections.shell.title}
              lead={copy.sections.shell.lead}
              layout="split"
              action={
                <ActionLink
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFooterContact((v) => !v)}
                >
                  {showFooterContact
                    ? isRtl
                      ? "إخفاء بيانات التواصل (حالة فارغة)"
                      : "Preview empty contact state"
                    : isRtl
                      ? "عرض بيانات تواصل تجريبية عبر props"
                      : "Preview populated contact props"}
                </ActionLink>
              }
            />
          </div>

          <SiteFooter
            contact={
              showFooterContact
                ? {
                    email: "specimen@example.invalid",
                    availability: isRtl ? "متاح للتعاقد (نموذج عرض)" : "Accepting briefs (prop specimen)",
                  }
                : null
            }
            socials={
              showFooterContact
                ? [
                    { label: "GitHub", href: "https://github.com" },
                    { label: "LinkedIn", href: "https://linkedin.com" },
                    { label: "X", href: "https://x.com" },
                  ]
                : []
            }
          />
        </section>
      </main>

      {/* Accessible Dialog demo */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={isRtl ? "نافذة حوارية بنمط الأوبسيديان" : "Obsidian Modal Dialog"}
        description={
          isRtl
            ? "تحجز التركيز بلوحة المفاتيح، توقف التمرير السلس Lenis مؤقتاً، وتعيد التركيز عند الإغلاق."
            : "Traps keyboard focus, pauses Lenis smooth scroll while open, and restores trigger focus on close."
        }
        closeLabel={isRtl ? "إغلاق" : "Close"}
        footer={
          <>
            <ActionLink variant="ghost" size="sm" onClick={() => setDialogOpen(false)}>
              {isRtl ? "إلغاء" : "Cancel"}
            </ActionLink>
            <ActionLink
              variant="primary"
              size="sm"
              onClick={() => {
                setDialogOpen(false);
                toast({
                  tone: "success",
                  title: isRtl ? "تم تأكيد الإجراء" : "Dialog action confirmed",
                });
              }}
            >
              {isRtl ? "تأكيد" : "Confirm"}
            </ActionLink>
          </>
        }
      >
        <p>
          {isRtl
            ? "صُممت هذه النافذة لمعاينة المرفقات أو تأكيد الإجراءات الحساسة دون تشويش بصري، مع خط حراري علوي رفيع وعتامة خلفية متوازنة."
            : "Designed for technical previews, architecture checklists, or confirmation flows. Press Escape or Tab through the footer controls to verify full focus containment."}
        </p>
      </Dialog>
    </div>
  );
}

export function DesignShowcaseClient() {
  const searchParams = useSearchParams();
  const initialDir = searchParams.get("dir") === "rtl" ? "rtl" : "ltr";
  const [locale, setLocale] = useState<AppLocale>(initialDir === "rtl" ? "ar" : "en");

  // Keep <html dir lang> synchronized with lab toggle so :root:lang(ar) and RTL scrollbars reflect reality
  useEffect(() => {
    const dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [locale]);

  const handleLocaleChange = useCallback((next: AppLocale) => {
    setLocale(next);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (next === "ar") {
        url.searchParams.set("dir", "rtl");
      } else {
        url.searchParams.delete("dir");
      }
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  return (
    <NextIntlClientProvider locale={locale} messages={designSystemMessages[locale]}>
      <SmoothScrollProvider>
        <ToastProvider closeLabel={designSystemMessages[locale].common.close}>
          <PageTransition>
            <ShowcaseBody locale={locale} onLocaleChange={handleLocaleChange} />
          </PageTransition>
        </ToastProvider>
      </SmoothScrollProvider>
    </NextIntlClientProvider>
  );
}
