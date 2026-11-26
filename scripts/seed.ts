import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { z } from "zod";
import { defaultSectionsRows } from "../src/content/sections";
import { faqs, pageSections, processSteps, projectCategories, roles, services, siteSettings, technologies, users } from "../src/db/schema";
import { hashPassword } from "../src/server/auth/password";
import { systemRoles } from "../src/server/auth/permissions";

const env = z.object({
  DATABASE_URL: z.string().min(1),
  ADMIN_EMAIL: z.email().max(254).transform((email) => email.toLowerCase()),
  ADMIN_PASSWORD: z.string().min(12).max(1024),
}).parse(process.env);

const bilingual = (en: string, ar: string) => ({ en, ar });
const starterServices = [
  {
    slug: "custom-web-platforms", icon: "PanelsTopLeft", featured: true, accent: "lava",
    title: bilingual("Custom Web Platforms", "منصات ويب مخصّصة"),
    tagline: bilingual("Software built around how your team works.", "برمجيات تنسجم مع أسلوب عمل فريقك."),
    summary: bilingual("Launch portals, dashboards and operational systems that connect your team, customers and data.", "أطلِق بوابات ولوحات معلومات وأنظمة تشغيلية تربط فريقك وعملاءك وبياناتك."),
    body: bilingual("We map the workflows your platform needs to support, then turn them into a secure application with clear roles, reliable integrations and a codebase your team can maintain.", "نحدّد مسارات العمل التي تحتاج منصتك إلى دعمها، ثم نحوّلها إلى تطبيق آمن بصلاحيات واضحة وتكاملات موثوقة وقاعدة برمجية يسهل على فريقك صيانتها."),
  },
  {
    slug: "mobile-apps", icon: "Smartphone", featured: true, accent: "blue",
    title: bilingual("Mobile Apps", "تطبيقات الجوال"),
    tagline: bilingual("Put your service in your customers’ hands.", "ضع خدمتك في متناول عملائك."),
    summary: bilingual("Design and build iOS and Android apps for customer journeys and field operations.", "نصمّم ونطوّر تطبيقات لنظامَي iOS وAndroid لخدمة العملاء ودعم فرق العمل الميداني."),
    body: bilingual("We test the core journeys on real devices and plan for the practical work of launching and maintaining your app, from store releases to analytics and monitoring.", "نختبر المسارات الأساسية على أجهزة فعلية، ونخطّط لمتطلبات إطلاق تطبيقك وتشغيله، بدءًا من النشر في المتاجر ووصولًا إلى التحليلات والمراقبة."),
  },
  {
    slug: "ai-solutions-automation", icon: "Sparkles", featured: true, accent: "cyan",
    title: bilingual("AI Solutions & Automation", "حلول الذكاء الاصطناعي والأتمتة"),
    tagline: bilingual("Apply AI where outcomes can be measured.", "وظّف الذكاء الاصطناعي في مهام يمكن قياس نتائجها."),
    summary: bilingual("Automate repeatable work, search internal knowledge and connect AI tools to existing workflows.", "أتِمِت المهام المتكرّرة، ويسّر البحث في المعرفة الداخلية، واربط أدوات الذكاء الاصطناعي بعملياتك الحالية."),
    body: bilingual("We start with a measurable workflow, evaluate the quality on representative examples and build review steps for decisions that need human judgment.", "نبدأ بعملية قابلة للقياس، ونقيّم جودة المخرجات على أمثلة تمثّل واقع العمل، ونضيف مراحل مراجعة للقرارات التي تستدعي الحكم البشري."),
  },
  {
    slug: "product-design", icon: "PenTool", featured: false, accent: "yellow",
    title: bilingual("UI/UX & Product Design", "تصميم المنتجات وتجربة المستخدم"),
    tagline: bilingual("Make the next step clear for every user.", "اجعل الخطوة التالية واضحة لكل مستخدم."),
    summary: bilingual("Shape product flows, test bilingual prototypes and build a design system ready for engineering.", "نبني مسارات الاستخدام، ونختبر نماذج أولية ثنائية اللغة، ونؤسّس نظام تصميم جاهزًا للتطوير."),
    body: bilingual("We make scope and usability decisions with working prototypes and use what we learn to guide the interface, accessibility requirements and implementation.", "نتّخذ قرارات النطاق وسهولة الاستخدام بالاستناد إلى نماذج تفاعلية، ونوظّف ما نتعلّمه في تصميم الواجهات وتحديد متطلبات الوصول والتنفيذ."),
  },
  {
    slug: "ecommerce", icon: "ShoppingCart", featured: false, accent: "green",
    title: bilingual("E-commerce", "التجارة الإلكترونية"),
    tagline: bilingual("Build a storefront your team can run confidently.", "أطلِق متجرًا يستطيع فريقك إدارته بثقة."),
    summary: bilingual("Create bilingual storefronts and integrate payments, inventory and order fulfillment.", "نطوّر متاجر ثنائية اللغة ونربطها بأنظمة الدفع والمخزون وتجهيز الطلبات."),
    body: bilingual("We trace the full journey from product discovery to fulfillment. The build covers how customers place orders and how your team manages exceptions after checkout.", "ندرس رحلة العميل كاملة، من اكتشاف المنتج إلى تسلّم الطلب. ويشمل التطوير تجربة الشراء وآلية تعامل فريقك مع الحالات الاستثنائية بعد الدفع."),
  },
  {
    slug: "cloud-devops", icon: "Cloud", featured: false, accent: "blue",
    title: bilingual("Cloud, DevOps & Support", "الحوسبة السحابية وDevOps والدعم"),
    tagline: bilingual("Operate your software with clear deployment and recovery plans.", "شغّل برمجياتك بخطط واضحة للنشر والتعافي."),
    summary: bilingual("Set up delivery pipelines, monitoring and support arrangements tailored to your system.", "نجهّز مسارات النشر والمراقبة والدعم بما يتناسب مع نظامك."),
    body: bilingual("We document operating responsibilities, test release and rollback procedures and agree what maintenance should look like after handover.", "نوثّق مسؤوليات التشغيل، ونختبر إجراءات النشر والتراجع، ونتّفق معك على آلية الصيانة بعد التسليم."),
  },
];

