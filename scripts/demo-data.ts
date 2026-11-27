import type { Localized, LocalizedList, ServiceFeature, SocialLinks } from "../src/db/schema";

/**
 * Deterministic UUID prefix reserved exclusively for client-preview demo data.
 * Distinct from starter seed (`c0de1a00-...`) and dev fixtures (`d3000000-...`)
 * so public queries display demo content while `clear:demo` removes only demo rows.
 */
export const DEMO_ID_PREFIX = "de000000-0000-4000-8000-";
export const DEMO_SLUG_PREFIX = "demo-";
export const DEMO_MEDIA_FOLDER = "demo";

export const demoId = (ns: string, index: number) =>
  `${DEMO_ID_PREFIX}${ns}${String(index + 1).padStart(10, "0")}`;

export const L = (en: string, ar: string): Localized => ({ en, ar });

/* ----------------------------------------------------- settings backfill */

export const DEMO_CONTACT = {
  email: "hello@codelava.dev",
  phone: "+966 50 482 1940",
  whatsapp: "+966504821940",
  address: L("Riyadh · Cairo · Working with teams worldwide", "الرياض · القاهرة · نعمل مع الفرق حول العالم"),
  hours: L("Sun – Thu, 9:00 AM – 6:00 PM (AST)", "الأحد – الخميس، ٩:٠٠ ص – ٦:٠٠ م (بتوقيت الرياض)"),
  mapUrl: "https://maps.google.com/?q=Riyadh+Saudi+Arabia",
};

export const DEMO_SOCIALS: Record<string, string> = {
  github: "https://github.com/codelava-dev",
  linkedin: "https://www.linkedin.com/company/codelava",
  x: "https://x.com/codelava_dev",
  upwork: "https://www.upwork.com/",
  mostaql: "https://mostaql.com/",
  behance: "https://www.behance.net/",
};

/* ----------------------------------------------------- starter enrichments */

export const DEMO_PROCESS_DURATIONS: Record<string, Localized> = {
  "c0de1a00-0000-4000-8000-020000000001": L("1–2 weeks", "أسبوع إلى أسبوعين"),
  "c0de1a00-0000-4000-8000-020000000002": L("2–3 weeks", "أسبوعان إلى ٣ أسابيع"),
  "c0de1a00-0000-4000-8000-020000000003": L("4–10 weeks", "٤ إلى ١٠ أسابيع"),
  "c0de1a00-0000-4000-8000-020000000004": L("1–2 weeks", "أسبوع إلى أسبوعين"),
};

export const DEMO_TECH_DESCRIPTIONS: Record<string, Localized> = {
  "next-js": L("App Router, server rendering and edge caching for fast bilingual web products.", "تقديم خادمي وتخزين عند الحافة لبناء منصات ويب ثنائية اللغة فائقة السرعة."),
  react: L("Component-driven interfaces with predictable state and smooth interactions.", "واجهات تفاعلية مبنية على مكونات منظمة وسهلة التوسع والصيانة."),
  typescript: L("End-to-end type safety across UI, API contracts and database queries.", "أمان أنواع شامل يربط الواجهات بواجهات البرمجة وقواعد البيانات."),
  "tailwind-css": L("Token-driven styling with logical RTL/LTR geometry and compact CSS bundles.", "تنسيق قائم على المتغيرات مع دعم منطقي أصيل للاتجاهين العربي والإنجليزي."),
  "node-js": L("High-throughput APIs, background workers and real-time webhooks.", "واجهات برمجية عالية الكفاءة ومعالجة خلفية وتكاملات لحظية."),
  python: L("Applied AI pipelines, data orchestration and automated document processing.", "خطوط معالجة للذكاء الاصطناعي التطبيقي وأتمتة الوثائق والبيانات."),
  fastapi: L("Async Python microservices with typed schemas and low-latency inference.", "خدمات خلفية سريعة بلغة Python مع توثيق تلقائي وأداء عالٍ."),
  postgresql: L("Relational reliability, JSONB bilingual fields and full-text indexing.", "اعتمادية علائقية مع حقول JSONB ثنائية اللغة وفهرسة بحث متقدمة."),
  redis: L("Sub-millisecond caching, rate limiting, queues and live session state.", "تخزين مؤقت فائق السرعة وإدارة طوابير ومراقبة الجلسات اللحظية."),
  flutter: L("Single-codebase iOS and Android apps with 60fps animations and RTL polish.", "تطبيقات iOS وAndroid بأداء سلس بسرعة ٦٠ إطارًا وتجربة عربية متقنة."),
  swift: L("Native iOS modules for Apple Pay, biometrics and low-latency hardware access.", "وحدات iOS أصلية لـ Apple Pay والبصمة وتجارب الأداء الفائق."),
  kotlin: L("Modern Android engineering for resilient field apps and background sync.", "تطوير حديث لنظام Android لتطبيقات موثوقة تدعم المزامنة في الخلفية."),
  pytorch: L("Custom model fine-tuning, Arabic NLP embeddings and evaluation harnesses.", "تدريب وضبط النماذج اللغوية وتقييم دقة معالجة اللغة العربية."),
  "hugging-face": L("Open-weights models and private inference hosted within regional clouds.", "نماذج مفتوحة الأوزان واستضافة استدلال خاصة داخل السحابة الإقليمية."),
  docker: L("Reproducible containers from local development to zero-downtime production.", "حاويات متطابقة من بيئة التطوير حتى النشر الإنتاجي دون توقف."),
  cloudflare: L("Global edge CDN, WAF protection and low-latency routing across the Gulf.", "شبكة توصيل عالمية وحماية WAF وتوجيه منخفض الكمون في الخليج."),
  "github-actions": L("Automated testing, security checks and blue-green release pipelines.", "اختبارات تلقائية وفحوصات أمان ومسارات نشر تدريجي موثوقة."),
  figma: L("Tokenized bilingual design systems and interactive prototypes ready for code.", "أنظمة تصميم ثنائية اللغة ونماذج أولية تفاعلية جاهزة للتطوير."),
};

export const DEMO_SERVICE_ENRICHMENTS: Record<
  string,
  {
    coverKey: string;
    deliverables: LocalizedList;
    features: ServiceFeature[];
  }
