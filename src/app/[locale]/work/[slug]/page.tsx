import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import {
  CaseStudyFactsRail,
  CaseStudyFeatures,
  CaseStudyGallery,
  CaseStudyHero,
  CaseStudyMetricsBand,
  CaseStudyNarrative,
  CaseStudyNavigation,
  CaseStudyTestimonial,
  type NarrativeChapter,
  type SecondaryChapter,
} from "@/components/sections/work";
import { routing } from "@/i18n/routing";
import {
  breadcrumbListJsonLd,
  caseStudyJsonLd,
  JsonLd,
} from "@/lib/jsonld";
import { buildMetadata, localizedPath } from "@/lib/seo";
import { getAllSlugs, getPageSections, getProjectBySlug } from "@/server/queries";
import "@/components/sections/work/work.css";

type CaseStudyParams = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  try {
    const { projects } = await getAllSlugs();
    return projects.map(({ slug }) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: CaseStudyParams): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const project = await getProjectBySlug(slug, locale);
  if (!project) return {};

  const socialImage = project.seo.image ?? project.cover;

  return buildMetadata({
    locale,
    path: `/work/${project.slug}`,
    title: project.seo.title ?? project.title,
    description: project.seo.description ?? project.summary,
    image: socialImage
      ? {
          url: socialImage.url,
          alt: socialImage.alt || project.title,
          width: socialImage.width,
          height: socialImage.height,
        }
      : null,
    noindex: project.seo.noindex,
    canonical: project.seo.canonical,
    type: "article",
  });
}

function hasHtmlContent(html: string | null | undefined): html is string {
  if (!html) return false;
  return html.replace(/<[^>]+>/g, "").trim().length > 0;
}

export default async function CaseStudyPage({ params }: CaseStudyParams) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const [project, sections, tCase, tWork, tCommon, tNav, tA11y, draft] = await Promise.all([
    getProjectBySlug(slug, locale),
    getPageSections("work", locale),
    getTranslations({ locale, namespace: "caseStudy" }),
    getTranslations({ locale, namespace: "work" }),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "a11y" }),
    draftMode(),
  ]);

  if (!project) notFound();

  const ctaContent = sections.find((s) => s.sectionKey === "cta")?.content ?? {};

  const chapters: NarrativeChapter[] = [
    hasHtmlContent(project.challengeHtml)
      ? { id: "challenge", label: tCase("challenge"), html: project.challengeHtml }
      : null,
    hasHtmlContent(project.solutionHtml)
      ? { id: "solution", label: tCase("solution"), html: project.solutionHtml }
      : null,
    hasHtmlContent(project.resultsHtml)
      ? { id: "results", label: tCase("results"), html: project.resultsHtml }
      : null,
  ].filter((c): c is NarrativeChapter => c !== null);

  const secondaryChapters: SecondaryChapter[] = [
    project.features.length > 0 ? { id: "features", label: tCase("features") } : null,
    project.gallery.length > 0 ? { id: "gallery", label: tCase("gallery") } : null,
    project.testimonial ? { id: "testimonial", label: tCase("testimonial") } : null,
    project.related.length > 0 ? { id: "related", label: tCase("related") } : null,
  ].filter((c): c is SecondaryChapter => c !== null);

  const pageUrl = localizedPath(locale, `/work/${project.slug}`);
  const ogImage = project.seo.image ?? project.cover;

  const creativeWorkLd = caseStudyJsonLd({
    title: project.seo.title ?? project.title,
    description: project.seo.description ?? project.summary,
    url: pageUrl,
    language: locale,
    image: ogImage?.url,
  });

  const breadcrumbLd = breadcrumbListJsonLd([
    { name: tNav("home"), url: localizedPath(locale, "/") },
    { name: tNav("work"), url: localizedPath(locale, "/work") },
    { name: project.title, url: pageUrl },
  ]);

  // Dynamic section index numbers based on rendered chapters
  let nextIdx = chapters.length + 1;
  const formatIdx = (n: number) => String(n).padStart(2, "0");

  const featuresIdx = project.features.length > 0 ? formatIdx(nextIdx++) : undefined;
  const galleryIdx = project.gallery.length > 0 ? formatIdx(nextIdx++) : undefined;
  const testimonialIdx = project.testimonial ? formatIdx(nextIdx++) : undefined;

  return (
    <main id="main-content" className="relative bg-bg text-text">
      <JsonLd data={creativeWorkLd} />
      <JsonLd data={breadcrumbLd} />

      <CaseStudyHero
        locale={locale}
        project={project}
        isDraft={draft.isEnabled}
        labels={{
          home: tNav("home"),
          work: tNav("work"),
          backToWork: tCase("backToWork"),
          breadcrumbsAria: tA11y("breadcrumbs"),
          playVideo: tA11y("playVideo"),
          pauseVideo: tA11y("pauseVideo"),
        }}
      />

      <CaseStudyFactsRail
        locale={locale}
        project={project}
        labels={{
          overview: tCase("overview"),
          client: tCase("client"),
          country: tCase("country"),
          industry: tCase("industry"),
          year: tCase("year"),
          duration: tCase("duration"),
          services: tCase("services"),
          technologies: tCase("technologies"),
          visitSite: tCase("visitSite"),
          appStore: tCase("appStore"),
          playStore: tCase("playStore"),
          openInNewTab: tA11y("openInNewTab"),
        }}
      />

      <CaseStudyMetricsBand locale={locale} metrics={project.metrics} />

      <CaseStudyNarrative
        locale={locale}
        chapters={chapters}
        secondaryChapters={secondaryChapters}
        ctaLabel={ctaContent.ctaLabel || tCommon("discussProject")}
      />

      <CaseStudyFeatures
        locale={locale}
        features={project.features}
        headingTitle={tCase("features")}
        sectionIndex={featuresIdx}
      />

      <CaseStudyGallery
        locale={locale}
        projectTitle={project.title}
        gallery={project.gallery}
        headingTitle={tCase("gallery")}
        sectionIndex={galleryIdx}
        labels={{
          close: tCommon("close"),
          previousSlide: tA11y("previousSlide"),
          nextSlide: tA11y("nextSlide"),
          goToSlidePrefix: tA11y.raw("goToSlide") as string,
        }}
      />

      <CaseStudyTestimonial
        locale={locale}
        testimonial={project.testimonial}
        headingTitle={tCase("testimonial")}
        sectionIndex={testimonialIdx}
        openInNewTabLabel={tA11y("openInNewTab")}
      />

      <CaseStudyNavigation
        locale={locale}
        related={project.related}
        prev={project.prev}
        next={project.next}
        labels={{
          relatedTitle: tCase("related"),
          previousLabel: tCase("previous"),
          nextLabel: tCase("next"),
          openCaseStudy: tWork("openCaseStudy"),
        }}
      />

    </main>
  );
}
