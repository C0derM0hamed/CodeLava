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
import { CtaBanner } from "@/components/site/CtaBanner";
import { sectionRegistry } from "@/content/sections";
import { routing, type AppLocale } from "@/i18n/routing";
import { formatNumber } from "@/lib/i18n-content";
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
    tServices,
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
    getTranslations({ locale, namespace: "services" }),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "a11y" }),
    getPageSections("home", locale),
    getSiteSettings(locale),
    getServices(locale),
    getProjects({ featured: true, limit: 1 }, locale),
    getProcessSteps(locale),
    getTestimonials({ limit: 16 }, locale),
    getAchievements(locale),
    getClientLogos(locale),
    getTechnologies({}, locale),
    getArticles({ page: 1, pageSize: 3 }, locale),
    getFaqs({}, locale),
  ]);

  const project = featured[0] ?? (await getProjects({ limit: 1 }, locale))[0] ?? null;
  const projectDetail = project ? await getProjectBySlug(project.slug, locale) : null;

  const visibleSections = sections.filter((s) => isHomeSectionKey(s.sectionKey));
  const hasHero = visibleSections.some((s) => s.sectionKey === "hero");
  const startsWithHero = visibleSections[0]?.sectionKey === "hero";
  const workDefaults = sectionRegistry.home.work.defaults;
  const ctaDefaults = sectionRegistry.home.cta.defaults;

  const renderers: Record<HomeSectionKey, (copy: SectionCopy) => ReactNode> = {
    hero: (copy) => (
      <HomeHero locale={locale}>
        <HomeHeroCopy
          tone="dark"
          eyebrow={copy.eyebrow || tCommon("tagline")}
          title={copy.title || t("title")}
          description={copy.description || t("description")}
          primaryLabel={copy.ctaLabel || t("startProject")}
          secondaryLabel={copy.secondaryCtaLabel || t("viewWork")}
        />
      </HomeHero>
    ),

    clients: (copy) => <HomeClientStrip label={copy.eyebrow || t("trustedBy")} clients={clientLogos} />,

    services: (copy) => (
      <HomeServices
        eyebrow={copy.eyebrow}
        title={copy.title || t("exploreServices")}
        description={copy.description}
        exploreLabel={t("exploreServices")}
        moreLabel={t("moreServices")}
        projectsBadge={(count) => tServices("projectsBadge", { count, formatted: formatNumber(count, locale) })}
        services={services}
      />
    ),

    work: (copy) => (
      <HomeFeaturedProject
        locale={locale}
        eyebrow={copy.eyebrow || t("selectedWork")}
        title={copy.title !== workDefaults.title[locale] ? copy.title : undefined}
        description={copy.description !== workDefaults.description[locale] ? copy.description : undefined}
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
        moreLabel={(count) => t("moreTechnologies", { count: formatNumber(count, locale) })}
        technologies={technologies}
      />
    ),

    proof: (copy) =>
      testimonials.length > 0 ? (
        <HomeTestimonials
          locale={locale}
          eyebrow={copy.eyebrow || t("clientReviews")}
          title={copy.title || t("clientPerspectives")}
          description={copy.description}
          testimonials={testimonials}
          labels={{
            previous: tA11y("previousSlide"),
            next: tA11y("nextSlide"),
            rating: t.raw("rating") as string,
            viewSource: t.raw("viewReview") as string,
            region: t("testimonialsRegion"),
            allPlatforms: t("allPlatforms"),
            deliveredProject: t("deliveredProject"),
            ratedReviewsLabel: t.raw("ratedReviews") as string,
            sources: {
              upwork: t("sources.upwork"),
              mostaql: t("sources.mostaql"),
              khamsat: t("sources.khamsat"),
              fiverr: t("sources.fiverr"),
              bahr: t("sources.bahr"),
              freelancer: t("sources.freelancer"),
              clutch: t("sources.clutch"),
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

    cta: (copy) => {
      const customTitle = copy.title && copy.title !== ctaDefaults.title[locale] ? copy.title : undefined;
      const customLead = copy.description && copy.description !== ctaDefaults.description[locale] ? copy.description : undefined;
      const customPrimary =
        copy.ctaLabel && copy.ctaLabel !== ctaDefaults.ctaLabel[locale]
          ? { href: "/quote", label: copy.ctaLabel }
          : undefined;
      return (
        <div className="container-lava relative z-10 py-[clamp(2.5rem,5vw,4.5rem)]">
          <CtaBanner eyebrow={copy.eyebrow !== ctaDefaults.eyebrow[locale] ? copy.eyebrow : undefined} title={customTitle} lead={customLead} primary={customPrimary} />
        </div>
      );
    },
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

      {!startsWithHero ? (
        <div className="pt-[var(--header-h)]">
          {!hasHero ? <h1 className="sr-only">{t("title")}</h1> : null}
        </div>
      ) : null}

      {visibleSections.map(({ sectionKey, content }) =>
        isHomeSectionKey(sectionKey) ? (
          <Fragment key={sectionKey}>{renderers[sectionKey](content)}</Fragment>
        ) : null,
      )}
    </main>
  );
}
