"use client";

import { useId, useRef, type ReactNode } from "react";
import { HeroVolcano } from "./HeroVolcano";

import { useVolcanoSound, VolcanoSoundToggle, type VolcanoSoundLabels } from "./sound";

type Props = { locale: "en" | "ar"; children: ReactNode; className?: string; titleId?: string; soundLabels?: VolcanoSoundLabels };

export function HeroStage({ locale, children, className, titleId, soundLabels }: Props) {
  const stageRef = useRef<HTMLElement>(null);
  const sound = useVolcanoSound({ stageRef });
  const after = useId();
  const ar = locale === "ar";
  const phases = ar
    ? ["سكون", "اشتعال", "ثوران", "تدفّق الكود", "الهوية"]
    : ["Stillness", "Ignition", "Eruption", "Code flow", "Identity"];

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
          <HeroVolcano locale={locale} onProgress={sound.setProgress} />
          <VolcanoSoundToggle sound={sound} labels={soundLabels} tone="dark" />

          {/* Cinematic readability & framing scrims */}
          <div className="dl-scrim" aria-hidden="true" />

          {/* Hero copy directly overlaid on the full-bleed volcano */}
          <div className="dl-overlay">
            <div className="container-lava dl-copy-grid">
              <div className="dl-copy">{children}</div>
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
