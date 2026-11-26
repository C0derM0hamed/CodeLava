import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowRightIcon, ArrowUpRightIcon } from "@/components/ui/Icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { HeatEdge, LavaDivider } from "@/experience/fx/LavaDivider";
import type { AppLocale } from "@/i18n/routing";
import { formatNumber } from "@/lib/i18n-content";
import type { Project, ProjectDetail } from "@/server/queries";

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

export function CaseStudyNavigation({
  locale,
  related,
  prev,
  next,
  labels,
}: CaseStudyNavigationProps) {
  const isRtl = locale === "ar";

  return (
    <>
      {related.length > 0 ? (
        <section
          id="related"
          className="scroll-mt-[calc(var(--header-h)+2.5rem)] py-12 sm:py-16"
        >
          <div className="container-lava space-y-10">
            <LavaDivider variant="seam" />

            <SectionHeading
              index="07"
              kicker={isRtl ? "أعمال مشابهة" : "Continue Exploring"}
              title={labels.relatedTitle}
              size="md"
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {related.map((item) => {
                const yearText = item.year
                  ? formatNumber(item.year, locale, { useGrouping: false })
                  : null;
                return (
                  <Link
                    key={item.id}
                    href={`/work/${item.slug}`}
                    data-cursor="view"
                    className="group flex flex-col justify-between overflow-hidden rounded-[var(--radius-lg)] border border-line bg-bg-elevated transition-colors duration-300 hover:border-line-lava-strong"
                  >
                    <div>
                      <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-line bg-surface">
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

                      <div className="space-y-3 p-5 sm:p-6">
                        <div className="flex flex-wrap items-center gap-2">
                          {item.category ? <Tag tone="outline">{item.category.name}</Tag> : null}
                          {yearText ? (
                            <span className="font-mono text-xs text-faint tabular-nums">
                              {yearText}
                            </span>
                          ) : null}
                        </div>

                        <h3 className="font-display text-xl font-medium text-text transition-colors group-hover:text-lava-100">
                          {item.title}
                        </h3>

                        {item.summary ? (
                          <p className="line-clamp-2 text-xs leading-relaxed text-muted">
                            {item.summary}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-line px-5 py-3.5 text-xs font-medium text-muted transition-colors group-hover:text-lava-100 sm:px-6">
                      <span>{labels.openCaseStudy}</span>
                      <ArrowUpRightIcon
                        size={14}
                        className="text-accent transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:group-hover:-translate-x-0.5"
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {prev || next ? (
        <section
          aria-label={isRtl ? "التنقل بين المشاريع" : "Project sequence navigation"}
          className="py-10 sm:py-14"
        >
          <div className="container-lava space-y-6">
            <LavaDivider variant="seam" />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              {prev ? (
                <Link
                  href={`/work/${prev.slug}`}
                  data-cursor="pointer"
                  className={
                    next
                      ? "group flex flex-col justify-between gap-4 rounded-[var(--radius-lg)] border border-line bg-bg-elevated p-6 transition-colors duration-300 hover:border-line-strong sm:p-8 lg:col-span-4"
                      : "group flex flex-col justify-between gap-4 rounded-[var(--radius-lg)] border border-line bg-bg-elevated p-6 transition-colors duration-300 hover:border-line-strong sm:p-8 lg:col-span-12"
                  }
                >
                  <div className="flex items-center gap-2 text-kicker text-faint">
                    <span className="inline-flex rotate-180 transition-transform duration-300 group-hover:-translate-x-1 rtl:group-hover:translate-x-1">
                      <ArrowRightIcon size={14} className="text-accent" />
                    </span>
                    <span>{labels.previousLabel}</span>
                  </div>
                  <p className="font-display text-xl font-medium text-text transition-colors group-hover:text-lava-100 sm:text-2xl">
                    {prev.title}
                  </p>
                </Link>
              ) : null}

              {next ? (
                <Link
                  href={`/work/${next.slug}`}
                  data-cursor="view"
                  className={
                    prev
                      ? "group relative flex flex-col justify-between gap-6 overflow-hidden rounded-[var(--radius-lg)] border border-line-strong bg-bg-elevated p-6 transition-colors duration-400 hover:border-line-lava-strong sm:p-10 lg:col-span-8"
                      : "group relative flex flex-col justify-between gap-6 overflow-hidden rounded-[var(--radius-lg)] border border-line-strong bg-bg-elevated p-6 transition-colors duration-400 hover:border-line-lava-strong sm:p-10 lg:col-span-12"
                  }
                >
                  <HeatEdge
                    position="bottom"
                    intensity="medium"
                    className="opacity-50 transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <div
                    aria-hidden="true"
                    className="heat-haze-radial pointer-events-none absolute inset-x-0 bottom-0 h-44 opacity-30 transition-opacity duration-500 group-hover:opacity-75"
                  />

                  <div className="relative z-10 flex items-center justify-between gap-4">
                    <span className="text-kicker text-accent">{labels.nextLabel}</span>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line-strong bg-surface text-accent transition-all duration-300 group-hover:border-line-lava-strong group-hover:bg-accent/15 group-hover:text-ember group-hover:shadow-[var(--lava-glow-sm)]">
                      <ArrowRightIcon
                        size={17}
                        className="transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                      />
                    </span>
                  </div>

                  <p className="relative z-10 text-display-md text-text transition-colors duration-300 group-hover:text-lava-100">
                    {next.title}
                  </p>
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
