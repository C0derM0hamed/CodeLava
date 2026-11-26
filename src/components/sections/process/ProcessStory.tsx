import type { ReactNode } from "react";
import { Reveal } from "@/experience/fx/Reveal";
import { PillLink, SectionIntro } from "./kit";
import { ProcessTimeline, type TimelineStep } from "./ProcessTimeline";

/** Wavy, glowing band edge from the reference. `flip` mirrors it for the bottom edge. */
function BandEdge({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 56"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-x-0 z-10 block h-8 w-full sm:h-12 ${
        flip ? "top-full -mt-px -scale-y-100" : "bottom-full -mb-px"
      }`}
    >
      <defs>
        <linearGradient id={flip ? "band-glow-b" : "band-glow-t"} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="var(--lava-500)" stopOpacity="0" />
          <stop offset="0.5" stopColor="var(--lava-400)" stopOpacity="0.85" />
          <stop offset="1" stopColor="var(--lava-500)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 56V30C180 6 360 4 560 22s420 34 640 10c90-10 170-26 240-20V56Z"
        fill="var(--ink-900)"
      />
      <path
        d="M0 30C180 6 360 4 560 22s420 34 640 10c90-10 170-26 240-20"
        fill="none"
        stroke={`url(#${flip ? "band-glow-b" : "band-glow-t"})`}
        strokeWidth="1.5"
      />
    </svg>
  );
}

export interface ProcessStoryProps {
  kicker?: string;
  title: string;
  lead?: string;
  ctaLabel: string;
  steps: TimelineStep[];
  durationLabel: string;
  empty: ReactNode;
}

export function ProcessStory({ kicker, title, lead, ctaLabel, steps, durationLabel, empty }: ProcessStoryProps) {
  if (steps.length === 0) return <section className="py-16 sm:py-24">{empty}</section>;

  return (
    <section id="stages" className="surface-dark relative mt-8 scroll-mt-24 py-20 sm:mt-14 sm:py-28">
      <BandEdge />
      <BandEdge flip />
      {/* soft lava bloom behind the story, contained inside the band */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-24 start-[8%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--lava-500)_22%,transparent),transparent)]" />
        <div className="absolute -bottom-32 end-[4%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--lava-600)_16%,transparent),transparent)]" />
      </div>

      <div className="container-lava relative z-20 grid gap-14 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-20">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+2.5rem)] lg:self-start">
          <Reveal mode="block">
            <SectionIntro
              kicker={kicker}
              title={title}
              lead={lead}
              action={
                <PillLink href="/quote" size="md">
                  {ctaLabel}
                </PillLink>
              }
            />
          </Reveal>
        </div>
        <ProcessTimeline steps={steps} durationLabel={durationLabel} />
      </div>
    </section>
  );
}
