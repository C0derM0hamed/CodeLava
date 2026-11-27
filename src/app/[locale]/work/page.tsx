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
  getServices,
} from "@/server/queries";

type WorkPageParams = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string | string[]; service?: string | string[] }>;
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
  const rawService = Array.isArray(resolvedSearch.service)
    ? resolvedSearch.service[0]
    : resolvedSearch.service;
  const activeCategory = rawCategory?.trim() || "";
  const activeService = rawService?.trim() || "";

  const [tWork, tCommon, tNav, allProjects, categories, services, sections] = await Promise.all([
    getTranslations({ locale, namespace: "work" }),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "nav" }),
    getProjects({}, locale),
    getProjectCategories(locale),
    getServices(locale),
    getPageSections("work", locale),
  ]);

  const filteredBase =
    activeCategory || activeService
      ? await getProjects(
          {
            category: activeCategory || undefined,
            serviceSlug: activeService || undefined,
          },
          locale,
        )
      : allProjects;

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

  const servicesWithProjects = services.filter((svc) => svc.projectCount > 0 || svc.slug === activeService);
  const visibleCategories = categories.filter((cat) => cat.count > 0 || cat.slug === activeCategory);

  const useServicePills = servicesWithProjects.length > 0 && !activeCategory;
  const activeFilterValue = useServicePills ? activeService : activeCategory;
  const filterOptions: FilterPillOption[] = useServicePills
    ? [
        {
          value: "",
          label: tWork("allServices"),
          count: formatNumber(allProjects.length, locale, { useGrouping: false }),
          href: "/work",
        },
        ...servicesWithProjects.map((svc) => ({
          value: svc.slug,
          label: svc.title,
          count: formatNumber(svc.projectCount, locale, { useGrouping: false }),
          href: `/work?service=${encodeURIComponent(svc.slug)}`,
        })),
      ]
    : [
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

  const hasFilter = Boolean(activeCategory || activeService);
  const featuredFlagships = !hasFilter ? enrichedProjects.filter((p) => p.featured).slice(0, 2) : [];
  const featuredIds = new Set(featuredFlagships.map((p) => p.id));
  const ledgerProjects = enrichedProjects.filter((p) => !featuredIds.has(p.id));

  const activeServiceLabel = servicesWithProjects.find((s) => s.slug === activeService)?.title;
  const activeCategoryLabel = visibleCategories.find((c) => c.slug === activeCategory)?.name;
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
          {filterOptions.length > 1 ? (
            <section className="pb-4 sm:pb-6">
              <div className="container-lava flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <FilterPills
                  options={filterOptions}
                  value={activeFilterValue}
                  ariaLabel={useServicePills ? tWork("filterByService") : tWork("filterByCategory")}
                />
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
                  activeServiceLabel ||
                  activeCategoryLabel ||
                  (isRtl ? "جميع المشاريع" : "All projects")
                }
                headingTitle={
                  hasFilter
                    ? activeServiceLabel || activeCategoryLabel || tWork("title")
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
