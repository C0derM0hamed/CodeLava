import { ActionLink } from "@/components/ui/ActionLink";
import { CodeTexture } from "@/experience/fx/CodeTexture";
import { LavaDivider } from "@/experience/fx/LavaDivider";
import { Reveal } from "@/experience/fx/Reveal";
import type { AppLocale } from "@/i18n/routing";
import { formatNumber } from "@/lib/i18n-content";
import type { WorkSectionCopy } from "./types";

export interface WorkHeroProps {
  locale: AppLocale;
  hero: WorkSectionCopy;
  intro?: WorkSectionCopy;
  ctaLabel: string;
  totalCount: number;
  fallbackTitle: string;
}

export function WorkHero({
  locale,
  hero,
  intro,
  ctaLabel,
  totalCount,
  fallbackTitle,
}: WorkHeroProps) {
  const isRtl = locale === "ar";
  const formattedCount = formatNumber(totalCount, locale, { minimumIntegerDigits: 2 });
  const countLabel = isRtl ? `${formattedCount} مشاريع منشورة` : `${formattedCount} CASE STUDIES`;

  return (
    <section className="relative overflow-hidden pt-[calc(var(--header-h)+3.25rem)] pb-14 sm:pt-[calc(var(--header-h)+4.75rem)] sm:pb-20">
      <CodeTexture opacity={0.11} />
      <div aria-hidden="true" className="grain-overlay pointer-events-none absolute inset-0" />
      <div
        aria-hidden="true"
        className="heat-haze-radial pointer-events-none absolute inset-x-0 bottom-0 h-80 opacity-45"
      />

      <div className="container-lava relative z-10 space-y-12 sm:space-y-16">
        {/* Eyebrow index row */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
          <div className="flex items-center gap-3">
            <span
              dir="ltr"
              className="font-mono text-xs font-medium tracking-[0.12em] text-accent tabular-nums"
            >
              01 /
            </span>
            <span className="text-kicker text-muted">
              {hero.eyebrow || fallbackTitle}
            </span>
          </div>

          {totalCount > 0 ? (
            <div className="inline-flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--lava-500)]"
              />
              <span className="font-mono text-xs tracking-[0.1em] text-ash-400 tabular-nums rtl:font-sans rtl:tracking-normal">
                {countLabel}
              </span>
            </div>
          ) : null}
        </div>

        {/* Display headline + asymmetric editorial brief */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-8">
            <Reveal as="h1" mode="words" immediate className="text-display-xl text-text">
              {hero.title || fallbackTitle}
            </Reveal>
          </div>

          <div className="space-y-6 lg:col-span-4 lg:pb-2">
            {hero.description ? <p className="text-lead">{hero.description}</p> : null}

            {intro?.title || intro?.description ? (
              <div className="space-y-1.5 border-s border-line-lava ps-4">
                {intro.title ? (
                  <p className="text-sm font-medium text-text">{intro.title}</p>
                ) : null}
                {intro.description ? (
                  <p className="text-xs leading-relaxed text-muted">{intro.description}</p>
                ) : null}
              </div>
            ) : null}

            <div>
              <ActionLink href="/quote" variant="molten" size="md" magnetic>
                {ctaLabel}
              </ActionLink>
            </div>
          </div>
        </div>
      </div>

      <LavaDivider variant="seam" className="mt-14 sm:mt-20" />
    </section>
  );
}
