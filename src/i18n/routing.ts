import { defineRouting } from "next-intl/routing";

export const locales = ["en", "ar"] as const;
export type AppLocale = (typeof locales)[number];
export const rtlLocales: readonly AppLocale[] = ["ar"];
export const dirOf = (l: string) => (rtlLocales.includes(l as AppLocale) ? "rtl" : "ltr");

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  localePrefix: "always",
  localeDetection: true,
});
