import Image from "next/image";
import { Chip, Kicker, TextLink } from "../process/kit";
import type { AppLocale } from "@/i18n/routing";
import { formatNumber } from "@/lib/i18n-content";
import type { CaseStudyTestimonialData } from "./types";

export interface CaseStudyTestimonialProps {
  locale: AppLocale;
  testimonial: CaseStudyTestimonialData;
  headingTitle: string;
  sectionIndex?: string;
  openInNewTabLabel: string;
}

export function CaseStudyTestimonial({
  locale,
  testimonial,
  headingTitle,
  openInNewTabLabel,
}: CaseStudyTestimonialProps) {
  if (!testimonial) return null;

  const isRtl = locale === "ar";
  const sourceLabels: Record<string, string> = isRtl
    ? { upwork: "Upwork", mostaql: "مستقل", khamsat: "خمسات", fiverr: "Fiverr", bahr: "بحر", freelancer: "Freelancer", clutch: "Clutch", direct: "عميل مباشر", other: "مصدر آخر" }
    : { upwork: "Upwork", mostaql: "Mostaql", khamsat: "Khamsat", fiverr: "Fiverr", bahr: "Bahr", freelancer: "Freelancer", clutch: "Clutch", direct: "Direct client", other: "Other source" };
  const sourceName = sourceLabels[testimonial.source] ?? testimonial.source;
  const ratingText =
    typeof testimonial.rating === "number"
      ? `${formatNumber(testimonial.rating, locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} / ${formatNumber(5, locale)}`
      : null;

  return (
    <section id="testimonial" className="scroll-mt-[calc(var(--header-h)+2.5rem)] py-12 sm:py-16">
      <div className="container-lava space-y-10">
        <div className="flex flex-col items-start gap-4">
          <Kicker>{isRtl ? "رأي العميل" : "Client voice"}</Kicker>
          <h2 className="text-display-md text-text">{headingTitle}</h2>
        </div>

        <div className="page-wash relative overflow-hidden rounded-[var(--radius-xl)] border border-line bg-surface p-6 shadow-card sm:p-10 lg:p-14">
          <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
            <blockquote className="space-y-6 lg:col-span-8">
              <span aria-hidden="true" className="block font-display text-6xl leading-none text-accent select-none">
                “
              </span>
              <p lang={testimonial.quoteLocale} dir="auto" className="text-display-sm leading-relaxed text-text">
                {testimonial.quote}
              </p>
            </blockquote>

            <div className="flex flex-col justify-between gap-5 border-t border-line pt-6 lg:col-span-4 lg:border-s lg:border-t-0 lg:ps-8 lg:pt-0">
              <div className="flex items-center gap-3.5">
                {testimonial.avatar ? (
                  <Image
                    src={testimonial.avatar.url}
                    alt={testimonial.authorName}
                    width={48}
                    height={48}
                    sizes="48px"
                    className="size-12 shrink-0 rounded-full border border-line object-cover"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="grid size-12 shrink-0 place-items-center rounded-full border border-line-lava bg-[color-mix(in_oklab,var(--lava-500)_9%,white)] font-display text-base font-bold text-accent-text"
                  >
                    {testimonial.authorName.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate font-semibold text-text">{testimonial.authorName}</p>
                  {testimonial.authorRole ? <p className="text-xs text-muted">{testimonial.authorRole}</p> : null}
                  {testimonial.company || testimonial.countryName ? (
                    <p className="text-xs text-faint">
                      {[testimonial.company, testimonial.countryName].filter(Boolean).join(" · ")}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {ratingText ? <Chip tone="accent">★ {ratingText}</Chip> : null}
                {testimonial.sourceUrl ? (
                  <TextLink
                    href={testimonial.sourceUrl}
                    icon="up-right"
                    aria-label={`${sourceName} (${openInNewTabLabel})`}
                  >
                    {sourceName}
                  </TextLink>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
