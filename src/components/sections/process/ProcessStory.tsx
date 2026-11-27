import { useId, type ReactNode } from "react";
import { Reveal } from "@/experience/fx/Reveal";
import { PillLink, SectionIntro } from "./kit";
import { ProcessTimeline, type TimelineStep } from "./ProcessTimeline";
import "./process.css";

/** Wavy, glowing band edge with RTL mirroring and dual-pass molten rim stroke. */
function BandEdge({ flip = false, uid }: { flip?: boolean; uid: string }) {
  const gradId = `process-band-glow-${flip ? "b" : "t"}-${uid}`;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 1440 64"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-x-0 z-10 block h-9 w-full overflow-visible sm:h-14 rtl:-scale-x-100 ${
        flip ? "top-full -mt-px -scale-y-100" : "bottom-full -mb-px"
      }`}
    >
      <defs>
        <linearGradient id={gradId} x1="0" x2="1440" y1="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--lava-500)" stopOpacity="0" />
          <stop offset="22%" stopColor="var(--lava-500)" stopOpacity="0.58" />
          <stop offset="50%" stopColor="var(--ember)" stopOpacity="0.95" />
          <stop offset="76%" stopColor="var(--lava-400)" stopOpacity="0.65" />
          <stop offset="100%" stopColor="var(--lava-500)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 64V34C180 8 360 6 560 25s420 38 640 12c90-11 170-28 240-22V64Z"
        fill="var(--ink-900)"
      />
      <path
        d="M0 34C180 8 360 6 560 25s420 38 640 12c90-11 170-28 240-22"
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="7"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        style={{ filter: "blur(6px)", opacity: 0.55 }}
      />
      <path
        d="M0 34C180 8 360 6 560 25s420 38 640 12c90-11 170-28 240-22"
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="1.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
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
  const uid = useId().replace(/[:«»]/g, "");
  if (steps.length === 0) return <section className="py-16 sm:py-24">{empty}</section>;

  return (
    <section id="stages" className="surface-dark section-y relative mt-8 scroll-mt-24 sm:mt-14">
      <BandEdge uid={uid} />
      <BandEdge flip uid={uid} />
      {/* soft lava bloom & subtle grain behind the story, contained inside the band */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="grain-overlay absolute inset-0" />
        <div className="absolute -top-24 start-[8%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--lava-500)_24%,transparent),transparent)]" />
        <div className="absolute -bottom-32 end-[4%] h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--lava-600)_18%,transparent),transparent)]" />
      </div>

      <div className="container-lava relative z-20 grid gap-[var(--space-split)] lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
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
