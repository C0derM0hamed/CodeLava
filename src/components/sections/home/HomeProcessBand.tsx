import type { CSSProperties } from "react";
import { ActionLink } from "@/components/ui/ActionLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/experience/fx/Reveal";
import { WaveBand } from "@/experience/fx/WaveBand";
import { StepIcon } from "@/components/sections/process/step-icon";
import { formatNumber } from "@/lib/i18n-content";
import type { AppLocale } from "@/i18n/routing";
import type { ProcessStep } from "@/server/queries/types";

const TILE = 60; // px — matches .home-step__tile
const DROP = 34; // px — vertical offset of every other step (the reference's gentle zigzag)

/** Smooth path through the tile centres; x in a 0–1000 viewBox, y in px. */
function lavaPath(count: number) {
  const points = Array.from({ length: count }, (_, i) => ({
    x: ((i + 0.5) / count) * 1000,
    y: TILE / 2 + (i % 2 === 1 ? DROP : 0),
  }));
  const first = points[0];
  const last = points[points.length - 1];
  let d = `M0 ${first.y + 10} C${first.x * 0.5} ${first.y + 6} ${first.x * 0.6} ${first.y} ${first.x} ${first.y}`;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const mid = (a.x + b.x) / 2;
    d += ` C${mid} ${a.y} ${mid} ${b.y} ${b.x} ${b.y}`;
  }
  d += ` C${last.x + (1000 - last.x) * 0.4} ${last.y} ${last.x + (1000 - last.x) * 0.5} ${last.y - 8} 1000 ${last.y - 12}`;
  return d;
}

export interface HomeProcessBandProps {
  locale: AppLocale;
  eyebrow?: string;
  title: string;
  description?: string;
  ctaLabel: string;
  steps: ProcessStep[];
}

/**
 * The dark wavy process band (reference): split intro + white pill on the start side, DB process
 * steps on the end side joined by a glowing lava line (desktop) / a lava rail (mobile).
 */
export function HomeProcessBand({ locale, eyebrow, title, description, ctaLabel, steps }: HomeProcessBandProps) {
  const visible = steps.filter((step) => step.title.trim()).slice(0, 6);
  if (visible.length === 0) return null;
  const path = lavaPath(visible.length);
  const height = TILE + DROP;

  return (
    <WaveBand
      aria-labelledby="home-process-title"
      rim="top"
      className="my-8 sm:my-12"
      contentClassName="container-lava band-y"
    >
      <div className="grid items-center gap-[var(--space-split)] xl:grid-cols-[minmax(17.5rem,21.5rem)_minmax(0,1fr)]">
        <div className="min-w-0">
          <SectionHeading
            layout="intro"
            size="md"
            kicker={eyebrow}
            title={title}
            lead={description}
            titleId="home-process-title"
            action={
              <ActionLink href="/process" variant="inverse" size="sm">
                {ctaLabel}
              </ActionLink>
            }
          />
        </div>

        <div className="relative min-w-0">
          <svg
            aria-hidden="true"
            focusable="false"
            className="pointer-events-none absolute inset-x-0 top-0 hidden w-full overflow-visible lg:block rtl:-scale-x-100"
            style={{ height }}
            viewBox={`0 0 1000 ${height}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="home-lava-line" x1="0" y1="0" x2="1000" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="var(--lava-600)" stopOpacity="0" />
                <stop offset="0.12" stopColor="var(--lava-500)" stopOpacity="0.9" />
                <stop offset="0.5" stopColor="var(--ember)" />
                <stop offset="0.88" stopColor="var(--lava-500)" stopOpacity="0.9" />
                <stop offset="1" stopColor="var(--lava-600)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={path} fill="none" stroke="url(#home-lava-line)" strokeWidth="8" vectorEffect="non-scaling-stroke" style={{ filter: "blur(7px)", opacity: 0.6 }} />
            <path d={path} fill="none" stroke="url(#home-lava-line)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
          </svg>

          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-7 start-[1.875rem] top-7 w-0.5 -translate-x-1/2 rounded-full bg-gradient-to-b from-lava-500/0 via-lava-500 to-lava-500/0 shadow-[0_0_14px_var(--lava-500)] lg:hidden rtl:translate-x-1/2"
          />

          <ol
            className="relative grid gap-9 lg:grid-cols-[repeat(var(--steps),minmax(0,1fr))] lg:gap-[var(--space-grid)]"
            style={{ "--steps": visible.length } as CSSProperties}
          >
            {visible.map((step, index) => (
              <Reveal
                as="li"
                mode="block"
                key={step.id}
                delay={index * 90}
                className={`flex gap-5 lg:flex-col lg:items-center lg:gap-4 lg:text-center ${index % 2 === 1 ? "lg:pt-[34px]" : ""}`}
              >
                <span aria-hidden="true" className="home-step__tile shrink-0">
                  <StepIcon icon={step.icon} className="size-6" />
                </span>
                <span className="grid gap-2 pt-1 lg:max-w-[26ch] lg:pt-2">
                  <span dir="ltr" className="font-mono text-xs text-faint lg:hidden">
                    {formatNumber(index + 1, locale, { minimumIntegerDigits: 2, useGrouping: false })}
                  </span>
                  <span className="font-display text-[1.125rem] font-semibold leading-snug text-text">{step.title}</span>
                  {step.description ? (
                    <span className="text-[0.9375rem] leading-relaxed text-muted">{step.description}</span>
                  ) : null}
                </span>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </WaveBand>
  );
}
