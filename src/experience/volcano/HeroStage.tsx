"use client";

import { useCallback, useEffect, useId, useRef, type ReactNode } from "react";
import { HeroVolcano } from "./HeroVolcano";

import { useVolcanoSound, VolcanoSoundToggle, type VolcanoSoundLabels } from "./sound";

type Props = { locale: "en" | "ar"; children: ReactNode; className?: string; titleId?: string; soundLabels?: VolcanoSoundLabels };

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

const HERO_SCROLL_PROPS = [
  "--hero-t-eyebrow",
  "--hero-t-line1",
  "--hero-t-line2",
  "--hero-t-lead",
  "--hero-t-cta",
  "--hero-return-p",
  "--hero-return-rule",
  "--hero-return-cta",
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
    returnP: -1,
    returnRule: -1,
    returnCta: -1,
    phaseAHidden: false,
    phaseBVisible: false,
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
      if (copyEl) {
        for (const prop of HERO_SCROLL_PROPS) copyEl.style.removeProperty(prop);
        const phaseA = copyEl.querySelector<HTMLElement>('[data-hero-phase="a"]');
        const phaseB = copyEl.querySelector<HTMLElement>('[data-hero-phase="b"]');
        if (phaseA) {
          phaseA.inert = false;
          delete phaseA.dataset.heroHidden;
        }
        if (phaseB) {
          phaseB.inert = true;
          phaseB.dataset.heroHidden = "true";
        }
      }
      lastStateRef.current = {
        eyebrow: -1,
        line1: -1,
        line2: -1,
        lead: -1,
        cta: -1,
        returnP: -1,
        returnRule: -1,
        returnCta: -1,
        phaseAHidden: false,
        phaseBVisible: false,
      };
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

      // Phase A (0 → 0.43): staggered drift & fade-out as the volcano erupts, keeping the middle scene clean.
      const eyebrow = smoothstep(0.04, 0.34, p);
      const line1 = smoothstep(0.07, 0.40, p);
      const line2 = smoothstep(0.10, 0.43, p);
      const lead = smoothstep(0.08, 0.39, p);
      const cta = smoothstep(0.06, 0.36, p);

      // Phase B (0.80 → 1.00): after the CodeLava logo finishes forming (reveal reaches 1.0 at p=0.82
      // in daylight-scene.ts), reveal a calmer closing composition word-by-word plus both CTAs.
      const returnP = clamp01((p - 0.80) / 0.14);
      const returnRule = smoothstep(0.80, 0.87, p);
      const returnCta = smoothstep(0.87, 0.97, p);

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
      if (prev.returnP !== returnP) {
        copyEl.style.setProperty("--hero-return-p", returnP.toFixed(4));
        prev.returnP = returnP;
      }
      if (prev.returnRule !== returnRule) {
        copyEl.style.setProperty("--hero-return-rule", returnRule.toFixed(4));
        prev.returnRule = returnRule;
      }
      if (prev.returnCta !== returnCta) {
        copyEl.style.setProperty("--hero-return-cta", returnCta.toFixed(4));
        prev.returnCta = returnCta;
      }

      // Interactive whenever visible; inert only while hidden in between (fully reversible).
      const phaseAHidden = cta >= 0.85;
      if (prev.phaseAHidden !== phaseAHidden) {
        prev.phaseAHidden = phaseAHidden;
        const phaseA = copyEl.querySelector<HTMLElement>('[data-hero-phase="a"]');
        if (phaseA) {
          phaseA.inert = phaseAHidden;
          if (phaseAHidden) {
            phaseA.dataset.heroHidden = "true";
          } else {
            delete phaseA.dataset.heroHidden;
          }
        }
      }

      const phaseBVisible = returnP >= 0.08;
      if (prev.phaseBVisible !== phaseBVisible) {
        prev.phaseBVisible = phaseBVisible;
        const phaseB = copyEl.querySelector<HTMLElement>('[data-hero-phase="b"]');
        if (phaseB) {
          phaseB.inert = !phaseBVisible;
          if (phaseBVisible) {
            delete phaseB.dataset.heroHidden;
          } else {
            phaseB.dataset.heroHidden = "true";
          }
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
