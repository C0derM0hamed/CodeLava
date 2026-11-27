"use client";

import { useCallback, useEffect, useId, useRef, type ReactNode } from "react";
import { HeroVolcano } from "./HeroVolcano";

import { useVolcanoSound, VolcanoSoundToggle, type VolcanoSoundLabels } from "./sound";

type Props = { locale: "en" | "ar"; children: ReactNode; className?: string; titleId?: string; soundLabels?: VolcanoSoundLabels };

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

const HERO_SCROLL_PROPS = [
  "--hero-t-eyebrow",
  "--hero-t-line1",
  "--hero-t-line2",
  "--hero-t-lead",
  "--hero-t-cta",
] as const;

export function HeroStage({ locale, children, className, titleId, soundLabels }: Props) {
  const stageRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const reducedMotionRef = useRef(false);
  const lastStateRef = useRef({
    eyebrow: -1,
    line1: -1,
    line2: -1,
    lead: -1,
    cta: -1,
    faded: false,
  });
  const sound = useVolcanoSound({ stageRef });
  const { setProgress } = sound;
  const after = useId();
  const ar = locale === "ar";
  const phases = ar
    ? ["سكون", "اشتعال", "ثوران", "تدفّق الكود", "الهوية"]
    : ["Stillness", "Ignition", "Eruption", "Code flow", "Identity"];

  useEffect(() => {
    const resetCopy = () => {
      const copyEl = copyRef.current;
      if (!copyEl) return;
      for (const prop of HERO_SCROLL_PROPS) copyEl.style.removeProperty(prop);
      copyEl.inert = false;
      delete copyEl.dataset.heroFaded;
      lastStateRef.current = { eyebrow: -1, line1: -1, line2: -1, lead: -1, cta: -1, faded: false };
    };

    const query =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    const syncMotion = () => {
      reducedMotionRef.current = Boolean(query?.matches);
      if (reducedMotionRef.current) resetCopy();
    };

    syncMotion();
    query?.addEventListener("change", syncMotion);
    return () => {
      query?.removeEventListener("change", syncMotion);
      resetCopy();
    };
  }, []);

  const handleProgress = useCallback(
    (p: number) => {
      setProgress(p);
      const copyEl = copyRef.current;
      if (!copyEl || reducedMotionRef.current) return;

      // Staggered smoothstep curves: copy lifts & clears cleanly before code flow / logo reveal.
      const eyebrow = smoothstep(0.04, 0.34, p);
      const line1 = smoothstep(0.07, 0.40, p);
      const line2 = smoothstep(0.10, 0.43, p);
      const lead = smoothstep(0.08, 0.39, p);
      const cta = smoothstep(0.06, 0.36, p);

      const prev = lastStateRef.current;
      if (prev.eyebrow !== eyebrow) {
        copyEl.style.setProperty("--hero-t-eyebrow", eyebrow.toFixed(4));
        prev.eyebrow = eyebrow;
      }
      if (prev.line1 !== line1) {
        copyEl.style.setProperty("--hero-t-line1", line1.toFixed(4));
        prev.line1 = line1;
      }
      if (prev.line2 !== line2) {
        copyEl.style.setProperty("--hero-t-line2", line2.toFixed(4));
        prev.line2 = line2;
      }
      if (prev.lead !== lead) {
        copyEl.style.setProperty("--hero-t-lead", lead.toFixed(4));
        prev.lead = lead;
      }
      if (prev.cta !== cta) {
        copyEl.style.setProperty("--hero-t-cta", cta.toFixed(4));
        prev.cta = cta;
      }

      // Disable pointer & keyboard focus once CTAs fade past visibility; restore when scrolling back.
      const faded = cta >= 0.85;
      if (prev.faded !== faded) {
        prev.faded = faded;
        copyEl.inert = faded;
        if (faded) {
          copyEl.dataset.heroFaded = "true";
        } else {
          delete copyEl.dataset.heroFaded;
        }
      }
    },
    [setProgress],
  );

  return (
    <>
      <section
        ref={stageRef}
        data-daylight-stage=""
        data-hero-dark="true"
        data-surface="dark"
        className={["dl-stage surface-dark", className].filter(Boolean).join(" ")}
        dir={ar ? "rtl" : "ltr"}
        lang={locale}
        aria-labelledby={titleId || undefined}
        aria-label={titleId ? undefined : ar ? "مقدمة" : "Introduction"}
      >
        <div className="dl-pin">
          <a className="dl-skip" href={"#" + after}>
            {ar ? "تخطّ المشهد" : "Skip the animation"}
          </a>

          {/* Scroll-scrubbed frames from the supplied volcano film */}
          <HeroVolcano locale={locale} onProgress={handleProgress} />
          <VolcanoSoundToggle sound={sound} labels={soundLabels} tone="dark" />

          {/* Cinematic readability & framing scrims */}
          <div className="dl-scrim" aria-hidden="true" />

          {/* Hero copy directly overlaid on the full-bleed volcano */}
          <div className="dl-overlay">
            <div className="container-lava dl-copy-grid">
              <div ref={copyRef} className="dl-copy">{children}</div>
            </div>
          </div>

          {/* Bottom scroll progress rail & volcanic phase indicator */}
          <div className="dl-cue" aria-hidden="true">
            <div className="container-lava dl-cue-inner">
              <div className="dl-cue-left">
                <span className="dl-mouse">
                  <i />
                </span>
                <span className="dl-cue-label">{ar ? "مرّر لإشعال البركان" : "Scroll to erupt"}</span>
              </div>

              <div className="dl-cue-right">
                <span className="dl-phases">
                  {phases.map((label, idx) => (
                    <span key={label} data-dl-phase={idx} hidden={idx !== 0}>
                      {label}
                    </span>
                  ))}
                </span>
                <span className="dl-track">
                  <i />
                </span>
              </div>
            </div>
          </div>

          <div className="dl-horizon-rim" aria-hidden="true" />
        </div>
      </section>
      <div id={after} tabIndex={-1} className="dl-end" />
    </>
  );
}
