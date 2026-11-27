import { Kicker } from "../process/kit";
import { Reveal } from "@/experience/fx/Reveal";
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
    <section id="features" className="scroll-mt-[calc(var(--header-h)+2.5rem)] py-10 sm:py-14">
      <div className="container-lava space-y-8 sm:space-y-10">
        <div className="flex flex-col items-start gap-3">
          <Kicker>{isRtl ? "القدرات والمزايا" : "Key capabilities"}</Kicker>
          <h2 className="text-display-md text-text">{headingTitle}</h2>
        </div>

        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {features.map((feature, idx) => {
            const num = formatNumber(idx + 1, locale, { minimumIntegerDigits: 2 });
            return (
              <Reveal
                as="li"
                mode="block"
                delay={(idx % 2) * 80}
                key={`${feature.title}-${idx}`}
                className="case-feature-card group flex flex-col gap-5 p-6 sm:p-8"
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    dir="ltr"
                    className="grid size-11 place-items-center rounded-[12px] border border-line-lava bg-[color-mix(in_oklab,var(--lava-500)_9%,white)] font-mono text-sm font-bold text-accent-text tabular-nums transition-colors duration-300 group-hover:bg-[color-mix(in_oklab,var(--lava-500)_16%,white)]"
                  >
                    {num}
                  </span>
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-line-strong transition-colors duration-300 group-hover:bg-accent"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display text-xl font-bold text-text sm:text-2xl">
                    {feature.title}
                  </h3>
                  {feature.description ? (
                    <p className="text-sm leading-relaxed text-muted sm:text-base">
                      {feature.description}
                    </p>
                  ) : null}
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