> = {
  "custom-web-platforms": {
    coverKey: "webLogistics",
    deliverables: {
      en: [
        "Bilingual (EN/AR) responsive web platform & operations console",
        "Role-based access control, audit trails & secure authentication",
        "PostgreSQL relational schema, API contracts & ERP integrations",
        "Automated CI/CD deployment pipeline & observability setup",
        "Complete architecture docs & clean engineering handover",
      ],
      ar: [
        "منصة ويب متجاوبة ثنائية اللغة (عربي/إنجليزي) ولوحة عمليات متكاملة",
        "نظام صلاحيات دقيق وسجل تدقيق ومصادقة محصّنة",
        "مخطط قاعدة بيانات PostgreSQL وعقود API وربط بأنظمة ERP",
        "مسار نشر تلقائي CI/CD ومراقبة لحظية للاستقرار والأداء",
        "توثيق معماري كامل وتسليم منظم لفريقك التقني",
      ],
    },
    features: [
      { title: L("Workflow-First Architecture", "بنية تنسجم مع مسار عملك"), description: L("Every screen mirrors real team roles rather than forcing operations into generic templates.", "نصمّم كل شاشة لتخدم أدوار فريقك الفعلية بدل إجبار العمل على قوالب جاهزة."), icon: "PanelsTopLeft" },
      { title: L("Enterprise Security & RBAC", "أمان مؤسسي وصلاحيات دقيقة"), description: L("Granular permissions, hardened sessions, rate limiting and full audit logs from day one.", "صلاحيات تفصيلية، جلسات آمنة، حماية من الطلبات المتكررة وسجل تدقيق شامل."), icon: "ShieldCheck" },
      { title: L("Native RTL + LTR Parity", "تكافؤ أصيل بين العربية والإنجليزية"), description: L("Logical layouts, localized numerals and calibrated Arabic typography across every table and form.", "تخطيطات منطقية وأرقام منسّقة وطباعة عربية مريحة في كل جدول ونموذج."), icon: "Globe" },
      { title: L("ERP & Payment Connectors", "تكامل سلس مع الأنظمة القائمة"), description: L("Reliable connectors for SAP, Odoo, payment gateways and regional compliance APIs.", "ربط موثوق مع SAP وOdoo وبوابات الدفع والمنصات التنظيمية في المنطقة."), icon: "Workflow" },
    ],
  },
  "mobile-apps": {
    coverKey: "mobileCourier",
    deliverables: {
      en: [
        "Production iOS & Android apps built with Flutter or native Swift/Kotlin",
        "Live maps, push notifications & resilient offline caching",
        "Local checkout integrations (Apple Pay, Mada, KNET, cards)",
        "App Store & Google Play compliance, screenshots & release kit",
        "Crash telemetry, analytics dashboards & post-launch care",
      ],
      ar: [
        "تطبيقان جاهزان للإنتاج لنظامَي iOS وAndroid عبر Flutter أو Native",
        "خرائط لحظية وإشعارات فورية وتخزين محلي عند ضعف الشبكة",
        "تكامل مع بوابات الدفع المحلية (Apple Pay ومدى وKNET والبطاقات)",
        "إعداد النشر ومراجعة متجرَي App Store وGoogle Play بالكامل",
        "رصد الأعطال ولوحات التحليلات ودعم مستمر بعد الإطلاق",
      ],
    },
    features: [
      { title: L("60fps Tactile Experience", "تجربة سلسة بسرعة ٦٠ إطارًا"), description: L("Fluid gestures, crisp RTL transitions and tested performance on real mid-range devices.", "حركات انسيابية وتجربة عربية متقنة مختبرة على الأجهزة الفعلية."), icon: "Smartphone" },
      { title: L("Live Tracking & Field Ops", "تتبّع مباشر وعمليات ميدانية"), description: L("Accurate courier and technician routing engineered for low battery drain.", "تتبع فوري للمندوبين والفنيين بكفاءة عالية لاستهلاك البطارية."), icon: "Compass" },
      { title: L("Regional Checkout Flows", "دفع محلي بضغطة واحدة"), description: L("Frictionless Apple Pay, Mada, STC Pay and corporate wallet checkout.", "تجربة دفع سريعة تدعم مدى وApple Pay والمحافظ المؤسسية."), icon: "Zap" },
      { title: L("Store Release Ownership", "إدارة شاملة لإصدارات المتاجر"), description: L("We handle provisioning, store reviews, phased rollouts and hotfix pipelines.", "نتولى إجراءات الاعتماد والنشر المرحلي والتحديثات السريعة دون تعقيد."), icon: "Rocket" },
    ],
  },
  "ai-solutions-automation": {
    coverKey: "aiCopilot",
    deliverables: {
      en: [
        "Citation-grounded Arabic & English RAG copilot or workflow agent",
        "Representative evaluation suite with measurable accuracy targets",
        "Human-in-the-loop review queues & full decision audit trails",
        "Role-scoped private retrieval connectors for internal documents",
        "Cost-controlled model routing, guardrails & fallback rules",
      ],
      ar: [
        "مساعد معرفي أو وكيل أتمتة باللغتين العربية والإنجليزية مع توثيق المصادر",
        "مجموعة اختبارات قياسية لقياس الدقة والموثوقية قبل النشر",
        "شاشات مراجعة بشرية وسجل تدقيق كامل لكل مخرج",
        "ربط آمن بوثائقك الداخلية مع احترام صلاحيات كل مستخدم",
        "توجيه ذكي للنماذج لضبط التكلفة مع ضوابط أمان وخطط بديلة",
      ],
    },
    features: [
      { title: L("Arabic-First Retrieval", "استرجاع معرفي مضبوط للعربية"), description: L("Hybrid semantic and lexical search tuned for Arabic legal, policy and financial text.", "بحث دلالي ومعجمي هجين مصمّم خصيصًا للوثائق العربية والإنجليزية."), icon: "Sparkles" },
      { title: L("Measured Evaluations", "تقييم رقمي قبل كل تحديث"), description: L("Every prompt and pipeline iteration is benchmarked against real business cases.", "نختبر كل تحسين على حالات عمل حقيقية لضمان ثبات الجودة."), icon: "BarChart3" },
      { title: L("Invoice & ERP Automation", "أتمتة الفواتير وربط ERP"), description: L("Extract structured fields from bilingual PDFs directly into SAP, Odoo or custom ERPs.", "استخراج تلقائي لبنود الفواتير والعقود وترحيلها مباشرة لنظامك المالي."), icon: "Bot" },
      { title: L("Data Residency & Privacy", "خصوصية وسيادة كاملة للبيانات"), description: L("PII redaction, source citations and strict tenant isolation built into the core.", "إخفاء البيانات الحساسة وتوثيق كل إجابة وعزل تام لبيانات شركتك."), icon: "Lock" },
    ],
  },
  "product-design": {
    coverKey: "designSystem",
    deliverables: {
      en: [
        "Discovery workshops, user journey maps & UX friction audit",
        "Clickable bilingual Figma prototypes tested with stakeholders",
        "Tokenized Figma & code design system with light/dark surfaces",
        "WCAG 2.2 AA accessibility & RTL typography specifications",
        "Engineering-ready component specs with all edge states",
      ],
      ar: [
        "ورش اكتشاف ورسم رحلات المستخدم وتدقيق نقاط الاحتكاك",
        "نماذج أولية تفاعلية على Figma بالعربية والإنجليزية للاختبار المبكر",
        "نظام تصميم موحّد بالمتغيرات جاهز للتطبيق البرمجي",
        "مواصفات إتاحة الوصول WCAG 2.2 AA وضبط الخطوط العربية",
        "توثيق كامل لحالات التفاعل والأخطاء والفراغ لتسليم سلس للمطورين",
      ],
    },
    features: [
      { title: L("Bilingual Design Systems", "أنظمة تصميم ثنائية اللغة"), description: L("Mirrored grids, balanced Arabic type scales and shared tokens across web and mobile.", "شبكات متناظرة ومقاييس خطوط عربية متوازنة توحّد الويب والجوال."), icon: "PenTool" },
      { title: L("Clickable Prototypes", "نماذج تفاعلية قبل البرمجة"), description: L("Validate critical flows with real users before investing engineering sprints.", "جرّب المسارات الأهم مع المستخدمين الفعليين قبل كتابة سطر برمجي واحد."), icon: "Layers" },
      { title: L("High-Conversion UX", "تجربة مستخدم ترفع التحويل"), description: L("Streamline onboarding, multi-step quotes and dense operational dashboards.", "تبسيط خطوات التسجيل وطلبات الأسعار ولوحات البيانات المعقدة."), icon: "Palette" },
      { title: L("Disciplined Handover", "تسليم هندسي دقيق"), description: L("Clear hover, focus, empty, loading and RTL rules so builds match design pixel-for-pixel.", "توضيح كل حالة تفاعل وتحميل وفراغ ليخرج التنفيذ مطابقًا للتصميم."), icon: "Boxes" },
    ],
  },
  ecommerce: {
    coverKey: "ecommerceLuxury",
    deliverables: {
      en: [
        "Sub-second headless bilingual storefront with structured SEO",
        "Mada, Apple Pay, Tamara, Tabby & multi-currency checkout",
        "Live warehouse inventory sync & courier waybill automation",
        "Localized campaigns, bundles & abandoned-cart recovery",
        "Core Web Vitals tuning & full analytics instrumentation",
      ],
      ar: [
        "متجر إلكتروني فائق السرعة ثنائي اللغة مهيّأ لمحركات البحث",
        "دفع متكامل عبر مدى وApple Pay وتمارا وتابي وعملات متعددة",
        "مزامنة لحظية للمخزون وإصدار تلقائي لبوالص الشحن",
        "إدارة مرنة للعروض والباقات واستعادة السلات المتروكة",
        "تحسين سرعة التصفح على الجوال وتتبّع دقيق للتحويلات",
      ],
    },
    features: [
      { title: L("Instant Mobile Storefront", "تصفّح فوري على الجوال"), description: L("Edge-cached product pages engineered to keep mobile checkout fast on any network.", "صفحات منتجات سريعة الاستجابة ترفع معدل إتمام الشراء من الجوال."), icon: "ShoppingCart" },
      { title: L("GCC Payments & BNPL", "الدفع بالتقسيط والبوابات الخليجية"), description: L("Direct integrations with Tamara, Tabby, Moyasar, Tap, HyperPay and Stripe.", "ربط مباشر مع تمارا وتابي وميسّر وتاب وHyperPay وStripe."), icon: "Zap" },
      { title: L("Inventory & Fulfillment", "مزامنة المخزون والتوصيل"), description: L("Real-time multi-warehouse stock levels and automated Aramex, SMSA and DHL labels.", "تحديث فوري للمخزون عبر الفروع وأتمتة الشحن مع أرامكس وسمسا وDHL."), icon: "Boxes" },
      { title: L("Editorial Merchandising", "عرض بصري يليق بالعلامة"), description: L("Rich lookbooks, live finish swatches and effortless bilingual catalog management.", "عرض تحريري فاخر للمنتجات مع تحكم مرن لفريقك في المحتوى والعروض."), icon: "Sparkles" },
    ],
  },
  "cloud-devops": {
    coverKey: "cloudDevops",
    deliverables: {
      en: [
        "Containerized cloud architecture (Docker / Terraform / Kubernetes)",
        "Zero-downtime CI/CD pipelines with instant automated rollbacks",
        "Unified observability dashboards, traces & SLO burn alerts",
        "Cloudflare edge caching, WAF rules & secret hardening",
        "Tested backup, failover drills & operational runbooks",
      ],
      ar: [
        "بنية سحابية حديثة بالحاويات والبنية ككود (Docker / Terraform)",
        "مسارات نشر دون توقف مع تراجع تلقائي فوري عند أي خلل",
        "لوحات مراقبة شاملة وتنبيهات مبكرة لمستوى الخدمة والأداء",
        "تحصين الحافة عبر Cloudflare وجدار الحماية WAF وإدارة الأسرار",
        "اختبارات تعافٍ ونسخ احتياطي موثّقة وأدلة تشغيل واضحة",
      ],
    },
    features: [
      { title: L("Zero-Downtime Releases", "إصدارات دون أي انقطاع"), description: L("Blue-green deployments and health checks keep services online during every push.", "نشر تدريجي وفحوصات سلامة تضمن استمرار الخدمة أثناء التحديثات."), icon: "Cloud" },
      { title: L("Actionable Observability", "مراقبة فورية وواضحة"), description: L("Structured logs, latency percentiles and alerts catch issues before customers feel them.", "سجلات منظمة وتنبيهات استباقية ترصد الاختناقات قبل تأثر المستخدمين."), icon: "Server" },
      { title: L("Regional Data Residency", "الامتثال لاستضافة البيانات"), description: L("Clean deployments across Riyadh, Dubai, Bahrain and European cloud regions.", "نشر مرن في مراكز بيانات الرياض ودبي والبحرين وأوروبا."), icon: "Globe" },
      { title: L("Cost & Resilience Tuning", "تحسين التكلفة والاعتمادية"), description: L("Right-sized autoscaling, encrypted daily snapshots and predictable cloud bills.", "توسّع تلقائي متوازن ونسخ احتياطي مشفّر يضبط فاتورة السحابة."), icon: "ShieldCheck" },
    ],
  },
};

/* ----------------------------------------------------- demo collections */

export const DEMO_CATEGORIES = [
  {
    id: demoId("05", 0),
    slug: `${DEMO_SLUG_PREFIX}cloud-devops`,
    name: L("Cloud & DevOps", "الحوسبة السحابية وDevOps"),
    sortOrder: 5,
  },
];

export type DemoProjectSpec = {
  slug: string;
  featured: boolean;
  categorySlug: string;
  serviceSlugs: string[];
  techSlugs: string[];
  coverKey: string;
  galleryKeys: string[];
  accent: string;
  title: Localized;
  summary: Localized;
  clientName: string;
  clientCountry: string;
  industry: Localized;
  year: number;
  duration: Localized;
  liveUrl: string | null;
  appStoreUrl: string | null;
  playStoreUrl: string | null;
  challenge: Localized;
  solution: Localized;
  results: Localized;
  metrics: { value: string; label: Localized }[];
  features: { title: Localized; description: Localized }[];
};

