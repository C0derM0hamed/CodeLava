import { useId } from "react";

export interface LogoMarkProps {
  /** Rendered height of the emblem in pixels (width scales proportionally at 120:84). */
  size?: number | string;
  /** Enables subtle pulsing magma cracks and rising caldera embers (CSS-only, respects reduced motion). */
  animated?: boolean;
  /** Renders subtle warm ambient radiance on the caldera and lava bracket. Defaults to true. */
  glow?: boolean;
  className?: string;
  title?: string;
  "aria-hidden"?: boolean;
}

/**
 * Hand-crafted geometric SVG of the CodeLava emblem:
 * sculpted warm-white `<` bracket + incandescent lava-orange `>` bracket
 * cradling a faceted obsidian volcano carved with tapered, razor-sharp magma fissures.
 * Zero raw hex values — reads exclusively from CSS design tokens.
 */
export function LogoMark({
  size = 36,
  animated = false,
  glow = true,
  className = "",
  title = "CodeLava",
  "aria-hidden": ariaHidden,
}: LogoMarkProps) {
  const uid = useId().replace(/:/g, "");
  const ids = {
    leftFace: `cl-lf-${uid}`,
    leftBevel: `cl-lb-${uid}`,
    rightFace: `cl-rf-${uid}`,
    rightBevel: `cl-rb-${uid}`,
    rockLeft: `cl-rl-${uid}`,
    rockRight: `cl-rr-${uid}`,
    rockCenter: `cl-rc-${uid}`,
    caldera: `cl-ca-${uid}`,
    magmaOuter: `cl-mo-${uid}`,
    magmaCore: `cl-mc-${uid}`,
    glowFilter: `cl-gl-${uid}`,
  };

  const heightStyle = typeof size === "number" ? `${size}px` : size;
  const isDecorative = ariaHidden === true;

  return (
    <svg
      viewBox="0 0 120 84"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ height: heightStyle, width: "auto" }}
      className={`inline-block shrink-0 select-none overflow-visible ${className}`}
      role={isDecorative ? undefined : "img"}
      aria-label={isDecorative ? undefined : title}
      aria-hidden={isDecorative || undefined}
      focusable="false"
    >
      {!isDecorative && title ? <title>{title}</title> : null}
      <defs>
        {/* Left white `<` sculpted brushed-ash gradient */}
        <linearGradient id={ids.leftFace} x1="10" y1="15" x2="46" y2="66" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--ash-50)" />
          <stop offset="68%" stopColor="var(--ash-200)" />
          <stop offset="100%" stopColor="var(--ash-400)" />
        </linearGradient>
        <linearGradient id={ids.leftBevel} x1="9" y1="42" x2="44" y2="68" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--ash-400)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="var(--obsidian-600)" stopOpacity="0.45" />
        </linearGradient>

        {/* Right molten `>` gradient */}
        <linearGradient id={ids.rightFace} x1="72" y1="14" x2="111" y2="66" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--ember)" />
          <stop offset="28%" stopColor="var(--lava-400)" />
          <stop offset="66%" stopColor="var(--lava-500)" />
          <stop offset="100%" stopColor="var(--lava-600)" />
        </linearGradient>
        <linearGradient id={ids.rightBevel} x1="72" y1="14" x2="112" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--lava-100)" stopOpacity="0.72" />
          <stop offset="100%" stopColor="var(--lava-400)" stopOpacity="0.04" />
        </linearGradient>

        {/* Faceted obsidian basalt rock planes */}
        <linearGradient id={ids.rockLeft} x1="19" y1="76" x2="57" y2="33" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--obsidian-850)" />
          <stop offset="52%" stopColor="var(--obsidian-700)" />
          <stop offset="100%" stopColor="var(--obsidian-800)" />
        </linearGradient>
        <linearGradient id={ids.rockCenter} x1="60" y1="32" x2="60" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--obsidian-700)" />
          <stop offset="30%" stopColor="var(--obsidian-850)" />
          <stop offset="100%" stopColor="var(--obsidian-950)" />
        </linearGradient>
        <linearGradient id={ids.rockRight} x1="64" y1="34" x2="101" y2="76" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--obsidian-800)" />
          <stop offset="56%" stopColor="var(--obsidian-900)" />
          <stop offset="100%" stopColor="var(--obsidian-950)" />
        </linearGradient>

        {/* Soft seamless atmospheric caldera radiance (smooth exponential falloff, zero disc ring) */}
        <radialGradient id={ids.caldera} cx="60" cy="31" r="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--ember)" stopOpacity="0.7" />
          <stop offset="22%" stopColor="var(--lava-400)" stopOpacity="0.34" />
          <stop offset="52%" stopColor="var(--lava-600)" stopOpacity="0.09" />
          <stop offset="82%" stopColor="var(--lava-700)" stopOpacity="0.015" />
          <stop offset="100%" stopColor="var(--lava-900)" stopOpacity="0" />
        </radialGradient>

        {/* Molten fissure heat gradients */}
        <linearGradient id={ids.magmaOuter} x1="60" y1="32" x2="60" y2="77" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--lava-300)" />
          <stop offset="30%" stopColor="var(--lava-500)" />
          <stop offset="76%" stopColor="var(--lava-600)" />
          <stop offset="100%" stopColor="var(--lava-700)" />
        </linearGradient>
        <linearGradient id={ids.magmaCore} x1="60" y1="33" x2="60" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--lava-100)" />
          <stop offset="28%" stopColor="var(--ember)" />
          <stop offset="78%" stopColor="var(--lava-400)" />
          <stop offset="100%" stopColor="var(--lava-500)" stopOpacity="0.4" />
        </linearGradient>

        {glow ? (
          <filter id={ids.glowFilter} x="-30%" y="-35%" width="160%" height="170%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ) : null}
      </defs>

      {/* Atmospheric caldera radiance */}
      {glow ? (
        <circle
          cx="60"
          cy="31"
          r="34"
          fill={`url(#${ids.caldera})`}
          className={animated ? "animate-lava-breathe" : undefined}
        />
      ) : null}

      {/* LEFT BRACKET `<` (warm white, chamfered arms tucking cleanly behind left flank) */}
      <g>
        <path
          d="M47.5 14.5C48.8 13.6 50.5 14.5 50.5 16.1V22.4C50.5 23.6 49.9 24.7 48.9 25.4L23.2 42.3L42.8 55.1L38.4 63.2L10.9 45.6C8.5 44.1 8.5 40.5 10.9 39L47.5 14.5Z"
          fill={`url(#${ids.leftFace})`}
        />
        <path
          d="M23.2 42.3L10.9 45.6L38.4 63.2L42.8 55.1L23.2 42.3Z"
          fill={`url(#${ids.leftBevel})`}
        />
      </g>

      {/* RIGHT BRACKET `>` (molten lava orange) */}
      <g filter={glow ? `url(#${ids.glowFilter})` : undefined}>
        <path
          d="M72.5 14.5C71.2 13.6 69.5 14.5 69.5 16.1V22.4C69.5 23.6 70.1 24.7 71.1 25.4L96.8 42.3L77.2 55.1L81.6 63.2L109.1 45.6C111.5 44.1 111.5 40.5 109.1 39L72.5 14.5Z"
          fill={`url(#${ids.rightFace})`}
        />
        <path
          d="M72.5 14.5L109.1 39L96.8 42.3L71.1 25.4C70.1 24.7 69.5 23.6 69.5 22.4V16.1C69.5 14.5 71.2 13.6 72.5 14.5Z"
          fill={`url(#${ids.rightBevel})`}
        />
      </g>

      {/* FACETED OBSIDIAN VOLCANO */}
      <g>
        {/* Full faceted mountain silhouette */}
        <path
          d="M52.2 34.4L60 36.2L67.8 34.4L79.2 52.8L92.4 64.4L103.5 75.8L76.4 73.6L60 79.4L43.6 73.6L16.5 75.8L27.6 64.4L40.8 52.8L52.2 34.4Z"
          fill={`url(#${ids.rockCenter})`}
        />
        {/* Left illuminated basalt facet */}
        <path
          d="M52.2 34.4L56.2 51.8L45.8 62.6L16.5 75.8L27.6 64.4L40.8 52.8L52.2 34.4Z"
          fill={`url(#${ids.rockLeft})`}
        />
        {/* Right shadowed basalt slope */}
        <path
          d="M67.8 34.4L79.2 52.8L92.4 64.4L103.5 75.8L76.4 69.6L65.2 54.8L67.8 34.4Z"
          fill={`url(#${ids.rockRight})`}
        />
        {/* Central obsidian prism ridge */}
        <path
          d="M56.2 51.8L60 36.2L65.2 54.8L60 79.4L48.8 68.4L56.2 51.8Z"
          fill="var(--obsidian-800)"
          fillOpacity="0.68"
        />
        {/* Crisp outer ridge catch-light */}
        <path
          d="M17.4 75.2L40.8 52.8L52.2 34.4M102.6 75.2L79.2 52.8L67.8 34.4"
          stroke="var(--ash-50)"
          strokeOpacity="0.18"
          strokeWidth="0.85"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* TAPERED RAZOR-SHARP MAGMA FISSURES & CALDERA RIM */}
      <g
        filter={glow ? `url(#${ids.glowFilter})` : undefined}
        className={animated ? "animate-lava-breathe" : undefined}
      >
        {/* Outer molten caldera lip & tapered branching lava channels */}
        <path
          d="M52.2 34.4C56.2 35.8 63.8 35.8 67.8 34.4L66.8 36.8C63.2 38.2 56.8 38.2 53.2 36.8L52.2 34.4Z"
          fill={`url(#${ids.magmaOuter})`}
        />
        {/* Left main fissure (wide at rim, jagged, tapering to sharp tip on left flank) */}
        <path
          d="M55.2 36.2L58.2 36.6L55.2 50.8L60.2 57.6L69.4 72.2L68.2 73.1L56.9 58.6L53.4 53.2L44.2 61.8L29.5 72.6L28.8 71.9L42.2 59.4L51.9 49.4L55.2 36.2Z"
          fill={`url(#${ids.magmaOuter})`}
        />
        {/* Right flank fissure (sharp tapered crack descending right slope) */}
        <path
          d="M62.4 36.3L65.1 35.9L70.8 48.2L80.6 58.6L91.6 69.8L90.8 70.4L78.4 59.8L68.3 49.1L62.4 36.3Z"
          fill={`url(#${ids.magmaOuter})`}
        />
        {/* Secondary micro-fissure branch */}
        <path
          d="M57.6 52.8L60.2 50.6L66.8 59.2L73.6 66.2L73 66.7L64.8 59.8L57.6 52.8Z"
          fill="var(--lava-500)"
          fillOpacity="0.82"
        />

        {/* White-hot incandescent ember core filaments inside main cracks */}
        <path
          d="M53.4 35.1C57 36.5 63 36.5 66.6 35.1L65.9 36.3C62.7 37.3 57.3 37.3 54.1 36.3L53.4 35.1Z"
          fill="var(--ember)"
        />
        <path
          d="M56.2 36.4L57.3 36.5L54.3 50.6L58.4 56.8L65.8 68.2L57.1 57.3L53.5 52.1L44 60.5L34.2 68.4L43 59.6L52.8 49.9L56.2 36.4Z"
          fill={`url(#${ids.magmaCore})`}
        />
        <path
          d="M63.4 36.2L64.4 36.1L69.8 48.3L79 58.3L86.4 65.4L77.9 58.6L68.9 48.7L63.4 36.2Z"
          fill={`url(#${ids.magmaCore})`}
        />
      </g>

      {/* RISING EMBER SPARKS (animated mode) */}
      {animated ? (
        <g aria-hidden="true">
          <circle
            cx="57"
            cy="28"
            r="1.3"
            fill="var(--ember)"
            className="animate-lava-ember"
            style={{ "--ember-dur": "2.4s", "--ember-delay": "0s", "--ember-dx": "-3px" } as React.CSSProperties}
          />
          <circle
            cx="61"
            cy="26"
            r="1.6"
            fill="var(--lava-400)"
            className="animate-lava-ember"
            style={{ "--ember-dur": "3.1s", "--ember-delay": "0.8s", "--ember-dx": "4px" } as React.CSSProperties}
          />
          <circle
            cx="64"
            cy="29"
            r="1.1"
            fill="var(--lava-300)"
            className="animate-lava-ember"
            style={{ "--ember-dur": "2.7s", "--ember-delay": "1.5s", "--ember-dx": "2px" } as React.CSSProperties}
          />
          <circle
            cx="59"
            cy="30"
            r="1"
            fill="var(--ember)"
            className="animate-lava-ember"
            style={{ "--ember-dur": "2.1s", "--ember-delay": "1.9s", "--ember-dx": "-1px" } as React.CSSProperties}
          />
        </g>
      ) : null}
    </svg>
  );
}
