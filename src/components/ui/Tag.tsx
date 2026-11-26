import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export type TagTone = "default" | "lava" | "outline" | "syntax-cyan" | "syntax-green" | "ink";

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: TagTone;
  /** Leading status dot. */
  dot?: boolean;
  size?: "sm" | "md";
}

const TONE_STYLES: Record<TagTone, string> = {
  default: "border-line bg-surface-2 text-muted",
  lava: "border-transparent bg-accent-soft text-accent-text",
  outline: "border-line-strong bg-transparent text-muted",
  "syntax-cyan": "border-transparent bg-[color-mix(in_oklab,var(--code-cyan)_11%,transparent)] text-text",
  "syntax-green": "border-transparent bg-[color-mix(in_oklab,var(--code-green)_11%,transparent)] text-text",
  ink: "border-transparent bg-text text-bg",
};

const DOT_STYLES: Record<TagTone, string> = {
  default: "bg-faint",
  lava: "bg-accent",
  outline: "bg-faint",
  "syntax-cyan": "bg-code-cyan",
  "syntax-green": "bg-code-green",
  ink: "bg-accent",
};

/**
 * Soft chip for categories, tech stacks and metadata. Sentence case in the body font
 * (pass `className="font-mono"` + `dir="ltr"` for code-ish values like package names).
 */
export function Tag({
  children,
  tone = "default",
  dot = false,
  size = "sm",
  className,
  ...props
}: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-pill)] border font-medium leading-none",
        size === "sm" ? "h-7 px-2.5 text-xs" : "h-8 px-3 text-[0.8125rem]",
        TONE_STYLES[tone],
        className,
      )}
      {...props}
    >
      {dot ? (
        <span aria-hidden="true" className={cn("h-1.5 w-1.5 shrink-0 rounded-full", DOT_STYLES[tone])} />
      ) : null}
      <span>{children}</span>
    </span>
  );
}
