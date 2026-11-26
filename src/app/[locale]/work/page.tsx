import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { FilterPills, type FilterPillOption } from "@/components/sections/process/kit";
import {
  WorkEmptyState,
  WorkFeaturedSpotlight,
  WorkHero,
  WorkLedger,
  type WorkIndexItem,
} from "@/components/sections/work";
import { routing } from "@/i18n/routing";
import { formatNumber } from "@/lib/i18n-content";
import { buildMetadata } from "@/lib/seo";
import {
  getPageMeta,
  getPageSections,
  getProjectBySlug,
  getProjectCategories,
  getProjects,
} from "@/server/queries";

type WorkPageParams = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string | string[] }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const [tWork, pageMeta, sections] = await Promise.all([
    getTranslations({ locale, namespace: "work" }),
    getPageMeta("work", locale),
    getPageSections("work", locale),
  ]);

  const hero = sections.find((s) => s.sectionKey === "hero")?.content ?? {};

  return buildMetadata({
    locale,
    path: "/work",
    title: pageMeta?.title ?? tWork("title"),
    description: pageMeta?.description ?? hero.description,
    image: pageMeta?.image ?? null,
    noindex: pageMeta?.noindex,
    canonical: pageMeta?.canonical,
  });
}

export default async function WorkPage({ params, searchParams }: WorkPageParams) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const resolvedSearch = await searchParams;
  const rawCategory = Array.isArray(resolvedSearch.category)
    ? resolvedSearch.category[0]
    : resolvedSearch.category;
  const activeCategory = rawCategory?.trim() || "";

  const [tWork, tCommon, tNav, allProjects, categories, sections] = await Promise.all([
    getTranslations({ locale, namespace: "work" }),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "nav" }),
    getProjects({}, locale),
    getProjectCategories(locale),
    getPageSections("work", locale),
  ]);

  const filteredBase = activeCategory
    ? await getProjects({ category: activeCategory }, locale)
    : allProjects;

  // Enrich listed projects from cached detail query to display mono tech tags, featured highlight metric, and hover video
  const details = await Promise.all(
    filteredBase.slice(0, 24).map((project) => getProjectBySlug(project.slug, locale)),
  );
  const detailMap = new Map(details.filter((d) => d !== null).map((d) => [d.slug, d]));

  const enrichedProjects: WorkIndexItem[] = filteredBase.map((project) => {
    const detail = detailMap.get(project.slug);
    if (!detail) return project;
    return {
      ...project,
      duration: detail.duration,
      video: detail.video,
      technologies: detail.technologies,
      metrics: detail.metrics,
    };
  });

  const heroContent = sections.find((s) => s.sectionKey === "hero")?.content ?? {};
  const introContent = sections.find((s) => s.sectionKey === "intro")?.content;
  const ctaContent = sections.find((s) => s.sectionKey === "cta")?.content ?? {};

  const visibleCategories = categories.filter(
    (cat) => cat.count > 0 || cat.slug === activeCategory,
  );

  const filterOptions: FilterPillOption[] = [
    {
      value: "",
      label: tWork("allCategories"),
      count: formatNumber(allProjects.length, locale, { useGrouping: false }),
      href: "/work",
    },
    ...visibleCategories.map((cat) => ({
      value: cat.slug,
      label: cat.name,
      count: formatNumber(cat.count, locale, { useGrouping: false }),
      href: `/work?category=${encodeURIComponent(cat.slug)}`,
    })),
  ];

  // Unfiltered view splits top featured flagships into asymmetric spotlight + remainder into interactive ledger.
  // Filtered view presents all matches directly in the editorial ledger for crisp comparison.
  const featuredFlagships = !activeCategory
    ? enrichedProjects.filter((p) => p.featured).slice(0, 2)
    : [];
  const featuredIds = new Set(featuredFlagships.map((p) => p.id));
  const ledgerProjects = enrichedProjects.filter((p) => !featuredIds.has(p.id));

  const isRtl = locale === "ar";
  const showingText = isRtl
    ? `عرض ${formatNumber(enrichedProjects.length, locale, { useGrouping: false })} من ${formatNumber(allProjects.length, locale, { useGrouping: false })}`
    : `Showing ${formatNumber(enrichedProjects.length, locale)} of ${formatNumber(allProjects.length, locale)}`;

  return (
    <main id="main-content" className="relative bg-bg pb-16 text-text sm:pb-24">
      <WorkHero
        locale={locale}
        hero={heroContent}
        intro={introContent}
        ctaLabel={ctaContent.ctaLabel || tCommon("discussProject")}
        totalCount={allProjects.length}
        fallbackTitle={tWork("title")}
      />

      {allProjects.length === 0 ? (
        <section className="py-14 sm:py-20">
          <div className="container-lava">
            <WorkEmptyState
              mode="empty"
              locale={locale}
              message={tWork("empty")}
              clearFiltersLabel={tCommon("clearFilters")}
              discussProjectLabel={tCommon("discussProject")}
              contactLabel={tNav("contact")}
            />
          </div>
        </section>
      ) : (
        <>
          {/* Category Filters Bar */}
          {visibleCategories.length > 0 ? (
            <section className="pb-4 sm:pb-6">
              <div className="container-lava flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <FilterPills options={filterOptions} value={activeCategory} ariaLabel={tWork("filterByCategory")} />
                <p role="status" className="shrink-0 text-sm text-faint tabular-nums">
                  {showingText}
                </p>
              </div>
            </section>
          ) : null}

          {enrichedProjects.length === 0 ? (
            <section className="py-14 sm:py-20">
              <div className="container-lava">
                <WorkEmptyState
                  mode="filtered"
                  locale={locale}
                  message={tWork("noResults")}
                  clearFiltersLabel={tCommon("clearFilters")}
                  discussProjectLabel={tCommon("discussProject")}
                  contactLabel={tNav("contact")}
                />
              </div>
            </section>
          ) : (
            <>
              <WorkFeaturedSpotlight
                locale={locale}
                projects={featuredFlagships}
                openLabel={tWork("openCaseStudy")}
              />

              <WorkLedger
                locale={locale}
                projects={ledgerProjects}
                headingKicker={
                  activeCategory
                    ? visibleCategories.find((c) => c.slug === activeCategory)?.name
                    : isRtl
                      ? "جميع المشاريع"
                      : "All projects"
                }
                headingTitle={
                  activeCategory
                    ? tWork("title")
                    : featuredFlagships.length > 0
                      ? isRtl
                        ? "المزيد من أعمالنا."
                        : "More of our work."
                      : isRtl
                        ? "جميع دراسات الحالة."
                        : "All case studies."
                }
                openLabel={tWork("openCaseStudy")}
              />
            </>
          )}
        </>
      )}

    </main>
  );
}
