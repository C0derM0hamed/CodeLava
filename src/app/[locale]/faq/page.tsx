import { getTranslations, setRequestLocale } from "next-intl/server";
import { MessageCircleQuestion } from "lucide-react";
import { ActionLink } from "@/components/ui/ActionLink";
import { FaqGroups } from "@/components/sections/faq/FaqGroups";
import { conversionMetadata } from "@/components/sections/forms/page-data";
import { PageSection } from "@/components/sections/forms/page-kit";
import { HighlightTitle } from "@/components/sections/process/kit";
import { Reveal } from "@/experience/fx/Reveal";
import type { AppLocale } from "@/i18n/routing";
import { formatNumber } from "@/lib/i18n-content";
import { JsonLd, faqPageJsonLd } from "@/lib/jsonld";
import { getFaqs, getPageSections, getServices, type Faq } from "@/server/queries";
import "@/components/sections/forms/conversion.css";
import "@/components/sections/faq/faq.css";

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const [t, sections] = await Promise.all([
    getTranslations({ locale, namespace: "faq" }),
    getPageSections("faq", locale),
  ]);
  return conversionMetadata(
    locale,
    "faq",
    t("title"),
    sections.find(({ sectionKey }) => sectionKey === "hero")?.content.description,
  );
}

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, common, sections, faqs, services] = await Promise.all([
    getTranslations("faq"),
    getTranslations("common"),
    getPageSections("faq", locale),
    getFaqs({}, locale),
    getServices(locale),
  ]);
  const hero = sections.find(({ sectionKey }) => sectionKey === "hero")?.content;
  const questions = faqs.filter(({ question, answerHtml }) => question.trim() && answerHtml.trim());
  const categories = new Map<string, Faq[]>();
  for (const item of questions) {
    const category = item.category?.trim() || "general";
    const group = categories.get(category) ?? [];
    group.push(item);
    categories.set(category, group);
  }
  const groups = [...categories].map(([id, items]) => ({
    id,
    items,
    title:
      categories.size === 1
        ? ""
        : id === "general"
          ? t("general")
          : services.find(({ slug }) => slug === id)?.title ??
            id.replace(/[-_]+/g, " ").replace(/^./, (letter) => letter.toLocaleUpperCase(locale)),
  }));

  const questionCountFormatted = formatNumber(questions.length, locale, { useGrouping: false });

  return (
    <main id="main-content" className="relative bg-bg text-text">
      {questions.length ? <JsonLd data={faqPageJsonLd(questions)} /> : null}

      {/* Distinctive Daylight Magma Hero */}
      <section className="faq-hero">
        <div className="container-lava relative">
          <div className="grid items-end gap-[var(--space-split)] lg:grid-cols-12">
            <div className="flex flex-col items-start gap-[var(--space-copy)] lg:col-span-8">
              <div className="flex flex-wrap items-center gap-3">
                <p className="kicker-rule">{hero?.eyebrow || t("title")}</p>
                {questions.length > 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-line-lava bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-text tabular-nums">
                    <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
                    <span>
                      {locale === "ar"
                        ? `${questionCountFormatted} ${questions.length === 1 ? "سؤال" : questions.length <= 10 ? "أسئلة" : "سؤالًا"}`
                        : `${questionCountFormatted} ${questions.length === 1 ? "question" : "questions"}`}
                    </span>
                  </span>
                ) : null}
              </div>
              <h1 className="text-display-xl max-w-[16ch] text-text">
                <HighlightTitle text={hero?.title || t("title")} />
              </h1>
              {hero?.description ? (
                <p className="text-lead max-w-[54ch]">{hero.description}</p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:col-span-4 lg:justify-end">
              <ActionLink href="/contact" variant="secondary" size="md">
                {common("getInTouch")}
              </ActionLink>
              <ActionLink href="/quote" size="md">
                {common("requestQuote")}
              </ActionLink>
            </div>
          </div>
        </div>
      </section>

      {/* Search + Questions FIRST (for immediate mobile access), sticky obsidian Help Card beside on desktop */}
      <PageSection>
        <div className="grid items-start gap-[var(--space-split)] lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-8">
            <FaqGroups groups={groups} locale={locale} />
          </div>

          <Reveal mode="block" className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:col-span-4">
            <aside className="faq-help-card surface-dark flex flex-col items-start gap-5">
              <span
                aria-hidden="true"
                className="grid size-12 place-items-center rounded-[14px] border border-lava-400/35 bg-lava-500/20 text-lava-300"
              >
                <MessageCircleQuestion size={23} strokeWidth={1.65} />
              </span>
              <div className="space-y-2">
                <h2 className="font-display text-xl font-semibold text-ash-50">{t("stillHaveQuestions")}</h2>
                <p className="text-sm leading-relaxed text-ink-200">{t("stillBody")}</p>
              </div>
              <div className="flex w-full flex-col gap-2.5 pt-1 sm:flex-row lg:flex-col">
                <ActionLink href="/contact" variant="inverse" size="md" fullWidth>
                  {common("getInTouch")}
                </ActionLink>
                <ActionLink href="/quote" variant="outline" size="md" fullWidth>
                  {common("requestQuote")}
                </ActionLink>
              </div>
            </aside>
          </Reveal>
        </div>
      </PageSection>
    </main>
  );
}
