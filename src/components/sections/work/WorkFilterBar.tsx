import { X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/components/ui/cn";
import type { AppLocale } from "@/i18n/routing";
import type { FilterPillOption } from "../process/kit";

export interface WorkFilterBarProps {
  locale: AppLocale;
  categoryOptions: FilterPillOption[];
  serviceOptions: FilterPillOption[];
  activeCategory: string;
  activeService: string;
  showCategories: boolean;
  showServices: boolean;
  categoryAriaLabel: string;
  serviceAriaLabel: string;
  showingText: string;
  clearLabel: string;
  clearHref?: string;
}

export function WorkFilterBar({
  locale,
  categoryOptions,
  serviceOptions,
  activeCategory,
  activeService,
  showCategories,
  showServices,
  categoryAriaLabel,
  serviceAriaLabel,
  showingText,
  clearLabel,
  clearHref = "/work",
}: WorkFilterBarProps) {
  if (!showCategories && !showServices) return null;

  const isRtl = locale === "ar";
  const hasFilter = Boolean(activeCategory || activeService);

  return (
    <section className="relative z-10 -mt-5 pb-4 sm:-mt-7 sm:pb-6">
      <div className="container-lava">
        <div className="work-filter-shell p-3.5 sm:p-5">
          <div className="flex flex-col gap-3.5">
            {showCategories ? (
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-4">
                <span className="shrink-0 text-[11px] font-semibold tracking-[0.12em] text-faint uppercase rtl:tracking-normal rtl:normal-case lg:w-20">
                  {isRtl ? "الفئة" : "Category"}
                </span>
                <nav aria-label={categoryAriaLabel} className="min-w-0 flex-1">
                  <ul className="work-filter-rail">
                    {categoryOptions.map((option) => {
                      const active = option.value === activeCategory;
                      return (
                        <li key={option.value || "all-cat"} className="shrink-0">
                          <Link
                            href={option.href}
                            aria-current={active ? "true" : undefined}
                            data-cursor="pointer"
                            className={cn(
                              "work-filter-pill",
                              active && "work-filter-pill--active-primary",
                            )}
                          >
                            <span>{option.label}</span>
                            {option.count !== undefined ? (
                              <span
                                dir="ltr"
                                className={cn(
                                  "text-[11px] tabular-nums",
                                  active ? "text-pearl-50/75" : "text-faint",
                                )}
                              >
                                {option.count}
                              </span>
                            ) : null}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            ) : null}

            {showCategories && showServices ? (
              <div className="h-px w-full bg-line" aria-hidden="true" />
            ) : null}

            {showServices ? (
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-4">
                <span className="shrink-0 text-[11px] font-semibold tracking-[0.12em] text-faint uppercase rtl:tracking-normal rtl:normal-case lg:w-20">
                  {isRtl ? "الخدمة" : "Service"}
                </span>
                <nav aria-label={serviceAriaLabel} className="min-w-0 flex-1">
                  <ul className="work-filter-rail">
                    {serviceOptions.map((option) => {
                      const active = option.value === activeService;
                      return (
                        <li key={option.value || "all-svc"} className="shrink-0">
                          <Link
                            href={option.href}
                            aria-current={active ? "true" : undefined}
                            data-cursor="pointer"
                            className={cn(
                              "work-filter-pill",
                              active && "work-filter-pill--active-accent",
                            )}
                          >
                            <span>{option.label}</span>
                            {option.count !== undefined ? (
                              <span
                                dir="ltr"
                                className={cn(
                                  "text-[11px] tabular-nums",
                                  active ? "text-accent-text/80" : "text-faint",
                                )}
                              >
                                {option.count}
                              </span>
                            ) : null}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
              <p role="status" className="inline-flex items-center gap-2 text-xs font-medium text-faint tabular-nums sm:text-sm">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
                <span>{showingText}</span>
              </p>

              {hasFilter ? (
                <Link
                  href={clearHref}
                  data-cursor="pointer"
                  className="inline-flex items-center gap-1.5 rounded-pill border border-line-lava bg-[color-mix(in_oklab,var(--lava-500)_8%,white)] px-3 py-1 text-xs font-semibold text-accent-text transition-colors hover:bg-[color-mix(in_oklab,var(--lava-500)_14%,white)]"
                >
                  <X aria-hidden="true" className="size-3.5" />
                  <span>{clearLabel}</span>
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
