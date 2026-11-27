"use client";

import { useEffect, useId, useRef, type CSSProperties } from "react";
import "./volcano.css";
import { VolcanoMark } from "./mark";

export interface VolcanoProps {
  locale: "en" | "ar";
  tagline?: string;
  kicker?: string;
  onComplete?: () => void;
  className?: string;
}

function Wordmark() {
  return (
    <span dir="ltr" className="cl-volcano-wordmark">
      Code<span>Lava.</span>
    </span>
  );
}

export default function VolcanoExperience({
  locale,
  tagline,
  kicker,
  className,
  onComplete,
}: VolcanoProps) {
  const root = useRef<HTMLElement>(null);
  const endId = useId();
  const complete = useRef(onComplete);
  const didComplete = useRef(false);
  useEffect(() => {
    complete.current = onComplete;
  }, [onComplete]);
  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let dispose: (() => void) | undefined;
    let cancel: (() => void) | undefined;
    let generation = 0;
    function configure() {
      generation++;
      const version = generation;
      cancel?.();
      dispose?.();
      dispose = undefined;
      if (motion.matches || !section) return;
      const start = () => {
        void import("./scene")
          .then(({ mount }) => {
            if (version === generation)
              dispose = mount(section, () => {
                if (!didComplete.current) {
                  didComplete.current = true;
                  complete.current?.();
                }
              });
          })
          .catch(() => {
            /* Static poster and identity remain readable. */
          });
      };
      if (typeof window.requestIdleCallback === "function") {
        const id = window.requestIdleCallback(start, { timeout: 750 });
        cancel = () => window.cancelIdleCallback(id);
      } else {
        const id = window.setTimeout(start, 60);
        cancel = () => window.clearTimeout(id);
      }
    }
    configure();
    motion.addEventListener("change", configure);
    return () => {
      generation++;
      cancel?.();
      dispose?.();
      motion.removeEventListener("change", configure);
    };
  }, []);
  const ar = locale === "ar";
  const line =
    tagline ?? (ar ? "ابتكار يتدفق برمجياً" : "Software & AI Solutions");
  const stages = ar
    ? ["سكون", "اشتعال", "تدفّق", "تشكّل", "هوية"]
    : ["Stillness", "Ignition", "Eruption", "Flow", "Identity"];
  return (
    <>
      <section
        ref={root}
        data-surface="dark"
        aria-label="CodeLava"
        lang={locale}
        dir={ar ? "rtl" : "ltr"}
        className={["cl-volcano-scene", className].filter(Boolean).join(" ")}
      >
        <div className="cl-volcano-stage" data-stage="">
          <a href={`#${endId}`} className="cl-volcano-skip">
            {ar ? "تخطَّ المشهد" : "Skip the scene"}
          </a>
          <div className="cl-volcano-backdrop">
            {/* eslint-disable-next-line @next/next/no-img-element -- The LCP plate shares the video's exact crop. */}
            <img
              className="cl-volcano-poster"
              src="/media/hero/calm.webp"
              width="1280"
              height="720"
              alt=""
              fetchPriority="high"
            />
            <video
              className="cl-volcano-plate"
              muted
              playsInline
              preload="none"
              aria-hidden="true"
            />
          </div>
          <div className="cl-volcano-scrim" />
          <canvas className="cl-volcano-fx" data-ink="" aria-hidden="true" />
          <canvas className="cl-volcano-fx" data-embers="" aria-hidden="true" />
          <div className="cl-volcano-intro">
            {kicker && <p className="cl-volcano-kicker">{kicker}</p>}
            <h1>
              <Wordmark />
            </h1>
            <p className="cl-volcano-tag">{line}</p>
          </div>
          <div className="cl-volcano-reveal" aria-hidden="true">
            <VolcanoMark />
            <Wordmark />
            <p className="cl-volcano-tag">{line}</p>
          </div>
          <div className="cl-volcano-foot" aria-hidden="true">
            <div className="cl-volcano-instruction">
              <i />
              {ar ? "مرّر للاستكشاف" : "Scroll to explore"}
            </div>
            <div className="cl-volcano-track">
              <span className="cl-volcano-phase">
                {stages.map((s, i) => (
                  <span key={s} data-phase={i} hidden={i !== 0}>
                    {s}
                  </span>
                ))}
              </span>
              <span className="cl-volcano-ticks" dir="ltr">
                {stages.map((s, i) => (
                  <i key={s} data-tick={i} />
                ))}
              </span>
            </div>
          </div>
          <div className="cl-volcano-ambient" aria-hidden="true">
            {Array.from({ length: 16 }, (_, i) => (
              <i
                key={i}
                style={
                  {
                    left: `${(i * 37 + 7) % 100}%`,
                    top: `${(i * 23 + 17) % 100}%`,
                    "--drift": `${((i % 4) - 1.5) * 13}px`,
                    animationDelay: `${-i * 1.79}s`,
                    animationDuration: `${5 + (i % 5)}s`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
          <div className="cl-volcano-bleed" />
          <svg
            className="cl-volcano-filament-out"
            aria-hidden="true"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
          >
            <path
              d="M500 620 C502 735 180 745 180 1000"
              pathLength="1"
              fill="none"
              stroke="var(--lava-400)"
              strokeWidth="1.4"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      </section>
      <span className="cl-volcano-end" id={endId} tabIndex={-1} />
    </>
  );
}
