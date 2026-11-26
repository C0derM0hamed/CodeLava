import Image from "next/image";
import { ActionLink } from "@/components/ui/ActionLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { HeatEdge, LavaDivider } from "@/experience/fx/LavaDivider";
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
  sectionIndex = "06",
  openInNewTabLabel,
}: CaseStudyTestimonialProps) {
  if (!testimonial) return null;

  const isRtl = locale === "ar";
  const ratingText =
    typeof testimonial.rating === "number"
      ? `${formatNumber(testimonial.rating, locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} / ${formatNumber(5, locale)}`
      : null;

  return (
    <section
      id="testimonial"
      className="scroll-mt-[calc(var(--header-h)+2.5rem)] py-12 sm:py-16"
    >
      <div className="container-lava space-y-10">
        <LavaDivider variant="seam" />

        <SectionHeading
          index={sectionIndex}
          kicker={isRtl ? "شهادة موثقة" : "Client Voice"}
          title={headingTitle}
          size="md"
        />

        <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-line-strong bg-bg-elevated p-6 sm:p-10 lg:p-14">
          <HeatEdge position="top" intensity="subtle" />
          <div
            aria-hidden="true"
            className="heat-haze-radial pointer-events-none absolute inset-x-0 bottom-0 h-56 opacity-45"
          />

          <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
            <blockquote className="space-y-6 lg:col-span-9">
              <span
                aria-hidden="true"
                className="block font-display text-5xl leading-none text-accent select-none"
              >
                “
              </span>

              <p
                lang={testimonial.quoteLocale}
                className="text-display-sm leading-relaxed text-text"
              >
                {testimonial.quote}
              </p>
            </blockquote>

            <div className="flex flex-col justify-between gap-5 border-t border-line pt-6 lg:col-span-3 lg:border-s lg:border-t-0 lg:ps-8 lg:pt-0">
              <div className="flex items-center gap-3.5">
                {testimonial.avatar ? (
                  <Image
                    src={testimonial.avatar.url}
                    alt={testimonial.authorName}
                    width={48}
                    height={48}
                    sizes="48px"
                    className="h-12 w-12 shrink-0 rounded-full border border-line-strong object-cover"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line-lava bg-lava-900/35 font-display text-base font-medium text-lava-100"
                  >
                    {testimonial.authorName.slice(0, 1).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0 space-y-0.5">
                  <p className="truncate font-medium text-text">{testimonial.authorName}</p>
                  {testimonial.authorRole ? (
                    <p className="text-xs text-muted">{testimonial.authorRole}</p>
                  ) : null}
                  {testimonial.company || testimonial.countryName ? (
                    <p className="text-xs text-faint">
                      {[testimonial.company, testimonial.countryName].filter(Boolean).join(" · ")}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {ratingText ? (
                  <Tag tone="lava" dot>
                    {ratingText}
                  </Tag>
                ) : null}
                {testimonial.sourceUrl ? (
                  <ActionLink
                    href={testimonial.sourceUrl}
                    external
                    variant="molten"
                    size="sm"
                    arrow="up-right"
                    aria-label={`${testimonial.source} (${openInNewTabLabel})`}
                  >
                    {testimonial.source}
                  </ActionLink>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
