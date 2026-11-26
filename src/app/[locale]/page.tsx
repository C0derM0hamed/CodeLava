import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-6 py-24">
      <h1 className="font-display text-5xl font-semibold">{t("title")}</h1>
      <p className="mt-5 max-w-prose text-lg text-muted">{t("description")}</p>
    </main>
  );
}
