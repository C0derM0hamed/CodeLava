import type { Metadata } from "next";
import { Fragment, type ReactNode } from "react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  HomeAboutTeaser,
  HomeClientStrip,
  HomeFaqTeaser,
  HomeFeaturedProject,
  HomeHero,
  HomeHeroCopy,
  HomeInsights,
  HomeProcessBand,
  HomeServices,
  HomeTechnologies,
  HomeTestimonials,
} from "@/components/sections/home";
import { sectionRegistry } from "@/content/sections";
import { routing, type AppLocale } from "@/i18n/routing";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/jsonld";
import { buildMetadata, localizedPath } from "@/lib/seo";
import {
  getAchievements,
  getArticles,
  getClientLogos,
  getFaqs,
  getPageMeta,
  getPageSections,
  getProcessSteps,
  getProjectBySlug,
  getProjects,
  getServices,
  getSiteSettings,
  getTechnologies,
  getTestimonials,
} from "@/server/queries";
import "@/components/sections/home/home.css";

type HomeParams = { params: Promise<{ locale: string }> };
type SectionCopy = Record<string, string>;

/**
 * Section keys the homepage knows how to render (page_sections.section_key for page "home").
 * Order and visibility come from the DB via getPageSections (sortOrder asc, hidden excluded);
 * "hero" is always pinned first. "cta" renders nothing: the footer owns the closing CTA banner.
 */
const HOME_SECTION_KEYS = [
  "hero",
  "clients",
  "services",
  "work",
  "process",
  "technologies",
  "proof",
  "about",
  "insights",
  "faq",
  "cta",
] as const;
type HomeSectionKey = (typeof HOME_SECTION_KEYS)[number];

function isHomeSectionKey(key: string): key is HomeSectionKey {
  return (HOME_SECTION_KEYS as readonly string[]).includes(key);
}

/**
 * Until Platform registers "clients" / "about" in sectionRegistry.home, those sections are
 * placed where the reference puts them. Once registered, the DB alone decides (incl. hiding).
 */
function withUnregisteredSections(entries: { sectionKey: string; content: SectionCopy }[]) {
  const registered = sectionRegistry.home as Record<string, unknown>;
  const list = entries.map(({ sectionKey, content }) => ({ sectionKey, content }));
  const has = (key: string) => list.some((entry) => entry.sectionKey === key);
  if (!("clients" in registered) && !has("clients")) {
    list.splice(list[0]?.sectionKey === "hero" ? 1 : 0, 0, { sectionKey: "clients", content: {} });
  }
  if (!("about" in registered) && !has("about")) {
    const before = list.findIndex((entry) => ["insights", "faq", "cta"].includes(entry.sectionKey));
    list.splice(before === -1 ? list.length : before, 0, { sectionKey: "about", content: {} });
  }
  return list;
}

export async function generateMetadata({ params }: HomeParams): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const [pageMeta, sections, settings] = await Promise.all([
    getPageMeta("home", locale),
    getPageSections("home", locale),
    getSiteSettings(locale),
  ]);
  const hero = sections.find((s) => s.sectionKey === "hero")?.content;

  return buildMetadata({
    locale,
    path: "/",
    title: pageMeta?.title || settings.seo.title || undefined,
    description: pageMeta?.description || hero?.description || settings.seo.description || undefined,
    image: pageMeta?.image ?? settings.seo.image ?? null,
    noindex: pageMeta?.noindex ?? settings.seo.noindex,
    canonical: pageMeta?.canonical,
  });
}

