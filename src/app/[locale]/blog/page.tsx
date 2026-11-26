import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArticleCard, BlogEmpty, BlogHero, BlogPagination, FeaturedArticle } from "@/components/sections/blog";
import { FilterPills } from "@/components/sections/process/kit";
import { routing } from "@/i18n/routing";
import { formatNumber } from "@/lib/i18n-content";
import { breadcrumbListJsonLd, JsonLd } from "@/lib/jsonld";
import { buildMetadata, localizedPath } from "@/lib/seo";
import { getArticles, getPageMeta, getPageSections } from "@/server/queries";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tag?: string | string[]; page?: string | string[] }>;
};

const PAGE_SIZE = 10;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)?.trim() ?? "";

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const [t, pageMeta, sections] = await Promise.all([
    getTranslations({ locale, namespace: "blog" }),
    getPageMeta("blog", locale),
    getPageSections("blog", locale),
  ]);
  const hero = sections.find((s) => s.sectionKey === "hero")?.content;
  return buildMetadata({
    locale,
    path: "/blog",
    title: pageMeta?.title ?? t("title"),
    description: pageMeta?.description ?? hero?.description,
    image: pageMeta?.image ?? null,
    noindex: pageMeta?.noindex,
    canonical: pageMeta?.canonical,
  });
}

export default async function BlogPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const query = await searchParams;
  const tag = first(query.tag);
  const requestedPage = Number.parseInt(first(query.page), 10);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const [t, tNav, tCommon, tA11y, sections, everything, current] = await Promise.all([
    getTranslations({ locale, namespace: "blog" }),
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "a11y" }),
    getPageSections("blog", locale),
    getArticles({ pageSize: 100 }, locale),
    getArticles({ tag: tag || undefined, page, pageSize: PAGE_SIZE }, locale),
  ]);

  const hero = sections.find((s) => s.sectionKey === "hero")?.content;
  const fmt = (value: number) => formatNumber(value, locale, { useGrouping: false });

  const tagCounts = new Map<string, number>();
  for (const article of everything.items) for (const name of new Set(article.tags)) {
    tagCounts.set(name, (tagCounts.get(name) ?? 0) + 1);
  }
  const tags = [...tagCounts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], locale));

  const hrefFor = (nextPage: number) => {
    const params = new URLSearchParams();
    if (tag) params.set("tag", tag);
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    return qs ? `/blog?${qs}` : "/blog";
  };

  const hasArticles = everything.total > 0;
  const lead = !tag && page === 1 ? (current.items.find((a) => a.featured) ?? current.items[0]) : undefined;
  const grid = current.items.filter((a) => a.id !== lead?.id);

  return (
    <main id="main-content" className="relative bg-bg text-text">
      <JsonLd
        data={breadcrumbListJsonLd([
          { name: tNav("home"), url: localizedPath(locale, "/") },
          { name: tNav("blog"), url: localizedPath(locale, "/blog") },
        ])}
      />

      <BlogHero eyebrow={hero?.eyebrow} title={hero?.title || t("title")} description={hero?.description} />

      <section className="pb-20 sm:pb-28">
        <div className="container-lava space-y-10 sm:space-y-12">
          {!hasArticles ? (
            <BlogEmpty
              title={t("empty")}
              lead={t("emptyLead")}
              primary={{ href: "/quote", label: tCommon("discussProject") }}
              secondary={{ href: "/work", label: tNav("work") }}
            />
          ) : (
            <>
              {tags.length > 0 ? (
                <FilterPills
                  ariaLabel={t("filterByTopic")}
                  value={tag}
                  options={[
                    { value: "", label: t("allTopics"), count: fmt(everything.total), href: "/blog" },
                    ...tags.map(([name, count]) => ({
                      value: name,
                      label: name,
                      count: fmt(count),
                      href: `/blog?tag=${encodeURIComponent(name)}`,
                    })),
                  ]}
                />
              ) : null}

              {current.items.length === 0 ? (
                <BlogEmpty
                  title={t("noResults")}
                  primary={{ href: "/blog", label: tCommon("clearFilters") }}
                />
              ) : (
                <>
                  {lead ? <FeaturedArticle article={lead} /> : null}
                  {grid.length > 0 ? (
                    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
                      {grid.map((article) => (
                        <li key={article.id} className="flex">
                          <ArticleCard article={article} className="w-full" />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <BlogPagination
                    page={current.page}
                    pageCount={current.pageCount}
                    label={tA11y("pagination")}
                    status={t("page", { page: fmt(current.page), total: fmt(current.pageCount) })}
                    previousLabel={tCommon("previous")}
                    nextLabel={tCommon("next")}
                    hrefFor={hrefFor}
                  />
                </>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
