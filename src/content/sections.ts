import { z } from "zod";
import type { Localized } from "@/db/schema";

const localized = z.object({ en: z.string().max(5000), ar: z.string().max(5000) });
const fieldHints = {
  eyebrow: { label: "Eyebrow", hint: "Short label above the headline." },
  title: { label: "Title", hint: "Main heading for the section." },
  description: { label: "Description", hint: "Short introduction in plain text." },
  ctaLabel: { label: "Action label", hint: "Text on the primary action." },
  secondaryCtaLabel: { label: "Secondary action", hint: "Text on the secondary action." },
};

function section<Fields extends Record<string, Localized>>(label: string, defaults: Fields) {
  type Key = Extract<keyof Fields, keyof typeof fieldHints>;
  const keys = Object.keys(defaults) as Key[];
  const shape = Object.fromEntries(keys.map((key) => [key, localized])) as Record<Key, typeof localized>;
  return {
    label,
    fields: Object.fromEntries(keys.map((key) => [key, fieldHints[key]])) as Pick<typeof fieldHints, Key>,
    schema: z.object(shape),
    defaults,
  };
}

const copy = (en: string, ar: string): Localized => ({ en, ar });
const block = (eyebrow: Localized, title: Localized, description: Localized) =>
  ({ eyebrow, title, description });

const cta = section("Call to action", {
  ...block(
    copy("Your next project", "مشروعك المقبل"),
    copy("Let’s talk about what you want to build.", "لنتحدث عمّا تطمح إلى بنائه."),
    copy("Tell us what needs to change and what success would look like for your team.",
      "أخبرنا بما تريد تغييره وما الذي سيعنيه النجاح لفريقك."),
  ),
  ctaLabel: copy("Discuss your project", "ناقش مشروعك معنا"),
});

function standardPage(label: string, eyebrow: Localized, headline: Localized, description: Localized,
  introTitle: Localized, introDescription: Localized) {
  return {
    hero: section(`${label} hero`, block(eyebrow, headline, description)),
    intro: section(`${label} introduction`, { title: introTitle, description: introDescription }),
    cta,
  };
}