const steps = [
  [bilingual("Discover", "الاكتشاف"), bilingual("Define the outcome, constraints and priorities with the people who will use or operate the product.", "نحدّد النتائج المطلوبة والقيود والأولويات مع من سيستخدمون المنتج أو يتولّون تشغيله."), "Compass"],
  [bilingual("Design", "التصميم"), bilingual("Prototype the important journeys and agree on the first scope before development.", "نُعدّ نماذج للمسارات الأهم ونتّفق على نطاق الإصدار الأول قبل بدء التطوير."), "PenTool"],
  [bilingual("Build and test", "التطوير والاختبار"), bilingual("Deliver in increments and review working software together.", "ننفّذ العمل على مراحل ونراجع معك ما بات جاهزًا للتجربة."), "Code2"],
  [bilingual("Launch and hand over", "الإطلاق والتسليم"), bilingual("Prepare deployment, document the system and agree on ongoing support.", "نستعد للنشر، ونوثّق النظام، ونتّفق على آلية الدعم المستمر."), "Rocket"],
] as const;

const questions = [
  [bilingual("What do you need to start?", "ما الذي تحتاجونه لبدء المشروع؟"), bilingual("Share your goal, who the product is for and any deadlines or constraints you already know. We can work with an initial outline.", "اذكر هدفك والفئة المستفيدة من المنتج وأي مواعيد أو قيود معروفة لديك. يكفينا تصوّر مبدئي للبدء.")],
  [bilingual("Can you work with an existing system?", "هل يمكنكم العمل على نظام قائم؟"), bilingual("Yes. We start by reviewing the current setup, dependencies and priorities, then agree on the safest practical scope for changes.", "نعم. نبدأ بمراجعة النظام الحالي واعتماداته وأولوياتك، ثم نتّفق معك على نطاق عملي وآمن للتعديلات.")],
  [bilingual("Do you build bilingual products?", "هل تطوّرون منتجات ثنائية اللغة؟"), bilingual("Yes. We plan for English and Arabic at the design stage, including right-to-left layouts and bilingual content workflows.", "نعم. نراعي العربية والإنجليزية منذ مرحلة التصميم، بما في ذلك تخطيطات الكتابة من اليمين إلى اليسار وآليات إدارة المحتوى باللغتين.")],
  [bilingual("What happens after launch?", "ماذا يحدث بعد الإطلاق؟"), bilingual("We agree on handover, documentation and any maintenance or support needed for your team to operate the system.", "نتّفق معك على التسليم والتوثيق وأي صيانة أو دعم يحتاج إليه فريقك لتشغيل النظام.")],
] as const;

