import type { CSSProperties } from "react";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

/**
 * Resolved token constants mirrored from src/app/globals.css exclusively for
 * next/og (Satori), which cannot evaluate CSS custom properties at render time.
 */
const OG_PALETTE = {
  obsidian950: "#07060a",
  obsidian900: "#0c0b10",
  obsidian850: "#121117",
  obsidian800: "#18161e",
  obsidian700: "#24212b",
  ash50: "#fbf7f2",
  ash200: "#e6ddd3",
  ash400: "#b3a99f",
  ash500: "#8c8379",
  lava300: "#ffb066",
  lava400: "#ff8a2a",
  lava500: "#ff6a00",
  lava600: "#e94e06",
  lava700: "#b8360a",
  lava900: "#4a1405",
  ember: "#ffcf4a",
} as const;

export interface CodeLavaOgProps {
  /** Mono index + category label, e.g. "01 / CASE STUDY" or "SOFTWARE & AI ENGINEERING". */
  kicker?: string;
  /** Primary editorial display headline. */
  title: string;
  /** Optional concise supporting line. */
  subtitle?: string;
  /** Optional metadata pills (up to 3 recommended). */
  tags?: string[];
  /** Locale direction — Satori renders RTL cleanly when dir="rtl" and Arabic font is loaded. */
  locale?: "en" | "ar";
  /** Optional bottom-end label (e.g. site hostname supplied by caller; never hardcoded). */
  footerLabel?: string;
}

/**
 * Satori-compatible inline SVG mark for next/og ImageResponse (no CSS variables or filters).
 */
function OgLogoMark({ height = 42 }: { height?: number }) {
  const width = Math.round((height * 120) / 84);
  return (
    <svg width={width} height={height} viewBox="0 0 120 84" fill="none">
      {/* Left warm-white `<` */}
      <path
        d="M47.5 14.5C48.8 13.6 50.5 14.5 50.5 16.1V22.4C50.5 23.6 49.9 24.7 48.9 25.4L23.2 42.3L42.8 55.1L38.4 63.2L10.9 45.6C8.5 44.1 8.5 40.5 10.9 39L47.5 14.5Z"
        fill={OG_PALETTE.ash50}
      />
      {/* Right lava `>` */}
      <path
        d="M72.5 14.5C71.2 13.6 69.5 14.5 69.5 16.1V22.4C69.5 23.6 70.1 24.7 71.1 25.4L96.8 42.3L77.2 55.1L81.6 63.2L109.1 45.6C111.5 44.1 111.5 40.5 109.1 39L72.5 14.5Z"
        fill={OG_PALETTE.lava500}
      />
      {/* Faceted obsidian volcano body */}
      <path
        d="M52.2 34.4L60 36.2L67.8 34.4L79.2 52.8L92.4 64.4L103.5 75.8L76.4 73.6L60 79.4L43.6 73.6L16.5 75.8L27.6 64.4L40.8 52.8L52.2 34.4Z"
        fill={OG_PALETTE.obsidian800}
        stroke="rgba(251,247,242,0.18)"
        strokeWidth="0.9"
      />
      {/* Left basalt facet */}
      <path
        d="M52.2 34.4L56.2 51.8L45.8 62.6L16.5 75.8L27.6 64.4L40.8 52.8L52.2 34.4Z"
        fill={OG_PALETTE.obsidian700}
      />
      {/* Tapered razor-sharp magma cracks */}
      <path
        d="M52.2 34.4C56.2 35.8 63.8 35.8 67.8 34.4L66.8 36.8C63.2 38.2 56.8 38.2 53.2 36.8L52.2 34.4Z"
        fill={OG_PALETTE.lava500}
      />
      <path
        d="M55.2 36.2L58.2 36.6L55.2 50.8L60.2 57.6L69.4 72.2L68.2 73.1L56.9 58.6L53.4 53.2L44.2 61.8L29.5 72.6L28.8 71.9L42.2 59.4L51.9 49.4L55.2 36.2Z"
        fill={OG_PALETTE.lava500}
      />
      <path
        d="M62.4 36.3L65.1 35.9L70.8 48.2L80.6 58.6L91.6 69.8L90.8 70.4L78.4 59.8L68.3 49.1L62.4 36.3Z"
        fill={OG_PALETTE.lava500}
      />
      <path
        d="M53.4 35.1C57 36.5 63 36.5 66.6 35.1L65.9 36.3C62.7 37.3 57.3 37.3 54.1 36.3L53.4 35.1Z"
        fill={OG_PALETTE.ember}
      />
      <path
        d="M56.2 36.4L57.3 36.5L54.3 50.6L58.4 56.8L65.8 68.2L57.1 57.3L53.5 52.1L44 60.5L34.2 68.4L43 59.6L52.8 49.9L56.2 36.4Z"
        fill={OG_PALETTE.ember}
      />
      <path
        d="M63.4 36.2L64.4 36.1L69.8 48.3L79 58.3L86.4 65.4L77.9 58.6L68.9 48.7L63.4 36.2Z"
        fill={OG_PALETTE.ember}
      />
    </svg>
  );
}

