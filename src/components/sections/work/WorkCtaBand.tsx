import { ActionLink } from "@/components/ui/ActionLink";
import { LavaDivider } from "@/experience/fx/LavaDivider";
import { Reveal } from "@/experience/fx/Reveal";
import type { WorkSectionCopy } from "./types";

export interface WorkCtaBandProps {
  cta: WorkSectionCopy;
  fallbackCtaLabel: string;
}

export function WorkCtaBand({ cta, fallbackCtaLabel }: WorkCtaBandProps) {
  const title = cta.title || fallbackCtaLabel;
  const label = cta.ctaLabel || fallbackCtaLabel;

  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      <div className="container-lava">
        <LavaDivider variant="crack" className="mb-14 sm:mb-20" />

        <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-line bg-bg-elevated px-6 py-12 sm:px-12 sm:py-16">
          <div
            aria-hidden="true"
            className="heat-haze-radial pointer-events-none absolute inset-x-0 bottom-0 h-72 opacity-65"
          />

          <div className="relative z-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-3xl space-y-4">
              {cta.eyebrow ? (
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--lava-500)]"
                  />
                  <span className="text-kicker text-accent">{cta.eyebrow}</span>
                </div>
              ) : null}

              <Reveal as="h2" mode="words" className="text-display-md text-text">
                {title}
              </Reveal>

              {cta.description ? <p className="text-lead max-w-2xl">{cta.description}</p> : null}
            </div>

            <div className="shrink-0">
              <ActionLink href="/quote" variant="molten" size="lg" magnetic>
                {label}
              </ActionLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
