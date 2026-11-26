import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export type TagTone = "default" | "lava" | "outline" | "syntax-cyan" | "syntax-green";

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: TagTone;
  /** Subtle leading ember indicator dot. */
  dot?: boolean;
}

const TONE_STYLES: Record<TagTone, string> = {
  default: "border-line bg-surface text-ash-200",
  lava: "border-line-lava bg-lava-900/35 text-lava-300",
  outline: "border-line-strong bg-transparent text-muted",
  "syntax-cyan": "border-syntax-cyan/25 bg-syntax-cyan/8 text-syntax-cyan",
  "syntax-green": "border-syntax-green/25 bg-syntax-green/8 text-syntax-green",
};

/**
 * Technical metadata badge — crisp architectural corner radius, monospace metadata legibility
 * in Latin and clean un-spaced sans in Arabic.
 */
export function Tag({ children, tone = "default", dot = false, className, ...props }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-[var(--radius-sm)] border px-2.5 py-1 font-mono text-[11px] font-medium tracking-[0.06em] uppercase leading-none",
        "rtl:font-sans rtl:text-xs rtl:tracking-normal rtl:normal-case",
        TONE_STYLES[tone],
        className,
      )}
      {...props}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className={cn(
            "h-1.5 w-1.5 shrink-0 rounded-full",
            tone === "syntax-green"
              ? "bg-syntax-green"
              : tone === "syntax-cyan"
                ? "bg-syntax-cyan"
                : "bg-accent shadow-[0_0_8px_var(--lava-500)]",
          )}
        />
      ) : null}
      <span>{children}</span>
    </span>
  );
}
