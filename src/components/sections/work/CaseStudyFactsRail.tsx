import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Chip } from "../process/kit";
import type { AppLocale } from "@/i18n/routing";
import { formatNumber } from "@/lib/i18n-content";
import type { ProjectDetail } from "@/server/queries";

export interface CaseStudyFactsRailProps {
  locale: AppLocale;
  project: ProjectDetail;
  labels: {
    overview: string;
    client: string;
    country: string;
    industry: string;
    year: string;
    duration: string;
    services: string;
    technologies: string;
    visitSite: string;
    appStore: string;
    playStore: string;
    openInNewTab: string;
  };
}

export function CaseStudyFactsRail({ locale, project, labels }: CaseStudyFactsRailProps) {
  const isRtl = locale === "ar";
  const facts: Array<{ label: string; value: string; mono?: boolean }> = [];

  if (project.clientName) {
    facts.push({ label: labels.client, value: project.clientName });
  }
  if (project.clientCountryName) {
    facts.push({ label: labels.country, value: project.clientCountryName });
  }
  if (project.industry) {
    facts.push({ label: labels.industry, value: project.industry });
  }
  if (project.year) {
    facts.push({
      label: labels.year,
      value: formatNumber(project.year, locale, { useGrouping: false }),
      mono: true,
    });
  }
  if (project.duration) {
    facts.push({ label: labels.duration, value: project.duration });
  }

  const externalLinks = [
    project.liveUrl ? { href: project.liveUrl, label: labels.visitSite } : null,
    project.appStoreUrl ? { href: project.appStoreUrl, label: labels.appStore } : null,
    project.playStoreUrl ? { href: project.playStoreUrl, label: labels.playStore } : null,
  ].filter((item): item is { href: string; label: string } => item !== null);

  const hasLowerTier =
    project.services.length > 0 ||
    project.technologies.length > 0 ||
    externalLinks.length > 0;

  if (facts.length === 0 && !hasLowerTier) return null;

  const factsColsClass =
    facts.length >= 5
      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
      : facts.length === 4
        ? "grid-cols-2 lg:grid-cols-4"
        : facts.length === 3
          ? "grid-cols-1 sm:grid-cols-3"
          : "grid-cols-1 sm:grid-cols-2";

  return (
    <section aria-label={labels.overview} className="py-6 sm:py-8">
      <div className="container-lava">
        <div className="overflow-hidden rounded-[var(--radius-xl)] border border-line bg-surface shadow-card">
          {/* Tier 1: Balanced horizontal project dossier bar — zero orphan empty cells */}
          {facts.length > 0 ? (
            <dl className={`grid ${factsColsClass} divide-y divide-line sm:divide-y-0 lg:divide-x rtl:lg:divide-x-reverse`}>
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="flex flex-col gap-1.5 px-5 py-4 sm:px-6 sm:py-5 [&:last-child:nth-child(odd)]:col-span-2 sm:[&:last-child:nth-child(odd)]:col-span-1"
                >
                  <dt className="text-[11px] font-semibold tracking-[0.1em] text-faint uppercase rtl:tracking-normal rtl:normal-case">
                    {fact.label}
                  </dt>
                  <dd
                    className={
                      fact.mono
                        ? "font-display text-base font-bold text-text tabular-nums sm:text-lg"
                        : "text-sm font-semibold text-text sm:text-[0.95rem]"
                    }
                  >
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          {/* Tier 2: Services, Technologies & Live Links */}
          {hasLowerTier ? (
            <div className="grid grid-cols-1 gap-6 border-t border-line bg-pearl-100/70 px-5 py-5 sm:px-6 sm:py-6 lg:grid-cols-12 lg:items-center">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-9">
                {project.services.length > 0 ? (
                  <div className="space-y-2.5">
                    <h2 className="text-[11px] font-semibold tracking-[0.1em] text-faint uppercase rtl:tracking-normal rtl:normal-case">
                      {labels.services}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {project.services.map((service) => (
                        <Link
                          key={service.id}
                          href={`/services/${service.slug}`}
                          data-cursor="pointer"
                          className="group inline-flex items-center gap-1.5 rounded-pill border border-line-strong bg-surface px-3.5 py-1.5 text-xs font-semibold text-text transition-colors hover:border-line-lava-strong hover:text-accent-text"
                        >
                          <span>{service.title}</span>
                          <ArrowUpRight
                            aria-hidden="true"
                            className="rtl-flip size-3 text-faint transition-colors group-hover:text-accent-text"
                          />
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}

                {project.technologies.length > 0 ? (
                  <div className="space-y-2.5">
                    <h2 className="text-[11px] font-semibold tracking-[0.1em] text-faint uppercase rtl:tracking-normal rtl:normal-case">
                      {labels.technologies}
                    </h2>
                    <div className="flex flex-wrap gap-1.5">
                      {project.technologies.map((tech) => (
                        <Chip key={tech.slug} className="bg-surface">
                          <span dir="ltr" className="inline-flex items-center gap-1.5">
                            {tech.icon ? (
                              <Image
                                src={tech.icon.url}
                                alt=""
                                width={14}
                                height={14}
                                className="h-3.5 w-3.5 object-contain"
                              />
                            ) : null}
                            <span>{tech.name}</span>
                          </span>
                        </Chip>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              {externalLinks.length > 0 ? (
                <div className="flex flex-col items-start gap-2.5 border-t border-line pt-4 lg:col-span-3 lg:items-end lg:border-s lg:border-t-0 lg:ps-6 lg:pt-0">
                  <span className="text-[11px] font-semibold tracking-[0.1em] text-faint uppercase rtl:tracking-normal rtl:normal-case">
                    {isRtl ? "روابط مباشرة" : "Live links"}
                  </span>
                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    {externalLinks.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-cursor="pointer"
                        aria-label={`${link.label} (${labels.openInNewTab})`}
                        className="group inline-flex h-10 items-center gap-2 rounded-pill border border-line-lava bg-surface px-4 text-xs font-semibold text-accent-text shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-line-lava-strong hover:bg-[color-mix(in_oklab,var(--lava-500)_8%,white)] hover:shadow-card sm:text-sm"
                      >
                        <span>{link.label}</span>
                        <ArrowUpRight
                          aria-hidden="true"
                          className="rtl-flip size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:group-hover:-translate-x-0.5"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
