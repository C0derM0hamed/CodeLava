import "server-only";
import { cache } from "react";
import type { AppLocale } from "@/i18n/routing";
import { getPageMeta } from "@/server/queries/settings";
import { buildMetadata } from "@/lib/seo";
import { readUtm } from "./model";

export const formOpenedAt = cache(() => Date.now());

export type SearchParams = Record<string, string | string[] | undefined>;

export async function conversionMetadata(locale: AppLocale, page: string, title: string, description?: string) {
  const seo = await getPageMeta(page, locale);
  return buildMetadata({
    locale, path: `/${page}`, title: seo?.title || title, description: seo?.description || description,
    image: seo?.image, canonical: seo?.canonical, noindex: seo?.noindex,
  });
}

export function campaignQuery(search: SearchParams) {
  const parameters = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (typeof value === "string") parameters.set(key, value);
    else if (value?.[0]) parameters.set(key, value[0]);
  }
  return new URLSearchParams(readUtm(parameters)).toString();
}

export function publicHttpLink(value?: string) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}
