import { SectionHeading } from "@/components/ui/SectionHeading";
import { LavaDivider } from "@/experience/fx/LavaDivider";
import type { AppLocale } from "@/i18n/routing";
import { formatNumber } from "@/lib/i18n-content";
import type { CaseStudyFeatureItem } from "./types";

export interface CaseStudyFeaturesProps {
  locale: AppLocale;
  features: CaseStudyFeatureItem[];
  headingTitle: string;
  sectionIndex?: string;
}

export function CaseStudyFeatures({
  locale,
  features,
  headingTitle,
  sectionIndex = "04",
}: CaseStudyFeaturesProps) {
  if (features.length === 0) return null;

  const isRtl = locale === "ar";

  return (
    <section
      id="features"
      className="scroll-mt-[calc(var(--header-h)+2.5rem)] py-12 sm:py-16"
    >
      <div className="container-lava space-y-10">
        <LavaDivider variant="seam" />

        <SectionHeading
          index={sectionIndex}
          kicker={isRtl ? "القدرات والمزايا" : "Key Capabilities"}
          title={headingTitle}
          size="md"
        />

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line md:grid-cols-2">
          {features.map((feature, idx) => {
            const num = formatNumber(idx + 1, locale, { minimumIntegerDigits: 2 });
            return (
              <div
                key={`${feature.title}-${idx}`}
                className="flex flex-col justify-between gap-4 bg-bg-elevated p-6 sm:p-8"
              >
                <div className="flex items-center justify-between gap-4">
                  <span
                    dir="ltr"
                    className="font-mono text-xs font-medium text-accent tabular-nums"
                  >
                    {num}
                  </span>
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-lava-500/75"
                  />
                </div>

                <div className="space-y-2.5">
                  <h3 className="font-display text-xl font-medium text-text sm:text-2xl">
                    {feature.title}
                  </h3>
                  {feature.description ? (
                    <p className="text-sm leading-relaxed text-muted">{feature.description}</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
