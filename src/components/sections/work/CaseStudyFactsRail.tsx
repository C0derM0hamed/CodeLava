import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Chip, TextLink } from "../process/kit";
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

  const hasContent =
    facts.length > 0 ||
    project.services.length > 0 ||
    project.technologies.length > 0 ||
    externalLinks.length > 0;

  if (!hasContent) return null;

  return (
    <section aria-label={labels.overview} className="py-8 sm:py-10">
      <div className="container-lava">
        <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-6 shadow-card sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Core facts columns */}
            {facts.length > 0 ? (
              <dl className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 lg:col-span-7 lg:grid-cols-3">
                {facts.map((fact) => (
                  <div key={fact.label} className="space-y-1.5 border-s border-line ps-4">
                    <dt className="text-xs font-semibold text-faint">{fact.label}</dt>
                    <dd
                      className={
                        fact.mono
                          ? "text-base font-semibold text-text tabular-nums"
                          : "text-sm font-semibold text-text sm:text-base"
                      }
                    >
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {/* Services, Technologies & Live links */}
            <div
              className={
                facts.length > 0
                  ? "flex flex-col justify-between gap-6 border-t border-line pt-6 lg:col-span-5 lg:border-s lg:border-t-0 lg:ps-8 lg:pt-0"
                  : "flex flex-col justify-between gap-6 lg:col-span-12"
              }
            >
              <div className="space-y-5">
                {project.services.length > 0 ? (
                  <div className="space-y-2.5">
                    <h2 className="text-xs font-semibold text-faint">{labels.services}</h2>
                    <div className="flex flex-wrap gap-2">
                      {project.services.map((service) => (
                        <Link
                          key={service.id}
                          href={`/services/${service.slug}`}
                          data-cursor="pointer"
                          className="inline-flex items-center rounded-pill border border-line-strong bg-surface px-3.5 py-1.5 text-xs font-medium text-text transition-colors hover:border-line-lava-strong hover:text-accent-text"
                        >
                          {service.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}

                {project.technologies.length > 0 ? (
                  <div className="space-y-2.5">
                    <h2 className="text-xs font-semibold text-faint">{labels.technologies}</h2>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <Chip key={tech.slug}>
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
                <div className="space-y-2.5 border-t border-line pt-5">
                  <span className="text-xs font-semibold text-faint">
                    {isRtl ? "روابط مباشرة" : "Live links"}
                  </span>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    {externalLinks.map((link) => (
                      <TextLink
                        key={link.href}
                        href={link.href}
                        icon="up-right"
                        aria-label={`${link.label} (${labels.openInNewTab})`}
                      >
                        {link.label}
                      </TextLink>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
