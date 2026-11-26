import "./volcano.css";

/** Place first inside the relatively positioned section following the hero. */
export function HeroFilament() {
  return (
    <svg
      className="cl-volcano-filament-next"
      aria-hidden="true"
      viewBox="0 0 1000 100"
      preserveAspectRatio="none"
    >
      <path
        d="M180 0 C180 59 110 52 65 94"
        fill="none"
        stroke="var(--lava-400)"
        strokeWidth="1.4"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
