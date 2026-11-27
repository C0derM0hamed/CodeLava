import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  AboutHero,
  AboutMarkets,
  AboutProof,
  AboutStory,
  AboutTeam,
  AboutValues,
} from "@/components/sections/about";
import { HomeTestimonials } from "@/components/sections/home";
import { routing, type AppLocale } from "@/i18n/routing";
import { countryName } from "@/lib/i18n-content";
import { JsonLd, breadcrumbListJsonLd } from "@/lib/jsonld";
import { buildMetadata, localizedPath } from "@/lib/seo";
import { getAchievements, getClientLogos, getPageMeta, getPageSections, getTeam, getTestimonials } from "@/server/queries";
import "@/components/sections/home/home.css";

type AboutParams = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: AboutParams): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const [t, pageMeta, sections] = await Promise.all([
    getTranslations({ locale, namespace: "about" }),
    getPageMeta("about", locale),
    getPageSections("about", locale),
  ]);
  const hero = sections.find((s) => s.sectionKey === "hero")?.content;

  return buildMetadata({
    locale,
    path: "/about",
    title: pageMeta?.title || t("title"),
    description: pageMeta?.description || hero?.description || undefined,
    image: pageMeta?.image ?? null,
    noindex: pageMeta?.noindex,
    canonical: pageMeta?.canonical,
  });
}

/**
 * About: story hero → story & mission → principles → markets (dark wave band) → team →
 * achievements → clients. DB-backed parts hide when empty; the footer owns the closing CTA.
 * Hero / intro copy comes from page_sections ("about": hero, intro) with message fallbacks.
 */
export default async function AboutPage({ params }: AboutParams) {
  const { locale: rawLocale } = await params;
  if (!hasLocale(routing.locales, rawLocale)) notFound();
  const locale: AppLocale = rawLocale;
  setRequestLocale(locale);

  const [t, tHome, tNav, tA11y, sections, team, achievements, clients, testimonials] = await Promise.all([
    getTranslations({ locale, namespace: "about" }),
    getTranslations({ locale, namespace: "home" }),
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "a11y" }),
    getPageSections("about", locale),
    getTeam(locale),
    getAchievements(locale),
    getClientLogos(locale),
    getTestimonials({ limit: 16 }, locale),
  ]);

  const section = (key: string) => sections.find((s) => s.sectionKey === key)?.content;
  const hero = section("hero");
  const intro = section("intro");

  const values = (["clarity", "bilingual", "ai", "handover"] as const).map((key) => ({
    icon: { clarity: "Compass", bilingual: "Languages", ai: "BrainCircuit", handover: "ShieldCheck" }[key],
    title: t(`values.${key}.title`),
    body: t(`values.${key}.body`),
  }));

  const markets = [
    {
      icon: "Landmark",
      title: t("markets.gulf.title"),
      body: t("markets.gulf.body"),
      places: ["SA", "AE", "KW", "QA"].map((code) => countryName(code, locale)),
    },
    { icon: "Building2", title: t("markets.egypt.title"), body: t("markets.egypt.body") },
    { icon: "Globe", title: t("markets.international.title"), body: t("markets.international.body") },
  ];

  return (
    <main id="main-content" className="relative overflow-x-clip bg-bg text-text">
      <JsonLd
        data={breadcrumbListJsonLd([
          { name: tNav("home"), url: localizedPath(locale, "/") },
          { name: tNav("about"), url: localizedPath(locale, "/about") },
        ])}
      />

      <AboutHero
        eyebrow={hero?.eyebrow || t("title")}
        title={hero?.title || t("title")}
        description={hero?.description}
        primaryLabel={tHome("startProject")}
        secondaryLabel={tHome("viewWork")}
        imageAlt={t("heroImageAlt")}
      />

      <AboutStory
        eyebrow={t("story")}
        title={intro?.title || t("story")}
        lead={intro?.description}
        story={t("storyBody")}
        statements={[
          { label: t("missionLabel"), body: t("mission") },
          { label: t("visionLabel"), body: t("vision") },
        ]}
      />

      <AboutValues eyebrow={t("valuesKicker")} title={t("valuesTitle")} lead={t("valuesLead")} values={values} />

      <AboutMarkets eyebrow={t("marketsKicker")} title={t("marketsTitle")} lead={t("marketsLead")} markets={markets} />

      <AboutTeam
        eyebrow={t("team")}
        title={t("team")}
        lead={t("teamLead")}
        linkLabel={t.raw("socialLink") as string}
        members={team}
      />

      <AboutProof
        locale={locale}
        achievementsKicker={t("achievements")}
        achievementsTitle={t("achievementsTitle")}
        clientsKicker={t("clients")}
        clientsTitle={t("clientsTitle")}
        achievements={achievements}
        clients={clients}
      />

      {testimonials.length > 0 ? (
        <HomeTestimonials
          locale={locale}
          eyebrow={tHome("clientReviews")}
          title={t("testimonials")}
          testimonials={testimonials}
          labels={{
            previous: tA11y("previousSlide"),
            next: tA11y("nextSlide"),
            rating: tHome.raw("rating") as string,
            viewSource: tHome.raw("viewReview") as string,
            region: tHome("testimonialsRegion"),
            allPlatforms: tHome("allPlatforms"),
            deliveredProject: tHome("deliveredProject"),
            ratedReviewsLabel: tHome.raw("ratedReviews") as string,
            sources: {
              upwork: tHome("sources.upwork"),
              mostaql: tHome("sources.mostaql"),
              khamsat: tHome("sources.khamsat"),
              fiverr: tHome("sources.fiverr"),
              bahr: tHome("sources.bahr"),
              freelancer: tHome("sources.freelancer"),
              clutch: tHome("sources.clutch"),
              direct: tHome("sources.direct"),
              other: tHome("sources.other"),
            },
          }}
        />
      ) : null}
    </main>
  );
}
