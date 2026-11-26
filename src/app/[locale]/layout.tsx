import type { Metadata, Viewport } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { fontVariables } from "@/app/fonts";
import { dirOf, routing } from "@/i18n/routing";
import { brandIcons, buildMetadata } from "@/lib/seo";
import "../globals.css";

type LocaleParams = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = { themeColor: "#07060a" };

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "meta" });
  const metadata = buildMetadata({ locale, description: t("description") });
  return {
    ...metadata,
    title: { default: t("title"), template: "%s — CodeLava" },
    openGraph: { ...metadata.openGraph, title: t("title") },
    twitter: { ...metadata.twitter, title: t("title") },
    icons: brandIcons,
    manifest: "/manifest.webmanifest",
  };
}

export default async function LocaleLayout({ children, params }: LocaleParams & { children: ReactNode }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return (
    <html lang={locale} dir={dirOf(locale)} className={fontVariables}>
      <body>
        <NextIntlClientProvider>
          {/* Mount SmoothScrollProvider around the site here. */}
          {/* Mount SiteHeader here. */}
          {children}
          {/* Mount SiteFooter here. */}
          {/* Mount FlameCursor here. */}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