const tech = [
  ["Next.js", "frontend", "nextdotjs"], ["React", "frontend", "react"], ["TypeScript", "frontend", "typescript"],
  ["Tailwind CSS", "frontend", "tailwindcss"], ["Node.js", "backend", "nodedotjs"], ["Python", "backend", "python"],
  ["FastAPI", "backend", "fastapi"], ["PostgreSQL", "database", "postgresql"], ["Redis", "database", "redis"],
  ["Flutter", "mobile", "flutter"], ["Swift", "mobile", "swift"], ["Kotlin", "mobile", "kotlin"], ["PyTorch", "ai", "pytorch"],
  ["Hugging Face", "ai", "huggingface"], ["Docker", "cloud", "docker"], ["Cloudflare", "cloud", "cloudflare"],
  ["GitHub Actions", "cloud", "githubactions"], ["Figma", "design", "figma"],
] as const;

const categories = [
  ["web-platforms", bilingual("Web platforms", "منصات الويب")], ["mobile", bilingual("Mobile apps", "تطبيقات الجوال")],
  ["ai-automation", bilingual("AI and automation", "الذكاء الاصطناعي والأتمتة")],
  ["ecommerce", bilingual("E-commerce", "التجارة الإلكترونية")], ["product-design", bilingual("Product design", "تصميم المنتجات")],
] as const;

const fixedId = (namespace: string, index: number) => `c0de1a00-0000-4000-8000-${namespace}${String(index + 1).padStart(10, "0")}`;
async function seed() {
  const sqlClient = postgres(env.DATABASE_URL, { max: 1 });
  try {
    const db = drizzle(sqlClient);
    const passwordHash = await hashPassword(env.ADMIN_PASSWORD);
    await db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(420233)`);
      for (const role of systemRoles) {
        const values = { ...role, system: true };
        await tx.insert(roles).values(values).onConflictDoUpdate({
        target: roles.key, set: values,
        setWhere: sql`(${roles.name}, ${roles.permissions}, ${roles.system}) is distinct from (excluded.name, excluded.permissions, excluded.system)`,
      });
      }
      const [owner] = await tx.select().from(roles).where(eq(roles.key, "owner"));
      await tx.insert(users).values({ email: env.ADMIN_EMAIL, name: "CodeLava Owner", roleId: owner.id, passwordHash }).onConflictDoNothing();
      await tx.insert(siteSettings).values([
        { key: "contact", value: { email: "", phone: "", whatsapp: "", address: bilingual("", ""), hours: bilingual("", ""), mapUrl: "" } },
        { key: "socials", value: {} }, { key: "seo", value: { title: bilingual("", ""), description: bilingual("", ""), noindex: false } },
        { key: "features", value: {} },
      ]).onConflictDoNothing();
      await tx.insert(services).values(starterServices.map((service, sortOrder) => ({
        ...service, id: fixedId("01", sortOrder), sortOrder, status: "published" as const, publishedAt: new Date(),
      }))).onConflictDoNothing();
      await tx.insert(processSteps).values(steps.map(([title, description, icon], sortOrder) => ({
        id: fixedId("02", sortOrder), title, description, icon, sortOrder,
      }))).onConflictDoNothing();
      await tx.insert(technologies).values(tech.map(([name, category, iconSlug], sortOrder) => ({
        id: fixedId("03", sortOrder), name, category, iconSlug, sortOrder, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      }))).onConflictDoNothing();
      await tx.insert(faqs).values(questions.map(([question, answer], sortOrder) => ({
        id: fixedId("04", sortOrder), question, answer, sortOrder, status: "published" as const, publishedAt: new Date(),
      }))).onConflictDoNothing();
      await tx.insert(projectCategories).values(categories.map(([slug, name], sortOrder) => ({
        id: fixedId("05", sortOrder), slug, name, sortOrder,
      }))).onConflictDoNothing();
      await tx.insert(pageSections).values(defaultSectionsRows()).onConflictDoNothing();
    });
    console.log("CodeLava roles, owner and starter content seeded.");
  } finally {
    await sqlClient.end();
  }
}

void seed().catch((error: unknown) => {
  console.error("Seed failed", error);
  process.exitCode = 1;
});
