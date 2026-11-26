import { Reveal } from "@/experience/fx/Reveal";
import type { Technology } from "@/server/queries/types";
import { HighlightTitle, Kicker, PageHero, PillLink } from "../process/kit";
import { TechnologyLogo } from "./TechnologyLogo";

export interface TechnologiesHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  ctaLabel: string;
  preview: Technology[];
}

export function TechnologiesHero({ eyebrow, title, description, ctaLabel, preview }: TechnologiesHeroProps) {
  return (
    <PageHero>
      <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
        <div className="flex flex-col items-start gap-6 lg:col-span-7">
          {eyebrow ? <Kicker>{eyebrow}</Kicker> : null}
          <h1 className="text-display-xl max-w-[16ch] text-text">
            <HighlightTitle text={title} />
          </h1>
          {description ? <p className="text-lead max-w-[52ch]">{description}</p> : null}
          <div className="mt-2">
            <PillLink href="/quote" size="lg">
              {ctaLabel}
            </PillLink>
          </div>
        </div>

        {preview.length > 0 ? (
          <Reveal mode="block" className="lg:col-span-5" >
            <ul
              aria-hidden="true"
              className="mx-auto grid max-w-md grid-cols-4 gap-3 sm:gap-4 [&>li:nth-child(4n+2)]:translate-y-4 [&>li:nth-child(4n+4)]:translate-y-4"
            >
              {preview.slice(0, 12).map((technology) => (
                <li
                  key={technology.id}
                  className="grid aspect-square place-items-center rounded-[var(--radius-md)] border border-line bg-surface shadow-card"
                >
                  <TechnologyLogo technology={technology} size="sm" bare />
                </li>
              ))}
            </ul>
          </Reveal>
        ) : null}
      </div>
    </PageHero>
  );
}
