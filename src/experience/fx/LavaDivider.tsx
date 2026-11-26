"use client";

import { useEffect, useId, useRef, useState } from "react";

export type LavaDividerVariant = "seam" | "crack";

export interface LavaDividerProps {
  variant?: LavaDividerVariant;
  /** Subtle ambient glow bleed above/below the seam. */
  glow?: boolean;
  className?: string;
}

/**
 * Molten architectural section separator.
 * "seam": razor-thin warm hairline with a slow travelling ember glint.
 * "crack": organic volcanic obsidian fissure with an incandescent core filament.
 * Animates ONLY while visible in the viewport (IntersectionObserver).
 */
export function LavaDivider({
  variant = "seam",
  glow = true,
  className = "",
}: LavaDividerProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const uid = useId().replace(/:/g, "");

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => {
        setVisible(entries[0]?.isIntersecting ?? false);
      },
      { threshold: 0.05 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  if (variant === "crack") {
    const gradId = `cl-crack-${uid}`;
    const coreId = `cl-core-${uid}`;
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={`relative w-full overflow-hidden py-4 select-none ${className}`}
      >
        {glow ? (
          <div
            className="pointer-events-none absolute inset-x-0 top-1/2 h-12 -translate-y-1/2 opacity-35 blur-2xl"
            style={{ background: "var(--gradient-heat-seam)" }}
          />
        ) : null}
        <svg
          viewBox="0 0 1440 28"
          preserveAspectRatio="none"
          fill="none"
          className="relative block h-7 w-full"
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="14" x2="1440" y2="14" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--obsidian-800)" stopOpacity="0" />
              <stop offset="16%" stopColor="var(--lava-700)" stopOpacity="0.6" />
              <stop offset="46%" stopColor="var(--lava-500)" stopOpacity="0.95" />
              <stop offset="52%" stopColor="var(--ember)" stopOpacity="1" />
              <stop offset="60%" stopColor="var(--lava-500)" stopOpacity="0.9" />
              <stop offset="84%" stopColor="var(--lava-700)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="var(--obsidian-800)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={coreId} x1="420" y1="14" x2="1020" y2="14" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--lava-400)" stopOpacity="0" />
              <stop offset="45%" stopColor="var(--ember)" stopOpacity="0.95" />
              <stop offset="55%" stopColor="var(--lava-100)" stopOpacity="1" />
              <stop offset="100%" stopColor="var(--lava-400)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Subtle full-width basalt fracture hairline */}
          <path
            d="M0 14 L210 14 L232 12.2 L268 15.6 L330 14 L520 14 L548 10.6 L592 17.5 L638 11.4 L695 15.2 L738 9.2 L772 16.4 L824 12.5 L872 15.4 L924 14 L1120 14 L1158 12.4 L1196 15.2 L1238 14 L1440 14"
            stroke={`url(#${gradId})`}
            strokeWidth="1.5"
            strokeLinejoin="round"
            className={visible ? "animate-lava-breathe" : undefined}
          />
          {/* Branching micro-fractures near center */}
          <path
            d="M695 15.2 L714 21.5 L728 23.2 M738 9.2 L752 4.2 L769 2.6 M592 17.5 L606 22.8"
            stroke="var(--lava-600)"
            strokeOpacity="0.55"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Incandescent magma center filament */}
          <path
            d="M520 14 L548 10.6 L592 17.5 L638 11.4 L695 15.2 L738 9.2 L772 16.4 L824 12.5 L872 15.4 L924 14"
            stroke={`url(#${coreId})`}
            strokeWidth="1"
            strokeLinejoin="round"
            className={visible ? "animate-lava-breathe" : undefined}
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`relative h-px w-full overflow-hidden bg-line select-none ${className}`}
    >
      {/* Travelling ember pulse — paused offscreen */}
      <span
        className={`absolute inset-y-0 start-0 w-1/2 ${visible ? "animate-lava-seam" : "opacity-60"}`}
        style={{ background: "var(--gradient-heat-seam)" }}
      />
      {glow ? (
        <span
          className="pointer-events-none absolute -top-2 inset-x-1/4 h-5 opacity-25 blur-md"
          style={{ background: "var(--gradient-heat-seam)" }}
        />
      ) : null}
    </div>
  );
}

export interface HeatEdgeProps {
  /** Whether the warm volcanic rim radiates upward from the bottom edge or downward from the top edge. */
  position?: "top" | "bottom";
  intensity?: "subtle" | "medium";
  className?: string;
}

/**
 * Radiant heat rim that anchors dark obsidian bands with subtle volcanic light emerging from an edge.
 */
export function HeatEdge({
  position = "bottom",
  intensity = "subtle",
  className = "",
}: HeatEdgeProps) {
  const isTop = position === "top";
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 ${
        isTop ? "top-0" : "bottom-0"
      } overflow-hidden select-none ${className}`}
    >
      <div
        className={`mx-auto h-px w-full ${intensity === "medium" ? "opacity-90" : "opacity-60"}`}
        style={{ background: "var(--gradient-heat-seam)" }}
      />
      <div
        className={`mx-auto h-16 w-3/4 blur-3xl ${
          isTop ? "-mt-8" : "-mb-8"
        } ${intensity === "medium" ? "opacity-25" : "opacity-14"}`}
        style={{ background: "var(--gradient-heat-seam)" }}
      />
    </div>
  );
}