export default async function HomePage({ params }: HomeParams) {
  const { locale: rawLocale } = await params;
  if (!hasLocale(routing.locales, rawLocale)) notFound();
  const locale: AppLocale = rawLocale;
  setRequestLocale(locale);

  const [
    t,
    tCommon,
    tA11y,
    sections,
    settings,
    services,
    featured,
    processSteps,
    testimonials,
    achievements,
    clientLogos,
    technologies,
    articles,
    faqs,
  ] = await Promise.all([
    getTranslations({ locale, namespace: "home" }),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "a11y" }),
    getPageSections("home", locale),
    getSiteSettings(locale),
    getServices(locale),
    getProjects({ featured: true, limit: 1 }, locale),
    getProcessSteps(locale),
    getTestimonials({ limit: 8 }, locale),
    getAchievements(locale),
    getClientLogos(locale),
    getTechnologies({}, locale),
    getArticles({ page: 1, pageSize: 3 }, locale),
    getFaqs({}, locale),
  ]);

  // Featured project: the first featured one, else the latest published project.
  const project = featured[0] ?? (await getProjects({ limit: 1 }, locale))[0] ?? null;
  const projectDetail = project ? await getProjectBySlug(project.slug, locale) : null;

  const hero = sections.find((s) => s.sectionKey === "hero");
  const body = withUnregisteredSections(sections.filter((s) => s.sectionKey !== "hero"));

  const renderers: Record<Exclude<HomeSectionKey, "hero">, (copy: SectionCopy) => ReactNode> = {
    clients: () => <HomeClientStrip label={t("trustedBy")} clients={clientLogos} />,

    services: (copy) => (
      <HomeServices
        eyebrow={copy.eyebrow}
        title={copy.title || t("exploreServices")}
        description={copy.description}
        exploreLabel={t("exploreServices")}
        moreLabel={t("moreServices")}
        services={services}
      />
    ),

    work: (copy) => (
      <HomeFeaturedProject
        locale={locale}
        eyebrow={copy.eyebrow || t("selectedWork")}
        achievementsTitle={t("achievementsTitle")}
        achievementsLabel={t("achievements")}
        caseStudyLabel={t("viewCaseStudy")}
        technologiesLabel={t("projectTechnologies")}
        allWorkLabel={t("allWork")}
        project={project}
        detail={projectDetail}
        achievements={achievements}
      />
    ),

    process: (copy) => (
      <HomeProcessBand
        locale={locale}
        eyebrow={copy.eyebrow}
        title={copy.title || t("seeProcess")}
        description={copy.description}
        ctaLabel={copy.ctaLabel || t("seeProcess")}
        steps={processSteps}
      />
    ),

    technologies: (copy) => (
      <HomeTechnologies
        eyebrow={copy.eyebrow}
        title={copy.title || t("exploreTechnologies")}
        description={copy.description}
        exploreLabel={t("exploreTechnologies")}
        moreLabel={(count) => t("moreTechnologies", { count })}
        technologies={technologies}
      />
    ),

    proof: (copy) =>
      testimonials.length > 0 ? (
        <HomeTestimonials
          eyebrow={copy.eyebrow}
          title={copy.title || t("clientPerspectives")}
          description={copy.description}
          testimonials={testimonials}
          labels={{
            previous: tA11y("previousSlide"),
            next: tA11y("nextSlide"),
            rating: t.raw("rating") as string,
            viewSource: t.raw("viewReview") as string,
            region: t("testimonialsRegion"),
            sources: {
              upwork: t("sources.upwork"),
              mostaql: t("sources.mostaql"),
              direct: t("sources.direct"),
              other: t("sources.other"),
            },
          }}
        />
      ) : null,

    about: (copy) => (
      <HomeAboutTeaser
        eyebrow={copy.eyebrow || t("about.eyebrow")}
        title={copy.title || t("about.title")}
        description={copy.description || t("about.description")}
        ctaLabel={copy.ctaLabel || t("about.cta")}
        imageAlt={t("about.imageAlt")}
        values={(["bilingual", "product", "partner"] as const).map((key) => ({
          icon: { bilingual: "Languages", product: "Target", partner: "Handshake" }[key],
          title: t(`values.${key}.title`),
          body: t(`values.${key}.body`),
        }))}
      />
    ),

    insights: (copy) => (
      <HomeInsights
        eyebrow={copy.eyebrow}
        title={copy.title || t("latestInsights")}
        description={copy.description}
        exploreLabel={t("allArticles")}
        articles={articles.items}
      />
    ),

    faq: (copy) => (
      <HomeFaqTeaser
        eyebrow={copy.eyebrow}
        title={copy.title || t("allQuestions")}
        description={copy.description}
        exploreLabel={t("allQuestions")}
        faqs={faqs}
      />
    ),

    // The closing CTA banner is rendered by the site footer on every page.
    cta: () => null,
  };

  const sameAs = Object.values(settings.socials).filter(
    (href): href is string => typeof href === "string" && /^https?:\/\//.test(href),
  );

  return (
    <main id="main-content" className="relative overflow-x-clip bg-bg text-text">
      <JsonLd
        data={organizationJsonLd({
          logo: "/brand/icons/icon-512.png",
          sameAs,
          email: settings.contact.email || undefined,
          telephone: settings.contact.phone || undefined,
        })}
      />
      <JsonLd data={websiteJsonLd({ url: localizedPath(locale, "/"), language: [locale] })} />

      {hero ? (
        <HomeHero locale={locale}>
          <HomeHeroCopy
            eyebrow={hero.content.eyebrow || tCommon("tagline")}
            title={hero.content.title || t("title")}
            description={hero.content.description || t("description")}
            primaryLabel={hero.content.ctaLabel || t("startProject")}
            secondaryLabel={hero.content.secondaryCtaLabel || t("viewWork")}
          />
        </HomeHero>
      ) : (
        // Hero hidden in the dashboard: clear the fixed header and keep a document title.
        <div className="pt-[var(--header-h)]">
          <h1 className="sr-only">{t("title")}</h1>
        </div>
      )}

      {body.map(({ sectionKey, content }) =>
        isHomeSectionKey(sectionKey) && sectionKey !== "hero" ? (
          <Fragment key={sectionKey}>{renderers[sectionKey](content)}</Fragment>
        ) : null,
      )}
    </main>
  );
}
