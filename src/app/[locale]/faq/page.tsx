import { getTranslations, setRequestLocale } from "next-intl/server";
import { ActionLink } from "@/components/ui/ActionLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FaqGroups } from "@/components/sections/faq/FaqGroups";
import { conversionMetadata } from "@/components/sections/forms/page-data";
import type { AppLocale } from "@/i18n/routing";
import { JsonLd, faqPageJsonLd } from "@/lib/jsonld";
import { getFaqs, getPageSections, getServices, type Faq } from "@/server/queries";
import "@/components/sections/forms/conversion.css";
import "@/components/sections/services/services.css";

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
    title: id === "general" ? t("general")
      : services.find(({ slug }) => slug === id)?.title ?? id.replace(/[-_]+/g, " ").replace(/^./, (letter) => letter.toLocaleUpperCase(locale)),
  }));

  return (
    <main id="main-content" className="conversion-frame">
      {questions.length ? <JsonLd data={faqPageJsonLd(questions)} /> : null}
      <div className="conversion-container faq-page">
        <div className="faq-editorial">
          <SectionHeading as="h1" title={hero?.title || t("title")} kicker={hero?.eyebrow} lead={hero?.description} animated={false} />
          <div className="faq-contact">
            <p className="text-muted">{t("stillHaveQuestions")}</p>
            <ActionLink href="/contact">{common("getInTouch")}</ActionLink>
          </div>
        </div>
        <FaqGroups groups={groups} locale={locale} />
      </div>
    </main>
  );
}
