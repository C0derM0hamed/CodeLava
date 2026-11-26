import { LogoMark } from "./LogoMark";

export type LogoSize = "sm" | "md" | "lg" | "xl";
export type LogoVariant = "full" | "mark" | "wordmark";
export type LogoLayout = "horizontal" | "stacked";

export interface LogoProps {
  size?: LogoSize;
  variant?: LogoVariant;
  layout?: LogoLayout;
  /** Animates caldera magma glow & rising sparks on the mark. */
  animated?: boolean;
  /** Optional tracked tagline displayed beneath the stacked wordmark. */
  tagline?: string;
  /** Trailing dot tone — warm-white matches the key art; lava matches inline wordmarks. */
  dotTone?: "white" | "lava";
  className?: string;
}

const SIZE_MAP: Record<
  LogoSize,
  { mark: number; markStacked: number; text: string; gap: string; tagline: string }
> = {
  sm: {
    mark: 22,
    markStacked: 38,
    text: "text-[1.125rem]",
    gap: "gap-2",
    tagline: "text-[0.625rem]",
  },
  md: {
    mark: 28,
    markStacked: 52,
    text: "text-[1.375rem]",
    gap: "gap-2.5",
    tagline: "text-[0.6875rem]",
  },
  lg: {
    mark: 38,
    markStacked: 72,
    text: "text-[1.875rem]",
    gap: "gap-3.5",
    tagline: "text-[0.75rem]",
  },
  xl: {
    mark: 54,
    markStacked: 96,
    text: "text-[2.75rem]",
    gap: "gap-4",
    tagline: "text-[0.8125rem]",
  },
};

/**
 * CodeLava brand lockup combining the inline SVG volcanic mark with the geometric
 * Outfit wordmark ("Code" warm-white + "Lava" molten gradient + ".").
 * Wordmark explicitly enforces dir="ltr" so "CodeLava." never reverses in RTL contexts.
 */
export function Logo({
  size = "md",
  variant = "full",
  layout = "horizontal",
  animated = false,
  tagline,
  dotTone = "white",
  className = "",
}: LogoProps) {
  const spec = SIZE_MAP[size];
  const isStacked = layout === "stacked";

  return (
    <span
      dir="ltr"
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
            className={`inline-flex items-baseline font-semibold leading-none tracking-[-0.035em] ${spec.text}`}
          >
            <span className="text-text">Code</span>
            <span className="text-lava-gradient">Lava</span>
            <span className={dotTone === "lava" ? "text-accent" : "text-text"}>.</span>
          </span>

          {tagline ? (
            <span
              className={`mt-2 inline-flex items-center gap-2.5 font-mono uppercase tracking-[0.26em] text-muted ${spec.tagline}`}
            >
              <span className="h-px w-5 bg-accent/70" aria-hidden="true" />
              <span>{tagline}</span>
              <span className="h-px w-5 bg-accent/70" aria-hidden="true" />
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
