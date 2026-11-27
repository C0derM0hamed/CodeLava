import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  TechnologiesHero,
  TechnologiesWhy,
  TechnologyExplorer,
} from "@/components/sections/technologies";
import { routing } from "@/i18n/routing";
import { formatNumber } from "@/lib/i18n-content";
import { breadcrumbListJsonLd, JsonLd } from "@/lib/jsonld";
import { buildMetadata, localizedPath } from "@/lib/seo";
import { getPageMeta, getPageSections, getTechnologies } from "@/server/queries";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const [t, pageMeta, sections] = await Promise.all([
    getTranslations({ locale, namespace: "technologies" }),
    getPageMeta("technologies", locale),
    getPageSections("technologies", locale),
  ]);
  const hero = sections.find((s) => s.sectionKey === "hero")?.content;
  return buildMetadata({
    locale,
    path: "/technologies",
    title: pageMeta?.title ?? t("title"),
    description: pageMeta?.description ?? hero?.description,
    image: pageMeta?.image ?? null,
    noindex: pageMeta?.noindex,
    canonical: pageMeta?.canonical,
  });
}

export default async function TechnologiesPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const [t, tNav, tCommon, sections, technologies] = await Promise.all([
    getTranslations({ locale, namespace: "technologies" }),
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "common" }),
    getPageSections("technologies", locale),
    getTechnologies({}, locale),
  ]);

  const section = (key: string) => sections.find((s) => s.sectionKey === key)?.content;
  const hero = section("hero");
  const intro = section("intro");
  const cta = section("cta");
  const ctaLabel = cta?.ctaLabel || tCommon("discussProject");

  const categoryLabels = Object.fromEntries(
    ["frontend", "backend", "mobile", "ai", "cloud", "database", "design", "other"].map((key) => [key, t(key)]),
  );
  const byCategory = new Map<string, number>();
  for (const { category } of technologies) byCategory.set(category, (byCategory.get(category) ?? 0) + 1);
  const fmt = (value: number) => formatNumber(value, locale, { useGrouping: false });

  return (
    <main id="main-content" className="relative bg-bg text-text">
      <JsonLd
        data={breadcrumbListJsonLd([
          { name: tNav("home"), url: localizedPath(locale, "/") },
          { name: tNav("technologies"), url: localizedPath(locale, "/technologies") },
        ])}
      />

      <TechnologiesHero
        eyebrow={hero?.eyebrow}
        title={hero?.title || t("title")}
        description={hero?.description}
        ctaLabel={ctaLabel}
        preview={technologies}
      />

      <section aria-label={t("title")} className="section-y">
        <div className="container-lava">
          {technologies.length === 0 ? (
            <p className="mx-auto max-w-xl rounded-[var(--radius-lg)] border border-line bg-surface p-10 text-center text-muted shadow-card">
              {t("empty")}
            </p>
          ) : (
            <TechnologyExplorer
              technologies={technologies}
              categoryLabels={categoryLabels}
              allLabel={tCommon("all")}
              filterLabel={t("filterByCategory")}
              totalCount={fmt(technologies.length)}
              counts={Object.fromEntries([...byCategory].map(([key, count]) => [key, fmt(count)]))}
              countLabels={Object.fromEntries(
                [...byCategory].map(([key, count]) => [key, t("count", { count, formatted: fmt(count) })]),
              )}
              statusLabels={{
                "": t("showing", { count: technologies.length, formatted: fmt(technologies.length) }),
                ...Object.fromEntries(
                  [...byCategory].map(([key, count]) => [key, t("showing", { count, formatted: fmt(count) })]),
                ),
              }}
            />
          )}
        </div>
      </section>

      {intro?.title ? (
        <TechnologiesWhy
          kicker={t("whyKicker")}
          title={intro.title}
          description={intro.description}
          ctaLabel={ctaLabel}
        />
      ) : null}
    </main>
  );
}
