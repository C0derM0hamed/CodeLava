import { Check, Clock } from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ActionLink } from "@/components/ui/ActionLink";
import { ArrowLeftIcon, ArrowUpRightIcon } from "@/components/ui/Icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SplitIntro } from "@/components/ui/SplitIntro";
import { Tag } from "@/components/ui/Tag";
import { cn } from "@/components/ui/cn";
import { FaqGroups } from "@/components/sections/faq/FaqGroups";
import { PageSection, Panel } from "@/components/sections/forms/page-kit";
import { HighlightTitle } from "@/components/sections/process/kit";
import { StepIcon } from "@/components/sections/process/step-icon";
import { serviceDisciplines } from "@/components/sections/services/disciplines";
import { ServiceIcon } from "@/components/sections/services/service-icons";
import { ServiceImage } from "@/components/sections/services/ServiceImage";
import { ServiceTiles } from "@/components/sections/services/ServiceTiles";
import { TechnologyLogo } from "@/components/sections/technologies/TechnologyLogo";
import { Reveal } from "@/experience/fx/Reveal";
import { WaveBand } from "@/experience/fx/WaveBand";
import { Link } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { JsonLd, breadcrumbListJsonLd, serviceJsonLd } from "@/lib/jsonld";
import { formatNumber } from "@/lib/i18n-content";
import { buildMetadata, localizedPath } from "@/lib/seo";
import { getAllSlugs, getFaqs, getProcessSteps, getServiceBySlug, getServices, getTechnologies } from "@/server/queries";
import "@/components/sections/forms/conversion.css";
import "@/components/sections/services/services.css";

type Props = { params: Promise<{ locale: AppLocale; slug: string }> };

