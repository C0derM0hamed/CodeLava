import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { formatNumber } from "@/lib/i18n-content";
import type { Project, ProjectDetail } from "@/server/queries";
import { Chip, Kicker } from "../process/kit";

export interface CaseStudyNavigationProps {
  locale: AppLocale;
  related: Project[];
  prev: ProjectDetail["prev"];
  next: ProjectDetail["next"];
  labels: {
    relatedTitle: string;
    previousLabel: string;
    nextLabel: string;
    openCaseStudy: string;
  };
}

export function CaseStudyNavigation({ locale, related, prev, next, labels }: CaseStudyNavigationProps) {
  const isRtl = locale === "ar";

  return (
    <>
      {related.length > 0 ? (
        <section id="related" className="section-y scroll-mt-[calc(var(--header-h)+2.5rem)]">
          <div className="container-lava space-y-[var(--space-heading)]">
            <div className="flex flex-col items-start gap-[var(--space-copy)]">
              <Kicker>{isRtl ? "أعمال مشابهة" : "Continue exploring"}</Kicker>
              <h2 className="text-display-md text-text">{labels.relatedTitle}</h2>
            </div>

            <ul className="grid grid-cols-1 gap-[var(--space-grid)] md:grid-cols-3">
              {related.map((item) => {
                const yearText = item.year ? formatNumber(item.year, locale, { useGrouping: false }) : null;
                return (
                  <li key={item.id} className="flex">
                    <Link
                      href={`/work/${item.slug}`}
                      data-cursor="view"
                      className="group flex w-full flex-col overflow-hidden rounded-[var(--radius-md)] border border-line bg-surface p-2.5 shadow-card transition-[transform,box-shadow] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:shadow-lift"
                    >
                      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[calc(var(--radius-md)-4px)] bg-pearl-300">
                        {item.cover ? (
                          <Image
                            src={item.cover.url}
                            alt={item.cover.alt || item.title}
                            width={item.cover.width ?? 1200}
                            height={item.cover.height ?? 750}
                            sizes="(max-width: 768px) 100vw, 33vw"
                            placeholder={item.cover.blurDataUrl ? "blur" : "empty"}
                            blurDataURL={item.cover.blurDataUrl ?? undefined}
                            className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                          />
                        ) : null}
                      </div>

                      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          {item.category ? <Chip tone="accent">{item.category.name}</Chip> : null}
                          {yearText ? <span className="text-xs text-faint tabular-nums">{yearText}</span> : null}
                        </div>
                        <h3 className="font-display text-xl font-bold text-text transition-colors group-hover:text-accent-text">
                          {item.title}
                        </h3>
                        {item.summary ? (
                          <p className="line-clamp-2 text-sm leading-relaxed text-muted">{item.summary}</p>
                        ) : null}
                        <span className="mt-auto inline-flex items-center gap-2 pt-2 text-sm font-semibold text-accent-text">
                          {labels.openCaseStudy}
                          <ArrowUpRight aria-hidden="true" className="rtl-flip size-4" />
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      ) : null}

      {prev || next ? (
        <nav
          aria-label={isRtl ? "التنقل بين المشاريع" : "Project sequence navigation"}
          className="py-10 sm:py-14"
        >
          <div className="container-lava">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              {prev ? (
                <Link
                  href={`/work/${prev.slug}`}
                  data-cursor="pointer"
                  className={`group flex flex-col justify-between gap-4 rounded-[var(--radius-lg)] border border-line bg-surface p-6 shadow-card transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-lift sm:p-8 ${next ? "lg:col-span-4" : "lg:col-span-12"}`}
                >
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-faint">
                    <ArrowLeft
                      aria-hidden="true"
                      className="rtl-flip size-4 text-accent-text transition-transform duration-300 group-hover:-translate-x-1 rtl:group-hover:translate-x-1"
                    />
                    {labels.previousLabel}
                  </span>
                  <span className="font-display text-xl font-bold text-text transition-colors group-hover:text-accent-text sm:text-2xl">
                    {prev.title}
                  </span>
                </Link>
              ) : null}

              {next ? (
                <Link
                  href={`/work/${next.slug}`}
                  data-cursor="view"
                  className={`group relative flex flex-col justify-between gap-6 overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface p-6 shadow-card transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-lift sm:p-10 ${prev ? "lg:col-span-8" : "lg:col-span-12"}`}
                >
                  <span className="page-wash pointer-events-none absolute inset-0" aria-hidden="true" />
                  <span className="relative flex items-center justify-between gap-4">
                    <span className="kicker-rule">{labels.nextLabel}</span>
                    <span className="grid size-11 place-items-center rounded-full bg-[image:var(--gradient-cta)] text-white shadow-lava">
                      <ArrowRight
                        aria-hidden="true"
                        className="rtl-flip size-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                      />
                    </span>
                  </span>
                  <span className="text-display-md relative text-text transition-colors duration-300 group-hover:text-accent-text">
                    {next.title}
                  </span>
                </Link>
              ) : null}
            </div>
          </div>
        </nav>
      ) : null}
    </>
  );
}
