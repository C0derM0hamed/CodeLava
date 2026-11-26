import { useId, type HTMLAttributes, type ReactNode } from "react";

export interface WaveBandProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  children: ReactNode;
  as?: "section" | "div" | "aside";
  /** Which edges get the soft wave. Default "both". */
  edges?: "both" | "top" | "bottom" | "none";
  /** Glowing lava rim traced along a wavy edge (reference: process band). Default "top". */
  rim?: "top" | "bottom" | "both" | "none";
  /** Soft lava light pooled inside the band. Default true. */
  glow?: boolean;
  /** Classes for the inner content wrapper (padding/containers live here). */
  contentClassName?: string;
}

// One gentle swell: rises at the start, dips mid-way, lifts again near the end.
const FILL_PATH =
  "M0 96V58C120 40 250 18 420 22C610 27 720 74 900 76C1080 78 1230 30 1440 34V96H0Z";
const RIM_PATH = "M0 58C120 40 250 18 420 22C610 27 720 74 900 76C1080 78 1230 30 1440 34";

function Edge({ position, rim, uid }: { position: "top" | "bottom"; rim: boolean; uid: string }) {
  const gradId = `wave-rim-${position}-${uid}`;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 1440 96"
      preserveAspectRatio="none"
      className={`pointer-events-none relative block h-[clamp(34px,5.2vw,84px)] w-full overflow-visible rtl:-scale-x-100 ${
        position === "top" ? "-mb-px" : "-mt-px -scale-y-100"
      }`}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--lava-500)" stopOpacity="0" />
          <stop offset="22%" stopColor="var(--lava-500)" stopOpacity="0.55" />
          <stop offset="48%" stopColor="var(--ember)" stopOpacity="0.95" />
          <stop offset="70%" stopColor="var(--lava-400)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="var(--lava-500)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={FILL_PATH} fill="var(--ink-900)" />
      {rim ? (
        <>
          <path
            d={RIM_PATH}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="7"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={{ filter: "blur(6px)", opacity: 0.55 }}
          />
          <path
            d={RIM_PATH}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="1.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </>
      ) : null}
    </svg>
  );
}

/**
 * Full-bleed dark ink band with soft wavy top/bottom edges (SVG), an optional glowing lava rim,
 * and `.surface-dark` applied so every semantic token inside flips to the dark palette.
 * Server-component safe; RTL mirrors the wave; no motion.
 */
export function WaveBand({
  children,
  as: Tag = "section",
  edges = "both",
  rim = "top",
  glow = true,
  className = "",
  contentClassName = "",
  ...rest
}: WaveBandProps) {
  const uid = useId().replace(/[:«»]/g, "");
  const hasTop = edges === "both" || edges === "top";
  const hasBottom = edges === "both" || edges === "bottom";

  return (
    <Tag className={`relative isolate ${className}`} {...rest}>
      {hasTop ? <Edge position="top" rim={rim === "top" || rim === "both"} uid={uid} /> : null}
      <div className="surface-dark relative overflow-hidden">
        {glow ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(40% 55% at 70% 45%, color-mix(in oklab, var(--lava-600) 14%, transparent) 0%, transparent 100%), radial-gradient(30% 45% at 14% 70%, color-mix(in oklab, var(--lava-700) 10%, transparent) 0%, transparent 100%)",
            }}
          />
        ) : null}
        <div className={`relative ${contentClassName}`}>{children}</div>
      </div>
      {hasBottom ? <Edge position="bottom" rim={rim === "bottom" || rim === "both"} uid={uid} /> : null}
    </Tag>
  );
}