export async function generateStaticParams({ params }: { params: { locale?: string } }) {
  const locales = hasLocale(routing.locales, params.locale) ? [params.locale] : routing.locales;
  const { services } = await getAllSlugs();
  return locales.flatMap((locale) => services.map(({ slug }) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const service = await getServiceBySlug(slug, locale);
  if (!service) notFound();
  return buildMetadata({
    locale,
    path: `/services/${slug}`,
    title: service.seo.title || service.title,
    description: service.seo.description || service.summary || service.tagline,
    image: service.seo.image ?? service.cover,
    canonical: service.seo.canonical,
    noindex: service.seo.noindex,
  });
}

export default async function ServicePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const service = await getServiceBySlug(slug, locale);
  if (!service) notFound();
  const [t, common, processCopy, faqCopy, workCopy, nav, homeCopy, steps, faqs, allServices, technologies] =
    await Promise.all([
      getTranslations("services"),
      getTranslations("common"),
      getTranslations("process"),
      getTranslations("faq"),
      getTranslations("work"),
      getTranslations("nav"),
      getTranslations("home"),
      getProcessSteps(locale),
      getFaqs({ category: slug }, locale),
      getServices(locale),
      getTechnologies({}, locale),
    ]);
  const quoteHref = `/quote?service=${encodeURIComponent(slug)}`;
  const url = localizedPath(locale, `/services/${slug}`);
  const serviceQuestions = faqs.filter(({ question, answerHtml }) => question && answerHtml);
  const projects = service.relatedProjects;
  const visibleSteps = steps.filter(({ title }) => title.trim()).slice(0, 4);
  const related = allServices.filter((item) => item.slug !== slug).slice(0, 3);
  const stack = technologies.filter(({ category }) => serviceDisciplines[slug]?.includes(category)).slice(0, 12);
  const hasBody = Boolean(service.bodyHtml);
  const hasDeliverables = service.deliverables.length > 0;

  // Smart project grid layout — eliminates single orphaned cards on 2- or 4-project services
  const projectGridClass =
    projects.length === 1
      ? "grid-cols-1"
      : projects.length === 2 || projects.length === 4
        ? "grid-cols-1 sm:grid-cols-2"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <main id="main-content" className="relative bg-bg text-text">
      <JsonLd
        data={serviceJsonLd({
          title: service.title,
          serviceType: service.title,
          url,
          language: locale,
          description: service.summary || service.tagline,
          image: service.cover?.url,
        })}
      />
      <JsonLd
        data={breadcrumbListJsonLd([
          { name: nav("home"), url: localizedPath(locale) },
          { name: t("title"), url: localizedPath(locale, "/services") },
          { name: service.title, url },
        ])}
      />

      {/* Distinctive Magma Service Hero */}
      <section className="services-hero">
        <div className="container-lava relative">
          <div className="grid items-center gap-[var(--space-split)] lg:grid-cols-12">
            <div className="flex flex-col items-start gap-[var(--space-copy)] lg:col-span-7">
              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  href="/services"
                  data-cursor="pointer"
                  className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-line-strong bg-surface/90 px-3.5 py-1.5 text-xs font-semibold text-muted shadow-xs backdrop-blur-sm transition-[border-color,color,box-shadow] duration-250 hover:border-line-lava-strong hover:text-accent-text hover:shadow-card"
                >
                  <ArrowLeftIcon size={14} />
                  <span>{t("allServices")}</span>
                </Link>
                {projects.length > 0 ? (
                  <Tag tone="lava" size="md" dot>
                    {t("projectsBadge", { count: service.projectCount })}
                  </Tag>
                ) : null}
              </div>

              <h1 className="text-display-lg max-w-[18ch] text-text">
                <HighlightTitle text={service.title} />
              </h1>

              {service.tagline ? (
                <p className="text-lead max-w-[46ch] text-text/85">{service.tagline}</p>
              ) : null}

              {service.summary && service.summary !== service.tagline ? (
                <p className="max-w-[54ch] text-body text-muted">{service.summary}</p>
              ) : null}

              <div className="flex flex-wrap items-center gap-3.5 pt-[var(--space-cta)]">
                <ActionLink href={quoteHref} size="lg">
                  {common("requestQuote")}
                </ActionLink>
                {projects.length > 0 ? (
                  <ActionLink href="#service-projects" variant="secondary" size="lg">
                    {t("viewServiceProjects")}
                  </ActionLink>
                ) : (
                  <ActionLink href="/contact" variant="secondary" size="lg" arrow="none">
                    {common("getInTouch")}
                  </ActionLink>
                )}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="service-cover-stage">
                {service.cover?.kind === "image" ? (
                  <div className="service-cover">
                    <ServiceImage media={service.cover} priority sizes="(max-width: 1024px) 100vw, 42vw" />
                  </div>
                ) : (
                  <div className="service-emblem" aria-hidden="true">
                    <ServiceIcon name={service.icon} size={88} strokeWidth={1.2} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects built under this service — adaptive balanced grid */}
      {projects.length ? (
        <PageSection labelledBy="service-projects">
          <div className="space-y-[var(--space-heading)]">
            <SectionHeading
              as="h2"
              size="md"
              layout="split"
              kicker={service.title}
              title={t("relatedProjects")}
              lead={t("relatedProjectsLead")}
              titleId="service-projects"
              animated={false}
              action={
                <ActionLink href={`/work?service=${encodeURIComponent(slug)}`} variant="text" size="sm">
                  {t("allInPortfolio")}
                </ActionLink>
              }
            />
            <ul className={cn("grid gap-[var(--space-grid)]", projectGridClass)}>
              {projects.map((project, index) => {
                const yearText = project.year
                  ? formatNumber(project.year, locale, { useGrouping: false })
                  : null;
                const meta = [project.clientName, project.clientCountryName, yearText].filter(Boolean);
                const isSingle = projects.length === 1;
                const spanHero = projects.length === 5 && index === 0;

                return (
                  <Reveal
                    as="li"
                    mode="block"
                    delay={index * 70}
                    key={project.id}
                    className={cn("min-w-0", spanHero && "lg:col-span-2")}
                  >
                    <Link
                      href={`/work/${project.slug}`}
                      data-cursor="view"
                      className={cn(
                        "group flex h-full overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface p-3 shadow-card transition-[transform,box-shadow,border-color] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:border-line-lava hover:shadow-[var(--shadow-lift)] motion-reduce:hover:translate-y-0",
                        isSingle ? "flex-col lg:grid lg:grid-cols-12 lg:items-center lg:gap-4" : "flex-col",
                      )}
                    >
                      <div
                        className={cn(
                          "relative overflow-hidden rounded-[calc(var(--radius-lg)-6px)] bg-pearl-300",
                          isSingle && "lg:col-span-7",
                        )}
                      >
                        {project.cover ? (
                          <ServiceImage
                            media={project.cover}
                            sizes={
                              isSingle
                                ? "(max-width: 1024px) 100vw, 58vw"
                                : projects.length === 2 || projects.length === 4
                                  ? "(max-width: 640px) 100vw, 50vw"
                                  : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            }
                            className="transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="aspect-[16/10] w-full bg-ink-900" />
                        )}
                        {project.highlightMetric ? (
                          <span className="pointer-events-none absolute start-3 bottom-3 inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-white/15 bg-ink-950/88 px-3 py-1.5 text-xs text-ash-50 shadow-card backdrop-blur-md">
                            <span aria-hidden="true" className="size-1.5 rounded-full bg-lava-400" />
                            <strong dir="ltr" className="font-display text-sm font-bold text-lava-300 tabular-nums">
                              {project.highlightMetric.value}
                            </strong>
                            <span className="text-ink-200">{project.highlightMetric.label}</span>
                          </span>
                        ) : null}
                      </div>

                      <div
                        className={cn(
                          "flex flex-1 flex-col gap-2.5 p-3 pt-4",
                          isSingle && "lg:col-span-5 lg:p-6",
                        )}
                      >
                        {meta.length > 0 ? (
                          <p className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-faint">
                            {meta.map((entry, idx) => (
                              <span
                                key={`${entry}-${idx}`}
                                className="inline-flex items-center rounded-[var(--radius-pill)] bg-surface-2 px-2.5 py-0.5 text-muted"
                              >
                                {entry}
                              </span>
                            ))}
                          </p>
                        ) : null}
                        <h3 className="font-display text-xl font-semibold leading-snug text-text transition-colors group-hover:text-accent-text">
                          {project.title}
                        </h3>
                        {project.summary ? (
                          <p className="line-clamp-3 text-sm leading-relaxed text-muted">{project.summary}</p>
                        ) : null}
                        <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-semibold text-accent-text">
                          <span>{workCopy("openCaseStudy")}</span>
                          <ArrowUpRightIcon
                            size={14}
                            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:group-hover:-translate-x-0.5"
                          />
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </ul>
          </div>
        </PageSection>
      ) : null}

      {/* Editorial Narrative + Obsidian Deliverables Spread */}
      {hasBody || hasDeliverables ? (
        <PageSection className={cn(projects.length ? "border-t border-line" : undefined)}>
          <Reveal mode="block">
            <div className="grid items-start gap-[var(--space-split)] lg:grid-cols-12">
              {hasBody ? (
                <article
                  className={cn(
                    "flex flex-col gap-6",
                    hasDeliverables ? "lg:col-span-6 lg:pt-2" : "lg:col-span-12",
                  )}
                >
                  <p className="kicker-rule">{service.title}</p>
                  <div className="service-narrative">
                    <div
                      className="conversion-prose text-[1.125rem] leading-[1.8] [&>p:first-child]:text-text"
                      dangerouslySetInnerHTML={{ __html: service.bodyHtml }}
                    />
                  </div>
                  <div className="pt-2">
                    <ActionLink href={quoteHref} variant="text" size="md">
                      {common("discussProject")}
                    </ActionLink>
                  </div>
                </article>
              ) : null}

              {hasDeliverables ? (
                <aside
                  aria-labelledby="service-deliverables"
                  className={cn(
                    "services-obsidian-card surface-dark",
                    hasBody ? "lg:col-span-6" : "lg:col-span-12",
                  )}
                >
                  <div className="flex items-center justify-between gap-3 border-b border-white/12 pb-4">
                    <h2 id="service-deliverables" className="font-display text-xl font-semibold text-ash-50">
                      {t("deliverables")}
                    </h2>
                    <span
                      dir="ltr"
                      className="inline-flex items-center rounded-[var(--radius-pill)] border border-lava-400/35 bg-lava-500/20 px-2.5 py-0.5 font-mono text-xs font-semibold text-lava-100 tabular-nums"
                    >
                      {formatNumber(service.deliverables.length, locale, {
                        minimumIntegerDigits: locale === "ar" ? 1 : 2,
                        useGrouping: false,
                      })}
                    </span>
                  </div>
                  <ul className="mt-5 divide-y divide-white/[0.08]">
                    {service.deliverables.map((value, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3.5 py-3.5 first:pt-1 last:pb-0 text-[0.95rem] leading-relaxed text-ash-200"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-lava-400/40 bg-lava-500/20 text-lava-300"
                        >
                          <Check size={13} strokeWidth={2.5} />
                        </span>
                        <span>{value}</span>
                      </li>
                    ))}
                  </ul>
                </aside>
              ) : null}
            </div>
          </Reveal>
        </PageSection>
      ) : null}

      {/* What's included — elevated feature cards */}
      {service.features.length ? (
        <PageSection labelledBy="service-features" className="border-t border-line">
          <SplitIntro titleId="service-features" animated={false} kicker={service.title} title={t("features")}>
            <ul className="grid gap-[var(--space-grid)] sm:grid-cols-2">
              {service.features.map(({ title, description, icon }, index) => (
                <Reveal as="li" mode="block" delay={index * 65} key={index} className="min-w-0">
                  <div className="service-feature-card h-full">
                    <div className="flex items-start justify-between gap-3">
                      <span
                        aria-hidden="true"
                        className="grid size-12 place-items-center rounded-[14px] border border-line-lava bg-accent-soft text-accent-text"
                      >
                        <ServiceIcon name={icon} size={23} />
                      </span>
                      <span aria-hidden="true" dir="ltr" className="font-mono text-xs text-faint tabular-nums">
                        {formatNumber(index + 1, locale, {
                          minimumIntegerDigits: locale === "ar" ? 1 : 2,
                          useGrouping: false,
                        })}
                      </span>
                    </div>
                    <h3 className="mt-5 font-display text-lg font-semibold leading-snug text-text">{title}</h3>
                    {description ? <p className="mt-2.5 text-sm leading-relaxed text-muted">{description}</p> : null}
                  </div>
                </Reveal>
              ))}
            </ul>
          </SplitIntro>
        </PageSection>
      ) : null}

      {/* Dark Obsidian Process WaveBand — visual rhythm anchor */}
      {visibleSteps.length ? (
        <WaveBand
          aria-labelledby="service-process"
          rim="both"
          className="my-4 sm:my-8"
          contentClassName="container-lava band-y"
        >
          <div className="space-y-[var(--space-heading)]">
            <SectionHeading
              as="h2"
              size="md"
              layout="split"
              kicker={nav("process")}
              title={processCopy("title")}
              titleId="service-process"
              animated={false}
              action={
                <ActionLink href="/process" variant="inverse" size="sm">
                  {processCopy("seeStages")}
                </ActionLink>
              }
            />

            <div className="relative">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-10 top-12 z-0 hidden h-px bg-[image:var(--gradient-heat-seam)] opacity-85 lg:block"
              />
              <ol className="relative z-10 grid gap-[var(--space-grid)] sm:grid-cols-2 lg:grid-cols-4">
                {visibleSteps.map(({ id, title, description, duration, icon }, index) => (
                  <Reveal as="li" mode="block" delay={index * 75} key={id} className="min-w-0">
                    <div className="relative flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-white/12 bg-[color-mix(in_oklab,var(--ink-800)_84%,var(--ink-900))] p-[var(--space-card)] shadow-[inset_0_1px_0_rgb(255_255_255/0.07)] transition-[border-color,background-color,transform] duration-300 hover:-translate-y-0.5 hover:border-lava-400/50 hover:bg-ink-800 motion-reduce:hover:translate-y-0">
                      <div className="flex items-center justify-between gap-3">
                        <span
                          aria-hidden="true"
                          className="grid size-11 place-items-center rounded-xl border border-lava-400/35 bg-lava-500/18 text-lava-300"
                        >
                          <StepIcon icon={icon} className="size-5" />
                        </span>
                        <span
                          dir="ltr"
                          className="font-mono text-xs font-semibold text-lava-300/90 tabular-nums"
                        >
                          {formatNumber(index + 1, locale, {
                            minimumIntegerDigits: locale === "ar" ? 1 : 2,
                            useGrouping: false,
                          })}
                        </span>
                      </div>
                      <h3 className="mt-5 font-display text-lg font-semibold text-ash-50">{title}</h3>
                      {description ? (
                        <p className="mt-2.5 text-sm leading-relaxed text-ink-200">{description}</p>
                      ) : null}
                      {duration ? (
                        <span className="mt-auto inline-flex w-fit items-center gap-1.5 pt-5 text-xs font-medium text-lava-300">
                          <Clock aria-hidden="true" className="size-3.5" />
                          <span>{duration}</span>
                        </span>
                      ) : null}
                    </div>
                  </Reveal>
                ))}
              </ol>
            </div>
          </div>
        </WaveBand>
      ) : null}

      {/* Technologies with real TechnologyLogo badges */}
      {stack.length ? (
        <PageSection labelledBy="service-tech">
          <Panel as="section" aria-labelledby="service-tech" className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
              <div className="space-y-1">
                <p className="kicker-rule">{nav("technologies")}</p>
                <h2 id="service-tech" className="font-display text-xl font-semibold text-text sm:text-2xl">
                  {t("technologies")}
                </h2>
              </div>
              <ActionLink href="/technologies" variant="text" size="sm">
                {homeCopy("exploreTechnologies")}
              </ActionLink>
            </div>

            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {stack.map((tech) => (
                <li
                  key={tech.slug}
                  className="flex items-center gap-3 rounded-[var(--radius-md)] border border-line bg-surface-2 px-3.5 py-3 transition-[border-color,background-color,transform] duration-250 hover:-translate-y-0.5 hover:border-line-lava hover:bg-surface motion-reduce:hover:translate-y-0"
                >
                  <TechnologyLogo technology={tech} size="sm" bare />
                  <span dir="auto" className="min-w-0 font-display text-sm font-semibold leading-snug text-text">
                    {tech.name}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </PageSection>
      ) : null}

      {/* Service-specific FAQ */}
      {serviceQuestions.length ? (
        <PageSection labelledBy="service-faq" className="border-t border-line">
          <SplitIntro
            titleId="service-faq"
            animated={false}
            alignIntro={serviceQuestions.length <= 2 ? "center" : "start"}
            kicker={nav("faq")}
            title={faqCopy("title")}
            link={{ href: "/faq", label: nav("faq") }}
          >
            <FaqGroups
              groups={[{ id: slug, title: "", items: serviceQuestions }]}
              searchable={false}
              locale={locale}
            />
          </SplitIntro>
        </PageSection>
      ) : null}

      {/* Related Services */}
      {related.length ? (
        <PageSection labelledBy="service-related" className="border-t border-line">
          <SectionHeading
            as="h2"
            size="md"
            layout="split"
            kicker={t("title")}
            title={t("relatedServices")}
            titleId="service-related"
            animated={false}
            action={
              <ActionLink href="/services" variant="text" size="sm">
                {t("allServices")}
              </ActionLink>
            }
          />
          <ServiceTiles
            services={related}
            actionLabel={t("viewService")}
            projectsBadge={(count) => t("projectsBadge", { count })}
            locale={locale}
            className="mt-[var(--space-heading)]"
          />
        </PageSection>
      ) : null}
    </main>
  );
}