/**
 * 1200×630 Open Graph template component for `next/og` (`new ImageResponse(<CodeLavaOgTemplate ... />, OG_SIZE)`).
 * Uses pure flexbox + inline styles so Satori renders deterministically with zero external CSS.
 */
export function CodeLavaOgTemplate({
  kicker = "SOFTWARE & AI SOLUTIONS",
  title,
  subtitle,
  tags = [],
  locale = "en",
  footerLabel = "CodeLava",
}: CodeLavaOgProps) {
  const isRtl = locale === "ar";
  const rowDir: CSSProperties["flexDirection"] = isRtl ? "row-reverse" : "row";

  return (
    <div
      style={{
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: OG_PALETTE.obsidian950,
        backgroundImage:
          "radial-gradient(ellipse 65% 70% at 88% 96%, rgba(233,78,6,0.28) 0%, rgba(74,20,5,0.16) 40%, rgba(7,6,10,0) 72%), radial-gradient(ellipse 45% 45% at 10% 8%, rgba(255,106,0,0.09) 0%, rgba(7,6,10,0) 65%)",
        color: OG_PALETTE.ash50,
        padding: "56px 68px 48px",
        position: "relative",
        fontFamily: isRtl ? "Readex Pro, IBM Plex Sans Arabic, sans-serif" : "Outfit, Geist, sans-serif",
      }}
    >
      {/* Subtle architectural hairline frame */}
      <div
        style={{
          position: "absolute",
          inset: 22,
          border: "1px solid rgba(251,247,242,0.08)",
          borderRadius: 16,
          display: "flex",
        }}
      />

      {/* Top row: Brand lockup + Kicker */}
      <div
        style={{
          display: "flex",
          flexDirection: rowDir,
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <OgLogoMark height={38} />
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              fontSize: 32,
              fontWeight: 600,
              letterSpacing: "-0.035em",
            }}
          >
            <span style={{ color: OG_PALETTE.ash50 }}>Code</span>
            <span style={{ color: OG_PALETTE.lava500 }}>Lava</span>
            <span style={{ color: OG_PALETTE.ash50 }}>.</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 16px",
            borderRadius: 6,
            border: "1px solid rgba(255,106,0,0.34)",
            backgroundColor: "rgba(255,106,0,0.08)",
            color: OG_PALETTE.lava300,
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: isRtl ? "0em" : "0.14em",
            textTransform: isRtl ? "none" : "uppercase",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: 99,
              backgroundColor: OG_PALETTE.ember,
              display: "flex",
            }}
          />
          <span>{kicker}</span>
        </div>
      </div>

      {/* Main editorial headline + subtitle */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: isRtl ? "flex-end" : "flex-start",
          textAlign: isRtl ? "right" : "left",
          gap: 20,
          maxWidth: 960,
          alignSelf: isRtl ? "flex-end" : "flex-start",
        }}
      >
        <div
          style={{
            fontSize: title.length > 52 ? 54 : 68,
            fontWeight: 500,
            lineHeight: isRtl ? 1.24 : 1.02,
            letterSpacing: isRtl ? "0em" : "-0.036em",
            color: OG_PALETTE.ash50,
            display: "flex",
          }}
        >
          {title}
        </div>

        {subtitle ? (
          <div
            style={{
              fontSize: 25,
              lineHeight: isRtl ? 1.6 : 1.45,
              color: OG_PALETTE.ash400,
              maxWidth: 820,
              display: "flex",
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>

      {/* Bottom strip: tags + signature footer + molten bottom seam */}
      <div style={{ display: "flex", flexDirection: "column", gap: 22, width: "100%" }}>
        <div
          style={{
            width: "100%",
            height: 2,
            backgroundImage:
              "linear-gradient(90deg, rgba(74,20,5,0) 0%, #b8360a 22%, #ff6a00 48%, #ffcf4a 52%, #ff6a00 58%, rgba(74,20,5,0) 100%)",
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: rowDir,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: rowDir, gap: 10 }}>
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 15,
                  color: OG_PALETTE.ash200,
                  padding: "6px 14px",
                  borderRadius: 6,
                  border: "1px solid rgba(251,247,242,0.14)",
                  backgroundColor: OG_PALETTE.obsidian900,
                  display: "flex",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <div
            style={{
              fontSize: 17,
              color: OG_PALETTE.ash500,
              letterSpacing: isRtl ? "0em" : "0.1em",
              textTransform: isRtl ? "none" : "uppercase",
              display: "flex",
            }}
          >
            {footerLabel}
          </div>
        </div>
      </div>
    </div>
  );
}
