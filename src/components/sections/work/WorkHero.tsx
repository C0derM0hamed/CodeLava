import type { CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { formatNumber } from "@/lib/i18n-content";
import { Chip } from "../process/kit";
import type { WorkSectionCopy } from "./types";

export interface WorkHeroProps {
  locale: AppLocale;
  hero: WorkSectionCopy;
  intro?: WorkSectionCopy;
  ctaLabel: string;
  totalCount: number;
  categoryCount?: number;
  marketCount?: number;
  fallbackTitle: string;
}

function splitHeroHeadline(text: string): [string, string | null] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length < 3) return [text.trim(), null];
  const tailCount = Math.max(1, Math.round(words.length * 0.45));
  const lead = words.slice(0, words.length - tailCount).join(" ");
  const tail = words.slice(words.length - tailCount).join(" ");
  return [lead, tail];
}

export function WorkHero({
  locale,
  hero,
  intro,
  ctaLabel,
  totalCount,
  categoryCount = 0,
  marketCount = 0,
  fallbackTitle,
}: WorkHeroProps) {
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

  const [leadTitle, accentTitle] = splitHeroHeadline(hero.title || fallbackTitle);

  const telemetry = [
    totalCount > 0
      ? {
          value: formatNumber(totalCount, locale, { useGrouping: false }),
          label: isRtl ? "دراسة حالة" : "Case studies",
        }
      : null,
    categoryCount > 0
      ? {
          value: formatNumber(categoryCount, locale, { useGrouping: false }),
          label: isRtl ? "تخصصات" : "Disciplines",
        }
      : null,
    marketCount > 0
      ? {
          value: formatNumber(marketCount, locale, { useGrouping: false }),
          label: isRtl ? "أسواق إقليمية" : "Active markets",
        }
      : null,
  ].filter((item): item is { value: string; label: string } => item !== null);

  return (
    <section className="work-hero-stage pt-[calc(var(--header-h)+var(--hero-top))] pb-14 sm:pb-20">
      <div aria-hidden="true" className="work-hero-grid" />

      <div className="container-lava relative">
        <div className="grid items-end gap-[var(--space-split)] lg:grid-cols-12">
          <div className="flex flex-col items-start gap-6 lg:col-span-7">
            <div
              className="work-hero-enter flex flex-wrap items-center gap-3"
              style={{ "--work-delay": "20ms" } as CSSProperties}
            >
              <span className="work-eyebrow-pill">
                <span aria-hidden="true" dir="ltr" className="work-eyebrow-pill__glyph">
                  &lt;/&gt;
                </span>
                <span className="work-eyebrow-pill__text">{hero.eyebrow || fallbackTitle}</span>
              </span>
              {totalCount > 0 ? <Chip tone="accent">{countLabel}</Chip> : null}
            </div>

            <h1
              className="work-hero-enter text-display-xl max-w-[14ch] text-text"
              style={{ "--work-delay": "90ms" } as CSSProperties}
            >
              <span className="work-display-line">{leadTitle}</span>
              {accentTitle ? (
                <>
                  {" "}
                  <span className="work-display-line work-display-line--accent">{accentTitle}</span>
                </>
              ) : null}
            </h1>

            {telemetry.length > 0 ? (
              <dl
                className="work-hero-enter flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-line pt-5"
                style={{ "--work-delay": "160ms" } as CSSProperties}
              >
                {telemetry.map((stat) => (
                  <div key={stat.label} className="flex items-baseline gap-2.5">
                    <dt className="order-2 text-xs font-medium text-faint sm:text-sm">{stat.label}</dt>
                    <dd
                      dir="ltr"
                      className="order-1 font-display text-2xl font-bold text-text tabular-nums sm:text-3xl"
                    >
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>

          <div
            className="work-hero-enter lg:col-span-5 lg:pb-1"
            style={{ "--work-delay": "180ms" } as CSSProperties}
          >
            <div className="flex flex-col items-start gap-5 rounded-[var(--radius-lg)] border border-line bg-[color-mix(in_oklab,var(--pearl-50)_84%,transparent)] p-6 shadow-card backdrop-blur-md sm:p-7">
              {hero.description ? (
                <p className="text-lead text-text">{hero.description}</p>
              ) : null}

              {intro?.title || intro?.description ? (
                <div className="relative w-full space-y-1.5 border-s-2 border-accent ps-4">
                  {intro.title ? (
                    <p className="text-sm font-semibold text-text">{intro.title}</p>
                  ) : null}
                  {intro.description ? (
                    <p className="text-sm leading-relaxed text-muted">{intro.description}</p>
                  ) : null}
                </div>
              ) : null}

              <div className="pt-1">
                <Link href="/quote" data-cursor="pointer" className="work-cta-btn">
                  <span>{ctaLabel}</span>
                  <span aria-hidden="true" className="work-cta-btn__well">
                    <ArrowRight className="rtl-flip size-4" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div aria-hidden="true" className="work-heat-seam absolute inset-x-0 bottom-0" />
    </section>
  );
}
