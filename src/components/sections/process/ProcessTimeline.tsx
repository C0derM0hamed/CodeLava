"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Clock } from "lucide-react";

export interface TimelineStep {
  id: string;
  /** Localised ordinal, e.g. "01" / "٠١". */
  number: string;
  stepLabel: string;
  title: string;
  description: string;
  duration: string | null;
  /** Server-rendered icon element. */
  icon: ReactNode;
}

export interface ProcessTimelineProps {
  steps: TimelineStep[];
  durationLabel: string;
}

/**
 * Vertical storytelling timeline. A lava line connects the step nodes and fills in as the reader
 * scrolls (segment by segment, driven by CSS variables so React never re-renders on scroll).
 * Without JS, or with reduced motion, every segment is simply fully lit.
 */
export function ProcessTimeline({ steps, durationLabel }: ProcessTimelineProps) {
  const listRef = useRef<HTMLOListElement | null>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const items = Array.from(list.querySelectorAll<HTMLElement>("[data-step]"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const lightAll = () => {
      for (const item of items) {
        item.style.setProperty("--seg", "1");
        item.dataset.active = "true";
      }
    };

    let frame = 0;
    const update = () => {
      frame = 0;
      const focusLine = window.innerHeight * 0.55;
      for (const item of items) {
        const rect = item.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, (focusLine - rect.top - 28) / Math.max(1, rect.height - 28)));
        item.style.setProperty("--seg", progress.toFixed(3));
        item.dataset.active = focusLine >= rect.top + 28 ? "true" : "false";
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    if (reduced.matches) {
      lightAll();
      return;
    }
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [steps.length]);

  return (
    <ol ref={listRef} className="relative m-0 list-none p-0">
      {steps.map((step, index) => {
        const last = index === steps.length - 1;
        return (
          <li
            key={step.id}
            id={`step-${step.id}`}
            data-step
            data-active="false"
            className="group/step relative scroll-mt-[calc(var(--header-h)+2rem)] ps-[4.75rem] pb-12 last:pb-0 sm:ps-[5.75rem] sm:pb-16"
          >
            {/* node */}
            <span
              className="absolute start-0 top-0 grid size-14 place-items-center rounded-2xl border border-white/12 bg-[color-mix(in_oklab,var(--ink-800)_90%,black)] text-lava-400 shadow-[0_10px_30px_-12px_rgb(0_0_0/0.6)] transition-[border-color,box-shadow,color] duration-500 group-data-[active=true]/step:border-lava-500/70 group-data-[active=true]/step:text-lava-300 group-data-[active=true]/step:shadow-[0_0_0_4px_color-mix(in_oklab,var(--lava-500)_14%,transparent),0_0_36px_-4px_color-mix(in_oklab,var(--lava-500)_55%,transparent)] sm:size-16 [&_svg]:size-6 sm:[&_svg]:size-7"
            >
              {step.icon}
            </span>

            {/* connecting lava line to the next node */}
            {!last ? (
              <span aria-hidden="true" className="absolute start-[1.65rem] top-14 -bottom-0 w-0.5 sm:start-[1.85rem] sm:top-16">
                <span className="absolute inset-0 rounded-full bg-white/10" />
                <span
                  className="absolute inset-0 origin-top rounded-full bg-[linear-gradient(180deg,var(--lava-300),var(--lava-500)_55%,var(--lava-600))]"
                  style={{ transform: "scaleY(var(--seg, 0))" }}
                />
                <span
                  className="absolute -inset-x-1 inset-y-0 origin-top rounded-full bg-lava-500/55 blur-[6px]"
                  style={{ transform: "scaleY(var(--seg, 0))" }}
                />
              </span>
            ) : null}

            {/* card */}
            <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.045] p-[var(--space-card)] transition-[border-color,background-color] duration-500 group-data-[active=true]/step:border-white/20 group-data-[active=true]/step:bg-white/[0.07]">
              <span
                aria-hidden="true"
                dir="ltr"
                className="pointer-events-none absolute end-6 -top-3 hidden font-display text-[7.5rem] leading-none font-bold text-transparent select-none sm:block [-webkit-text-stroke:1px_rgb(255_255_255/0.09)]"
              >
                {step.number}
              </span>

              <div className="relative flex flex-wrap items-center gap-x-4 gap-y-2">
                <p className="text-sm font-semibold text-accent-text">{step.stepLabel}</p>
                {step.duration ? (
                  <span className="inline-flex items-center gap-1.5 rounded-pill border border-white/12 bg-white/[0.05] px-3 py-1 text-xs font-medium text-muted">
                    <Clock aria-hidden="true" className="size-3.5 text-lava-400" />
                    <span className="sr-only">{durationLabel}: </span>
                    <span>{step.duration}</span>
                  </span>
                ) : null}
              </div>

              <h3 className="text-display-sm relative mt-3 text-text">{step.title}</h3>
              {step.description ? (
                <p className="text-body relative mt-3 max-w-[58ch] text-muted">{step.description}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
