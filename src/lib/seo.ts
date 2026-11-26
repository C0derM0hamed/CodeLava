import type { Metadata } from "next";
import en from "@/i18n/messages/en.json";
import ar from "@/i18n/messages/ar.json";
import { locales, routing, type AppLocale } from "@/i18n/routing";

export const appUrl = new URL(process.env.APP_URL || "http://localhost:3000");
export const brandIcons = {
  icon: [{ url: "/brand/icons/favicon.svg", type: "image/svg+xml" }, { url: "/brand/icons/icon-32.png", sizes: "32x32" }],
  apple: "/brand/icons/apple-touch-icon.png",
};

const meta = { en: en.meta, ar: ar.meta };
const ogLocales = { en: "en_US", ar: "ar_SA" };

export function localizedPath(locale: AppLocale, path = "/") {
  const segment = path.replace(/^\/+|\/+$/g, "");
  return segment ? `/${locale}/${segment}` : `/${locale}`;
}

export function absoluteUrl(path: string) {
  return new URL(path, appUrl).toString();
}

export function languageAlternates(path = "/") {
  return {
    en: absoluteUrl(localizedPath("en", path)),
    ar: absoluteUrl(localizedPath("ar", path)),
    "x-default": absoluteUrl(localizedPath(routing.defaultLocale, path)),
  };
}

type MetadataInput = {
  locale: AppLocale;
  path?: string;
  title?: string;
  description?: string;
  image?: string | { url: string; alt?: string; width?: number | null; height?: number | null } | null;
  noindex?: boolean;
  canonical?: string;
  type?: "website" | "article";
};

export function buildMetadata({ locale, path, title, description, image, noindex, canonical, type = "website" }: MetadataInput): Metadata {
  const fallback = meta[locale];
  const page = localizedPath(locale, path);
  const url = absoluteUrl(canonical ?? page);
  const displayTitle = title ? `${title} — CodeLava` : fallback.title;
  const summary = description ?? fallback.description;
  const socialImage = typeof image === "string" ? { url: image } : image ?? {
    url: localizedPath(locale, "/opengraph-image"), alt: fallback.imageAlt, width: 1200, height: 630,
  };
  const images = [{
    ...socialImage, url: absoluteUrl(socialImage.url),
    width: socialImage.width ?? undefined, height: socialImage.height ?? undefined,
  }];
  return {
    metadataBase: appUrl,
    title: title ?? { absolute: fallback.title },
    description: summary,
    alternates: { canonical: url, languages: languageAlternates(path) },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type, siteName: "CodeLava", title: displayTitle, description: summary, url,
      locale: ogLocales[locale],
      alternateLocale: locales.filter((value) => value !== locale).map((value) => ogLocales[value]),
      images,
    },
    twitter: { card: "summary_large_image", title: displayTitle, description: summary, images },
  };
}
