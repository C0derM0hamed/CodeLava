import { Check } from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ActionLink } from "@/components/ui/ActionLink";
import { ArrowLeftIcon, ArrowUpRightIcon } from "@/components/ui/Icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SplitIntro } from "@/components/ui/SplitIntro";
import { Tag } from "@/components/ui/Tag";
import { FaqGroups } from "@/components/sections/faq/FaqGroups";
import { PageSection, PageTop, Panel } from "@/components/sections/forms/page-kit";
import { serviceDisciplines } from "@/components/sections/services/disciplines";
import { ServiceIcon } from "@/components/sections/services/service-icons";
import { ServiceImage } from "@/components/sections/services/ServiceImage";
import { ServiceTiles } from "@/components/sections/services/ServiceTiles";
import { Reveal } from "@/experience/fx/Reveal";
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
  const [t, common, processCopy, faqCopy, workCopy, nav, steps, faqs, allServices, technologies] = await Promise.all([
    getTranslations("services"),
    getTranslations("common"),
    getTranslations("process"),
    getTranslations("faq"),
    getTranslations("work"),
    getTranslations("nav"),
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

      <PageTop>
        <div className="grid items-center gap-[var(--space-split)] lg:grid-cols-12">
          <div className="flex flex-col items-start gap-[var(--space-copy)] lg:col-span-7">
            <div className="flex flex-wrap items-center gap-3">
              <ActionLink href="/services" variant="text" size="sm" arrow="none">
                <span className="inline-flex items-center gap-2">
                  <ArrowLeftIcon size={15} />
                  {t("allServices")}
                </span>
              </ActionLink>
              {projects.length > 0 ? (
                <Tag tone="lava" size="md">
                  {t("projectsBadge", { count: service.projectCount })}
                </Tag>
              ) : null}
            </div>
            <SectionHeading
              as="h1"
              size="lg"
              layout="intro"
              title={service.title}
              lead={service.tagline || service.summary}
              animated={false}
              className="max-w-[40rem]"
            />
            {service.tagline && service.summary ? (
              <p className="max-w-[54ch] text-body text-muted">{service.summary}</p>
            ) : null}
            <div className="pt-[var(--space-cta)] flex flex-wrap items-center gap-3.5">
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
            {service.cover?.kind === "image" ? (
              <div className="service-cover">
                <ServiceImage media={service.cover} priority sizes="(max-width: 1024px) 100vw, 40vw" />
              </div>
            ) : (
              <div className="service-emblem" aria-hidden="true">
                <ServiceIcon name={service.icon} size={88} strokeWidth={1.2} />
              </div>
            )}
          </div>
        </div>
      </PageTop>

      {/* Projects built under this service — prominently surfaced at the top of the section */}
      {projects.length ? (
        <PageSection labelledBy="service-projects" className="!pt-0 sm:!pt-0 lg:!pt-0">
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
            <ul className="grid gap-[var(--space-grid)] sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, index) => {
                const yearText = project.year
                  ? formatNumber(project.year, locale, { useGrouping: false })
                  : null;
                const meta = [project.clientName, project.clientCountryName, yearText].filter(Boolean);
                return (
                  <Reveal as="li" mode="block" delay={index * 70} key={project.id} className="min-w-0">
                    <Link
                      href={`/work/${project.slug}`}
                      data-cursor="view"
                      className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface p-3 shadow-card transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-line-lava hover:shadow-[var(--shadow-lift)] motion-reduce:hover:translate-y-0"
                    >
                      <div className="relative overflow-hidden rounded-[calc(var(--radius-lg)-6px)] bg-pearl-300">
                        {project.cover ? (
                          <ServiceImage
                            media={project.cover}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="aspect-[16/10] w-full bg-ink-900" />
                        )}
                        {project.highlightMetric ? (
                          <span className="pointer-events-none absolute start-3 bottom-3 rounded-[var(--radius-sm)] border border-white/15 bg-ink-950/85 px-3 py-1.5 text-xs text-ash-50 shadow-card backdrop-blur-md">
                            <strong dir="ltr" className="font-display text-sm font-bold text-lava-300 tabular-nums">
                              {project.highlightMetric.value}
                            </strong>{" "}
                            <span className="text-ink-200">{project.highlightMetric.label}</span>
                          </span>
                        ) : null}
                      </div>

                      <div className="flex flex-1 flex-col gap-2.5 p-3 pt-4">
                        {meta.length > 0 ? (
                          <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium text-faint">
                            {meta.map((entry, idx) => (
                              <span key={`${entry}-${idx}`} className="inline-flex items-center gap-2">
                                {idx > 0 ? <span aria-hidden="true">·</span> : null}
                                <span>{entry}</span>
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

      {hasBody || hasDeliverables ? (
        <PageSection className={projects.length ? undefined : "!pt-0 sm:!pt-0 lg:!pt-0"}>
          <Reveal mode="block">
            <div className="grid gap-[var(--space-grid)] lg:grid-cols-12">
              {hasBody ? (
                <Panel as="article" className={hasDeliverables ? "lg:col-span-7" : "lg:col-span-12"}>
                  <div
                    className="conversion-prose text-[1.0625rem] leading-[1.75]"
                    dangerouslySetInnerHTML={{ __html: service.bodyHtml }}
                  />
                </Panel>
              ) : null}
              {hasDeliverables ? (
                <Panel as="section" aria-labelledby="service-deliverables" className={hasBody ? "lg:col-span-5" : "lg:col-span-12"}>
                  <h2 id="service-deliverables" className="font-display text-xl font-semibold text-text">
                    {t("deliverables")}
                  </h2>
                  <ul className="mt-6 grid gap-4">
                    {service.deliverables.map((value, index) => (
                      <li key={index} className="flex items-start gap-3.5 text-[0.9375rem] leading-relaxed text-text">
                        <span
                          aria-hidden="true"
                          className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-accent-soft-strong text-accent-text"
                        >
                          <Check size={13} strokeWidth={2.4} />
                        </span>
                        <span>{value}</span>
                      </li>
                    ))}
                  </ul>
                </Panel>
              ) : null}
            </div>
          </Reveal>
        </PageSection>
      ) : null}

      {service.features.length ? (
        <PageSection labelledBy="service-features">
          <SplitIntro titleId="service-features" animated={false} kicker={service.title} title={t("features")}>
            <Reveal mode="block">
              <ul className="grid gap-[var(--space-grid)] sm:grid-cols-2">
                {service.features.map(({ title, description, icon }, index) => (
                  <li key={index} className="rounded-[var(--radius-md)] border border-line bg-surface p-[var(--space-card)] shadow-card">
                    <span aria-hidden="true" className="grid size-12 place-items-center rounded-[14px] bg-accent-soft text-accent-text">
                      <ServiceIcon name={icon} size={23} />
                    </span>
                    <h3 className="mt-5 font-display text-lg font-semibold leading-snug text-text">{title}</h3>
                    {description ? <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p> : null}
                  </li>
                ))}
              </ul>
            </Reveal>
          </SplitIntro>
        </PageSection>
      ) : null}

      {visibleSteps.length ? (
        <PageSection labelledBy="service-process">
          <SplitIntro
            titleId="service-process"
            animated={false}
            reverse
            kicker={nav("process")}
            title={processCopy("title")}
            link={{ href: "/process", label: processCopy("seeStages") }}
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
                      {duration ? <Tag tone="lava">{duration}</Tag> : null}
                    </div>
                    <h3 className="mt-5 font-display text-lg font-semibold text-text">{title}</h3>
                    {description ? <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p> : null}
                  </li>
                ))}
              </ol>
            </Reveal>
          </SplitIntro>
        </PageSection>
      ) : null}

      {stack.length ? (
        <PageSection className="!py-0">
          <Panel
            as="section"
            aria-labelledby="service-tech"
            className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-10"
          >
            <h2 id="service-tech" className="font-display text-xl font-semibold text-text sm:max-w-[16ch]">
              {t("technologies")}
            </h2>
            <ul className="flex flex-wrap gap-2.5 sm:justify-end">
              {stack.map(({ slug: techSlug, name }) => (
                <li key={techSlug}>
                  <Tag tone="default" size="md">
                    {name}
                  </Tag>
                </li>
              ))}
            </ul>
          </Panel>
        </PageSection>
      ) : null}

      {serviceQuestions.length ? (
        <PageSection labelledBy="service-faq">
          <SplitIntro
            titleId="service-faq"
            animated={false}
            kicker={nav("faq")}
            title={faqCopy("title")}
            link={{ href: "/faq", label: nav("faq") }}
          >
            <FaqGroups groups={[{ id: slug, title: "", items: serviceQuestions }]} searchable={false} locale={locale} />
          </SplitIntro>
        </PageSection>
      ) : null}

      {related.length ? (
        <PageSection labelledBy="service-related">
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
            className="mt-[var(--space-heading)]"
          />
        </PageSection>
      ) : null}
    </main>
  );
}
