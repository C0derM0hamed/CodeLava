import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/experience/fx/Reveal";
import type { AppLocale } from "@/i18n/routing";
import { formatNumber } from "@/lib/i18n-content";
import type { ProjectDetail } from "@/server/queries";
import { Chip, PageHero } from "../process/kit";
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
    <PageHero className="pb-10 sm:pb-14">
      <div className="space-y-10 sm:space-y-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav aria-label={labels.breadcrumbsAria}>
            <ol className="flex flex-wrap items-center gap-2 text-sm text-faint">
              <li>
                <Link href="/" data-cursor="pointer" className="transition-colors hover:text-text">
                  {labels.home}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/work" data-cursor="pointer" className="transition-colors hover:text-text">
                  {labels.work}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="max-w-[26ch] truncate font-medium text-text">
                {project.title}
              </li>
            </ol>
          </nav>

          <Link
            href="/work"
            data-cursor="pointer"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-accent-text"
          >
            <ArrowLeft
              aria-hidden="true"
              className="rtl-flip size-4 transition-transform duration-300 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5"
            />
            <span>{labels.backToWork}</span>
          </Link>
        </div>

        <div className="max-w-5xl space-y-6">
          <div className="flex flex-wrap items-center gap-2.5">
            {project.category ? (
              <Link href={`/work?category=${encodeURIComponent(project.category.slug)}`} data-cursor="pointer">
                <Chip tone="accent">{project.category.name}</Chip>
              </Link>
            ) : null}
            {yearLabel ? <Chip className="tabular-nums">{yearLabel}</Chip> : null}
            {project.clientCountryName ? <Chip>{project.clientCountryName}</Chip> : null}
            {isDraft ? <Chip tone="ink">{isRtl ? "معاينة مسودة" : "Draft preview"}</Chip> : null}
          </div>

          <Reveal as="h1" mode="words" immediate className="text-display-lg text-text">
            {project.title}
          </Reveal>

          {project.summary ? <p className="text-lead max-w-3xl">{project.summary}</p> : null}
        </div>

        <CaseStudyMediaFrame
          title={project.title}
          cover={project.cover}
          video={project.video}
          playLabel={labels.playVideo}
          pauseLabel={labels.pauseVideo}
        />
      </div>
    </PageHero>
  );
}
