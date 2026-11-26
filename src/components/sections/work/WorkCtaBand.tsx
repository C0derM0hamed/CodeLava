import { Reveal } from "@/experience/fx/Reveal";
import { Kicker, PillLink } from "../process/kit";
import type { WorkSectionCopy } from "./types";

export interface WorkCtaBandProps {
  cta: WorkSectionCopy;
  fallbackCtaLabel: string;
}

export function WorkCtaBand({ cta, fallbackCtaLabel }: WorkCtaBandProps) {
  return (
    <section className="py-16 sm:py-24">
      <div className="container-lava">
        <div className="page-wash flex flex-col items-start justify-between gap-8 rounded-[var(--radius-xl)] border border-line bg-surface px-6 py-12 shadow-card sm:px-12 sm:py-16 lg:flex-row lg:items-end">
          <div className="max-w-3xl space-y-4">
            {cta.eyebrow ? <Kicker>{cta.eyebrow}</Kicker> : null}
            <Reveal as="h2" mode="words" className="text-display-md text-text">
              {cta.title || fallbackCtaLabel}
            </Reveal>
            {cta.description ? <p className="text-lead max-w-2xl">{cta.description}</p> : null}
          </div>
          <PillLink href="/quote" size="lg">
            {cta.ctaLabel || fallbackCtaLabel}
          </PillLink>
        </div>
      </div>
    </section>
  );
}
