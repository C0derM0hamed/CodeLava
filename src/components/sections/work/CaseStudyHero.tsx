import type { CSSProperties } from "react";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/experience/fx/Reveal";
import type { AppLocale } from "@/i18n/routing";
import { formatNumber } from "@/lib/i18n-content";
import type { ProjectDetail } from "@/server/queries";
import { Chip } from "../process/kit";
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
    <section className="work-hero-stage pt-[calc(var(--header-h)+var(--hero-top))] pb-10 sm:pb-14">
      <div aria-hidden="true" className="work-hero-grid" />

      <div className="container-lava relative space-y-8 sm:space-y-11">
        {/* Top bar: single-line breadcrumb + tactile back pill */}
        <div className="work-hero-enter flex flex-wrap items-center justify-between gap-3" style={{ "--work-delay": "20ms" } as CSSProperties}>
          <nav aria-label={labels.breadcrumbsAria} className="min-w-0 flex-1">
            <ol className="flex items-center gap-2 overflow-hidden text-xs text-faint sm:text-sm">
              <li className="shrink-0">
                <Link href="/" data-cursor="pointer" className="transition-colors hover:text-text">
                  {labels.home}
                </Link>
              </li>
              <li aria-hidden="true" className="shrink-0 text-line-strong">/</li>
              <li className="shrink-0">
                <Link href="/work" data-cursor="pointer" className="transition-colors hover:text-text">
                  {labels.work}
                </Link>
              </li>
              <li aria-hidden="true" className="shrink-0 text-line-strong">/</li>
              <li aria-current="page" className="min-w-0 truncate font-medium text-text">
                {project.title}
              </li>
            </ol>
          </nav>

          <Link
            href="/work"
            data-cursor="pointer"
            className="group inline-flex shrink-0 items-center gap-2 rounded-pill border border-line bg-[color-mix(in_oklab,var(--pearl-50)_88%,transparent)] px-3.5 py-1.5 text-xs font-semibold text-accent-text shadow-xs backdrop-blur-sm transition-colors hover:border-line-lava-strong sm:text-sm"
          >
            <ArrowLeft
              aria-hidden="true"
              className="rtl-flip size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5"
            />
            <span>{labels.backToWork}</span>
          </Link>
        </div>

        {/* Title & Editorial Lead */}
        <div className="grid items-end gap-6 lg:grid-cols-12 lg:gap-[var(--space-split)]">
          <div className="space-y-5 lg:col-span-8">
            <div
              className="work-hero-enter flex flex-wrap items-center gap-2"
              style={{ "--work-delay": "60ms" } as CSSProperties}
            >
              {project.category ? (
                <Link
                  href={`/work?category=${encodeURIComponent(project.category.slug)}`}
                  data-cursor="pointer"
                  className="transition-transform hover:-translate-y-0.5"
                >
                  <Chip tone="accent">{project.category.name}</Chip>
                </Link>
              ) : null}
              {yearLabel ? (
                <Chip className="bg-[color-mix(in_oklab,var(--pearl-50)_90%,transparent)] tabular-nums">
                  {yearLabel}
                </Chip>
              ) : null}
              {project.clientCountryName ? (
                <Chip className="bg-[color-mix(in_oklab,var(--pearl-50)_90%,transparent)]">
                  {project.clientCountryName}
                </Chip>
              ) : null}
              {isDraft ? <Chip tone="ink">{isRtl ? "معاينة مسودة" : "Draft preview"}</Chip> : null}
            </div>

            <Reveal as="h1" mode="words" immediate className="text-display-lg text-text">
              {project.title}
            </Reveal>
          </div>

          {project.summary ? (
            <div
              className="work-hero-enter lg:col-span-4 lg:pb-1.5"
              style={{ "--work-delay": "140ms" } as CSSProperties}
            >
              <p className="border-s-2 border-line-lava ps-4 text-base leading-relaxed text-muted sm:text-[1.0625rem]">
                {project.summary}
              </p>
            </div>
          ) : null}
        </div>

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
