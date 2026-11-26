"use client";

import { useTranslations } from "next-intl";

export interface SkipLinkProps {
  /** Target landmark ID (without #). Default "main-content". */
  targetId?: string;
  /** Optional label override (defaults to `common.skipToContent`). */
  label?: string;
}

/**
 * Keyboard-first skip navigation link. Visually hidden until focused.
 */
export function SkipLink({ targetId = "main-content", label }: SkipLinkProps) {
  const t = useTranslations("common");

  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[calc(var(--z-cursor)-1)] focus:inline-flex focus:items-center focus:rounded-[var(--radius-sm)] focus:bg-accent focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-obsidian-950 focus:shadow-[var(--lava-glow-sm)]"
    >
      {label ?? t("skipToContent")}
    </a>
  );
}
