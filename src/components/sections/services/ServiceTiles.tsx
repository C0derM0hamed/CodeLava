import { ArrowRightIcon } from "@/components/ui/Icons";
import { cn } from "@/components/ui/cn";
import { Link } from "@/i18n/navigation";
import type { Service } from "@/server/queries/types";
import { ServiceIcon } from "./service-icons";
import "./services.css";

type TileService = Pick<Service, "id" | "slug" | "title" | "tagline" | "summary" | "icon"> & {
  projectCount?: number;
};

/**
 * Service tiles: rounded cards with icon, live project count pill (when published projects exist),
 * title, summary, and arrow linking to `/services/[slug]` where the service's projects open first.
 */
export function ServiceTiles({
  services,
  actionLabel,
  projectsBadge,
  featuredFirst = false,
  columns = 3,
  className,
}: {
  services: TileService[];
  actionLabel: string;
  projectsBadge?: (count: number) => string;
  featuredFirst?: boolean;
  columns?: 2 | 3;
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
        return (
          <li key={service.id} className="min-w-0">
            <Link
              href={`/services/${service.slug}`}
              data-cursor="pointer"
              className={cn("service-tile group", featured && "service-tile--featured surface-dark")}
            >
              <div className="flex items-start justify-between gap-3">
                <span aria-hidden="true" className="service-tile-icon">
                  <ServiceIcon name={service.icon} size={featured ? 26 : 24} />
                </span>
                {count > 0 && projectsBadge ? (
                  <span
                    className={cn(
                      "inline-flex items-center rounded-[var(--radius-pill)] border px-2.5 py-1 text-xs font-semibold tabular-nums",
                      featured
                        ? "border-lava-400/35 bg-lava-500/20 text-lava-100"
                        : "border-line-lava bg-accent-soft text-accent-text",
                    )}
                  >
                    {projectsBadge(count)}
                  </span>
                ) : null}
              </div>
              <span className="grid gap-2">
                <span className="font-display text-[1.1875rem] font-semibold leading-snug text-text transition-colors duration-300 group-hover:text-accent-text">
                  {service.title}
                </span>
                {service.tagline || service.summary ? (
                  <span className="text-sm leading-relaxed text-muted">
                    {service.tagline || service.summary}
                  </span>
                ) : null}
              </span>
              <span className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm font-semibold text-accent-text">
                <span>{actionLabel}</span>
                <span aria-hidden="true" className="service-tile-arrow">
                  <ArrowRightIcon
                    size={15}
                    className="transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                  />
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
