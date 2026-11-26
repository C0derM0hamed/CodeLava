import type { ReactNode } from "react";
import { Reveal } from "@/experience/fx/Reveal";
import { cn } from "./cn";

export interface SectionHeadingProps {
  /** Legacy mono section index ("01" → "01 /"). When set, the kicker renders as mono meta next to it. */
  index?: string;
  /** Short kicker label. Without `index` it renders as the reference "kicker-rule" (orange rule + label). */
  kicker?: string;
  /** Display headline. Use "\n" for the reference's deliberate two-line H2s ("End-to-End\nDigital Solutions"). */
  title: string;
  /** A phrase inside `title` painted with the lava display gradient. */
  highlight?: string;
  /** Intro copy under the title. */
  lead?: string;
  /** Trailing action slot — typically `<ActionLink variant="text">` (split intro) or a pill. */
  action?: ReactNode;
  as?: "h1" | "h2" | "h3";
  size?: "xl" | "lg" | "md" | "sm";
  /**
   * "stack": kicker · title · lead · action stacked (default).
   * "split": title on the start side, lead + action on the end side (desktop).
   * "intro": compact column for the reference "split intro" — narrow measure, text link under the lead.
   *          Usually you want `<SplitIntro>` which also lays out the content column.
   */
  layout?: "stack" | "split" | "intro";
  /** Horizontal alignment for stack/intro layouts. */
  align?: "start" | "center";
  /** id applied to the heading element (for aria-labelledby on the section). */
  titleId?: string;
  /** Word rise + fade reveal. Default true. */
  animated?: boolean;
  className?: string;
}

const SIZE_CLASS = {
  xl: "text-display-xl",
  lg: "text-display-lg",
  md: "text-display-md",
  sm: "text-display-sm",
} as const;

/** Static (non-animated) title renderer with "\n" breaks and gradient highlight. */
export function renderDisplayTitle(title: string, highlight?: string): ReactNode {
  const lines = title.split("\n");
  const hl = highlight?.trim();
  return lines.map((line, li) => {
    let node: ReactNode = line;
    if (hl) {
      const at = line.indexOf(hl);
      if (at >= 0) {
        node = (
          <>
            {line.slice(0, at)}
            <span className="text-lava-gradient">{hl}</span>
            {line.slice(at + hl.length)}
          </>
        );
      }
    }
    return (
      <span key={li}>
        {node}
        {li < lines.length - 1 ? <br /> : null}
      </span>
    );
  });
}

/**
 * Section heading for the v2 light system: kicker-rule + bold display title (optionally two lines
 * with a gradient phrase) + muted intro + optional action.
 */
export function SectionHeading({
  index,
  kicker,
  title,
  highlight,
  lead,
  action,
  as = "h2",
  size = "lg",
  layout = "stack",
  align = "start",
  titleId,
  animated = true,
  className,
}: SectionHeadingProps) {
  const formattedIndex = index
    ? index.trim().endsWith("/")
      ? index.trim()
      : `${index.trim()} /`
    : null;
  const HeadingTag = as;
  const centered = align === "center" && layout !== "split";
  const titleClass = cn(SIZE_CLASS[size], "text-text");

  const titleNode = animated ? (
    <div id={titleId}>
      <Reveal as={as} mode="words" highlight={highlight} className={titleClass}>
        {title}
      </Reveal>
    </div>
  ) : (
    <HeadingTag id={titleId} className={titleClass}>
      {renderDisplayTitle(title, highlight)}
    </HeadingTag>
  );

  const kickerNode =
    formattedIndex || kicker ? (
      formattedIndex ? (
        <div className={cn("flex items-center gap-3", centered && "justify-center")}>
          <span
            dir="ltr"
            className="font-mono text-xs font-medium tracking-[0.12em] text-accent-text tabular-nums"
          >
            {formattedIndex}
          </span>
          {kicker ? <span className="text-kicker text-muted">{kicker}</span> : null}
        </div>
      ) : (
        <p className={cn("kicker-rule", centered && "kicker-rule--center")}>{kicker}</p>
      )
    ) : null;

  if (layout === "split") {
    return (
      <header
        className={cn("grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end lg:gap-12", className)}
      >
        <div className="space-y-4 lg:col-span-7">
          {kickerNode}
          {titleNode}
        </div>
        {lead || action ? (
          <div className="flex flex-col items-start gap-5 lg:col-span-5 lg:pb-1.5">
            {lead ? <p className="text-lead max-w-[46ch]">{lead}</p> : null}
            {action ? <div>{action}</div> : null}
          </div>
        ) : null}
      </header>
    );
  }

  const isIntro = layout === "intro";

  return (
    <header
      className={cn(
        "flex flex-col",
        isIntro ? "gap-4" : "gap-5",
        centered ? "items-center text-center" : "items-start",
        className,
      )}
    >
      {kickerNode}
      <div className={cn(!isIntro && "max-w-4xl", centered && "mx-auto")}>
        {titleNode}
      </div>
      {lead ? (
        <p
          className={cn(
            isIntro ? "max-w-[42ch] text-body text-muted" : "text-lead max-w-[54ch]",
            centered && "mx-auto",
          )}
        >
          {lead}
        </p>
      ) : null}
      {action ? <div className={cn(isIntro ? "pt-1" : "pt-2")}>{action}</div> : null}
    </header>
  );
}