export const sectionRegistry = {
  home: {
    hero: section("Home hero", {
      ...block(
        copy("Software & AI Solutions", "ابتكار يتدفق برمجياً"),
        copy("Build what moves your business forward.", "ابنِ ما يدفع أعمالك إلى الأمام."),
        copy("CodeLava designs and engineers digital products, custom software and AI solutions around the way your business works.",
          "نصمّم ونطوّر في CodeLava منتجات رقمية وبرمجيات مخصّصة وحلول ذكاء اصطناعي تنسجم مع طريقة عملك."),
      ),
      ctaLabel: copy("Discuss your project", "ناقش مشروعك معنا"),
      secondaryCtaLabel: copy("Explore our work", "اكتشف أعمالنا"),
    }),
    services: section("Services", block(
      copy("Services", "خدماتنا"), copy("Engineering for the way you work.", "هندسة برمجية تنسجم مع طريقة عملك."),
      copy("From the first product decision to the systems behind it, we build around the work your team needs to get done.",
        "من أول قرار في المنتج إلى الأنظمة التي تدعمه، نبني حول احتياجات فريقك الفعلية."),
    )),
    work: section("Work", block(
      copy("Selected work", "مختارات من أعمالنا"), copy("Decisions behind the build.", "القرارات وراء كل مشروع."),
      copy("Explore the challenges, trade-offs and engineering choices behind our work.",
        "تعرّف على التحديات والمفاضلات والخيارات الهندسية التي شكّلت أعمالنا."),
    )),
    proof: section("Testimonials, clients and achievements", block(
      copy("Working together", "العمل المشترك"), copy("From the people we build with.", "من شركائنا في العمل."),
      copy("Client perspectives and milestones from our work together.", "آراء عملائنا ومحطات من أعمالنا المشتركة."),
    )),
    process: section("Process", block(
      copy("Process", "منهجية العمل"), copy("Know what happens next.", "وضوح في كل خطوة."),
      copy("We make the important decisions visible, from discovery to release and beyond.",
        "نُبقي القرارات المهمة واضحة أمامك منذ الاكتشاف وحتى الإطلاق وما بعده."),
    )),
    technologies: section("Technologies", block(
      copy("Technologies", "التقنيات"), copy("Tools chosen for the job.", "لكل مشروع تقنياته المناسبة."),
      copy("We choose a stack your team can operate, maintain and extend as the product evolves.",
        "نختار تقنيات يسهل على فريقك تشغيلها وصيانتها وتوسيعها مع تطوّر المنتج."),
    )),
    insights: section("Insights", block(
      copy("Insights", "رؤى ومقالات"), copy("Notes from the work.", "أفكار من واقع العمل."),
      copy("Perspectives on software, product design and applied AI.", "رؤى في البرمجيات وتصميم المنتجات والذكاء الاصطناعي التطبيقي."),
    )),
    faq: section("Frequently asked questions", block(
      copy("FAQ", "الأسئلة الشائعة"), copy("Before we get started.", "قبل أن نبدأ."),
      copy("Answers to common questions about working with CodeLava.", "إجابات عن أبرز الأسئلة حول العمل مع CodeLava."),
    )),
    cta,
  },
  about: standardPage("About", copy("About CodeLava", "عن CodeLava"),
    copy("Good software starts with understanding the work.", "البرمجيات الجيّدة تبدأ بفهم طبيعة العمل."),
    copy("We bring product thinking and software engineering together to solve business problems.",
      "نجمع بين التفكير في المنتج وهندسة البرمجيات لمعالجة تحديات الأعمال."),
    copy("How we approach the work", "كيف نعمل"), copy("We ask clear questions, explain our choices and stay close to the people who will use what we build.",
      "نطرح أسئلة واضحة، ونشرح خياراتنا، ونبقى على تواصل مع من سيستخدمون ما نبنيه.")),
  services: standardPage("Services", copy("Services", "خدماتنا"),
    copy("Software and AI, built around your business.", "برمجيات وذكاء اصطناعي مصمّمان لأعمالك."),
    copy("Explore where we can help, from shaping a new product to improving an existing system.",
      "اكتشف كيف يمكننا مساعدتك، من صياغة منتج جديد إلى تطوير نظام قائم."),
    copy("Find the right scope", "حدّد النطاق المناسب"), copy("We start with the outcome you need, then agree on what it will take to deliver it.",
      "نبدأ بالنتيجة التي تحتاج إليها، ثم نتّفق على ما يتطلّبه تحقيقها.")),
  work: standardPage("Work", copy("Portfolio", "أعمالنا"), copy("Inside the work.", "من داخل المشاريع."),
    copy("Explore projects through the problems they set out to solve.", "تصفّح مشاريعنا من خلال التحديات التي انطلقت منها."),
    copy("Explore case studies", "استكشف دراسات الحالة"), copy("See the context and decisions that shaped each project.",
      "تعرّف على سياق كل مشروع والقرارات التي شكّلته.")),
  process: standardPage("Process", copy("Process", "منهجية العمل"), copy("A clear path from idea to release.", "مسار واضح من الفكرة إلى الإطلاق."),
    copy("See how we define the work, build it in stages and prepare for handover.", "تعرّف على كيفية تحديد نطاق العمل وتنفيذه على مراحل والاستعداد للتسليم."),
    copy("What to expect", "ما الذي تتوقّعه؟"), copy("We agree on priorities and use working software to guide the next decision.",
      "نتّفق على الأولويات ونستند إلى ما بات جاهزًا للتجربة لاتخاذ القرار التالي.")),
  technologies: standardPage("Technologies", copy("Technologies", "التقنيات"), copy("Technical choices that fit the product.", "خيارات تقنية تلائم المنتج."),
    copy("Explore the tools we use to design, build and operate digital products.", "تعرّف على الأدوات التي نستخدمها لتصميم المنتجات الرقمية وبنائها وتشغيلها."),
    copy("What guides the choice", "ما الذي يوجّه اختيارنا؟"), copy("We consider how your team will deploy, secure and maintain the system.",
      "نراعي كيف سيشغّل فريقك النظام ويؤمّنه ويصونه.")),
  blog: standardPage("Blog", copy("Insights", "رؤى ومقالات"), copy("Ideas from the workbench.", "أفكار من واقع العمل."),
    copy("Read our perspectives on building software, shaping products and applying AI.", "اقرأ رؤانا في تطوير البرمجيات وتصميم المنتجات وتطبيقات الذكاء الاصطناعي."),
    copy("Browse articles", "تصفّح المقالات"), copy("Find a topic that relates to the decisions you’re making.",
      "اختر موضوعًا يساعدك في القرارات التي تعمل عليها.")),
  faq: standardPage("FAQ", copy("FAQ", "الأسئلة الشائعة"), copy("Questions before a project begins.", "أسئلة قبل انطلاق المشروع."),
    copy("Find answers about scope, collaboration and what happens after launch.", "تعرّف على إجابات تخصّ نطاق العمل والتعاون وما بعد الإطلاق."),
    copy("Browse questions", "تصفّح الأسئلة"), copy("Explore the topics that matter to your project.",
      "استكشف الموضوعات التي تهمّ مشروعك.")),
  contact: standardPage("Contact", copy("Contact", "تواصل معنا"), copy("Tell us what’s on your mind.", "يسعدنا أن نسمع منك."),
    copy("Get in touch about a project, a partnership or a question.", "تواصل معنا بشأن مشروع أو شراكة أو استفسار."),
    copy("Send a message", "أرسل رسالة"), copy("Share enough context for us to respond to your request.",
      "شاركنا المعلومات التي تساعدنا على الردّ على طلبك.")),
  quote: standardPage("Quote", copy("Project inquiry", "طلب عرض سعر"), copy("Tell us about your project.", "حدّثنا عن مشروعك."),
    copy("Share your goals, priorities and constraints so we can discuss the scope.", "شاركنا أهدافك وأولوياتك والقيود القائمة لنناقش نطاق العمل."),
    copy("Start with what you know", "ابدأ بما تعرفه عن المشروع"), copy("An outline is enough to start. You can add files if they help explain your needs.",
      "يكفي تصوّر موجز للبدء. يمكنك إرفاق ملفات إذا كانت تساعد في توضيح احتياجاتك.")),
};

export type SectionPageKey = keyof typeof sectionRegistry;

export function defaultSectionsRows() {
  return Object.entries(sectionRegistry).flatMap(([pageKey, sections]) =>
    Object.entries(sections).map(([sectionKey, entry], index) => ({
      pageKey, sectionKey, visible: true, sortOrder: index, content: entry.defaults,
    })),
  );
}
