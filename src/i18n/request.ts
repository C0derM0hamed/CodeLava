import { hasLocale, type AbstractIntlMessages } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { getTranslationOverrides } from "@/server/queries/settings";
import { routing } from "./routing";

const messageSources = {
  en: () => import("./messages/en.json"),
  ar: () => import("./messages/ar.json"),
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const [{ default: defaults }, overrides] = await Promise.all([
    messageSources[locale](),
    getTranslationOverrides(locale),
  ]);
  const messages: AbstractIntlMessages = structuredClone(defaults);

  for (const { key, value } of overrides) {
    if (value === null) continue;
    const path = key.split(".");
    if (path.some((part) => !part || ["__proto__", "prototype", "constructor"].includes(part))) continue;
    const leaf = path.pop()!;
    let target: AbstractIntlMessages | undefined = messages;
    for (const part of path) {
      if (!target) break;
      const child: AbstractIntlMessages | string | undefined = target[part];
      if (typeof child === "string") {
        target = undefined;
        break;
      }
      target = child ?? (target[part] = {});
    }
    if (target && typeof target[leaf] !== "object") target[leaf] = value;
  }

  return { locale, messages };
});
