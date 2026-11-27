import { ArrowDown } from "lucide-react";
import { Reveal } from "@/experience/fx/Reveal";
import { HighlightTitle, Kicker, PageHero, PillLink } from "./kit";

export interface ProcessHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  ctaLabel: string;
  stagesLabel: string;
  glanceLabel: string;
  durationLabel: string;
  steps: { id: string; number: string; title: string; duration: string | null }[];
}

export function ProcessHero({
  eyebrow,
  title,
  description,
  ctaLabel,
  stagesLabel,
  glanceLabel,
  durationLabel,
  steps,
}: ProcessHeroProps) {
  return (
    <PageHero>
      <div className="grid items-center gap-[var(--space-split)] lg:grid-cols-12">
        <div className="flex flex-col items-start gap-[var(--space-copy)] lg:col-span-7">
          {eyebrow ? <Kicker>{eyebrow}</Kicker> : null}
          <h1 className="text-display-xl max-w-[16ch] text-text">
            <HighlightTitle text={title} />
          </h1>
          {description ? <p className="text-lead max-w-[54ch]">{description}</p> : null}
          <div className="flex flex-wrap items-center gap-3.5 pt-[var(--space-cta)]">
            <PillLink href="/quote" size="lg">
              {ctaLabel}
            </PillLink>
            {steps.length > 0 ? (
              <a
                href="#stages"
                data-cursor="pointer"
                className="group inline-flex h-14 items-center gap-2.5 rounded-pill border border-line-strong bg-surface px-7 text-base font-semibold text-text shadow-xs transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-line-lava-strong hover:shadow-card"
              >
                <span>{stagesLabel}</span>
                <ArrowDown aria-hidden="true" className="size-4 text-accent-text" />
              </a>
            ) : null}
          </div>
        </div>

        {steps.length > 0 ? (
          <Reveal mode="block" className="lg:col-span-5">
            <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-[var(--space-card)] shadow-card">
              <h2 className="text-sm font-semibold text-text">{glanceLabel}</h2>
              <ol className="mt-5 divide-y divide-line">
                {steps.map((step) => (
                  <li key={step.id}>
                    <a
                      href={`#step-${step.id}`}
                      data-cursor="pointer"
                      className="group flex items-center gap-4 py-3.5 transition-colors"
                    >
                      <span
                        dir="ltr"
                        className="grid size-9 shrink-0 place-items-center rounded-full border border-line-lava bg-[color-mix(in_oklab,var(--lava-500)_8%,white)] text-xs font-semibold text-accent-text tabular-nums"
                      >
                        {step.number}
                      </span>
                      <span className="min-w-0 flex-1 font-display text-[1.0625rem] font-semibold text-text transition-colors group-hover:text-accent-text">
                        {step.title}
                      </span>
                      {step.duration ? (
                        <span className="shrink-0 text-xs text-faint">
                          <span className="sr-only">{durationLabel}: </span>
                          {step.duration}
                        </span>
                      ) : null}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        ) : null}
      </div>
    </PageHero>
  );
}
