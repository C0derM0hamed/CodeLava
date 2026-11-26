import { LogoMark, LOGO_TONE_VARS, type LogoTone } from "./LogoMark";

export type LogoSize = "sm" | "md" | "lg" | "xl";
export type LogoVariant = "full" | "mark" | "wordmark";
export type LogoLayout = "horizontal" | "stacked";

export interface LogoProps {
  size?: LogoSize;
  variant?: LogoVariant;
  layout?: LogoLayout;
  /** Animates crater glow & rising embers on the mark. */
  animated?: boolean;
  /** Small tracked line under the wordmark (e.g. "Software & AI Solutions"). */
  tagline?: string;
  /**
   * Background the logo sits on. "auto" (default) follows surface tokens (`.surface-dark` flips it);
   * "light" = ink "Code" for light backgrounds; "dark" = warm-white "Code" for dark backgrounds.
   */
  tone?: LogoTone;
  /** @deprecated kept for compatibility — the dot now always belongs to "Lava." */
  dotTone?: "white" | "lava";
  className?: string;
}

const SIZE_MAP: Record<
  LogoSize,
  { mark: number; markStacked: number; text: string; gap: string; tagline: string }
> = {
  sm: { mark: 24, markStacked: 40, text: "text-[1.1875rem]", gap: "gap-2", tagline: "text-[0.5rem]" },
  md: { mark: 30, markStacked: 56, text: "text-[1.4375rem]", gap: "gap-2.5", tagline: "text-[0.5625rem]" },
  lg: { mark: 40, markStacked: 76, text: "text-[1.9375rem]", gap: "gap-3", tagline: "text-[0.6875rem]" },
  xl: { mark: 56, markStacked: 104, text: "text-[2.75rem]", gap: "gap-4", tagline: "text-[0.8125rem]" },
};

/**
 * CodeLava lockup: mark + geometric wordmark ("Code" ink/warm-white + "Lava." lava gradient).
 * Always LTR so "CodeLava." never reverses in Arabic layouts.
 */
export function Logo({
  size = "md",
  variant = "full",
  layout = "horizontal",
  animated = false,
  tagline,
  tone = "auto",
  className = "",
}: LogoProps) {
  const spec = SIZE_MAP[size];
  const isStacked = layout === "stacked";
  const toneStyle = tone === "auto" ? undefined : LOGO_TONE_VARS[tone];

  return (
    <span
      dir="ltr"
      style={toneStyle}
      className={`inline-flex shrink-0 select-none ${
        isStacked ? "flex-col items-center text-center" : "flex-row items-center"
      } ${spec.gap} ${className}`}
    >
      {variant !== "wordmark" ? (
        <LogoMark
          size={isStacked ? spec.markStacked : spec.mark}
          animated={animated}
          aria-hidden={variant === "full"}
        />
      ) : null}

      {variant !== "mark" ? (
        <span className={`inline-flex flex-col ${isStacked ? "items-center" : "items-start"}`}>
          <span
            dir="ltr"
            style={{ fontFamily: "var(--font-display-latin), var(--font-display), sans-serif" }}
            className={`inline-flex items-baseline font-bold leading-none tracking-[-0.03em] ${spec.text}`}
          >
            <span style={{ color: "var(--logo-word)" }}>Code</span>
            <span className="text-lava-gradient pe-[0.04em]">Lava.</span>
          </span>

          {tagline ? (
            <span
              className={`mt-[0.35em] inline-flex items-center gap-2 font-semibold uppercase leading-none tracking-[0.22em] text-muted ${spec.tagline}`}
            >
              {isStacked ? <span className="h-px w-5 bg-accent/70" aria-hidden="true" /> : null}
              <span>{tagline}</span>
              {isStacked ? <span className="h-px w-5 bg-accent/70" aria-hidden="true" /> : null}
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
