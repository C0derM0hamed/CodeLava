import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  ProcessFaq,
  ProcessHero,
  ProcessStory,
  StepIcon,
  type TimelineStep,
} from "@/components/sections/process";
import { routing } from "@/i18n/routing";
import { formatNumber } from "@/lib/i18n-content";
import { breadcrumbListJsonLd, JsonLd } from "@/lib/jsonld";
import { buildMetadata, localizedPath } from "@/lib/seo";
import { getFaqs, getPageMeta, getPageSections, getProcessSteps } from "@/server/queries";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const [t, pageMeta, sections] = await Promise.all([
    getTranslations({ locale, namespace: "process" }),
    getPageMeta("process", locale),
    getPageSections("process", locale),
  ]);
  const hero = sections.find((s) => s.sectionKey === "hero")?.content;
  return buildMetadata({
    locale,
    path: "/process",
    title: pageMeta?.title ?? t("title"),
    description: pageMeta?.description ?? hero?.description,
    image: pageMeta?.image ?? null,
    noindex: pageMeta?.noindex,
    canonical: pageMeta?.canonical,
  });
}

export default async function ProcessPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const [t, tNav, tCommon, sections, homeSections, steps, faqs] = await Promise.all([
    getTranslations({ locale, namespace: "process" }),
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "common" }),
    getPageSections("process", locale),
    getPageSections("home", locale),
    getProcessSteps(locale),
    getFaqs({}, locale),
  ]);

  const section = (key: string) => sections.find((s) => s.sectionKey === key)?.content;
  const hero = section("hero");
  const intro = section("intro");
  const cta = section("cta");
  const faqCopy = homeSections.find((s) => s.sectionKey === "faq")?.content;

  const visibleSteps = steps.filter((step) => step.title.trim());
  const numbered = visibleSteps.map((step, index) => ({
    ...step,
    number: formatNumber(index + 1, locale, { minimumIntegerDigits: 2, useGrouping: false }),
  }));
  const timeline: TimelineStep[] = numbered.map((step) => ({
    id: step.id,
    number: step.number,
    stepLabel: t("step", { step: step.number }),
    title: step.title,
    description: step.description,
    duration: step.duration,
    icon: <StepIcon icon={step.icon} />,
  }));
  const questions = faqs.filter((f) => f.question.trim() && f.answerHtml.trim()).slice(0, 4);

  return (
    <main id="main-content" className="relative bg-bg text-text">
      <JsonLd
        data={breadcrumbListJsonLd([
          { name: tNav("home"), url: localizedPath(locale, "/") },
          { name: tNav("process"), url: localizedPath(locale, "/process") },
        ])}
      />

      <ProcessHero
        eyebrow={hero?.eyebrow}
        title={hero?.title || t("title")}
        description={hero?.description}
        ctaLabel={cta?.ctaLabel || tCommon("discussProject")}
        stagesLabel={t("seeStages")}
        glanceLabel={t("glance")}
        durationLabel={t("duration")}
        steps={numbered.map(({ id, number, title, duration }) => ({ id, number, title, duration }))}
      />

      <ProcessStory
        kicker={hero?.eyebrow}
        title={intro?.title || t("title")}
        lead={intro?.description}
        ctaLabel={cta?.ctaLabel || tCommon("discussProject")}
        steps={timeline}
        durationLabel={t("duration")}
        empty={
          <div className="container-lava">
            <p className="mx-auto max-w-xl rounded-[var(--radius-lg)] border border-line bg-surface p-10 text-center text-muted shadow-card">
              {t("empty")}
            </p>
          </div>
        }
      />

      <ProcessFaq
        kicker={faqCopy?.eyebrow}
        title={faqCopy?.title || tNav("faq")}
        lead={faqCopy?.description}
        allLabel={t("allQuestions")}
        items={questions}
      />
    </main>
  );
}
