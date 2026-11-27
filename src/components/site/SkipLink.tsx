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
      onClick={() => {
        const target = document.getElementById(targetId);
        if (!target) return;
        if (!target.hasAttribute("tabindex")) target.tabIndex = -1;
        target.focus({ preventScroll: true });
      }}
      className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[calc(var(--z-cursor)-1)] focus:inline-flex focus:items-center focus:rounded-[var(--radius-pill)] focus:bg-ink-900 focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-pearl-50 focus:shadow-[var(--shadow-lift)]"
    >
      {label ?? t("skipToContent")}
    </a>
  );
}
