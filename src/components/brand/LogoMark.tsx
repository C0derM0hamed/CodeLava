import { useId, type CSSProperties } from "react";

export type LogoTone = "auto" | "light" | "dark";

export interface LogoMarkProps {
  /** Rendered height in px (or any CSS length). Width follows the viewBox ratio. */
  size?: number | string;
  /**
   * "auto" (default): full volcano at ≥ 32px, simplified brackets-only mark below.
   * "full": always draw the volcano. "simple": always brackets only.
   */
  detail?: "auto" | "full" | "simple";
  /** Breathing crater + rising embers (CSS only; frozen under reduced motion). */
  animated?: boolean;
  /** Soft crater glow behind the summit. Default true. */
  glow?: boolean;
  /**
   * Which background the mark sits on. "auto" follows the surrounding surface tokens
   * (`.surface-dark` flips automatically); "light"/"dark" force it.
   */
  tone?: LogoTone;
  className?: string;
  title?: string;
  "aria-hidden"?: boolean;
}

/** CSS variables that force a tone regardless of the surrounding surface. */
export const LOGO_TONE_VARS: Record<Exclude<LogoTone, "auto">, CSSProperties> = {
  light: {
    "--logo-word": "var(--ink-900)",
    "--logo-rock": "var(--ink-800)",
    "--logo-rock-edge": "var(--ink-600)",
    "--gradient-lava-wordmark": "var(--gradient-lava-wordmark-deep)",
  } as CSSProperties,
  dark: {
    "--logo-word": "var(--ash-50)",
    "--logo-rock": "var(--ink-600)",
    "--logo-rock-edge": "var(--ink-400)",
    "--gradient-lava-wordmark": "var(--gradient-lava-wordmark-bright)",
  } as CSSProperties,
};

/**
 * CodeLava emblem, redrawn for v2 (light-first): a cyan→blue `<` (code) and a lava-orange `>`
 * cradling a compact volcano with a glowing crater and two lava fissures.
 * Bold rounded strokes keep it crisp at header size; below ~32px the volcano is dropped
 * (detail="auto") so the brackets stay legible. Token-driven — no raw hex.
 */
