import { ArrowDown } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ActionLink } from "@/components/ui/ActionLink";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { conversionMetadata } from "@/components/sections/forms/page-data";
import { PageSection, Panel } from "@/components/sections/forms/page-kit";
import { HighlightTitle } from "@/components/sections/process/kit";
import { ServiceIcon } from "@/components/sections/services/service-icons";
import { ServiceTiles } from "@/components/sections/services/ServiceTiles";
import { Reveal } from "@/experience/fx/Reveal";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { formatNumber } from "@/lib/i18n-content";
import { getPageSections, getProcessSteps, getServices } from "@/server/queries";
import "@/components/sections/forms/conversion.css";
import "@/components/sections/services/services.css";

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const [t, sections] = await Promise.all([
    getTranslations({ locale, namespace: "services" }),
    getPageSections("services", locale),
  ]);
  return conversionMetadata(
    locale,
    "services",
    t("title"),
    sections.find(({ sectionKey }) => sectionKey === "hero")?.content.description,
  );
}

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, common, nav, process, sections, services, steps] = await Promise.all([
    getTranslations("services"),
    getTranslations("common"),
    getTranslations("nav"),
    getTranslations("process"),
    getPageSections("services", locale),
    getServices(locale),
    getProcessSteps(locale),
  ]);
  const hero = sections.find(({ sectionKey }) => sectionKey === "hero")?.content;
  const intro = sections.find(({ sectionKey }) => sectionKey === "intro")?.content;
  const visibleSteps = steps.filter(({ title }) => title.trim()).slice(0, 4);
  const totalProjects = services.reduce((sum, s) => sum + (s.projectCount ?? 0), 0);

  return (
    <main id="main-content" className="relative bg-bg text-text">
      {/* Distinctive Daylight Magma Hero */}
      <section className="services-hero">
        <div className="container-lava relative">
          <div className="grid items-center gap-[var(--space-split)] lg:grid-cols-12">
            <div className="flex flex-col items-start gap-[var(--space-copy)] lg:col-span-7">
              <p className="kicker-rule">{hero?.eyebrow || t("title")}</p>
              <h1 className="text-display-xl max-w-[16ch] text-text">
                <HighlightTitle text={hero?.title || t("title")} />
              </h1>
              {hero?.description ? (
                <p className="text-lead max-w-[52ch]">{hero.description}</p>
              ) : null}
              <div className="flex flex-wrap items-center gap-3.5 pt-[var(--space-cta)]">
                <ActionLink href="/quote" size="lg">
                  {common("requestQuote")}
                </ActionLink>
                {services.length > 0 ? (
                  <a
                    href="#services-catalog"
                    data-cursor="pointer"
                    className="group inline-flex h-14 items-center gap-2.5 rounded-[var(--radius-pill)] border border-line-strong bg-surface px-7 text-base font-semibold text-text shadow-xs transition-[transform,box-shadow,border-color] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:border-line-lava-strong hover:shadow-card motion-reduce:hover:translate-y-0"
                  >
                    <span>{t("allServices")}</span>
                    <ArrowDown aria-hidden="true" className="size-4 text-accent-text transition-transform duration-300 group-hover:translate-y-0.5" />
                  </a>
                ) : null}
              </div>
            </div>

            {services.length > 0 ? (
              <Reveal mode="block" immediate className="lg:col-span-5">
                <aside className="services-obsidian-card surface-dark">
                  <div className="flex items-center justify-between gap-3 border-b border-white/12 pb-4">
                    <span className="text-sm font-semibold text-ash-50">{t("allServices")}</span>
                    <div className="flex items-center gap-2">
                      <span
                        dir="ltr"
                        className="inline-flex items-center rounded-[var(--radius-pill)] border border-white/14 bg-white/[0.06] px-2.5 py-0.5 font-mono text-xs font-semibold text-ash-200 tabular-nums"
                      >
                        {formatNumber(services.length, locale, { minimumIntegerDigits: locale === "ar" ? 1 : 2, useGrouping: false })}
                      </span>
                      {totalProjects > 0 ? (
                        <span className="inline-flex items-center rounded-[var(--radius-pill)] border border-lava-400/35 bg-lava-500/20 px-2.5 py-0.5 text-xs font-semibold text-lava-100 tabular-nums">
                          {t("projectsBadge", { count: totalProjects })}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <ol className="mt-3 divide-y divide-white/[0.08]">
                    {services.map((service, index) => (
                      <li key={service.id}>
                        <Link
                          href={`/services/${service.slug}`}
                          data-cursor="pointer"
                          className="services-index-link group"
                        >
                          <span
                            aria-hidden="true"
                            className="grid size-8 shrink-0 place-items-center rounded-[10px] border border-white/12 bg-white/[0.05] text-lava-400 transition-colors duration-250 group-hover:border-lava-400/50 group-hover:bg-lava-500/20 group-hover:text-lava-100"
                          >
                            <ServiceIcon name={service.icon} size={16} />
                          </span>
                          <span className="min-w-0 flex-1 font-display text-[0.95rem] font-semibold leading-snug text-ash-50 transition-colors group-hover:text-lava-300">
                            {service.title}
                          </span>
                          {service.projectCount > 0 ? (
                            <span className="hidden shrink-0 text-xs font-medium text-ink-300 tabular-nums sm:inline">
                              {t("projectsBadge", { count: service.projectCount })}
                            </span>
                          ) : (
                            <span dir="ltr" className="hidden shrink-0 font-mono text-xs text-ink-300 tabular-nums sm:inline">
                              {formatNumber(index + 1, locale, { minimumIntegerDigits: locale === "ar" ? 1 : 2, useGrouping: false })}
                            </span>
                          )}
                          <ArrowRightIcon
                            size={14}
                            className="text-ink-300 transition-[transform,color] duration-300 group-hover:translate-x-0.5 group-hover:text-lava-300 rtl:group-hover:-translate-x-0.5"
                          />
                        </Link>
                      </li>
                    ))}
                  </ol>
                </aside>
              </Reveal>
            ) : null}
          </div>
        </div>
      </section>

      {/* Full-width Services Grid */}
      <PageSection labelledBy="services-catalog">
        <div id="services-catalog" className="scroll-mt-[calc(var(--header-h)+2rem)]">
          {services.length ? (
            <ServiceTiles
              services={services}
              actionLabel={t("viewService")}
              projectsBadge={(count) => t("projectsBadge", { count })}
              featuredFirst
              locale={locale}
            />
          ) : (
            <Panel className="grid min-h-48 place-items-center text-center text-muted">
              <p>{t("empty")}</p>
            </Panel>
          )}
        </div>
      </PageSection>

      {/* Process Preview — Architectural 4-step strip with horizontal magma connector */}
      {visibleSteps.length ? (
        <PageSection labelledBy="services-process-title" className="border-t border-line">
          <div className="space-y-[var(--space-heading)]">
            <SectionHeading
              as="h2"
              size="md"
              layout="split"
              kicker={nav("process")}
              title={intro?.title || process("title")}
              lead={intro?.description}
              titleId="services-process-title"
              animated={false}
              action={
                <ActionLink href="/process" variant="text" size="sm">
                  {process("seeStages")}
                </ActionLink>
              }
            />

            <div className="relative">
              {/* Subtle connecting filament on desktop */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-10 top-11 hidden h-px bg-[image:var(--gradient-heat-seam)] opacity-55 lg:block"
              />
              <ol className="grid gap-[var(--space-grid)] sm:grid-cols-2 lg:grid-cols-4">
                {visibleSteps.map(({ id, title, description, duration }, index) => (
                  <Reveal as="li" mode="block" delay={index * 70} key={id} className="min-w-0">
                    <div className="services-step-card flex h-full flex-col">
                      <div className="flex items-center justify-between gap-3">
                        <span
                          aria-hidden="true"
                          dir="ltr"
                          className="grid size-10 place-items-center rounded-full border border-line-lava bg-accent-soft font-mono text-sm font-semibold text-accent-text tabular-nums"
                        >
                          {formatNumber(index + 1, locale, {
                            minimumIntegerDigits: locale === "ar" ? 1 : 2,
                            useGrouping: false,
                          })}
                        </span>
                        {duration ? <Tag tone="lava">{duration}</Tag> : null}
                      </div>
                      <h3 className="mt-6 font-display text-lg font-semibold leading-snug text-text">
                        {title}
                      </h3>
                      {description ? (
                        <p className="mt-2.5 text-sm leading-relaxed text-muted">{description}</p>
                      ) : null}
                    </div>
                  </Reveal>
                ))}
              </ol>
            </div>
          </div>
        </PageSection>
      ) : null}
    </main>
  );
}
