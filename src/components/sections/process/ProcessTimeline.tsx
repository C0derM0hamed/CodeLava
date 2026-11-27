"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Clock } from "lucide-react";
import "./process.css";

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
 * Vertical storytelling timeline. A lava conduit connects the step nodes and fills in as the reader
 * scrolls (segment by segment, driven by CSS variables so React never re-renders on scroll).
 * Step 01 starts warmly lit and a subtle ember baseline keeps the track alive even before scrolling.
 * Without JS, or with reduced motion, every segment is fully lit.
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
      const focusLine = window.innerHeight * 0.72;
      items.forEach((item, idx) => {
        const rect = item.getBoundingClientRect();
        const rawProgress = Math.min(1, Math.max(0, (focusLine - rect.top - 28) / Math.max(1, rect.height - 28)));
        // Keep step 01 warmly engaged with at least a gentle ignition lead-in
        const progress = idx === 0 ? Math.max(0.28, rawProgress) : rawProgress;
        item.style.setProperty("--seg", progress.toFixed(3));
        item.dataset.active = idx === 0 || focusLine >= rect.top + 28 ? "true" : "false";
      });
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
            data-active={index === 0 ? "true" : "false"}
            className="group/step relative scroll-mt-[calc(var(--header-h)+2rem)] ps-[4.5rem] pb-11 last:pb-0 sm:ps-[5.75rem] sm:pb-14"
          >
            {/* node */}
            <span
              className="absolute start-0 top-0 grid size-14 place-items-center rounded-2xl border border-white/14 bg-[color-mix(in_oklab,var(--ink-800)_92%,black)] text-lava-400 shadow-[0_10px_30px_-12px_rgb(0_0_0/0.6)] transition-[border-color,box-shadow,color,transform] duration-500 group-data-[active=true]/step:border-lava-400/75 group-data-[active=true]/step:text-lava-300 group-data-[active=true]/step:shadow-[0_0_0_4px_color-mix(in_oklab,var(--lava-500)_16%,transparent),0_0_38px_-4px_color-mix(in_oklab,var(--lava-500)_60%,transparent)] sm:size-16 [&_svg]:size-6 sm:[&_svg]:size-7"
            >
              {step.icon}
            </span>

            {/* connecting lava conduit — centered geometrically under the 56px (3.5rem) / 64px (4rem) node */}
            {!last ? (
              <span
                aria-hidden="true"
                className="absolute start-[calc(1.75rem-1px)] top-14 -bottom-0 w-0.5 sm:start-[calc(2rem-1px)] sm:top-16"
              >
                <span className="process-conduit-ambient" />
                <span
                  className="absolute inset-0 origin-top rounded-full bg-[linear-gradient(180deg,var(--ember),var(--lava-400)_42%,var(--lava-600))]"
                  style={{ transform: "scaleY(var(--seg, 0.28))" }}
                />
                <span
                  className="absolute -inset-x-1.5 inset-y-0 origin-top rounded-full bg-lava-500/60 blur-[6px]"
                  style={{ transform: "scaleY(var(--seg, 0.28))" }}
                />
              </span>
            ) : null}

            {/* card */}
            <div className="process-step-card">
              <span aria-hidden="true" dir="ltr" className="process-step-watermark hidden sm:block">
                {step.number}
              </span>

              <div className="relative flex flex-wrap items-center gap-x-3.5 gap-y-2 pe-0 sm:pe-20">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-lava-300">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-lava-400" />
                  <span>{step.stepLabel}</span>
                </p>
                {step.duration ? (
                  <span className="inline-flex items-center gap-1.5 rounded-pill border border-white/14 bg-white/[0.06] px-3 py-1 text-xs font-medium text-ink-200">
                    <Clock aria-hidden="true" className="size-3.5 text-lava-400" />
                    <span className="sr-only">{durationLabel}: </span>
                    <span>{step.duration}</span>
                  </span>
                ) : null}
              </div>

              <h3 className="text-display-sm relative mt-3.5 text-ash-50 sm:pe-20">{step.title}</h3>
              {step.description ? (
                <p className="text-body relative mt-3 max-w-[56ch] text-ink-200">{step.description}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