export function LogoMark({
  size = 36,
  detail = "auto",
  animated = false,
  glow = true,
  tone = "auto",
  className = "",
  title = "CodeLava",
  "aria-hidden": ariaHidden,
}: LogoMarkProps) {
  const uid = useId().replace(/[:«»]/g, "");
  const ids = {
    code: `clm-code-${uid}`,
    lava: `clm-lava-${uid}`,
    rock: `clm-rock-${uid}`,
    crater: `clm-crater-${uid}`,
    fissure: `clm-fis-${uid}`,
  };

  const numericSize = typeof size === "number" ? size : Number.parseFloat(size);
  const simple =
    detail === "simple" || (detail === "auto" && Number.isFinite(numericSize) && numericSize < 32);
  const heightStyle = typeof size === "number" ? `${size}px` : size;
  const isDecorative = ariaHidden === true;
  const toneStyle = tone === "auto" ? undefined : LOGO_TONE_VARS[tone];

  return (
    <svg
      viewBox={simple ? "6 10 108 64" : "0 0 120 88"}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ height: heightStyle, width: "auto", ...toneStyle }}
      className={`inline-block shrink-0 select-none overflow-visible ${className}`}
      role={isDecorative ? undefined : "img"}
      aria-label={isDecorative ? undefined : title}
      aria-hidden={isDecorative || undefined}
      focusable="false"
    >
      {!isDecorative && title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id={ids.code} x1="16" y1="16" x2="50" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--brand-cyan)" />
          <stop offset="100%" stopColor="var(--brand-blue)" />
        </linearGradient>
        <linearGradient id={ids.lava} x1="70" y1="16" x2="104" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--lava-400)" />
          <stop offset="100%" stopColor="var(--lava-600)" />
        </linearGradient>
        {!simple ? (
          <>
            <linearGradient id={ids.rock} x1="60" y1="38" x2="60" y2="84" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--logo-rock-edge)" />
              <stop offset="55%" stopColor="var(--logo-rock)" />
              <stop offset="100%" stopColor="var(--logo-rock)" />
            </linearGradient>
            <radialGradient id={ids.crater} cx="60" cy="38" r="20" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--ember)" stopOpacity="0.55" />
              <stop offset="35%" stopColor="var(--lava-400)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--lava-500)" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={ids.fissure} x1="60" y1="38" x2="60" y2="82" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--ember)" />
              <stop offset="45%" stopColor="var(--lava-400)" />
              <stop offset="100%" stopColor="var(--lava-600)" stopOpacity="0.7" />
            </linearGradient>
          </>
        ) : null}
      </defs>

      {simple ? (
        <>
          <path
            d="M50 17L17 42L50 67"
            stroke={`url(#${ids.code})`}
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M70 17L103 42L70 67"
            stroke={`url(#${ids.lava})`}
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          {glow ? (
            <circle
              cx="60"
              cy="38"
              r="20"
              fill={`url(#${ids.crater})`}
              className={animated ? "animate-lava-breathe" : undefined}
            />
          ) : null}

          {/* Brackets — lower arms tuck behind the volcano flanks */}
          <path
            d="M47 15L13 42L47 69"
            stroke={`url(#${ids.code})`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M73 15L107 42L73 69"
            stroke={`url(#${ids.lava})`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Volcano — gently concave flanks */}
          <path
            d="M24 84C38 72 48 56 53.6 41.4C54.2 39.9 55.6 39.2 57 39.6L60 40.4L63 39.6C64.4 39.2 65.8 39.9 66.4 41.4C72 56 82 72 96 84H24Z"
            fill={`url(#${ids.rock})`}
          />
          {/* shadow facet (right flank) */}
          <path
            d="M60 40.4L63 39.6C64.4 39.2 65.8 39.9 66.4 41.4C72 56 82 72 96 84H66C67 70 64.5 56 60 40.4Z"
            fill="var(--ink-950)"
            fillOpacity="0.3"
          />

          {/* Crater lava lens + tapered fissures */}
          <g className={animated ? "animate-lava-breathe" : undefined}>
            <path
              d="M54.2 41.2C57.6 43.2 62.4 43.2 65.8 41.2C63.9 39.7 62 40 60 40.8C58 40 56.1 39.7 54.2 41.2Z"
              fill="var(--ember)"
            />
            <path
              d="M56.2 42.2L58.6 42.8L57.2 51.6L60.4 58.2L56 71.5L55.1 71.4L58.2 58.6L55 52.2Z"
              fill={`url(#${ids.fissure})`}
            />
            <path
              d="M62 42.8L64.2 42.3L67.8 51.4L66.2 57.8L73.6 69.4L72.8 70L64.8 58.4L66 51.6Z"
              fill={`url(#${ids.fissure})`}
            />
            <path d="M57.9 55.4L61.6 61.6L61 62L57.5 56.6Z" fill="var(--lava-500)" fillOpacity="0.85" />
          </g>

          {/* Embers above the crater (rise when animated) */}
          <g aria-hidden="true">
            {[
              { cx: 60, cy: 33.5, r: 1.7, dur: "2.6s", delay: "0s", dx: "1px", fill: "var(--lava-400)" },
              { cx: 56.4, cy: 29.5, r: 1.15, dur: "3.1s", delay: "0.8s", dx: "-3px", fill: "var(--ember)" },
              { cx: 63.6, cy: 27.8, r: 1.3, dur: "2.8s", delay: "1.5s", dx: "3px", fill: "var(--lava-300)" },
            ].map((e) => (
              <circle
                key={`${e.cx}-${e.cy}`}
                cx={e.cx}
                cy={e.cy}
                r={e.r}
                fill={e.fill}
                className={animated ? "animate-lava-ember" : undefined}
                style={
                  animated
                    ? ({ "--ember-dur": e.dur, "--ember-delay": e.delay, "--ember-dx": e.dx } as CSSProperties)
                    : undefined
                }
              />
            ))}
          </g>
        </>
      )}
    </svg>
  );
}
