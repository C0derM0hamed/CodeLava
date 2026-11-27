import { Reveal } from "@/experience/fx/Reveal";
import type { AppLocale } from "@/i18n/routing";
import { formatNumber } from "@/lib/i18n-content";
import { Chip, HighlightTitle, Kicker, PageHero, PillLink } from "../process/kit";
import type { WorkSectionCopy } from "./types";

export interface WorkHeroProps {
  locale: AppLocale;
  hero: WorkSectionCopy;
  intro?: WorkSectionCopy;
  ctaLabel: string;
  totalCount: number;
  fallbackTitle: string;
}

export function WorkHero({ locale, hero, intro, ctaLabel, totalCount, fallbackTitle }: WorkHeroProps) {
  const isRtl = locale === "ar";
  const countLabel = isRtl
    ? totalCount === 1
      ? "مشروع واحد منشور"
      : totalCount === 2
        ? "مشروعان منشوران"
        : totalCount <= 10
          ? `${formatNumber(totalCount, locale, { useGrouping: false })} مشاريع منشورة`
          : `${formatNumber(totalCount, locale, { useGrouping: false })} مشروعًا منشورًا`
    : `${formatNumber(totalCount, locale)} published ${totalCount === 1 ? "case study" : "case studies"}`;

  return (
    <PageHero className="pb-12 sm:pb-16">
      <div className="grid items-end gap-[var(--space-split)] lg:grid-cols-12">
        <div className="flex flex-col items-start gap-[var(--space-copy)] lg:col-span-8">
          <div className="flex flex-wrap items-center gap-4">
            <Kicker>{hero.eyebrow || fallbackTitle}</Kicker>
            {totalCount > 0 ? <Chip tone="accent">{countLabel}</Chip> : null}
          </div>
          <h1 className="text-display-xl max-w-[16ch] text-text">
            <HighlightTitle text={hero.title || fallbackTitle} />
          </h1>
        </div>

        <Reveal mode="block" className="lg:col-span-4 lg:pb-3">
          <div className="flex flex-col items-start gap-[var(--space-copy)]">
            {hero.description ? <p className="text-lead">{hero.description}</p> : null}
            {intro?.title || intro?.description ? (
              <div className="space-y-1.5 border-s-2 border-line-lava ps-4">
                {intro.title ? <p className="text-sm font-semibold text-text">{intro.title}</p> : null}
                {intro.description ? <p className="text-sm leading-relaxed text-muted">{intro.description}</p> : null}
              </div>
            ) : null}
            <div className="pt-[var(--space-cta)]">
              <PillLink href="/quote" size="md">
                {ctaLabel}
              </PillLink>
            </div>
          </div>
        </Reveal>
      </div>
    </PageHero>
  );
}
