import { DaylightMotion } from "./DaylightMotion";
import manifest from "../../../public/media/hero/seq/manifest.json";
import "./daylight.css";

type Props = { locale: "en" | "ar"; className?: string; onProgress?: (progress: number) => void };

export function HeroVolcano({ locale, className, onProgress }: Props) {
  const root = "/media/hero/seq";
  const last = String(manifest.frameCount - 1).padStart(3, "0");

  return (
    <DaylightMotion locale={locale} className={className} onProgress={onProgress}>
      <div className="dl-backdrop">
        <div className="dl-media-frame">
          <picture>
            <source media="(prefers-reduced-motion: reduce) and (max-width: 900px)" srcSet={`${root}/mobile/${last}.avif`} />
            <source media="(prefers-reduced-motion: reduce)" srcSet={`${root}/desktop/${last}.avif`} />
            <source media="(max-width: 900px)" srcSet={`${root}/mobile/000.avif`} />
            <img className="dl-poster" src={`${root}/desktop/000.avif`} width={1920} height={1080}
              alt="" fetchPriority="high" decoding="async" {...{ elementtiming: "volcano-poster" }} />
          </picture>
          <canvas className="dl-sequence" aria-hidden="true" />
        </div>
      </div>
    </DaylightMotion>
  );
}
