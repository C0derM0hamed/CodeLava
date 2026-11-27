import type { Localized } from "../../src/db/schema";

const L = (en: string, ar: string): Localized => ({ en, ar });

export const serviceEnrichments: Record<
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
