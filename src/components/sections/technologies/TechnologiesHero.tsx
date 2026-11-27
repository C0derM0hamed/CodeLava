import type { CSSProperties } from "react";
import { Reveal } from "@/experience/fx/Reveal";
import type { Technology } from "@/server/queries/types";
import { HighlightTitle, Kicker, PillLink } from "../process/kit";
import { resolveTechnologyBrand, TechnologyLogo } from "./TechnologyLogo";
import "./technologies.css";

export interface TechnologiesHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  ctaLabel: string;
  preview: Technology[];
  stackCountLabel?: string;
}

export function TechnologiesHero({
  eyebrow,
  title,
  description,
  ctaLabel,
  preview,
  stackCountLabel,
}: TechnologiesHeroProps) {
  return (
    <section className="tech-hero">
      <div className="container-lava relative">
        <div className="grid items-center gap-[var(--space-split)] lg:grid-cols-12">
          <div className="flex flex-col items-start gap-[var(--space-copy)] lg:col-span-7">
            <div className="flex flex-wrap items-center gap-3">
              {eyebrow ? <Kicker>{eyebrow}</Kicker> : null}
              {stackCountLabel ? (
                <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-line-lava bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-text tabular-nums">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
                  <span>{stackCountLabel}</span>
                </span>
              ) : null}
            </div>
            <h1 className="text-display-xl max-w-[16ch] text-text">
              <HighlightTitle text={title} />
            </h1>
            {description ? <p className="text-lead max-w-[54ch]">{description}</p> : null}
            <div className="pt-[var(--space-cta)]">
              <PillLink href="/quote" size="lg">
                {ctaLabel}
              </PillLink>
            </div>
          </div>

          {preview.length > 0 ? (
            <Reveal mode="block" immediate className="lg:col-span-5">
              <div className="tech-constellation-stage">
                <ul
                  aria-hidden="true"
                  className="mx-auto grid max-w-[26rem] grid-cols-4 gap-3 sm:gap-3.5 [&>li:nth-child(4n+2)]:translate-y-4 [&>li:nth-child(4n+4)]:translate-y-4"
                >
                  {preview.slice(0, 12).map((technology) => {
                    const brand = resolveTechnologyBrand(technology);
                    return (
                      <li
                        key={technology.id}
                        title={technology.name}
                        className="tech-constellation-tile"
                        style={{ "--tech-brand": brand } as CSSProperties}
                      >
                        <TechnologyLogo technology={technology} size="sm" bare />
                        <span
                          dir="ltr"
                          className="hidden max-w-full truncate text-[0.6875rem] font-medium text-faint sm:block"
                        >
                          {technology.name}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}
