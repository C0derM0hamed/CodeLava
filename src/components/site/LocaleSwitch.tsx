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
    "group inline-flex shrink-0 items-center gap-2 rounded-[var(--radius-pill)] border border-line/80 bg-surface/65 font-medium text-text/85 shadow-[var(--shadow-xs)] backdrop-blur-sm transition-[background-color,border-color,color,box-shadow,transform] duration-200",
    "hover:-translate-y-px hover:border-line-lava hover:bg-surface hover:text-text hover:shadow-[var(--shadow-card)] motion-reduce:hover:translate-y-0",
    size === "sm" ? "h-10 px-3.5 text-sm" : "h-12 px-4 text-[0.9375rem]",
    className,
  );

  const inner = (
    <>
      <GlobeIcon
        size={size === "sm" ? 17 : 18}
        className="text-muted transition-colors group-hover:text-accent-text"
      />
      <span lang={nextLocale} className="leading-none">
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
