import { Kicker } from "../process/kit";
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
}: CaseStudyFeaturesProps) {
  if (features.length === 0) return null;

  const isRtl = locale === "ar";

  return (
    <section id="features" className="scroll-mt-[calc(var(--header-h)+2.5rem)] py-12 sm:py-16">
      <div className="container-lava space-y-10">
        <div className="flex flex-col items-start gap-4">
          <Kicker>{isRtl ? "القدرات والمزايا" : "Key capabilities"}</Kicker>
          <h2 className="text-display-md text-text">{headingTitle}</h2>
        </div>

        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {features.map((feature, idx) => {
            const num = formatNumber(idx + 1, locale, { minimumIntegerDigits: 2 });
            return (
              <li
                key={`${feature.title}-${idx}`}
                className="flex flex-col gap-5 rounded-[var(--radius-md)] border border-line bg-surface p-6 shadow-card transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-lift sm:p-8"
              >
                <span
                  dir="ltr"
                  className="grid size-10 place-items-center rounded-full border border-line-lava bg-[color-mix(in_oklab,var(--lava-500)_8%,white)] text-sm font-semibold text-accent-text tabular-nums"
                >
                  {num}
                </span>
                <div className="space-y-2.5">
                  <h3 className="font-display text-xl font-bold text-text sm:text-2xl">{feature.title}</h3>
                  {feature.description ? (
                    <p className="text-sm leading-relaxed text-muted sm:text-base">{feature.description}</p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
