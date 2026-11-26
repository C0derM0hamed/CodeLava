"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { GlobeIcon } from "@/components/ui/Icons";
import { cn } from "@/components/ui/cn";

export interface LocaleSwitchProps {
  /** Optional custom locale handler (used in non-localized lab previews). */
  onLocaleChange?: (nextLocale: AppLocale) => void;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Bilingual EN ↔ AR switcher that preserves the current route path via `@/i18n/navigation`.
 * Sets explicit `lang` attribute on the opposite-language label for screen readers.
 */
export function LocaleSwitch({
  onLocaleChange,
  size = "sm",
  className,
}: LocaleSwitchProps) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("nav");
  const pathname = usePathname() || "/";

  const nextLocale: AppLocale = locale === "ar" ? "en" : "ar";

  const classes = cn(
    "group inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-line bg-bg-elevated/70 text-ash-200 transition-all duration-250",
    "hover:border-line-lava-strong hover:bg-surface hover:text-text",
    size === "sm" ? "h-9 px-3 text-xs" : "h-11 px-4 text-sm",
    className,
  );

  const inner = (
    <>
      <GlobeIcon
        size={size === "sm" ? 14 : 16}
        className="text-muted transition-colors group-hover:text-accent"
      />
      <span
        lang={nextLocale}
        className={cn(
          "font-medium leading-none",
          nextLocale === "ar" ? "font-sans tracking-normal" : "font-mono tracking-[0.04em]",
        )}
      >
        {t("switchToLocale")}
      </span>
    </>
  );

  if (onLocaleChange) {
    return (
      <button
        type="button"
        onClick={() => onLocaleChange(nextLocale)}
        aria-label={t("switchLanguageAria")}
        data-cursor="pointer"
        className={classes}
      >
        {inner}
      </button>
    );
  }

  return (
    <Link
      href={pathname}
      locale={nextLocale}
      aria-label={t("switchLanguageAria")}
      data-cursor="pointer"
      className={classes}
    >
      {inner}
    </Link>
  );
}
