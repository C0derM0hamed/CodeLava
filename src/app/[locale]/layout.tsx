import type { Metadata, Viewport } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { fontVariables } from "@/app/fonts";
import { dirOf, routing } from "@/i18n/routing";
import { brandIcons, buildMetadata } from "@/lib/seo";
import { SiteHeader, SiteFooter, SkipLink, PageTransition } from "@/components/site";
import type { FooterSocialLink } from "@/components/site";
import { ToastProvider } from "@/components/ui/Toast";
import { FlameCursor } from "@/experience/cursor";
import { SmoothScrollProvider } from "@/experience/fx/SmoothScrollProvider";
import { getServices, getSiteSettings } from "@/server/queries";
import "../globals.css";

type LocaleParams = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = { themeColor: "#f6f5f3" };

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
  const [settings, tc, services] = await Promise.all([
    getSiteSettings(locale),
    getTranslations({ locale, namespace: "common" }),
    getServices(locale),
  ]);
  const { contact } = settings;
  const socials: FooterSocialLink[] = Object.entries(settings.socials)
    .filter(([, href]) => typeof href === "string" && /^https?:\/\//.test(href))
    .map(([key, href]) => ({ label: socialLabels[key] ?? key, href: href as string }));
  return (
    <html lang={locale} dir={dirOf(locale)} className={fontVariables}>
      <body>
        <NextIntlClientProvider>
          <ToastProvider closeLabel={tc("close")}>
            <SkipLink />
            <SmoothScrollProvider>
              <SiteHeader />
              <PageTransition>
                {children /* each page renders its own <main id="main-content"> */}
              </PageTransition>
              <SiteFooter
                services={services.slice(0, 6).map((s) => ({ label: s.title, href: `/services/${s.slug}` }))}
                contact={{ email: contact.email, phone: contact.phone, location: contact.address, availability: contact.hours }}
                socials={socials}
              />
            </SmoothScrollProvider>
            <FlameCursor viewLabelEn="View" viewLabelAr="عرض" />
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

const socialLabels: Record<string, string> = {
  linkedin: "LinkedIn", github: "GitHub", x: "X", behance: "Behance", dribbble: "Dribbble",
  website: "Website", upwork: "Upwork", mostaql: "Mostaql",
};
