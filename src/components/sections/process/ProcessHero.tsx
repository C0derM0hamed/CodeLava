import { ArrowDown } from "lucide-react";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { Reveal } from "@/experience/fx/Reveal";
import { HighlightTitle, Kicker, PillLink } from "./kit";
import "./process.css";

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
    <section className="process-hero">
      <div className="container-lava relative">
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
                  className="group inline-flex h-14 items-center gap-2.5 rounded-pill border border-line-strong bg-surface px-7 text-base font-semibold text-text shadow-xs transition-[transform,box-shadow,border-color] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:border-line-lava-strong hover:shadow-card motion-reduce:hover:translate-y-0"
                >
                  <span>{stagesLabel}</span>
                  <ArrowDown
                    aria-hidden="true"
                    className="size-4 text-accent-text transition-transform duration-300 group-hover:translate-y-0.5"
                  />
                </a>
              ) : null}
            </div>
          </div>

          {steps.length > 0 ? (
            <Reveal mode="block" immediate className="lg:col-span-5">
              <div className="process-roadmap">
                <div className="flex items-center justify-between gap-3 border-b border-line pb-4">
                  <h2 className="font-display text-sm font-semibold tracking-tight text-text">{glanceLabel}</h2>
                  <span
                    dir="ltr"
                    className="inline-flex items-center rounded-[var(--radius-pill)] border border-line-lava bg-accent-soft px-2.5 py-0.5 font-mono text-xs font-semibold text-accent-text tabular-nums"
                  >
                    {steps[steps.length - 1]?.number ?? steps.length}
                  </span>
                </div>

                <div className="relative mt-3">
                  {/* Connecting vertical rail behind the numbered dots */}
                  {steps.length > 1 ? (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute start-[1.125rem] top-6 bottom-6 w-px bg-[linear-gradient(180deg,var(--line-lava-strong),var(--line-lava)_70%,transparent)]"
                    />
                  ) : null}
                  <ol className="relative space-y-1">
                    {steps.map((step) => (
                      <li key={step.id}>
                        <a href={`#step-${step.id}`} data-cursor="pointer" className="process-roadmap-item group">
                          <span dir="ltr" className="process-roadmap-dot">
                            {step.number}
                          </span>
                          <span className="min-w-0 flex-1 font-display text-[1.03125rem] font-semibold text-text transition-colors group-hover:text-accent-text">
                            {step.title}
                          </span>
                          {step.duration ? (
                            <span className="shrink-0 rounded-[var(--radius-pill)] bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-muted">
                              <span className="sr-only">{durationLabel}: </span>
                              {step.duration}
                            </span>
                          ) : null}
                          <ArrowRightIcon
                            size={14}
                            className="text-faint opacity-0 transition-[transform,opacity,color] duration-250 group-hover:translate-x-0.5 group-hover:text-accent-text group-hover:opacity-100 rtl:group-hover:-translate-x-0.5"
                          />
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}
