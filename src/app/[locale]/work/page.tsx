import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { FilterPillOption } from "@/components/sections/process/kit";
import {
  WorkEmptyState,
  WorkFeaturedSpotlight,
  WorkFilterBar,
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
import "@/components/sections/work/work.css";

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

  const hasFilter = Boolean(activeCategory || activeService);
  const selectedCategory = categories.find(({ slug }) => slug === activeCategory);
  const selectedService = services.find(({ slug }) => slug === activeService);
  const unknownFilter = (activeCategory && !selectedCategory) || (activeService && !selectedService);
  const filteredBase = !hasFilter
    ? allProjects
    : unknownFilter
      ? []
      : await getProjects(
          {
            category: selectedCategory?.slug,
            serviceSlug: selectedService?.slug,
          },
          locale,
        );

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

  function filterHref(category: string, service: string) {
    const search = new URLSearchParams();
    if (category) search.set("category", category);
    if (service) search.set("service", service);
    return search.size ? `/work?${search}` : "/work";
  }

  const activeCategoriesWithProjects = categories.filter(({ count }) => count > 0);
  const uniqueMarkets = new Set(allProjects.map((p) => p.clientCountryName).filter(Boolean));

  const categoryOptions: FilterPillOption[] = [
    { value: "", label: tWork("allCategories"), href: filterHref("", selectedService?.slug ?? "") },
    ...categories
      .filter(({ count, slug }) => count > 0 || slug === activeCategory)
      .map(({ slug, name, count }) => ({
        value: slug,
        label: name,
        href: filterHref(slug, selectedService?.slug ?? ""),
        count: activeService ? undefined : formatNumber(count, locale),
      })),
  ];
  const serviceOptions: FilterPillOption[] = [
    { value: "", label: tWork("allServices"), href: filterHref(selectedCategory?.slug ?? "", "") },
    ...services
      .filter(({ projectCount, slug }) => projectCount > 0 || slug === activeService)
      .map(({ slug, title, projectCount }) => ({
        value: slug,
        label: title,
        href: filterHref(selectedCategory?.slug ?? "", slug),
        count: activeCategory ? undefined : formatNumber(projectCount, locale),
      })),
  ];
  const showCategories = categoryOptions.length > 1 || Boolean(activeCategory);
  const showServices = serviceOptions.length > 1 || Boolean(activeService);

  const featuredFlagships = !hasFilter ? enrichedProjects.filter((p) => p.featured).slice(0, 2) : [];
  const featuredIds = new Set(featuredFlagships.map((p) => p.id));
  const ledgerProjects = enrichedProjects.filter((p) => !featuredIds.has(p.id));

  const activeFilterLabel = [selectedService?.title, selectedCategory?.name].filter(Boolean).join(" · ");
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
        categoryCount={activeCategoriesWithProjects.length}
        marketCount={uniqueMarkets.size}
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
          <WorkFilterBar
            locale={locale}
            categoryOptions={categoryOptions}
            serviceOptions={serviceOptions}
            activeCategory={activeCategory}
            activeService={activeService}
            showCategories={showCategories}
            showServices={showServices}
            categoryAriaLabel={tWork("filterByCategory")}
            serviceAriaLabel={tWork("filterByService")}
            showingText={showingText}
            clearLabel={tCommon("clearFilters")}
          />

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
                  activeFilterLabel || (isRtl ? "جميع المشاريع" : "All projects")
                }
                headingTitle={
                  hasFilter
                    ? activeFilterLabel || tWork("title")
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
