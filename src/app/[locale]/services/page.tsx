import { getTranslations, setRequestLocale } from "next-intl/server";
import { ActionLink } from "@/components/ui/ActionLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServiceRows } from "@/components/sections/services/ServiceRows";
import { conversionMetadata } from "@/components/sections/forms/page-data";
import { CodeTexture } from "@/experience/fx/CodeTexture";
import { LavaDivider } from "@/experience/fx/LavaDivider";
import { getPageSections, getServiceBySlug, getServices, getTechnologies } from "@/server/queries";
import type { AppLocale } from "@/i18n/routing";
import "@/components/sections/forms/conversion.css";
import "@/components/sections/services/services.css";

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const [t, sections] = await Promise.all([getTranslations({ locale, namespace: "services" }), getPageSections("services", locale)]);
  return conversionMetadata(locale, "services", t("title"), sections.find(({ sectionKey }) => sectionKey === "hero")?.content.description);
}

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, common, sections, services, technologies] = await Promise.all([
    getTranslations("services"), getTranslations("common"), getPageSections("services", locale), getServices(locale), getTechnologies({}, locale),
  ]);
  const hero = sections.find(({ sectionKey }) => sectionKey === "hero")?.content;
  const intro = sections.find(({ sectionKey }) => sectionKey === "intro")?.content;
  const cta = sections.find(({ sectionKey }) => sectionKey === "cta")?.content;
  const rows = await Promise.all(services.map(async (summary) => ({ summary, detail: await getServiceBySlug(summary.slug, locale) })));

  return (
    <main id="main-content" className="conversion-frame service-catalog-frame">
      <div className="conversion-container service-page">
        <div className="service-catalog-hero">
          <div className="service-catalog-atmosphere"><CodeTexture opacity={0.24} /></div>
          <SectionHeading as="h1" size="lg" kicker={hero?.eyebrow} title={hero?.title || t("title")} lead={hero?.description} animated={false} />
        </div>
        <section className="service-catalog" aria-label={t("allServices")}>
          {intro ? <SectionHeading title={intro.title || t("allServices")} lead={intro.description}
            size="sm" layout="split" animated={false} /> : null}
          {rows.length ? <ServiceRows services={rows} technologies={technologies} locale={locale} /> :
            <p className="border-y border-line py-6 text-muted">{t("empty")}</p>}
        </section>
        {cta ? <section className="service-cta">
          <LavaDivider variant="seam" />
          <SectionHeading kicker={cta.eyebrow} title={cta.title || common("discussProject")} lead={cta.description} size="md" layout="split"
            animated={false} action={<ActionLink href="/quote" magnetic>{cta.ctaLabel || common("requestQuote")}</ActionLink>} />
        </section> : null}
      </div>
    </main>
  );
}
