import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/experience/fx/Reveal";
import { WaveBand } from "@/experience/fx/WaveBand";
import { StepIcon } from "@/components/sections/process/step-icon";

export interface Market {
  icon: string;
  title: string;
  body: string;
  /** Country names shown as chips (already localized). */
  places?: string[];
}

/** Markets we serve — the page's one dark wavy band: Gulf · Egypt · International. */
export function AboutMarkets({ eyebrow, title, lead, markets }: { eyebrow?: string; title: string; lead?: string; markets: Market[] }) {
  return (
    <WaveBand aria-labelledby="about-markets-title" rim="top" className="my-8 sm:my-12" contentClassName="container-lava band-y">
      <div className="grid items-center gap-[var(--space-split)] lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading layout="intro" size="md" kicker={eyebrow} title={title} lead={lead} titleId="about-markets-title" />
        </div>
        <ul className="grid gap-[var(--space-grid)] md:grid-cols-3 lg:col-span-8">
          {markets.map((market, index) => (
            <Reveal
              as="li"
              mode="block"
              delay={index * 90}
              key={market.title}
              className="flex flex-col gap-5 rounded-[var(--radius-md)] border border-[color-mix(in_oklab,var(--ash-50)_12%,transparent)] bg-[color-mix(in_oklab,var(--ink-800)_70%,transparent)] p-[var(--space-card)]"
            >
              <span aria-hidden="true" className="home-market__icon">
                <StepIcon icon={market.icon} className="size-[1.375rem]" />
              </span>
              <span className="grid gap-2">
                <span className="font-display text-lg font-semibold text-text">{market.title}</span>
                <span className="text-sm leading-relaxed text-muted">{market.body}</span>
              </span>
              {market.places && market.places.length > 0 ? (
                <span className="mt-auto flex flex-wrap gap-1.5 pt-1">
                  {market.places.map((place) => (
                    <span
                      key={place}
                      className="inline-flex h-7 items-center rounded-[var(--radius-pill)] border border-[color-mix(in_oklab,var(--ash-50)_14%,transparent)] px-2.5 text-xs font-medium text-text"
                    >
                      {place}
                    </span>
                  ))}
                </span>
              ) : null}
            </Reveal>
          ))}
        </ul>
      </div>
    </WaveBand>
  );
}
