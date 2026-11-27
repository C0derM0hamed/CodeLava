import { ArrowRightIcon } from "@/components/ui/Icons";
import { cn } from "@/components/ui/cn";
import { Reveal } from "@/experience/fx/Reveal";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { formatNumber } from "@/lib/i18n-content";
import type { Service } from "@/server/queries/types";
import { ServiceIcon } from "./service-icons";
import "./services.css";

type TileService = Pick<Service, "id" | "slug" | "title" | "tagline" | "summary" | "icon"> & {
  projectCount?: number;
};

/**
 * Service tiles: Daylight Magma rounded cards with live project count pill,
 * optional localized ordinal, luminous hover filament, and crisp single-line action bar.
 */
export function ServiceTiles({
  services,
  actionLabel,
  projectsBadge,
  featuredFirst = false,
  columns = 3,
  locale,
  animated = true,
  className,
}: {
  services: TileService[];
  actionLabel: string;
  projectsBadge?: (count: number) => string;
  featuredFirst?: boolean;
  columns?: 2 | 3;
  locale?: AppLocale;
  animated?: boolean;
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-[var(--space-grid)] sm:grid-cols-2",
        columns === 3 && "lg:grid-cols-3",
        className,
      )}
    >
      {services.map((service, index) => {
        const featured = featuredFirst && index === 0;
        const count = service.projectCount ?? 0;
        const ordinal = locale
          ? formatNumber(index + 1, locale, {
              minimumIntegerDigits: locale === "ar" ? 1 : 2,
              useGrouping: false,
            })
          : null;

        const card = (
          <Link
            href={`/services/${service.slug}`}
            data-cursor="pointer"
            className={cn("service-tile group", featured && "service-tile--featured surface-dark")}
          >
            <div className="flex items-start justify-between gap-3">
              <span aria-hidden="true" className="service-tile-icon">
                <ServiceIcon name={service.icon} size={featured ? 25 : 23} />
              </span>
              <div className="flex items-center gap-2">
                {count > 0 && projectsBadge ? (
                  <span
                    className={cn(
                      "inline-flex items-center rounded-[var(--radius-pill)] border px-2.5 py-1 text-xs font-semibold tabular-nums whitespace-nowrap",
                      featured
                        ? "border-lava-400/35 bg-lava-500/20 text-lava-100"
                        : "border-line-lava bg-accent-soft text-accent-text",
                    )}
                  >
                    {projectsBadge(count)}
                  </span>
                ) : null}
                {ordinal ? (
                  <span
                    aria-hidden="true"
                    dir="ltr"
                    className={cn(
                      "font-mono text-xs font-medium tabular-nums",
                      featured ? "text-ink-300" : "text-faint",
                    )}
                  >
                    {ordinal}
                  </span>
                ) : null}
              </div>
            </div>

            <span className="grid gap-2.5">
              <span
                className={cn(
                  "font-display text-[1.25rem] font-semibold leading-snug text-text transition-colors duration-300",
                  featured ? "group-hover:text-lava-300" : "group-hover:text-accent-text",
                )}
              >
                {service.title}
              </span>
              {service.tagline || service.summary ? (
                <span className="text-[0.9375rem] leading-relaxed text-muted">
                  {service.tagline || service.summary}
                </span>
              ) : null}
            </span>

            <span
              className={cn(
                "mt-auto flex items-center justify-between gap-3 border-t pt-4 text-sm font-semibold",
                featured
                  ? "border-white/12 text-lava-300"
                  : "border-line text-accent-text",
              )}
            >
              <span className="min-w-0 truncate">{actionLabel}</span>
              <span aria-hidden="true" className="service-tile-arrow">
                <ArrowRightIcon
                  size={15}
                  className="transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                />
              </span>
            </span>
          </Link>
        );

        return animated ? (
          <Reveal as="li" mode="block" delay={Math.min(index, 5) * 65} key={service.id} className="min-w-0">
            {card}
          </Reveal>
        ) : (
          <li key={service.id} className="min-w-0">
            {card}
          </li>
        );
      })}
    </ul>
  );
}
