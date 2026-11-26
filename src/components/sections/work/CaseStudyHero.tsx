import { Link } from "@/i18n/navigation";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { Tag } from "@/components/ui/Tag";
import { Reveal } from "@/experience/fx/Reveal";
import type { AppLocale } from "@/i18n/routing";
import { formatNumber } from "@/lib/i18n-content";
import type { ProjectDetail } from "@/server/queries";
import { CaseStudyMediaFrame } from "./CaseStudyMediaFrame";

export interface CaseStudyHeroProps {
  locale: AppLocale;
  project: ProjectDetail;
  isDraft: boolean;
  labels: {
    home: string;
    work: string;
    backToWork: string;
    breadcrumbsAria: string;
    playVideo: string;
    pauseVideo: string;
  };
}

export function CaseStudyHero({
  locale,
  project,
  isDraft,
  labels,
}: CaseStudyHeroProps) {
  const isRtl = locale === "ar";
  const yearLabel = project.year
    ? formatNumber(project.year, locale, { useGrouping: false })
    : null;

  return (
    <section className="relative overflow-hidden pt-[calc(var(--header-h)+2.75rem)] pb-12 sm:pt-[calc(var(--header-h)+4rem)] sm:pb-16">
      <div aria-hidden="true" className="grain-overlay pointer-events-none absolute inset-0" />
      <div
        aria-hidden="true"
        className="heat-haze-radial pointer-events-none absolute inset-x-0 top-0 h-96 rotate-180 opacity-35"
      />

      <div className="container-lava relative z-10 space-y-10 sm:space-y-12">
        {/* Top bar: Breadcrumbs + Back to work */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
          <nav aria-label={labels.breadcrumbsAria}>
            <ol className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <li>
                <Link href="/" data-cursor="pointer" className="transition-colors hover:text-text">
                  {labels.home}
                </Link>
              </li>
              <li aria-hidden="true" className="text-faint">
                /
              </li>
              <li>
                <Link href="/work" data-cursor="pointer" className="transition-colors hover:text-text">
                  {labels.work}
                </Link>
              </li>
              <li aria-hidden="true" className="text-faint">
                /
              </li>
              <li aria-current="page" className="max-w-[26ch] truncate font-medium text-text">
                {project.title}
              </li>
            </ol>
          </nav>

          <Link
            href="/work"
            data-cursor="pointer"
            className="group inline-flex items-center gap-2 text-xs font-medium text-ash-200 transition-colors hover:text-lava-100"
          >
            {/* Outer rotate-180 + inner .rtl-flip points left in LTR and right in RTL */}
            <span className="inline-flex rotate-180 transition-transform duration-300 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5">
              <ArrowRightIcon size={14} className="text-accent" />
            </span>
            <span>{labels.backToWork}</span>
          </Link>
        </div>

        {/* Title + Meta */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            {project.category ? (
              <Link href={`/work?category=${encodeURIComponent(project.category.slug)}`} data-cursor="pointer">
                <Tag tone="lava" dot className="transition-colors hover:border-line-lava-strong">
                  {project.category.name}
                </Tag>
              </Link>
            ) : null}

            {yearLabel ? (
              <Tag tone="outline" className="tabular-nums">
                {yearLabel}
              </Tag>
            ) : null}

            {project.clientCountryName ? (
              <Tag tone="default">{project.clientCountryName}</Tag>
            ) : null}

            {isDraft ? (
              <Tag tone="syntax-cyan" dot>
                {isRtl ? "معاينة مسودة" : "Draft preview"}
              </Tag>
            ) : null}
          </div>

          <Reveal as="h1" mode="words" immediate className="max-w-5xl text-display-xl text-text">
            {project.title}
          </Reveal>

          {project.summary ? (
            <p className="text-lead max-w-3xl">{project.summary}</p>
          ) : null}
        </div>

        {/* Cinematic Cover (Video or Image) */}
        <CaseStudyMediaFrame
          title={project.title}
          cover={project.cover}
          video={project.video}
          playLabel={labels.playVideo}
          pauseLabel={labels.pauseVideo}
        />
      </div>
    </section>
  );
}
