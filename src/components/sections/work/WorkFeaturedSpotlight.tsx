"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/components/ui/cn";
import type { AppLocale } from "@/i18n/routing";
import { formatNumber } from "@/lib/i18n-content";
import { Chip, Kicker } from "../process/kit";
import type { WorkIndexItem } from "./types";

export interface WorkFeaturedSpotlightProps {
  locale: AppLocale;
  projects: WorkIndexItem[];
  openLabel: string;
}

export function WorkFeaturedSpotlight({
  locale,
  projects,
  openLabel,
}: WorkFeaturedSpotlightProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const isRtl = locale === "ar";

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const mediaFrames = gsap.utils.toArray<HTMLElement>("[data-work-parallax]", root);
      for (const frame of mediaFrames) {
        gsap.fromTo(
          frame,
          { scale: 1.06 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: frame,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      }
    }, root);

    return () => ctx.revert();
  }, [projects.length]);

  if (projects.length === 0) return null;

  return (
    <section ref={rootRef} className="py-12 sm:py-16 lg:py-20">
      <div className="container-lava space-y-[var(--space-heading)]">
        <div className="grid gap-[var(--space-grid)] lg:grid-cols-12 lg:items-end lg:gap-[var(--space-split)]">
          <div className="flex flex-col items-start gap-[var(--space-copy)] lg:col-span-7">
            <Kicker>{isRtl ? "دراسات مميزة" : "Featured projects"}</Kicker>
            <h2 className="text-display-md text-text">
              {isRtl ? "مشاريع محورية بأثر ملموس." : "Flagship work, in depth."}
            </h2>
          </div>
          <p className="text-lead text-muted lg:col-span-5">
            {isRtl
              ? "منصات وحلول ذكاء اصطناعي ومنتجات ثنائية اللغة بُنيت لتدوم."
              : "Platforms, AI systems and bilingual products built to last."}
          </p>
        </div>

        <ul className="space-y-[var(--space-grid-lg)]">
          {projects.map((project, idx) => {
            const isFlipped = idx % 2 === 1;
            const yearText = project.year
              ? formatNumber(project.year, locale, { useGrouping: false })
              : null;
            const highlightMetric = project.metrics?.[0];
            const meta = [yearText, project.clientCountryName, project.industry].filter(Boolean);
            const cardIndex = formatNumber(idx + 1, locale, { minimumIntegerDigits: 2 });

            return (
              <li key={project.id}>
                <article className="group relative">
                  <Link
                    href={`/work/${project.slug}`}
                    data-cursor="view"
                    className="work-spotlight-card grid grid-cols-1 gap-6 p-3.5 sm:p-5 lg:grid-cols-12 lg:items-center lg:gap-8"
                  >
                    <div
                      className={cn(
                        "relative overflow-hidden rounded-[calc(var(--radius-xl)-8px)] border border-line bg-pearl-300 lg:col-span-7",
                        isFlipped ? "lg:order-2" : "lg:order-1",
                      )}
                    >
                      <div className="relative aspect-[16/10] w-full overflow-hidden">
                        {project.cover ? (
                          <div data-work-parallax className="h-full w-full will-change-transform">
                            <Image
                              src={project.cover.url}
                              alt={project.cover.alt || project.title}
                              width={project.cover.width ?? 1600}
                              height={project.cover.height ?? 1000}
                              sizes="(max-width: 1024px) 100vw, 56vw"
                              priority={idx === 0}
                              placeholder={project.cover.blurDataUrl ? "blur" : "empty"}
                              blurDataURL={project.cover.blurDataUrl ?? undefined}
                              className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
                            />
                          </div>
                        ) : (
                          <div className="grid h-full w-full place-items-center">
                            <span dir="ltr" className="font-mono text-xs text-faint">
                              {project.slug}
                            </span>
                          </div>
                        )}

                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/30 via-transparent to-ink-950/15"
                        />

                        <div className="pointer-events-none absolute inset-x-3.5 top-3.5 flex flex-wrap items-center justify-between gap-2 sm:inset-x-4 sm:top-4">
                          <Chip tone="ink" className="shadow-xs">
                            <span aria-hidden="true" className="size-1.5 rounded-full bg-lava-400" />
                            <span>{isRtl ? "مشروع مميز" : "Featured"}</span>
                          </Chip>
                          {project.category ? (
                            <Chip className="border-white/40 bg-white/92 text-text shadow-xs backdrop-blur-md">
                              {project.category.name}
                            </Chip>
                          ) : null}
                        </div>

                        {/* Floating telemetry badge on sm+ only so 390px mobile images stay clean & unobstructed */}
                        {highlightMetric ? (
                          <div className="pointer-events-none absolute start-4 bottom-4 hidden sm:block">
                            <div className="rounded-[var(--radius-md)] border border-white/60 bg-white/94 px-4 py-2.5 shadow-lift backdrop-blur-md">
                              <p
                                dir="ltr"
                                className="font-display text-2xl font-bold text-accent-text tabular-nums"
                              >
                                {highlightMetric.value}
                              </p>
                              <p className="text-[11px] font-medium text-muted">
                                {highlightMetric.label}
                              </p>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div
                      className={cn(
                        "flex flex-col justify-between gap-5 px-2 pb-2 lg:col-span-5 lg:py-4",
                        isFlipped ? "lg:order-1 lg:ps-5 lg:pe-2" : "lg:order-2 lg:pe-5 lg:ps-2",
                      )}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          {meta.length > 0 ? (
                            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-accent-text sm:text-sm">
                              {meta.map((item, i) => (
                                <span
                                  key={`${item}-${i}`}
                                  className="inline-flex items-center gap-2"
                                >
                                  {i > 0 ? (
                                    <span aria-hidden="true" className="text-line-strong">
                                      ·
                                    </span>
                                  ) : null}
                                  <span className="tabular-nums">{item}</span>
                                </span>
                              ))}
                            </p>
                          ) : null}
                          <span
                            dir="ltr"
                            className="shrink-0 font-mono text-xs font-semibold text-faint tabular-nums"
                          >
                            {cardIndex}
                          </span>
                        </div>

                        <h3 className="text-display-md text-text transition-colors duration-300 group-hover:text-accent-text">
                          {project.title}
                        </h3>

                        {project.clientName ? (
                          <p className="text-sm font-semibold text-faint">{project.clientName}</p>
                        ) : null}

                        <p className="text-body text-muted">{project.summary}</p>

                        {/* Clean inline metric strip on mobile (< sm) */}
                        {highlightMetric ? (
                          <div className="flex items-baseline gap-3 rounded-[var(--radius-md)] border border-line-lava bg-[color-mix(in_oklab,var(--lava-100)_30%,white)] px-3.5 py-2.5 sm:hidden">
                            <span
                              dir="ltr"
                              className="font-display text-xl font-bold text-accent-text tabular-nums"
                            >
                              {highlightMetric.value}
                            </span>
                            <span className="text-xs font-medium text-muted">
                              {highlightMetric.label}
                            </span>
                          </div>
                        ) : null}
                      </div>

                      {project.technologies && project.technologies.length > 0 ? (
                        <ul className="flex flex-wrap items-center gap-1.5">
                          {project.technologies.slice(0, 5).map((tech) => (
                            <li key={tech.slug}>
                              <Chip className="bg-pearl-100">
                                <span dir="ltr">{tech.name}</span>
                              </Chip>
                            </li>
                          ))}
                        </ul>
                      ) : null}

                      <div className="flex items-center justify-between border-t border-line pt-4">
                        <span className="inline-flex items-center gap-2 text-[0.95rem] font-semibold text-accent-text">
                          <span>{openLabel}</span>
                        </span>
                        <span
                          aria-hidden="true"
                          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface text-text transition-all duration-300 ease-[var(--ease-out-expo)] group-hover:border-transparent group-hover:bg-[image:var(--gradient-cta)] group-hover:text-white group-hover:shadow-lava"
                        >
                          <ArrowUpRight className="rtl-flip size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:group-hover:-translate-x-0.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
