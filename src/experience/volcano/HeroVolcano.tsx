import { DaylightMotion } from "./DaylightMotion";
import "./daylight.css";

type Props = { locale: "en" | "ar"; className?: string };

export function HeroVolcano({ locale, className }: Props) {
  return (
    <DaylightMotion locale={locale} className={className}>
      <div className="dl-backdrop">
        <div className="dl-media-frame">
          {/* eslint-disable-next-line @next/next/no-img-element -- Shares the exact object-cover geometry of the scrubbed eruption video */}
          <img
            className="dl-poster"
            src="/media/hero/calm.webp"
            width={1280}
            height={720}
            alt=""
            fetchPriority="high"
            decoding="async"
          />
          <video
            className="dl-video"
            muted
            playsInline
            preload="none"
            aria-hidden="true"
          />
          <div className="dl-crater-glow" aria-hidden="true" />
        </div>
      </div>

      {/* GPU WebGL volcanic sparks & ambient rising embers */}
      <canvas className="dl-canvas dl-embers" data-dl-embers="" aria-hidden="true" />

      {/* Crisp syntax-highlighted code fragments erupting on physical arcs from the crater */}
      <canvas className="dl-canvas dl-code" data-dl-code="" aria-hidden="true" />
    </DaylightMotion>
  );
}
