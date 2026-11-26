import { getTranslations, setRequestLocale } from "next-intl/server";
import { MessageCircleQuestion } from "lucide-react";
import { ActionLink } from "@/components/ui/ActionLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FaqGroups } from "@/components/sections/faq/FaqGroups";
import { conversionMetadata } from "@/components/sections/forms/page-data";
import { IconTile, PageTop, Panel } from "@/components/sections/forms/page-kit";
import type { AppLocale } from "@/i18n/routing";
import { JsonLd, faqPageJsonLd } from "@/lib/jsonld";
import { getFaqs, getPageSections, getServices, type Faq } from "@/server/queries";
import "@/components/sections/forms/conversion.css";

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const [t, sections] = await Promise.all([getTranslations({ locale, namespace: "faq" }), getPageSections("faq", locale)]);
  return conversionMetadata(locale, "faq", t("title"), sections.find(({ sectionKey }) => sectionKey === "hero")?.content.description);
}

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, common, sections, faqs, services] = await Promise.all([
    getTranslations("faq"), getTranslations("common"), getPageSections("faq", locale), getFaqs({}, locale), getServices(locale),
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
    id, items,
    title: categories.size === 1 ? "" : id === "general" ? t("general")
      : services.find(({ slug }) => slug === id)?.title ?? id.replace(/[-_]+/g, " ").replace(/^./, (letter) => letter.toLocaleUpperCase(locale)),
  }));

  return (
    <main id="main-content" className="relative bg-bg text-text">
      {questions.length ? <JsonLd data={faqPageJsonLd(questions)} /> : null}
      <PageTop>
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="flex flex-col gap-8 lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:col-span-4">
            <SectionHeading as="h1" size="md" layout="intro" title={hero?.title || t("title")} kicker={hero?.eyebrow}
              lead={hero?.description} animated={false} />
            <Panel className="flex flex-col items-start gap-4 !p-6">
              <IconTile icon={MessageCircleQuestion} />
              <div>
                <p className="font-display text-lg font-semibold text-text">{t("stillHaveQuestions")}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{t("stillBody")}</p>
              </div>
              <ActionLink href="/contact" variant="secondary" size="sm">{common("getInTouch")}</ActionLink>
            </Panel>
          </div>
          <div className="min-w-0 lg:col-span-8">
            <FaqGroups groups={groups} locale={locale} />
          </div>
        </div>
      </PageTop>
    </main>
  );
}
