import { getTranslations, setRequestLocale } from "next-intl/server";
import { ActionLink } from "@/components/ui/ActionLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SplitIntro } from "@/components/ui/SplitIntro";
import { conversionMetadata } from "@/components/sections/forms/page-data";
import { PageSection, PageTop, Panel } from "@/components/sections/forms/page-kit";
import { ServiceTiles } from "@/components/sections/services/ServiceTiles";
import { Reveal } from "@/experience/fx/Reveal";
import type { AppLocale } from "@/i18n/routing";
import { formatNumber } from "@/lib/i18n-content";
import { getPageSections, getProcessSteps, getServices } from "@/server/queries";
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
  const [t, common, nav, process, sections, services, steps] = await Promise.all([
    getTranslations("services"), getTranslations("common"), getTranslations("nav"), getTranslations("process"),
    getPageSections("services", locale), getServices(locale), getProcessSteps(locale),
  ]);
  const hero = sections.find(({ sectionKey }) => sectionKey === "hero")?.content;
  const intro = sections.find(({ sectionKey }) => sectionKey === "intro")?.content;
  const visibleSteps = steps.filter(({ title }) => title.trim()).slice(0, 4);

  return (
    <main id="main-content" className="relative bg-bg text-text">
      <PageTop>
        <div className="grid items-start gap-[var(--space-split)] lg:grid-cols-12">
          <div className="lg:col-span-4 lg:pt-3">
            <SectionHeading
              as="h1"
              size="md"
              layout="intro"
              kicker={hero?.eyebrow}
              title={hero?.title || t("title")}
              lead={hero?.description}
              animated={false}
              action={<ActionLink href="/quote" size="md">{common("requestQuote")}</ActionLink>}
            />
          </div>
          <div className="min-w-0 lg:col-span-8">
            {services.length ? (
              <ServiceTiles
                services={services}
                actionLabel={t("viewService")}
                projectsBadge={(count) => t("projectsBadge", { count })}
                featuredFirst
              />
            ) : (
              <Panel className="grid min-h-48 place-items-center text-center text-muted">
                <p>{t("empty")}</p>
              </Panel>
            )}
          </div>
        </div>
      </PageTop>

      {visibleSteps.length ? (
        <PageSection labelledBy="services-process-title">
          <SplitIntro
            titleId="services-process-title"
            animated={false}
            kicker={nav("process")}
            title={intro?.title || process("title")}
            lead={intro?.description}
            link={{ href: "/process", label: process("seeStages") }}
          >
            <Reveal mode="block">
              <ol className="grid gap-[var(--space-grid)] sm:grid-cols-2">
                {visibleSteps.map(({ id, title, description, duration }, index) => (
                  <li key={id} className="rounded-[var(--radius-md)] border border-line bg-surface p-[var(--space-card)] shadow-card">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        aria-hidden="true"
                        className="grid size-9 place-items-center rounded-full border border-line-lava bg-accent-soft text-sm font-semibold text-accent-text tabular-nums"
                      >
                        {formatNumber(index + 1, locale, { minimumIntegerDigits: locale === "ar" ? 1 : 2, useGrouping: false })}
                      </span>
                      {duration ? <span className="text-xs text-faint">{duration}</span> : null}
                    </div>
                    <h3 className="mt-5 font-display text-lg font-semibold text-text">{title}</h3>
                    {description ? <p className="mt-2.5 text-sm leading-relaxed text-muted">{description}</p> : null}
                  </li>
                ))}
              </ol>
            </Reveal>
          </SplitIntro>
        </PageSection>
      ) : null}
    </main>
  );
}
