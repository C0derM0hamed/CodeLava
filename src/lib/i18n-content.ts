import type { AppLocale } from "@/i18n/routing";

export function t<T extends string | readonly string[]>(
  field: Partial<Record<AppLocale, T>> | null | undefined,
  locale: AppLocale,
): T | undefined {
  const value = field?.[locale];
  const fallback = field?.[locale === "en" ? "ar" : "en"];
  const hasContent = (item: T | undefined) =>
    typeof item === "string" ? Boolean(item.trim()) : Boolean(item?.length);
  return hasContent(value) ? value : hasContent(fallback) ? fallback : value ?? fallback;
}

export function formatNumber(
  value: number,
  locale: AppLocale,
  { arabicIndic = locale === "ar", ...options }: Intl.NumberFormatOptions & { arabicIndic?: boolean } = {},
) {
  return new Intl.NumberFormat(locale, { numberingSystem: arabicIndic ? "arab" : "latn", ...options }).format(value);
}

export function formatDate(
  value: Date | string | number,
  locale: AppLocale,
  { arabicIndic = locale === "ar", ...options }: Intl.DateTimeFormatOptions & { arabicIndic?: boolean } = {},
) {
  const format = Object.keys(options).length ? options : { dateStyle: "medium" as const };
  return new Intl.DateTimeFormat(locale, {
    timeZone: "UTC",
    calendar: "gregory",
    numberingSystem: arabicIndic ? "arab" : "latn",
    ...format,
  }).format(new Date(value));
}

export function countryName(code: string, locale: AppLocale) {
  return /^[a-z]{2}$/i.test(code)
    ? new Intl.DisplayNames(locale, { type: "region" }).of(code.toUpperCase()) ?? code
    : code;
}
