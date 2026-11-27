import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/experience/fx/Reveal";
import { WaveBand } from "@/experience/fx/WaveBand";
import { StepIcon } from "@/components/sections/process/step-icon";
import type { AppLocale } from "@/i18n/routing";
import { formatNumber } from "@/lib/i18n-content";

export interface Market {
  icon: string;
  title: string;
  body: string;
  /** Country names shown as chips (already localized). */
  places?: string[];
}

/** Markets we serve — the page's signature dark wavy band: Gulf · Egypt · International. */
export function AboutMarkets({
  locale = "en",
  eyebrow,
  title,
  lead,
  markets,
}: {
  locale?: AppLocale;
  eyebrow?: string;
  title: string;
  lead?: string;
  markets: Market[];
}) {
  return (
    <WaveBand
      aria-labelledby="about-markets-title"
      rim="top"
      className="my-4 sm:my-8"
      contentClassName="container-lava band-y"
    >
      <div className="grid items-center gap-[var(--space-split)] lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading
            layout="intro"
            size="md"
            kicker={eyebrow}
            title={title}
            lead={lead}
            titleId="about-markets-title"
          />
        </div>

        <ul className="grid gap-[var(--space-grid)] md:grid-cols-3 lg:col-span-8">
          {markets.map((market, index) => {
            const num = formatNumber(index + 1, locale, { minimumIntegerDigits: 2 });
            return (
              <Reveal
                as="li"
                mode="block"
                delay={index * 90}
                key={market.title}
                className="about-market-card flex flex-col gap-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <span aria-hidden="true" className="home-market__icon">
                    <StepIcon icon={market.icon} className="size-[1.375rem]" />
                  </span>
                  <span
                    dir="ltr"
                    className="font-mono text-xs font-semibold text-lava-300/80 tabular-nums"
                  >
                    {num}
                  </span>
                </div>

                <div className="grid gap-2">
                  <h3 className="font-display text-lg font-bold text-ash-50">{market.title}</h3>
                  <p className="text-sm leading-relaxed text-ink-200">{market.body}</p>
                </div>

                {market.places && market.places.length > 0 ? (
                  <div className="mt-auto flex flex-wrap gap-1.5 border-t border-line pt-4">
                    {market.places.map((place) => (
                      <span
                        key={place}
                        className="inline-flex min-h-7 items-center rounded-[var(--radius-pill)] border border-[color-mix(in_oklab,var(--lava-400)_30%,transparent)] bg-[color-mix(in_oklab,var(--lava-500)_10%,transparent)] px-2.5 py-0.5 text-xs font-medium text-ash-50"
                      >
                        {place}
                      </span>
                    ))}
                  </div>
                ) : null}
              </Reveal>
            );
          })}
        </ul>
      </div>
    </WaveBand>
  );
}
