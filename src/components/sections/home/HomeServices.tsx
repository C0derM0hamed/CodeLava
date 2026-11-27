import { ArrowRightIcon } from "@/components/ui/Icons";
import { SplitIntro } from "@/components/ui/SplitIntro";
import { cn } from "@/components/ui/cn";
import { Reveal } from "@/experience/fx/Reveal";
import { Link } from "@/i18n/navigation";
import { ServiceIcon } from "@/components/sections/services/service-icons";
import type { Service } from "@/server/queries/types";

const MAX_TILES = 6;

export interface HomeServicesProps {
  eyebrow?: string;
  title: string;
  description?: string;
  exploreLabel: string;
  moreLabel: string;
  projectsBadge?: (count: number) => string;
  services: Service[];
}

/**
 * Services split intro + compact tiles. Each tile links into `/services/[slug]` where
 * the projects built under that service are showcased prominently, displaying a live
 * project counter badge when published projects exist.
 */
export function HomeServices({
  eyebrow,
  title,
  description,
  exploreLabel,
  moreLabel,
  projectsBadge,
  services,
}: HomeServicesProps) {
  if (services.length === 0) return null;
  const overflow = services.length > MAX_TILES;
  const tiles = overflow ? services.slice(0, MAX_TILES - 1) : services;

  return (
    <section aria-labelledby="home-services-title" className="section-y">
      <div className="container-lava">
        <SplitIntro
          kicker={eyebrow}
          title={title}
          lead={description}
          link={{ href: "/services", label: exploreLabel }}
          titleId="home-services-title"
          alignIntro="center"
        >
          <ul className="grid grid-cols-1 gap-3.5 min-[420px]:grid-cols-2 sm:gap-4 md:grid-cols-3">
            {tiles.map((service, index) => {
              const featured = index === 0;
              return (
                <Reveal as="li" mode="block" delay={index * 60} key={service.id} className="min-w-0">
                  <Link
                    href={`/services/${service.slug}`}
                    data-cursor="pointer"
                    className={cn("home-service group", featured && "home-service--featured surface-dark")}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span aria-hidden="true" className="home-service__icon">
                        <ServiceIcon name={service.icon} size={22} />
                      </span>
                      {service.projectCount > 0 && projectsBadge ? (
                        <span
                          className={cn(
                            "inline-flex items-center rounded-[var(--radius-pill)] border px-2.5 py-0.5 text-[0.72rem] font-semibold tabular-nums",
                            featured
                              ? "border-lava-400/35 bg-lava-500/18 text-lava-100"
                              : "border-line-lava bg-accent-soft text-accent-text",
                          )}
                        >
                          {projectsBadge(service.projectCount)}
                        </span>
                      ) : null}
                    </div>
                    <span className="grid gap-1.5">
                      <span className="font-display text-[1.0625rem] font-semibold leading-snug text-text transition-colors duration-200 group-hover:text-accent-text">
                        {service.title}
                      </span>
                      {service.tagline ? (
                        <span className="line-clamp-2 text-sm leading-relaxed text-muted">{service.tagline}</span>
                      ) : null}
                    </span>
                    <span aria-hidden="true" className="home-service__arrow mt-auto self-end">
                      <ArrowRightIcon
                        size={14}
                        className="transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                      />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
            {overflow ? (
              <Reveal as="li" mode="block" delay={tiles.length * 60} className="min-w-0">
                <Link href="/services" data-cursor="pointer" className="home-service group justify-center text-center">
                  <span aria-hidden="true" className="home-service__icon mx-auto">
                    <ServiceIcon name="LayoutGrid" size={22} />
                  </span>
                  <span className="font-display text-[1.0625rem] font-semibold text-text">{moreLabel}</span>
                </Link>
              </Reveal>
            ) : null}
          </ul>
        </SplitIntro>
      </div>
    </section>
  );
}
