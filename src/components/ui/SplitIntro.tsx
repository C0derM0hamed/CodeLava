import type { ReactNode } from "react";
import { ActionLink } from "./ActionLink";
import { SectionHeading } from "./SectionHeading";
import { cn } from "./cn";

export interface SplitIntroProps {
  kicker?: string;
  /** Two-line titles read best: "Modern Technologies\nfor Real Impact". */
  title: string;
  highlight?: string;
  lead?: string;
  /** Convenience text link rendered under the lead (`<ActionLink variant="text">`). */
  link?: { href: string; label: string };
  /** Custom action node (overrides `link`). */
  action?: ReactNode;
  /** Content column (tiles, cards, logos, carousel…). */
  children: ReactNode;
  /** Put the intro on the end side instead (vary the rhythm between sections). */
  reverse?: boolean;
  /** Intro column width on desktop: "narrow" ≈ 33% (default) or "wide" ≈ 42%. */
  introWidth?: "narrow" | "wide";
  /** Vertical alignment of the intro against the content column. */
  alignIntro?: "start" | "center" | "end";
  as?: "h2" | "h3";
  size?: "lg" | "md" | "sm";
  titleId?: string;
  animated?: boolean;
  className?: string;
  contentClassName?: string;
}

/**
 * The reference's signature "split intro": a narrow intro column (kicker-rule · two-line H2 ·
 * short intro · orange text link) beside a wide content column. Mirrors automatically in RTL.
 */
export function SplitIntro({
  kicker,
  title,
  highlight,
  lead,
  link,
  action,
  children,
  reverse = false,
  introWidth = "narrow",
  alignIntro = "start",
  as = "h2",
  size = "md",
  titleId,
  animated = true,
  className,
  contentClassName,
}: SplitIntroProps) {
  const actionNode =
    action ??
    (link ? (
      <ActionLink href={link.href} variant="text" size="sm">
        {link.label}
      </ActionLink>
    ) : null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14",
        alignIntro === "center" && "lg:items-center",
        alignIntro === "end" && "lg:items-end",
        className,
      )}
    >
      <div
        className={cn(
          introWidth === "wide" ? "lg:col-span-5" : "lg:col-span-4",
          reverse && "lg:order-last",
        )}
      >
        <SectionHeading
          layout="intro"
          as={as}
          size={size}
          kicker={kicker}
          title={title}
          highlight={highlight}
          lead={lead}
          action={actionNode}
          titleId={titleId}
          animated={animated}
        />
      </div>
      <div
        className={cn(
          introWidth === "wide" ? "lg:col-span-7" : "lg:col-span-8",
          "min-w-0",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