export const DEMO_PROJECTS: DemoProjectSpec[] = [
  {
    slug: `${DEMO_SLUG_PREFIX}mizan-logistics-os`,
    featured: true,
    categorySlug: "web-platforms",
    serviceSlugs: ["custom-web-platforms", "cloud-devops"],
    techSlugs: ["next-js", "typescript", "postgresql", "redis", "docker"],
    coverKey: "webLogistics",
    galleryKeys: ["cloudDevops", "proptech"],
    accent: "lava",
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
    liveUrl: "https://example.com/demo/mizan-logistics",
    appStoreUrl: null,
    playStoreUrl: null,
    challenge: L(
      "## Fragmented Dispatch Operations\n\nDispatchers were juggling four disconnected spreadsheets, WhatsApp driver updates, and manual customs portals—creating costly delays across Riyadh, Jeddah, and Dubai corridors.\n\n- Zero live visibility once trucks departed regional hubs.\n- Manual proof-of-delivery reconciliation delayed invoicing by 5 days.\n\n> \"We needed one operational source of truth that both dispatchers and enterprise shippers could trust.\"",
      "## تشغيل متفرّق دون رؤية لحظية\n\nكان فريق التشغيل يعتمد على جداول متفرقة وتحديثات يدوية عبر واتساب وبوابات تخليص منفصلة، ما تسبّب في تأخيرات مكلفة عبر خطوط الرياض وجدة ودبي.\n\n- غياب الرؤية اللحظية بمجرد مغادرة الشاحنات لمراكز الانطلاق.\n- تأخر إصدار الفواتير ٥ أيام بسبب المطابقة اليدوية لإثبات التسليم.\n\n> \"كنا بحاجة إلى منصة موحّدة يثق بها فريق التشغيل والعملاء على حد سواء.\"",
    ),
    solution: L(
      "## Unified Bilingual Operations OS\n\nWe engineered a real-time operations platform with live GPS corridor telemetry, automated exception alerts, role-based dispatcher and client portals, and direct ERP billing hooks.\n\n```ts\nawait dispatch.trackCorridor({\n  corridor: \"RUH-DXB\",\n  customsAlerts: true,\n  locale: \"ar\",\n});\n```\n\nEvery milestone automatically emits a signed bilingual PDF proof-of-delivery straight to the client portal.",
      "## منصة تشغيل موحّدة ثنائية اللغة\n\nبنينا نظامًا تشغيليًا لحظيًا يجمع تتبّع المسارات عبر GPS والتنبيهات الآلية وبوابات المشغلين والعملاء مع ربط مباشر بنظام الفوترة وERP.\n\n```ts\nawait dispatch.trackCorridor({\n  corridor: \"RUH-DXB\",\n  customsAlerts: true,\n  locale: \"ar\",\n});\n```\n\nعند كل مرحلة تسليم تُصدر المنصة تلقائيًا وثيقة إثبات تسليم ثنائية اللغة في بوابة العميل.",
    ),
    results: L(
      "## Measurable Operational Lift\n\nWithin 90 days of rollout, on-time delivery climbed to **98.4%**, manual dispatch calls dropped by **68%**, and enterprise clients gained real-time visibility from pickup to customs clearance.",
      "## نتائج تشغيلية ملموسة\n\nخلال ٩٠ يومًا من الإطلاق ارتفع الالتزام بمواعيد التسليم إلى **98.4%**، وانخفضت المكالمات التشغيلية اليدوية بنسبة **68%** مع شفافية لحظية للعملاء.",
    ),
    metrics: [
      { value: "98.4%", label: L("On-time delivery", "التزام بالمواعيد") },
      { value: "-68%", label: L("Manual dispatch calls", "انخفاض المتابعة اليدوية") },
      { value: "248", label: L("Connected fleet units", "مركبة متصلة لحظيًا") },
    ],
    features: [
      { title: L("Live Gulf Route Map", "خريطة مسارات لحظية"), description: L("Real-time corridor monitoring with ETA drift and customs checkpoint status.", "متابعة فورية لمسارات الشحنات وحالة المنافذ الجمركية وتوقعات الوصول.") },
      { title: L("Client Tracking Portal", "بوابة تتبع للعملاء"), description: L("Branded Arabic/English tracking links with automated proof-of-delivery PDFs.", "روابط تتبع ثنائية اللغة مع إثبات تسليم إلكتروني فوري.") },
      { title: L("Automated ERP Billing", "ربط تلقائي بالفوترة"), description: L("Completed trips sync verified mileage and customs fees directly into accounting.", "ترحيل تلقائي للرحلات المكتملة ورسوم التخليص إلى النظام المالي.") },
    ],
  },
  {
    slug: `${DEMO_SLUG_PREFIX}nibras-ai-copilot`,
    featured: true,
    categorySlug: "ai-automation",
    serviceSlugs: ["ai-solutions-automation", "custom-web-platforms"],
    techSlugs: ["python", "fastapi", "next-js", "postgresql", "pytorch"],
    coverKey: "aiCopilot",
    galleryKeys: ["rasedAi", "webLogistics"],
    accent: "cyan",
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
    liveUrl: "https://example.com/demo/nibras-ai",
    appStoreUrl: null,
    playStoreUrl: null,
    challenge: L(
      "## Hours Lost in Bilingual Policy Archives\n\nAnalysts spent hours cross-referencing Arabic regulatory circulars and English policy PDFs with zero audit trail for compliance review.\n\n- Generic chat tools hallucinated clause numbers.\n- Strict data residency prohibited sending internal documents to public endpoints.",
      "## ساعات ضائعة في البحث داخل الأرشيف\n\nكان المحللون يقضون ساعات في مراجعة التعاميم العربية والسياسات الإنجليزية يدويًا دون سجل تدقيق يوثّق مصدر كل إجابة.\n\n- الأدوات العامة كانت تختلق أرقام المواد النظامية.\n- متطلبات خصوصية البيانات منعت إرسال الوثائق الداخلية لخدمات عامة.",
    ),
    solution: L(
      "## Hybrid Arabic/English RAG With Page-Level Citations\n\nWe engineered a private hybrid-search retrieval platform combining Arabic morphological matching with dense embeddings, confidence scoring, and human-in-the-loop sign-off.",
      "## منصة استرجاع هجينة بتوثيق دقيق للمصادر\n\nبنينا منصة RAG خاصة ببحث هجين يجمع مطابقة الجذور العربية والمتجهات الدلالية، مع إشارات مرجعية لرقم الصفحة ومؤشر ثقة ومراجعة بشرية معتمدة.",
    ),
    results: L(
      "## Verified Speed and Accuracy\n\nDocument research time dropped by **74%** while achieving **98%** citation faithfulness on a 500-question bilingual evaluation suite.",
      "## سرعة ودقة موثّقة بالأرقام\n\nانخفض زمن البحث في الوثائق بنسبة **74%** مع دقة توثيق مصادر بلغت **98%** عبر ٥٠٠ حالة اختبار ثنائية اللغة.",
    ),
    metrics: [
      { value: "98%", label: L("Citation accuracy", "دقة توثيق المصادر") },
      { value: "-74%", label: L("Research time saved", "تقليص زمن البحث") },
      { value: "120K+", label: L("Indexed documents", "وثيقة مفهرسة") },
    ],
    features: [
      { title: L("Interactive Knowledge Graph", "خريطة ترابط معرفية"), description: L("Visualizes clause dependencies across policies, contracts and amendments.", "تعرض علاقات البنود بين السياسات والعقود والتعديلات بصريًا.") },
      { title: L("Role-Scoped Retrieval", "استرجاع مقيّد بالصلاحيات"), description: L("Every query respects document-level access permissions automatically.", "كل استعلام يحترم صلاحيات كل موظف تلقائيًا دون استثناء.") },
      { title: L("500-Case Eval Harness", "مقياس جودة آلي مستمر"), description: L("Automated regression checks run before every prompt or model update.", "اختبارات تحقق آلية قبل اعتماد أي تحديث في النماذج أو البحث.") },
    ],
  },
  {
    slug: `${DEMO_SLUG_PREFIX}qafila-courier-app`,
    featured: false,
    categorySlug: "mobile",
    serviceSlugs: ["mobile-apps", "product-design"],
    techSlugs: ["flutter", "node-js", "postgresql", "redis", "cloudflare"],
    coverKey: "mobileCourier",
    galleryKeys: ["designSystem", "proptech"],
    accent: "blue",
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
    liveUrl: "https://example.com/demo/qafila",
    appStoreUrl: "https://apps.apple.com/",
    playStoreUrl: "https://play.google.com/",
    challenge: L(
      "## Peak-Hour Drop-Offs and RTL Friction\n\nLegacy hybrid apps suffered from GPS drift, slow checkout drop-offs, and awkward Arabic RTL transitions during peak evening hours in Kuwait City.",
      "## تراجع الأداء في ساعات الذروة\n\nعانت التطبيقات السابقة من عدم دقة الخريطة وبطء خطوة الدفع ومشاكل في الواجهة العربية خلال ساعات الذروة في مدينة الكويت.",
    ),
    solution: L(
      "## 60fps Flutter Rebuild With One-Tap Local Checkout\n\nWe rebuilt both customer and courier apps in Flutter with smooth live map tracking, a 4-stage progress stepper, instant address pinning, and KNET / Apple Pay checkout.",
      "## إعادة بناء عبر Flutter مع دفع محلي فوري\n\nأعدنا بناء تطبيقي العميل والمندوب عبر Flutter بتتبع خرائط سلس بسرعة ٦٠ إطارًا ومؤشر مراحل فوري ودفع محلي بضغطة واحدة.",
    ),
    results: L(
      "## 4.9★ Launch Across 60K+ Downloads\n\nCheckout conversion jumped **39%**, average courier pickup dropped to **12 minutes**, and app store ratings climbed to **4.9★**.",
      "## إطلاق ناجح بتقييم 4.9★\n\nارتفع إتمام الطلبات بنسبة **39%** وانخفض متوسط وصول المندوب إلى **١٢ دقيقة** بتقييم **4.9★** عبر أكثر من ٦٠ ألف تحميل.",
    ),
    metrics: [
      { value: "12 min", label: L("Avg. courier pickup", "متوسط وصول المندوب") },
      { value: "+39%", label: L("Checkout conversion", "زيادة إتمام الطلب") },
      { value: "4.9★", label: L("App Store rating", "تقييم المتجر") },
    ],
    features: [
      { title: L("4-Stage Live Stepper", "تتبّع فوري بأربع مراحل"), description: L("Confirmed, Picked Up, En Route and Delivered milestones updated in real time.", "تحديثات لحظية من تأكيد الطلب وحتى التسليم الفعلي.") },
      { title: L("One-Tap Local Checkout", "دفع محلي بضغطة واحدة"), description: L("Integrated KNET, Apple Pay and saved corporate wallets.", "تكامل كامل مع KNET وApple Pay والمحافظ المؤسسية.") },
    ],
  },
  {
    slug: `${DEMO_SLUG_PREFIX}diyar-luxury-ecommerce`,
    featured: false,
    categorySlug: "ecommerce",
    serviceSlugs: ["ecommerce", "product-design"],
    techSlugs: ["next-js", "typescript", "postgresql", "cloudflare", "tailwind-css"],
    coverKey: "ecommerceLuxury",
    galleryKeys: ["designSystem", "proptech"],
    accent: "green",
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
    liveUrl: "https://example.com/demo/diyar-living",
    appStoreUrl: null,
    playStoreUrl: null,
    challenge: L(
      "## Slow Monolithic Storefront\n\nA heavy legacy theme took 5.2 seconds to load on Saudi 5G mobile devices and couldn't support custom fabric finishes or multi-warehouse delivery scheduling.",
      "## بطء القالب التقليدي وضعف التخصيص\n\nاستغرق القالب القديم أكثر من ٥ ثوانٍ للتحميل على الجوال ولم يدعم تخصيص الأقمشة أو جدولة التوصيل من مستودعات متعددة.",
    ),
    solution: L(
      "## Edge-Cached Next.js Flagship\n\nWe built a fast headless storefront with interactive material swatches, a slide-over bag drawer, Tamara/Tabby/Mada checkout, and real-time showroom ERP sync.",
      "## متجر فائق السرعة بتجربة تحريرية\n\nبنينا متجرًا فائق السرعة عبر Next.js مع اختيار فوري للخامات وسلة انزلاقية سلسة وتكامل تمارا وتابي ومدى ومزامنة مباشرة مع المعارض والمستودعات.",
    ),
    results: L(
      "## Sub-Second Speed, 2.4x Revenue Growth\n\nMobile page loads dropped to **0.7s**, average order value grew by **31%**, and online revenue increased **2.4x** year-over-year.",
      "## تحميل أقل من ثانية ونمو 2.4x\n\nانخفض زمن تحميل الصفحات على الجوال إلى **0.7 ثانية** ونما متوسط قيمة الطلب **31%** مع تضاعف المبيعات **2.4x**.",
    ),
    metrics: [
      { value: "2.4x", label: L("Online revenue growth", "نمو المبيعات الرقمية") },
      { value: "0.7s", label: L("Mobile load speed", "سرعة التحميل على الجوال") },
      { value: "+31%", label: L("Average order value", "زيادة متوسط السلة") },
    ],
    features: [
      { title: L("Interactive Finish Swatches", "اختيار الخامات والمقاسات"), description: L("Live imagery and price updates across stone, oak and bouclé finishes.", "تحديث فوري للصور والأسعار عند تغيير الخامة أو المقاس.") },
      { title: L("GCC BNPL & Delivery Slots", "تقسيط وجدولة التركيب"), description: L("Tamara, Tabby and white-glove installation booking inside checkout.", "خيارات تمارا وتابي وحجز موعد التركيب ضمن خطوة الدفع.") },
    ],
  },
  {
    slug: `${DEMO_SLUG_PREFIX}wafra-design-system`,
    featured: false,
    categorySlug: "product-design",
    serviceSlugs: ["product-design", "mobile-apps"],
    techSlugs: ["figma", "react", "typescript", "tailwind-css", "next-js"],
    coverKey: "designSystem",
    galleryKeys: ["mobileCourier", "ecommerceLuxury"],
    accent: "yellow",
    title: L("Wafra Digital Banking Design System", "نظام تصميم وفرة للخدمات المصرفية الرقمية"),
    summary: L(
      "Unified bilingual Figma, React and Flutter token architecture powering consumer cards, wealth dashboards, and SME onboarding for a flagship UAE fintech.",
      "نظام تصميم موحّد ثنائي اللغة على Figma وReact وFlutter يقود البطاقات الرقمية ولوحات الثروات وتجربة الشركات الصغيرة لتطبيق مالي رائد في الإمارات.",
    ),
    clientName: "Wafra FinTech",
    clientCountry: "AE",
    industry: L("Digital Banking & FinTech", "التقنية المالية"),
    year: 2026,
    duration: L("8 weeks", "٨ أسابيع"),
    liveUrl: "https://example.com/demo/wafra-design-system",
    appStoreUrl: null,
    playStoreUrl: null,
    challenge: L(
      "## Inconsistent UI Across Three Product Squads\n\nThree independent teams were shipping divergent Arabic and English components, slowing down handoffs and fragmenting customer trust.",
      "## تفاوت الواجهات بين فرق المنتج\n\nكانت ثلاث فرق مستقلة تطلق أنماط واجهة غير متناسقة بالعربية والإنجليزية، ما أبطأ وتيرة التسليم وأضعف وحدة الهوية.",
    ),
    solution: L(
      "## Tokenized Multi-Surface Core\n\nWe crafted a semantic token layer, 64 accessible RTL-first components, interactive motion specs, and synced Storybook documentation for web and mobile.",
      "## مكتبة مكونات ومتغيرات موحّدة\n\nأسّسنا طبقة متغيرات دلالية و٦٤ مكوّنًا متاحًا ومضبوطًا للغتين مع مواصفات حركة تفاعلية وتوثيق برمجي متزامن للويب والجوال.",
    ),
    results: L(
      "## 2.1x Faster Feature Delivery\n\nUI delivery velocity doubled while achieving **100% WCAG AA** contrast compliance across light and dark surfaces.",
      "## مضاعفة سرعة تسليم الواجهات\n\nتضاعفت سرعة إطلاق الميزات (**2.1x أسرع**) مع تحقيق امتثال **100% لمعايير WCAG AA** في جميع الأوضاع.",
    ),
    metrics: [
      { value: "64", label: L("Bilingual components", "مكوّن ثنائي اللغة") },
      { value: "2.1x", label: L("Faster UI shipping", "تسريع تطوير الواجهات") },
      { value: "100%", label: L("WCAG AA contrast", "امتثال التباين البصري") },
    ],
    features: [
      { title: L("Shared Semantic Tokens", "متغيرات موحّدة عبر المنصات"), description: L("One token source drives Figma, React web and Flutter mobile effortlessly.", "مصدر متغيرات واحد يغذّي Figma وReact وFlutter دون تكرار.") },
      { title: L("Accessible Motion Spec", "تفاعلات تحترم تقليل الحركة"), description: L("Documented tactile card physics with built-in reduced-motion fallbacks.", "مواصفات حركة واضحة تراعي تفضيلات تقليل الحركة وإتاحة الوصول.") },
    ],
  },
  {
    slug: `${DEMO_SLUG_PREFIX}sama-cloud-platform`,
    featured: false,
    categorySlug: `${DEMO_SLUG_PREFIX}cloud-devops`,
    serviceSlugs: ["cloud-devops", "custom-web-platforms"],
    techSlugs: ["docker", "cloudflare", "github-actions", "postgresql", "redis"],
    coverKey: "cloudDevops",
    galleryKeys: ["webLogistics", "rasedAi"],
    accent: "blue",
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
    liveUrl: "https://example.com/demo/sama-cloud",
    appStoreUrl: null,
    playStoreUrl: null,
    challenge: L(
      "## Fragile Releases and Unpredictable Latency\n\nManual server deployments caused maintenance outages, regional latency spikes, and rising unmonitored cloud spend.",
      "## نشر يدوي وتفاوت في زمن الاستجابة\n\nتسببت عمليات النشر اليدوية في انقطاعات متكررة وتفاوت زمن الاستجابة وارتفاع غير مراقب في فاتورة السحابة.",
    ),
    solution: L(
      "## Blue-Green Automation & Edge Telemetry\n\nWe containerized the stack with Docker, automated blue-green releases via GitHub Actions, added Cloudflare WAF caching, and built unified SLO dashboards.",
      "## أتمتة النشر ومراقبة الحافة\n\nحوّلنا البنية إلى حاويات Docker مع نشر تدريجي عبر GitHub Actions وحماية Cloudflare ولوحات مراقبة لحظية موحّدة.",
    ),
    results: L(
      "## 99.98% Uptime at 34% Lower Cloud Cost\n\nDelivered **99.98% uptime**, cut Gulf p95 API latency by **57%**, and lowered monthly cloud bills by **34%**.",
      "## استقرار 99.98% مع خفض التكلفة 34%\n\nحققت البنية استقرارًا بنسبة **99.98%** وخفضت زمن استجابة الواجهات في الخليج بنسبة **57%** ووفّرت **34%** من فاتورة السحابة.",
    ),
    metrics: [
      { value: "99.98%", label: L("Measured uptime", "نسبة التشغيل الفعلي") },
      { value: "-57%", label: L("Regional p95 latency", "خفض زمن الاستجابة") },
      { value: "-34%", label: L("Cloud spend saved", "وفر في تكلفة السحابة") },
    ],
    features: [
      { title: L("15-Second Rollbacks", "تراجع فوري خلال ١٥ ثانية"), description: L("Automated health probes verify every release before shifting traffic.", "فحوصات سلامة تلقائية تتحقق من كل إصدار قبل تحويل حركة المرور.") },
      { title: L("Multi-Region Edge Routing", "توجيه ذكي متعدد المناطق"), description: L("Consistent low-latency routing across Riyadh, Dubai and Frankfurt nodes.", "أداء مستقر ومنخفض الكمون عبر عقد الرياض ودبي وفرانكفورت.") },
    ],
  },
  {
    slug: `${DEMO_SLUG_PREFIX}sanad-proptech-portal`,
    featured: false,
    categorySlug: "web-platforms",
    serviceSlugs: ["custom-web-platforms", "product-design"],
    techSlugs: ["next-js", "react", "typescript", "postgresql", "tailwind-css"],
    coverKey: "proptech",
    galleryKeys: ["webLogistics", "designSystem"],
    accent: "lava",
    title: L("Sanad Property Operations Portal", "بوابة سند لإدارة العقارات والأصول"),
    summary: L(
      "Multi-tower leasing, automated rent invoicing, and preventive maintenance workflows powering 42,000+ managed residential and commercial units in Dubai.",
      "منصة سحابية لإدارة العقود وتحصيل الإيجارات وأعمال الصيانة الوقائية لأكثر من ٤٢ ألف وحدة سكنية وتجارية في دبي.",
    ),
    clientName: "Sanad Real Estate Tech",
    clientCountry: "AE",
    industry: L("PropTech & Real Estate", "التقنية العقارية"),
    year: 2025,
    duration: L("12 weeks", "١٢ أسبوعًا"),
    liveUrl: "https://example.com/demo/sanad-proptech",
    appStoreUrl: null,
    playStoreUrl: null,
    challenge: L(
      "## Manual Renewals Across Multi-Owner Portfolios\n\nProperty teams struggled with fragmented lease renewals, slow maintenance ticket routing, and manual owner financial statements.",
      "## تعقيد إدارة المحافظ متعددة الملاك\n\nواجه مديرو العقارات صعوبة في متابعة تجديد العقود وتوزيع بلاغات الصيانة والمطابقة المالية اليدوية لمحافظ متعددة الملاك.",
    ),
    solution: L(
      "## Multi-Tenant Bilingual Property OS\n\nWe delivered automated lease generation, SLA-ranked technician dispatch queues, and one-click bilingual owner yield statements.",
      "## بوابة عقارية متعددة الجهات\n\nطوّرنا بوابة تولّد العقود تلقائيًا وتنظّم جدول الفنيين وفق الأولوية وتصدر تقارير مالية فورية للملاك بالعربية والإنجليزية.",
    ),
    results: L(
      "## 51% Faster Maintenance Resolution\n\nMaintenance SLA compliance climbed sharply and digital lease renewals reached **94%** within the first quarter.",
      "## تسريع استجابة الصيانة بنسبة 51%\n\nتحسّنت سرعة إغلاق طلبات الصيانة بنسبة **51%** وارتفعت نسبة التجديد الإلكتروني للعقود إلى **94%** خلال الربع الأول.",
    ),
    metrics: [
      { value: "42K+", label: L("Managed units", "وحدة مُدارة") },
      { value: "+51%", label: L("Faster maintenance SLA", "سرعة استجابة الصيانة") },
      { value: "94%", label: L("Digital lease renewal", "تجديد إلكتروني للعقود") },
    ],
    features: [
      { title: L("Owner Financial Statements", "تقارير مالية فورية للملاك"), description: L("Automated occupancy, yield and expense summaries exported cleanly.", "ملخصات الإشغال والعائد والمصروفات جاهزة للتصدير بضغطة زر.") },
      { title: L("Smart Contractor Dispatch", "توجيه ذكي للفنيين"), description: L("Routes tickets automatically by building zone, trade and SLA tier.", "توزيع تلقائي للبلاغات حسب الموقع والتخصص ومستوى الأولوية.") },
    ],
  },
  {
    slug: `${DEMO_SLUG_PREFIX}rased-invoice-automation`,
    featured: false,
    categorySlug: "ai-automation",
    serviceSlugs: ["ai-solutions-automation", "cloud-devops"],
    techSlugs: ["python", "fastapi", "hugging-face", "postgresql", "docker"],
    coverKey: "rasedAi",
    galleryKeys: ["aiCopilot", "cloudDevops"],
    accent: "cyan",
    title: L("Rased ZATCA Invoice & ERP Agent", "راصد لأتمتة الفواتير وربط أنظمة ERP"),
    summary: L(
      "ZATCA-compliant bilingual OCR & reconciliation AI pipeline processing 18,000+ monthly supplier invoices directly into SAP and Odoo with human exception review.",
      "منظومة ذكاء اصطناعي متوافقة مع متطلبات الزكاة والضريبة (ZATCA) لقراءة ومطابقة أكثر من ١٨ ألف فاتورة مورد شهريًا وربطها مباشرة بـ SAP وOdoo.",
    ),
    clientName: "Rased Financial Ops",
    clientCountry: "SA",
    industry: L("FinOps & Automation", "الأتمتة المالية"),
    year: 2026,
    duration: L("9 weeks", "٩ أسابيع"),
    liveUrl: "https://example.com/demo/rased-finops",
    appStoreUrl: null,
    playStoreUrl: null,
    challenge: L(
      "## Month-End Bottlenecks From Manual Data Entry\n\nFinance teams manually keyed thousands of mixed Arabic/English supplier PDFs every month, delaying VAT reporting and month-end closing.",
      "## اختناق الإقفال الشهري بسبب الإدخال اليدوي\n\nأدخلت الفرق المالية آلاف الفواتير المختلطة بين العربية والإنجليزية يدويًا شهريًا، ما سبّب تأخيرًا متكررًا في الإقفال الضريبي.",
    ),
    solution: L(
      "## Structured Vision Extraction & Review Queue\n\nWe deployed a ZATCA-aware extraction pipeline with automated PO matching, VAT rule validation, and a focused reviewer queue for low-confidence lines.",
      "## استخراج ذكي ومراجعة مركّزة للاستثناءات\n\nأطلقنا خط معالجة يستخرج بنود الفاتورة ويطابقها بأوامر الشراء ويتحقق من ضريبة القيمة المضافة مع شاشة مراجعة سريعة للاستثناءات فقط.",
    ),
    results: L(
      "## Month-End Close Cut From 9 Days to 2\n\nAchieved **99.4%** straight-through field accuracy across 18,000+ monthly invoices.",
      "## تقليص الإقفال الشهري من ٩ أيام إلى يومين\n\nحقّق النظام دقة استخراج **99.4%** عبر أكثر من ١٨ ألف فاتورة شهريًا.",
    ),
    metrics: [
      { value: "99.4%", label: L("Extraction accuracy", "دقة الاستخراج") },
      { value: "18K+", label: L("Monthly invoices", "فاتورة شهريًا") },
      { value: "4.5x", label: L("Faster month-end close", "تسريع الإقفال الشهري") },
    ],
    features: [
      { title: L("ZATCA QR & VAT Verification", "التحقق الآلي من ZATCA"), description: L("Validates QR hashes, tax numbers and totals prior to ERP posting.", "فحص فوري لرموز QR والأرقام الضريبية والمجاميع قبل الترحيل.") },
      { title: L("Confidence Exception Queue", "قائمة استثناءات ذكية"), description: L("Automates 92% end-to-end and highlights only anomalies for accountants.", "يؤتمت 92% بالكامل ويعرض الحالات الاستثنائية فقط للمحاسب.") },
    ],
  },
];

