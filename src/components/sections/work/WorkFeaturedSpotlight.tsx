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
          { scale: 1.07 },
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
    <section ref={rootRef} className="section-y">
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
            const yearText = project.year ? formatNumber(project.year, locale, { useGrouping: false }) : null;
            const highlightMetric = project.metrics?.[0];
            const meta = [yearText, project.clientCountryName, project.industry].filter(Boolean);

            return (
              <li key={project.id}>
                <article className="group relative">
                  <Link
                    href={`/work/${project.slug}`}
                    data-cursor="view"
                    className="grid grid-cols-1 gap-[var(--space-grid-lg)] rounded-[var(--radius-xl)] border border-line bg-surface p-4 shadow-card transition-shadow duration-300 hover:shadow-lift sm:p-5 lg:grid-cols-12 lg:items-center"
                  >
                    <div
                      className={cn(
                        "relative overflow-hidden rounded-[calc(var(--radius-xl)-8px)] bg-pearl-300 lg:col-span-7",
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

                        <div className="pointer-events-none absolute inset-x-4 top-4 flex flex-wrap items-center justify-between gap-2">
                          <Chip tone="ink">{isRtl ? "مشروع مميز" : "Featured"}</Chip>
                          {project.category ? (
                            <Chip className="bg-white/90 backdrop-blur-sm">{project.category.name}</Chip>
                          ) : null}
                        </div>

                        {highlightMetric ? (
                          <div className="pointer-events-none absolute start-4 bottom-4">
                            <div className="rounded-[var(--radius-md)] border border-line bg-white/92 px-4 py-2.5 shadow-card backdrop-blur-md">
                              <p dir="ltr" className="font-display text-xl font-bold text-accent-text tabular-nums sm:text-2xl">
                                {highlightMetric.value}
                              </p>
                              <p className="text-[11px] text-muted">{highlightMetric.label}</p>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div
                      className={cn(
                        "flex flex-col justify-between gap-6 px-2 pb-3 lg:col-span-5 lg:py-4",
                        isFlipped ? "lg:order-1 lg:ps-6" : "lg:order-2 lg:pe-6",
                      )}
                    >
                      <div className="space-y-4">
                        {meta.length > 0 ? (
                          <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm font-semibold text-accent-text">
                            {meta.map((item, i) => (
                              <span key={`${item}-${i}`} className="inline-flex items-center gap-2.5">
                                {i > 0 ? <span aria-hidden="true" className="text-faint">·</span> : null}
                                <span className="tabular-nums">{item}</span>
                              </span>
                            ))}
                          </p>
                        ) : null}

                        <h3 className="text-display-md text-text transition-colors duration-300 group-hover:text-accent-text">
                          {project.title}
                        </h3>

                        {project.clientName ? <p className="text-sm font-semibold text-faint">{project.clientName}</p> : null}
                        <p className="text-body text-muted">{project.summary}</p>
                      </div>

                      {project.technologies && project.technologies.length > 0 ? (
                        <ul className="flex flex-wrap items-center gap-2">
                          {project.technologies.slice(0, 5).map((tech) => (
                            <li key={tech.slug}>
                              <Chip>
                                <span dir="ltr">{tech.name}</span>
                              </Chip>
                            </li>
                          ))}
                        </ul>
                      ) : null}

                      <span className="inline-flex items-center gap-2 text-[0.95rem] font-semibold text-accent-text transition-[gap] duration-300 group-hover:gap-3">
                        {openLabel}
                        <ArrowUpRight aria-hidden="true" className="rtl-flip size-4" />
                      </span>
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
