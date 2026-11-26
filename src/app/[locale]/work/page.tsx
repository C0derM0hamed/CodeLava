import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { FilterChips, type FilterChipOption } from "@/components/ui/Tabs";
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

  const filterOptions: FilterChipOption[] = [
    {
      value: "",
      label: tWork("allCategories"),
      count: allProjects.length,
      href: "/work",
    },
    ...visibleCategories.map((cat) => ({
      value: cat.slug,
      label: cat.name,
      count: cat.count,
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
    ? `عرض ${formatNumber(enrichedProjects.length, locale, { minimumIntegerDigits: 2 })} من ${formatNumber(allProjects.length, locale, { minimumIntegerDigits: 2 })}`
    : `SHOWING ${formatNumber(enrichedProjects.length, locale, { minimumIntegerDigits: 2 })} / ${formatNumber(allProjects.length, locale, { minimumIntegerDigits: 2 })}`;

  return (
    <main id="main-content" className="relative bg-bg text-text">
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
            <section
              aria-label={tWork("filterByCategory")}
              className="border-b border-line bg-bg/95 py-6 backdrop-blur-sm"
            >
              <div className="container-lava flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <nav aria-label={tWork("filterByCategory")}>
                  <FilterChips
                    options={filterOptions}
                    value={activeCategory}
                    ariaLabel={tWork("filterByCategory")}
                  />
                </nav>

                <p className="shrink-0 font-mono text-xs tracking-[0.08em] text-faint tabular-nums rtl:font-sans rtl:tracking-normal">
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
                sectionIndex={featuredFlagships.length > 0 ? "03" : "02"}
                headingKicker={
                  activeCategory
                    ? visibleCategories.find((c) => c.slug === activeCategory)?.name
                    : isRtl
                      ? "سجل المشاريع"
                      : "Project Index"
                }
                headingTitle={
                  activeCategory
                    ? tWork("title")
                    : featuredFlagships.length > 0
                      ? isRtl
                        ? "الأرشيف الهندسي الكامل."
                        : "Selected engineering ledger."
                      : isRtl
                        ? "جميع دراسات الحالة."
                        : "Case study archive."
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