export const DEMO_TESTIMONIALS = [
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
    projectSlug: `${DEMO_SLUG_PREFIX}mizan-logistics-os`,
    quote: L(
      "Working with CodeLava on Mostaql felt like having an in-house CTO and product team. They delivered our bilingual fleet platform ahead of schedule with clear weekly demos.",
      "تجربتنا مع فريق CodeLava عبر مستقل كانت استثنائية؛ التزام تام بالمواعيد، فهم عميق لطبيعة التشغيل اللوجستي في المملكة، وتسليم منصة ثنائية اللغة فاقت توقعاتنا.",
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
    projectSlug: `${DEMO_SLUG_PREFIX}sama-cloud-platform`,
    quote: L(
      "Rare engineering discipline on Upwork. CodeLava migrated our multi-region cloud infrastructure with zero downtime, cut Gulf latency in half, and documented every runbook cleanly.",
      "انضباط هندسي نادر على Upwork؛ نفّذ فريق CodeLava ترحيل بنيتنا السحابية متعددة المناطق دون ثانية توقف واحدة وخفضوا زمن الاستجابة في الخليج إلى النصف.",
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
    projectSlug: `${DEMO_SLUG_PREFIX}nibras-ai-copilot`,
    quote: L(
      "CodeLava built our private Arabic/English AI copilot with strict source citations and permission controls. Our analysts now answer regulatory questions in seconds instead of hours.",
      "طوّرت CodeLava مساعدنا الذكي الخاص للوثائق العربية والإنجليزية مع توثيق دقيق للمصادر وضوابط صلاحيات صارمة، ما اختصر ساعات البحث إلى ثوانٍ.",
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
    projectSlug: `${DEMO_SLUG_PREFIX}qafila-courier-app`,
    quote: L(
      "Our Flutter courier app went from concept to 4.9 stars on the App Store. Seamless Arabic RTL polish, rock-solid live map tracking, and smooth KNET checkout.",
      "حوّلوا فكرة تطبيق قافلة إلى منتج فعلي بتقييم 4.9 على المتاجر؛ واجهة عربية متقنة، تتبع مباشر مستقر على الخريطة، وربط سلس مع KNET.",
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
    projectSlug: `${DEMO_SLUG_PREFIX}rased-invoice-automation`,
    quote: L(
      "Hired CodeLava via Bahr for our ZATCA invoice AI pipeline. They skipped the hype, built measurable benchmarks, and cut our monthly close from 9 days to 2.",
      "تعاقدنا مع CodeLava عبر منصة بحر لبناء منظومة أتمتة الفواتير المتوافقة مع ZATCA، وكانت النتيجة عملية ومقاسة: دقة 99.4% وتقليص الإقفال الشهري من ٩ أيام إلى يومين.",
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
    projectSlug: `${DEMO_SLUG_PREFIX}diyar-luxury-ecommerce`,
    quote: L(
      "Our headless storefront feels like an international luxury flagship. Mobile load times dropped under a second and online sales more than doubled.",
      "متجرنا الجديد يعكس فخامة العلامة التجارية بسرعة تحميل أقل من ثانية على الجوال، مع تكامل سلس لتمارا وتابي ومضاعفة المبيعات الرقمية.",
    ),
  },
  {
    source: "khamsat" as const,
    sourceUrl: "https://khamsat.com/",
    featured: false,
    authorName: "Layla Al-Jaber",
    authorRole: L("Head of Operations", "رئيسة العمليات"),
    company: "Sanad Real Estate Tech",
    country: "AE",
    rating: 5.0,
    quoteLocale: "ar",
    projectSlug: `${DEMO_SLUG_PREFIX}sanad-proptech-portal`,
    quote: L(
      "Started with a focused architecture review on Khamsat and quickly expanded to our full property operations portal. Transparent weekly progress and zero surprises at handover.",
      "بدأنا بمراجعة معمارية محدّدة عبر خمسات، وبسبب وضوحهم واحترافيتهم وسّعنا العمل لبناء بوابة سند العقارية بالكامل دون أي مفاجآت عند التسليم.",
    ),
  },
  {
    source: "fiverr" as const,
    sourceUrl: "https://www.fiverr.com/",
    featured: false,
    authorName: "Omar Al-Suwaidi",
    authorRole: L("Chief Product Officer", "الرئيس التنفيذي للمنتجات"),
    company: "Wafra FinTech",
    country: "AE",
    rating: 5.0,
    quoteLocale: "en",
    projectSlug: `${DEMO_SLUG_PREFIX}wafra-design-system`,
    quote: L(
      "The bilingual design system CodeLava engineered unified three product squads overnight. Every Arabic and English token works identically across Figma, React, and Flutter.",
      "وحّد نظام التصميم الذي بنته CodeLava ثلاث فرق منتج في وقت قياسي؛ كل مكوّن يعمل بالتناسق نفسه بالعربية والإنجليزية عبر الويب والجوال.",
    ),
  },
];

export const DEMO_CLIENTS = [
  { name: "Mizan Logistics", country: "SA", mark: "hex" as const, url: "https://example.com/demo/mizan" },
  { name: "Wafra FinTech", country: "AE", mark: "prism" as const, url: "https://example.com/demo/wafra" },
  { name: "Nibras AI", country: "QA", mark: "ring" as const, url: "https://example.com/demo/nibras" },
  { name: "Diyar Living", country: "SA", mark: "arc" as const, url: "https://example.com/demo/diyar" },
  { name: "Qafila Express", country: "KW", mark: "bolt" as const, url: "https://example.com/demo/qafila" },
  { name: "Sama Cloud", country: "AE", mark: "grid" as const, url: "https://example.com/demo/sama" },
  { name: "Sanad PropTech", country: "AE", mark: "hex" as const, url: "https://example.com/demo/sanad" },
  { name: "Rased FinOps", country: "SA", mark: "ring" as const, url: "https://example.com/demo/rased" },
];

export const DEMO_ACHIEVEMENTS = [
  { value: "48", suffix: "+", label: L("Products shipped", "منتج رقمي أُطلق"), description: L("Across web, mobile & applied AI", "عبر الويب والجوال والذكاء الاصطناعي"), icon: "Rocket" },
  { value: "4.9", suffix: "★", label: L("Client rating", "متوسط تقييم العملاء"), description: L("Verified across Upwork, Mostaql, Bahr & Clutch", "موثّق عبر Upwork ومستقل وبحر وClutch"), icon: "Trophy" },
  { value: "98", suffix: "%", label: L("On-time delivery", "التزام بالمواعيد"), description: L("Milestone-tracked weekly sprints", "تسليم أسبوعي منضبط بالمراحل"), icon: "ShieldCheck" },
  { value: "6", suffix: "+", label: L("Active markets", "أسواق نشطة"), description: L("Saudi Arabia, UAE, Kuwait, Qatar, Egypt & Europe", "السعودية والإمارات والكويت وقطر ومصر وأوروبا"), icon: "Globe" },
];

export const DEMO_TEAM: {
  slug: string;
  initials: string;
  accent: string;
  secondary: string;
  name: Localized;
  role: Localized;
  bio: Localized;
  socials: SocialLinks;
}[] = [
  {
    slug: `${DEMO_SLUG_PREFIX}mohamed-el-sayed`,
    initials: "ME",
    accent: "#ff6a00",
    secondary: "#0aa5c2",
    name: L("Mohamed El-Sayed", "محمد السيد"),
    role: L("Founder & Principal Architect", "المؤسس ومهندس الأنظمة الرئيسي"),
    bio: L(
      "Leads software architecture, distributed platforms, and applied AI delivery for teams across the Gulf, Egypt, and Europe.",
      "يقود هندسة الأنظمة والمنصات الموزّعة وتنفيذ حلول الذكاء الاصطناعي التطبيقي للشركات في الخليج ومصر وأوروبا.",
    ),
    socials: { github: "https://github.com/codelava-dev", linkedin: "https://www.linkedin.com/" },
  },
  {
    slug: `${DEMO_SLUG_PREFIX}nour-al-rashid`,
    initials: "NR",
    accent: "#e94e06",
    secondary: "#ffcf4a",
    name: L("Nour Al-Rashid", "نور الراشد"),
    role: L("Head of Product Design", "رئيسة تصميم المنتجات"),
    bio: L(
      "Crafts bilingual RTL/LTR design systems, interactive prototypes, and high-clarity interfaces tailored for complex business workflows.",
      "تصمّم أنظمة التصميم ثنائية اللغة والنماذج التفاعلية وواجهات الاستخدام الواضحة للأنظمة والمنتجات الرقمية.",
    ),
    socials: { behance: "https://www.behance.net/", dribbble: "https://dribbble.com/" },
  },
  {
    slug: `${DEMO_SLUG_PREFIX}karim-mansour`,
    initials: "KM",
    accent: "#0aa5c2",
    secondary: "#ff8a2a",
    name: L("Karim Mansour", "كريم منصور"),
    role: L("Lead AI & Backend Engineer", "قائد هندسة الذكاء الاصطناعي والأنظمة الخلفية"),
    bio: L(
      "Specializes in Arabic/English RAG systems, FastAPI services, evaluation pipelines, and reliable ERP integrations.",
      "متخصّص في بناء أنظمة المعرفة الذكية باللغتين وخدمات FastAPI واختبارات الدقة والتكامل مع أنظمة ERP.",
    ),
    socials: { github: "https://github.com/", linkedin: "https://www.linkedin.com/" },
  },
  {
    slug: `${DEMO_SLUG_PREFIX}youssef-hassan`,
    initials: "YH",
    accent: "#2f6bff",
    secondary: "#ff6a00",
    name: L("Youssef Hassan", "يوسف حسن"),
    role: L("Mobile & Cloud Lead", "قائد تطبيقات الجوال والحوسبة السحابية"),
    bio: L(
      "Builds 60fps Flutter mobile apps and zero-downtime cloud infrastructure across regional and European data centers.",
      "يطوّر تطبيقات Flutter سلسة وبنية سحابية عالية الإتاحة دون توقف عبر مراكز البيانات الإقليمية والأوروبية.",
    ),
    socials: { github: "https://github.com/", upwork: "https://www.upwork.com/" },
  },
];

export const DEMO_FAQS: { category: string; question: Localized; answer: Localized }[] = [
  {
    category: "general",
    question: L("How do you structure pricing and milestones?", "كيف تنظّمون التسعير ومراحل الدفع؟"),
    answer: L(
      "Most builds run on fixed-scope milestones or dedicated monthly sprints. Every milestone has a clear demoable deliverable—such as an approved prototype, a live staging module, or production launch—so you always see working software before moving to the next phase.",
      "نعمل غالبًا بنظام مراحل واضحة النطاق أو دورات تطوير شهرية مخصّصة. ترتبط كل مرحلة بمخرج ملموس يمكن اختباره—مثل نموذج تفاعلي معتمد أو وحدة تشغيلية على بيئة التجربة أو الإطلاق الفعلي—لتتابع التقدّم بوضوح تام.",
    ),
  },
  {
    category: "general",
    question: L("Do we own 100% of the source code and IP?", "هل نمتلك كامل الشيفرة البرمجية والملكية الفكرية؟"),
    answer: L(
      "Yes. From day one, repositories, design files, cloud accounts and documentation belong entirely to your organization. We sign mutual NDAs before discovery whenever requested.",
      "نعم بالكامل. منذ اليوم الأول تكون المستودعات البرمجية وملفات التصميم وحسابات السحابة والتوثيق مملوكة لشركتك بالكامل، ونوقّع اتفاقية عدم إفصاح (NDA) قبل بدء الاكتشاف متى طُلب ذلك.",
    ),
  },
  {
    category: "custom-web-platforms",
    question: L("Can you integrate our platform with SAP, Odoo, or local payment gateways?", "هل يمكن ربط المنصة بأنظمة SAP أو Odoo أو بوابات الدفع المحلية؟"),
    answer: L(
      "Yes. We regularly integrate custom web platforms with SAP, Odoo, ZATCA e-invoicing, Mada, Moyasar, Tap, HyperPay, and regional shipping providers using resilient, audited API layers.",
      "بالتأكيد. نربط المنصات المخصّصة بانتظام مع SAP وOdoo والفوترة الإلكترونية (ZATCA) ومدى وميسّر وتاب وHyperPay وشركات الشحن الإقليمية عبر طبقة تكامل موثوقة ومراقَبة.",
    ),
  },
  {
    category: "mobile-apps",
    question: L("Should we build our mobile app with Flutter or native Swift & Kotlin?", "هل الأفضل بناء تطبيقنا عبر Flutter أم Native (Swift وKotlin)؟"),
    answer: L(
      "For most customer and operations apps, **Flutter** delivers native-grade 60fps performance and true Arabic RTL support from a single codebase—cutting time-to-market by 35–45%. When an app relies heavily on specialized hardware or OS extensions, we build native Swift/Kotlin modules or full native apps.",
      "في أغلب تطبيقات العملاء والتشغيل يمنح **Flutter** أداءً سلسًا بسرعة ٦٠ إطارًا ودعمًا متقنًا للعربية من قاعدة برمجية واحدة، ما يختصر زمن الإطلاق بنسبة ٣٥–٤٥٪. وعند الحاجة لميزات عتادية متقدّمة نضيف وحدات Swift/Kotlin أصلية أو نبني تطبيقًا أصليًا بالكامل.",
    ),
  },
  {
    category: "ai-solutions-automation",
    question: L("How do you keep internal company data private in AI workflows?", "كيف تضمنون خصوصية بيانات شركتنا في حلول الذكاء الاصطناعي؟"),
    answer: L(
      "We never train public models on client data. Depending on your compliance needs, we deploy private API endpoints with zero data retention or self-hosted open-weights models inside your regional cloud—enforcing role-based access on every retrieval query.",
      "لا نستخدم بيانات عملائنا مطلقًا لتدريب أي نماذج عامة. وفق متطلبات الامتثال لديكم، ننشر واجهات خاصة دون احتفاظ بالبيانات أو نماذج مفتوحة مستضافة داخل سحابتكم الإقليمية مع فرض صلاحيات الوصول على كل استعلام.",
    ),
  },
  {
    category: "product-design",
    question: L("Can we hire CodeLava for UX & design system work before development?", "هل يمكن التعاقد معكم على تصميم التجربة ونظام التصميم قبل التطوير؟"),
    answer: L(
      "Yes. Many teams start with a 3-to-5-week discovery and clickable bilingual prototype sprint. You walk away with validated user flows, a tokenized Figma library, and a clear technical roadmap you can build with us or your internal engineers.",
      "نعم. تبدأ فرق كثيرة معنا بمرحلة اكتشاف ونموذج أولي تفاعلي ثنائي اللغة خلال ٣ إلى ٥ أسابيع، لتحصل على مسارات مستخدم مختبرة ومكتبة تصميم على Figma وخارطة طريق تقنية واضحة للتنفيذ معنا أو مع فريقك.",
    ),
  },
  {
    category: "ecommerce",
    question: L("Do your storefronts support Tamara, Tabby, Mada, and multi-currency GCC checkout?", "هل تدعم متاجركم تمارا وتابي ومدى والعملات الخليجية المتعددة؟"),
    answer: L(
      "Yes. We configure local payment gateways, BNPL installments (Tamara & Tabby), Apple Pay, VAT invoicing, and automatic currency/language switching tailored for Saudi Arabia, the UAE, Kuwait, Qatar, and international buyers.",
      "نعم. نجهّز بوابات الدفع المحلية والتقسيط عبر تمارا وتابي وApple Pay والفوترة الضريبية وتبديل العملات واللغة بسلاسة للأسواق السعودية والإماراتية والكويتية والقطرية والعالمية.",
    ),
  },
  {
    category: "cloud-devops",
    question: L("Can you migrate our existing servers without interrupting live users?", "هل يمكن ترحيل خوادمنا الحالية إلى السحابة دون انقطاع الخدمة؟"),
    answer: L(
      "Yes. We containerize your application in parallel, run staged load and failover checks, replicate the database with minimal cutover lag, and switch DNS gradually so customers experience zero downtime.",
      "نعم. نجهّز البنية الجديدة بالحاويات بالتوازي، ونجري اختبارات الضغط والتعافي، ونزامن قاعدة البيانات قبل التحويل التدريجي، بحيث ينتقل النظام دون أي توقف يلحظه المستخدمون.",
    ),
  },
];

export const DEMO_ARTICLES = [
  {
    slug: `${DEMO_SLUG_PREFIX}engineering-bilingual-rtl-web-platforms`,
    featured: true,
    coverKey: "blogBilingual",
    authorIndex: 0,
    tags: ["Engineering", "Bilingual UX", "Next.js"],
    readingMinutes: 6,
    daysAgo: 3,
    title: L(
      "Engineering True Arabic & English Web Platforms Without Layout Drift",
      "هندسة منصات ويب ثنائية اللغة (عربي/إنجليزي) دون أخطاء تخطيط RTL",
    ),
    excerpt: L(
      "How logical CSS properties, paired Latin/Arabic type scales, and bilingual JSONB schemas eliminate costly localization rewrites.",
      "كيف تمنع الخصائص المنطقية في CSS ومقاييس الخطوط المتوازنة وهيكلة البيانات ثنائية اللغة إعادة بناء الواجهة لاحقًا.",
    ),
    body: L(
      "## Start With Logical Geometry\n\nMost bilingual products break because right-to-left support is bolted on after English screens are finalized. Using logical CSS (`margin-inline`, `padding-inline`, `inset-inline-start`) and directional icon mirroring ensures every component flips naturally.\n\n## Calibrate Arabic Typography\n\nArabic scripts need slightly taller line-height (`1.75–1.85`) and zero letter-spacing so connected glyphs stay crisp across display headlines and dense operational tables.\n\n> \"Good bilingual software never feels translated—it feels authored natively in both scripts.\"\n\n## Keep Data Bilingual at the Schema Level\n\nStoring `{ en, ar }` JSONB fields directly in PostgreSQL lets editorial teams preview, draft, and publish both locales atomically with zero sync drift.\n\n```ts\nexport type Localized = { en: string; ar: string };\n```",
      "## ابدأ بالهندسة المنطقية للتخطيط\n\nتتعثر معظم المنتجات ثنائية اللغة لأن دعم الاتجاه من اليمين إلى اليسار يُضاف في اللحظة الأخيرة. الاعتماد على خصائص CSS المنطقية (`margin-inline` و`inset-inline-start`) يضمن انعكاس كل مكوّن بسلاسة طبيعية.\n\n## اضبط مقاييس الخط العربي بعناية\n\nتحتاج النصوص العربية إلى ارتفاع سطر أرحب (`1.75–1.85`) وتباعد أحرف صفري حتى تبقى الكلمات المتصلة واضحة ومريحة للقراءة في العناوين والجداول.\n\n> \"المنتج ثنائي اللغة المتقن لا يبدو مترجمًا، بل يبدو مصمّمًا ومكتوبًا بأصالة في كلتا اللغتين.\"\n\n## هيكل البيانات للغتين من البداية\n\nحفظ النصوص كحقول `{ en, ar }` مباشرة في PostgreSQL يمكّن فريق المحتوى من المعاينة والنشر المتزامن للغتين دون تضارب.\n\n```ts\nexport type Localized = { en: string; ar: string };\n```",
    ),
  },
  {
    slug: `${DEMO_SLUG_PREFIX}measured-ai-in-enterprise-operations`,
    featured: false,
    coverKey: "blogAi",
    authorIndex: 2,
    tags: ["Applied AI", "Enterprise", "Engineering"],
    readingMinutes: 5,
    daysAgo: 10,
    title: L(
      "Applying Measured AI in Enterprise Operations: Beyond Chat Demos",
      "توظيف الذكاء الاصطناعي العملي في عمليات الشركات: ما بعد العروض التجريبية",
    ),
    excerpt: L(
      "Why evaluation benchmarks, source citations, and human-in-the-loop checkpoints turn fragile LLM prototypes into dependable business software.",
      "لماذا تحوّل اختبارات القياس وتوثيق المصادر ونقاط المراجعة البشرية النماذج التجريبية إلى أنظمة أعمال يُعتمد عليها.",
    ),
    body: L(
      "## Start With a Measurable Bottleneck\n\nSuccessful enterprise AI projects target repeatable workflows like invoice reconciliation, Arabic policy retrieval, or quote drafting where baseline speed and accuracy can be measured clearly.\n\n## Ground Every Output in Citations\n\nTeams trust AI when every claim links straight back to the exact policy page or ERP record—and low-confidence items route automatically to a human reviewer.\n\n## Benchmark Before Every Release\n\nMaintain a golden set of 200+ real bilingual examples so prompt or model updates never silently regress production accuracy.",
      "## ابدأ باختناق تشغيلي قابل للقياس\n\nتنجح مشاريع الذكاء الاصطناعي المؤسسية حين تستهدف مهام متكررة مثل مطابقة الفواتير أو البحث في السياسات العربية حيث يمكن قياس الدقة والزمن بوضوح.\n\n## وثّق كل مخرج بمصدره\n\nتزداد ثقة الفرق عندما يرتبط كل استنتاج برقم الصفحة أو السجل الفعلي، مع تحويل الحالات منخفضة الثقة تلقائيًا إلى مراجع بشري.\n\n## قِس الأداء قبل كل تحديث\n\nاحتفظ بمجموعة اختبار تمثّل واقع العمل من ٢٠٠ حالة ثنائية اللغة على الأقل لضمان عدم تراجع الدقة مع أي تحديث.",
    ),
  },
  {
    slug: `${DEMO_SLUG_PREFIX}sub-200ms-nextjs-performance-playbook`,
    featured: false,
    coverKey: "blogPerf",
    authorIndex: 3,
    tags: ["Performance", "Next.js", "Cloud"],
    readingMinutes: 5,
    daysAgo: 17,
    title: L(
      "Our Sub-200ms Next.js Playbook for High-Conversion Regional Products",
      "دليلنا العملي للوصول إلى سرعة أقل من 200ms في تطبيقات Next.js",
    ),
    excerpt: L(
      "Practical caching, AVIF/WebP image pipelines, and server-first rendering that keep interactive sites feeling instant on mobile networks.",
      "تقنيات التخزين المؤقت ومعالجة الصور بـ AVIF/WebP والتقديم الخادمي لإبقاء المواقع فورية الاستجابة على شبكات الجوال.",
    ),
    body: L(
      "## Paint the Hero Immediately\n\nYour primary headline and hero visual should render from HTML and an eager WebP poster before JavaScript hydrates, keeping LCP consistently low on mobile devices.\n\n## Optimize Media at Upload Time\n\nGenerating responsive AVIF and WebP variants plus tiny blur placeholders at upload time ensures portfolio galleries stay razor-sharp without bloating mobile bandwidth.\n\n## Cache With Explicit Invalidation Tags\n\nPair tag-based server caching with clean admin revalidation hooks so public pages stay instant while editorial updates appear immediately.",
      "## اعرض المحتوى الأساسي فورًا\n\nيجب أن يظهر العنوان الرئيسي وصورة الهيرو مباشرة من HTML دون انتظار تحميل JavaScript، ما يحافظ على زمن LCP منخفضًا على الجوال.\n\n## عالج الصور تلقائيًا عند الرفع\n\nتوليد نسخ AVIF وWebP متعددة المقاسات عند الرفع يحافظ على نقاء معرض الأعمال دون استهلاك بيانات الجوال.\n\n## تخزين مؤقت بوسوم تحديث دقيقة\n\nاربط التخزين المؤقت للخادم بوسوم واضحة تتجدد فور النشر من لوحة الإدارة لتجمع بين السرعة الفورية وتحديث المحتوى اللحظي.",
    ),
  },
  {
    slug: `${DEMO_SLUG_PREFIX}design-systems-for-gulf-fintech`,
    featured: false,
    coverKey: "blogDesign",
    authorIndex: 1,
    tags: ["Product Design", "Bilingual UX"],
    readingMinutes: 6,
    daysAgo: 25,
    title: L(
      "Designing High-Trust Bilingual Design Systems for Regional FinTech",
      "بناء أنظمة تصميم ثنائية اللغة عالية الموثوقية لتطبيقات التقنية المالية",
    ),
    excerpt: L(
      "Practical patterns for financial typography, tabular numerals, WCAG AA contrast, and shared tokens across Figma, React, and Flutter.",
      "أنماط عملية لطباعة الأرقام المالية وتباين الألوان وتوحيد المتغيرات بين Figma وReact وFlutter.",
    ),
    body: L(
      "## Clarity Builds Financial Trust\n\nIn digital banking and treasury apps, hierarchy and contrast carry regulatory and emotional weight. Every amount, currency code, and status badge must scan effortlessly in both Arabic and English.\n\n## Keep Numerals Tabular and Predictable\n\nUse `tabular-nums` and explicit `dir=\"ltr\"` wrappers around monetary figures and IBAN codes so decimals never jump or reverse unexpectedly in RTL tables.\n\n## Sync Tokens Directly Into Code\n\nWhen spacing, radius, and semantic color tokens map 1-to-1 between Figma and CSS/Flutter themes, design reviews shift from pixel policing to product quality.",
      "## الوضوح البصري أساس الثقة المالية\n\nفي تطبيقات المصرفية الرقمية والخزينة يحمل التباين والتدرج البصري أثرًا مباشرًا على ثقة العميل؛ فكل مبلغ ورمز عملة وحالة تحويل يجب أن تُقرأ بوضوح فوري باللغتين.\n\n## حافظ على ثبات الأرقام في الجداول العربية\n\nاستخدم `tabular-nums` وتنسيقًا منضبطًا للأرقام والعملات وأرقام الآيبان حتى لا تتداخل الخانات أو تنعكس داخل الواجهة العربية.\n\n## زامن المتغيرات مباشرة مع الكود\n\nعندما تتطابق متغيرات الألوان والمسافات بين Figma والكود ينتقل تركيز الفريق من التصحيحات الشكلية إلى جودة تجربة المنتج.",
    ),
  },
  {
    slug: `${DEMO_SLUG_PREFIX}headless-commerce-gcc-checkout`,
    featured: false,
    coverKey: "blogCommerce",
    authorIndex: 4,
    tags: ["E-commerce", "Performance", "Product Design"],
    readingMinutes: 4,
    daysAgo: 34,
    title: L(
      "Removing Checkout Friction in GCC E-Commerce Storefronts",
      "إزالة نقاط الاحتكاك في خطوة الدفع لمتاجر التجارة الإلكترونية في الخليج",
    ),
    excerpt: L(
      "Why mobile speed, local payment ordering (Mada, Apple Pay, Tamara), and honest delivery slots lift conversion more than homepage banners.",
      "لماذا ترفع سرعة الجوال وترتيب وسائل الدفع المحلية (مدى وApple Pay وتمارا) ومواعيد التوصيل الواضحة المبيعات أكثر من أي لافتة إعلانية.",
    ),
    body: L(
      "## Put Local Payment Methods First\n\nShoppers in Saudi Arabia and the Gulf expect Apple Pay, Mada, and BNPL options like Tamara and Tabby front and center—not buried inside a generic credit card accordion.\n\n## Show Real Delivery Windows Before Checkout\n\nConnecting your storefront directly to warehouse and showroom inventory lets buyers pick a real delivery slot while confidence is highest.\n\n## Trim Every Kilobyte on Mobile\n\nEvery second saved between product page and checkout confirmation pays back directly in completed orders.",
      "## قدّم وسائل الدفع المحلية أولًا\n\nيتوقع المتسوق في الخليج رؤية Apple Pay ومدى وخيارات التقسيط مثل تمارا وتابي بوضوح مباشر، لا مخفية داخل نماذج بطاقات تقليدية.\n\n## اعرض مواعيد التوصيل الحقيقية مبكرًا\n\nربط المتجر مباشرة بمخزون المستودعات والمعارض يتيح للعميل اختيار موعد توصيل حقيقي ويعزّز ثقته قبل الدفع.\n\n## اختصر كل ثانية تحميل على الجوال\n\nكل ثانية توفّرها بين صفحة المنتج وتأكيد الطلب تنعكس مباشرة في زيادة معدل إتمام الشراء.",
    ),
  },
  {
    slug: `${DEMO_SLUG_PREFIX}zero-downtime-cloud-migrations`,
    featured: false,
    coverKey: "blogCloud",
    authorIndex: 3,
    tags: ["Cloud", "Engineering", "Enterprise"],
    readingMinutes: 5,
    daysAgo: 42,
    title: L(
      "Zero-Downtime Cloud Migrations Without Weekend Maintenance Windows",
      "الترحيل السحابي دون توقف ودون فترات صيانة في عطلة نهاية الأسبوع",
    ),
    excerpt: L(
      "A step-by-step pattern for containerizing legacy services, replicating PostgreSQL safely, and rehearsing 15-second rollbacks.",
      "منهجية عملية لتحويل الخدمات القائمة إلى حاويات ومزامنة PostgreSQL بأمان والتدرّب على التراجع الفوري خلال ١٥ ثانية.",
    ),
    body: L(
      "## Rehearse the Cutover Before Production\n\nThe calmest cloud migrations are boring because every script—container build, database replication, health probe, and rollback—was rehearsed on staging first.\n\n## Separate Stateless Compute From Stateful Data\n\nMoving web and API tiers behind Cloudflare and Docker containers first reduces risk before touching primary PostgreSQL storage.\n\n## Measure Latency Before and After\n\nBaseline p50 and p95 latency from regional users so you can verify both reliability and real speed gains immediately after cutover.",
      "## تدرّب على خطة الانتقال قبل التنفيذ الفعلي\n\nأهدأ عمليات الترحيل السحابي هي التي جُرّبت كل خطوة فيها مسبقًا على بيئة مماثلة للإنتاج: بناء الحاويات ومزامنة قاعدة البيانات وفحوصات السلامة وخطة التراجع.\n\n## افصل طبقة التشغيل عن طبقة البيانات\n\nنقل واجهات التطبيق وخدمات API أولًا خلف Cloudflare وحاويات Docker يقلّل المخاطر قبل المساس بقاعدة بيانات PostgreSQL الرئيسية.\n\n## قِس زمن الاستجابة قبل الترحيل وبعده\n\nسجّل مؤشرات p50 وp95 من مستخدمي المنطقة للتحقق الفوري من تحسّن الأداء والاستقرار بعد التحويل.",
    ),
  },
  {
    slug: `${DEMO_SLUG_PREFIX}flutter-arabic-rtl-field-apps`,
    featured: false,
    coverKey: "blogMobile",
    authorIndex: 3,
    tags: ["Mobile", "Bilingual UX", "Performance"],
    readingMinutes: 5,
    daysAgo: 50,
    title: L(
      "Building 60fps Bilingual Field & Delivery Apps in Flutter",
      "تطوير تطبيقات التوصيل والعمل الميداني ثنائية اللغة بسرعة ٦٠ إطارًا عبر Flutter",
    ),
    excerpt: L(
      "How offline-first queues, battery-aware GPS batching, and native RTL animations keep courier apps reliable in dense cities.",
      "كيف تضمن طوابير العمل دون اتصال وتجميع إحداثيات GPS الموفّر للبطارية وحركات RTL السلسة موثوقية تطبيقات التوصيل.",
    ),
    body: L(
      "## Design for Unstable Mobile Connections\n\nField couriers pass through tunnels, basements, and congested towers every hour. Persisting status transitions locally and syncing idempotently prevents lost deliveries.\n\n## Tune Map Markers for 60fps\n\nDecouple live socket coordinates from Flutter widget rebuilds by animating marker interpolation inside a dedicated controller.\n\n## Mirror Gestures and Navigation Naturally\n\nTest back-swipes, bottom sheets, and stepper progress bars in Arabic from sprint one so RTL never feels secondary.",
      "## صمّم التطبيق للعمل بثبات مع تقلّب الشبكة\n\nيمر المندوبون يوميًا عبر الأنفاق والمباني وضعف التغطية؛ لذلك يضمن حفظ تحديثات الحالة محليًا ومزامنتها تلقائيًا عدم ضياع أي طلب.\n\n## اضبط حركة الخرائط بسرعة ٦٠ إطارًا\n\nافصل تدفق الإحداثيات اللحظية عن إعادة بناء الواجهة الكاملة لتحافظ على سلاسة الخريطة وكفاءة البطارية.\n\n## اختبر الاتجاه العربي منذ الأسبوع الأول\n\nمراجعة إيماءات السحب والقوائم السفلية ومؤشرات المراحل باللغة العربية مبكرًا تمنح المستخدم تجربة طبيعية ومتقنة.",
    ),
  },
];

/* ----------------------------------------------------- Daylight Magma SVGs */

function esc(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function buildStudioCardSvg(opts: {
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
  const bgA = isDark ? "#0f1320" : "#f6f5f3";
  const bgB = isDark ? "#151a29" : "#efedea";
  const cardBg = isDark ? "#181e30" : "#ffffff";
  const panelBg = isDark ? "#1d2334" : "#fbfaf8";
  const textMain = isDark ? "#fbf7f2" : "#151a29";
  const textMuted = isDark ? "#b9bcc8" : "#4a5165";
  const line = isDark ? "rgba(255,255,255,0.09)" : "rgba(21,26,41,0.09)";

  const barSvg = opts.bars
    .slice(0, 8)
    .map((val, i) => {
      const h = Math.round(val * 2.0);
      const x = 250 + i * 76;
      const y = 760 - h;
      const col =
        i === Math.min(opts.bars.length, 8) - 1
          ? opts.accent
          : i % 2 === 0
            ? opts.secondary
            : isDark
              ? "#2a3144"
              : "#e4e6ec";
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
      <stop offset="0%" stop-color="${opts.accent}" stop-opacity="${isDark ? "0.34" : "0.2"}" />
      <stop offset="100%" stop-color="${opts.accent}" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="glowB" cx="15%" cy="88%" r="48%">
      <stop offset="0%" stop-color="${opts.secondary}" stop-opacity="${isDark ? "0.22" : "0.14"}" />
      <stop offset="100%" stop-color="${opts.secondary}" stop-opacity="0" />
    </radialGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="125%">
      <feDropShadow dx="0" dy="28" stdDeviation="28" flood-color="#0f1320" flood-opacity="${isDark ? "0.52" : "0.14"}" />
    </filter>
  </defs>
  <rect width="1600" height="1000" fill="url(#bg)" />
  <rect width="1600" height="1000" fill="url(#glowA)" />
  <rect width="1600" height="1000" fill="url(#glowB)" />
  <g filter="url(#shadow)">
    <rect x="176" y="108" width="1248" height="784" rx="28" fill="${cardBg}" stroke="${line}" stroke-width="2" />
  </g>
  <rect x="176" y="108" width="1248" height="62" rx="28" fill="${panelBg}" />
  <rect x="176" y="142" width="1248" height="28" fill="${panelBg}" />
  <line x1="176" y1="170" x2="1424" y2="170" stroke="${line}" stroke-width="1.5" />
  <circle cx="220" cy="139" r="7" fill="${opts.accent}" />
  <circle cx="246" cy="139" r="7" fill="${opts.secondary}" opacity="0.75" />
  <circle cx="272" cy="139" r="7" fill="${textMuted}" opacity="0.35" />
  <rect x="320" y="127" width="280" height="24" rx="12" fill="${isDark ? "rgba(255,255,255,0.06)" : "rgba(21,26,41,0.05)"}" />
  <rect x="228" y="216" width="212" height="34" rx="17" fill="${opts.accent}" fill-opacity="0.16" />
  <text x="334" y="239" text-anchor="middle" fill="${opts.accent}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="16" font-weight="700" letter-spacing="1.2">${esc(opts.tag)}</text>
  <text x="228" y="310" fill="${textMain}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="44" font-weight="700" letter-spacing="-1">${esc(opts.title)}</text>
  <rect x="1000" y="216" width="372" height="170" rx="22" fill="${panelBg}" stroke="${line}" stroke-width="1.5" />
  <text x="1036" y="304" fill="${opts.accent}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="58" font-weight="800" letter-spacing="-2">${esc(opts.metric)}</text>
  <text x="1036" y="348" fill="${textMuted}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="20" font-weight="500">${esc(opts.metricLabel)}</text>
  <rect x="228" y="420" width="736" height="414" rx="22" fill="${panelBg}" stroke="${line}" stroke-width="1.5" />
  <line x1="252" y1="520" x2="936" y2="520" stroke="${line}" stroke-dasharray="6 8" />
  <line x1="252" y1="620" x2="936" y2="620" stroke="${line}" stroke-dasharray="6 8" />
  <line x1="252" y1="720" x2="936" y2="720" stroke="${line}" stroke-dasharray="6 8" />
  ${barSvg}
  <rect x="1000" y="420" width="372" height="414" rx="22" fill="${panelBg}" stroke="${line}" stroke-width="1.5" />
  <circle cx="1186" cy="575" r="88" fill="none" stroke="${line}" stroke-width="18" />
  <circle cx="1186" cy="575" r="88" fill="none" stroke="${opts.accent}" stroke-width="18" stroke-dasharray="395 555" stroke-linecap="round" transform="rotate(-90 1186 575)" />
  <circle cx="1186" cy="575" r="60" fill="none" stroke="${opts.secondary}" stroke-width="10" stroke-dasharray="260 390" stroke-linecap="round" transform="rotate(-35 1186 575)" />
  <rect x="1040" y="718" width="292" height="16" rx="8" fill="${isDark ? "rgba(255,255,255,0.14)" : "rgba(21,26,41,0.12)"}" />
  <rect x="1040" y="752" width="206" height="14" rx="7" fill="${opts.accent}" fill-opacity="0.55" />
  <rect x="1040" y="782" width="244" height="12" rx="6" fill="${isDark ? "rgba(255,255,255,0.08)" : "rgba(21,26,41,0.08)"}" />
</svg>`.trim();
}

export function buildLogoSvg(name: string, mark: "hex" | "arc" | "grid" | "prism" | "bolt" | "ring") {
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

export function buildPortraitSvg(opts: { initials: string; accent: string; secondary: string; seed: number }) {
  const cx = 240 + ((opts.seed * 67) % 320);
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="880" viewBox="0 0 800 880">
  <defs>
    <linearGradient id="pbg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fbfaf8" />
      <stop offset="100%" stop-color="#eeedf3" />
    </linearGradient>
    <radialGradient id="pg1" cx="50%" cy="92%" r="68%">
      <stop offset="0%" stop-color="${opts.accent}" stop-opacity="0.34" />
      <stop offset="100%" stop-color="${opts.accent}" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="pg2" cx="${Math.round((cx / 800) * 100)}%" cy="18%" r="48%">
      <stop offset="0%" stop-color="${opts.secondary}" stop-opacity="0.24" />
      <stop offset="100%" stop-color="${opts.secondary}" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="800" height="880" fill="url(#pbg)" />
  <rect width="800" height="880" fill="url(#pg1)" />
  <rect width="800" height="880" fill="url(#pg2)" />
  <circle cx="400" cy="400" r="240" fill="none" stroke="rgba(21,26,41,0.08)" stroke-width="1.5" stroke-dasharray="8 10" />
  <circle cx="400" cy="400" r="168" fill="#ffffff" fill-opacity="0.88" stroke="rgba(21,26,41,0.1)" stroke-width="2" />
  <path d="M 160 880 C 200 700, 600 700, 640 880 Z" fill="#151a29" fill-opacity="0.06" />
  <circle cx="400" cy="400" r="136" fill="${opts.accent}" fill-opacity="0.1" />
  <text x="400" y="438" text-anchor="middle" fill="#151a29" font-family="ui-sans-serif, system-ui, sans-serif" font-size="112" font-weight="800" letter-spacing="-4">${esc(opts.initials)}</text>
  <rect x="340" y="514" width="120" height="8" rx="4" fill="${opts.accent}" />
</svg>`.trim();
}
