import type { ReactNode } from "react";
import { Reveal } from "@/experience/fx/Reveal";
import { cn } from "./cn";

export interface SectionHeadingProps {
  /** Monospace section index such as "01" or "02 /". Trailing slash is formatted automatically if omitted. */
  index?: string;
  /** Short editorial kicker label next to the index. */
  kicker?: string;
  /** Primary display headline. */
  title: string;
  /** Optional lead description below or paired alongside the title. */
  lead?: string;
  /** Optional trailing action slot (e.g. <ActionLink variant="molten">). */
  action?: ReactNode;
  /** Display heading level & visual scale. */
  as?: "h1" | "h2" | "h3";
  size?: "xl" | "lg" | "md" | "sm";
  /** "split" creates an asymmetric editorial layout on desktop (title start, lead+action end). */
  layout?: "stack" | "split";
  /** Animate title words with bilingual-safe Reveal. Default true. */
  animated?: boolean;
  className?: string;
}

const SIZE_CLASS = {
  xl: "text-display-xl",
  lg: "text-display-lg",
  md: "text-display-md",
  sm: "text-display-sm",
} as const;

/**
 * Editorial numbered section heading (`01 / Services` + display headline + optional asymmetric split lead/CTA).
 */
export function SectionHeading({
  index,
  kicker,
  title,
  lead,
  action,
  as = "h2",
  size = "lg",
  layout = "stack",
  animated = true,
  className,
}: SectionHeadingProps) {
  const formattedIndex = index
    ? index.trim().endsWith("/")
      ? index.trim()
      : `${index.trim()} /`
    : null;

  const HeadingTag = as;

  const titleNode = animated ? (
    <Reveal as={as} mode="words" className={cn(SIZE_CLASS[size], "text-text")}>
      {title}
    </Reveal>
  ) : (
    <HeadingTag className={cn(SIZE_CLASS[size], "text-text")}>{title}</HeadingTag>
  );

  return (
    <header
      className={cn(
        layout === "split"
          ? "grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end lg:gap-10"
          : "flex flex-col gap-5",
        className,
      )}
    >
      <div className={cn(layout === "split" ? "lg:col-span-7" : "max-w-4xl", "space-y-4")}>
        {formattedIndex || kicker ? (
          <div className="flex items-center gap-3">
            {formattedIndex ? (
              <span
                dir="ltr"
                className="font-mono text-xs font-medium tracking-[0.12em] text-accent tabular-nums"
              >
                {formattedIndex}
              </span>
            ) : null}
            {kicker ? <span className="text-kicker text-muted">{kicker}</span> : null}
          </div>
        ) : null}
        {titleNode}
      </div>

      {lead || action ? (
        <div
          className={cn(
            layout === "split"
              ? "flex flex-col items-start gap-5 lg:col-span-5 lg:pb-1.5"
              : "flex max-w-2xl flex-col items-start gap-5",
          )}
        >
          {lead ? <p className="text-lead">{lead}</p> : null}
          {action ? <div>{action}</div> : null}
        </div>
      ) : null}
    </header>
  );
}
