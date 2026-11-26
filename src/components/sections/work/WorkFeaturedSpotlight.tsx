"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "@/i18n/navigation";
import { ArrowUpRightIcon } from "@/components/ui/Icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { HeatEdge } from "@/experience/fx/LavaDivider";
import { cn } from "@/components/ui/cn";
import type { AppLocale } from "@/i18n/routing";
import { formatNumber } from "@/lib/i18n-content";
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
    <section ref={rootRef} className="py-12 sm:py-16">
      <div className="container-lava space-y-12 sm:space-y-16">
        <SectionHeading
          index="02"
          kicker={isRtl ? "دراسات مميزة" : "Featured Flagships"}
          title={isRtl ? "مشاريع محورية بأثر ملموس." : "Flagship engineering."}
          size="md"
          layout="split"
          lead={
            isRtl
              ? "تحول تقني مصمّم لقطاعات عالية المتطلبات في الخليج والمنطقة."
              : "High-stakes platforms, AI architectures, and bilingual products built to endure."
          }
        />

        <div className="space-y-14 sm:space-y-24">
          {projects.map((project, idx) => {
            const isFlipped = idx % 2 === 1;
            const indexCode = formatNumber(idx + 1, locale, { minimumIntegerDigits: 2 });
            const yearText = project.year
              ? formatNumber(project.year, locale, { useGrouping: false })
              : null;
            const highlightMetric = project.metrics?.[0];

            return (
              <article key={project.id} className="group relative">
                <Link
                  href={`/work/${project.slug}`}
                  data-cursor="view"
                  className="grid grid-cols-1 gap-7 rounded-[var(--radius-lg)] border border-line bg-bg-elevated/70 p-4 transition-colors duration-400 hover:border-line-lava-strong hover:bg-bg-elevated sm:p-6 lg:grid-cols-12 lg:items-center lg:gap-12 lg:p-8"
                >
                  {/* Visual cover frame — 7 cols */}
                  <div
                    className={cn(
                      "relative overflow-hidden rounded-[var(--radius-md)] border border-line bg-surface lg:col-span-7",
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
                        <div className="flex h-full w-full items-center justify-center bg-obsidian-900">
                          <span dir="ltr" className="font-mono text-xs text-faint">
                            {project.slug}
                          </span>
                        </div>
                      )}

                      {/* Subtle obsidian vignette + molten hover sheen */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian-950/75 via-transparent to-obsidian-950/20 opacity-80 transition-opacity duration-500 group-hover:opacity-65"
                      />
                      <HeatEdge
                        position="bottom"
                        intensity="subtle"
                        className="opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      />

                      {/* Corner category & featured badges */}
                      <div className="pointer-events-none absolute inset-x-4 top-4 flex flex-wrap items-center justify-between gap-2">
                        <Tag tone="lava" dot>
                          {isRtl ? "مشروع مميز" : "Featured"}
                        </Tag>
                        {project.category ? (
                          <Tag tone="default" className="bg-obsidian-950/85 backdrop-blur-sm">
                            {project.category.name}
                          </Tag>
                        ) : null}
                      </div>

                      {highlightMetric ? (
                        <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-end justify-between gap-4">
                          <div className="rounded-[var(--radius-sm)] border border-line-strong bg-obsidian-950/85 px-3.5 py-2 backdrop-blur-md">
                            <p
                              dir="ltr"
                              className="font-display text-xl font-medium text-lava-300 tabular-nums sm:text-2xl"
                            >
                              {highlightMetric.value}
                            </p>
                            <p className="text-[11px] text-ash-200">{highlightMetric.label}</p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Narrative summary & metadata — 5 cols */}
                  <div
                    className={cn(
                      "flex flex-col justify-between gap-6 lg:col-span-5",
                      isFlipped ? "lg:order-1 lg:pe-4" : "lg:order-2 lg:ps-4",
                    )}
                  >
                    <div className="space-y-4">
                      {/* Meta strip */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-xs text-faint rtl:font-sans">
                        <span dir="ltr" className="font-mono text-accent tabular-nums">
                          {indexCode}
                        </span>
                        {yearText ? (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">{yearText}</span>
                          </>
                        ) : null}
                        {project.clientCountryName ? (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{project.clientCountryName}</span>
                          </>
                        ) : null}
                        {project.industry ? (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-muted">{project.industry}</span>
                          </>
                        ) : null}
                      </div>

                      <h3 className="text-display-md text-text transition-colors duration-300 group-hover:text-lava-100">
                        {project.title}
                      </h3>

                      {project.clientName ? (
                        <p className="font-mono text-xs uppercase tracking-[0.1em] text-ash-400 rtl:font-sans rtl:tracking-normal rtl:normal-case">
                          {project.clientName}
                        </p>
                      ) : null}

                      <p className="text-body text-muted">{project.summary}</p>
                    </div>

                    {/* Technologies mono tags */}
                    {project.technologies && project.technologies.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-2">
                        {project.technologies.slice(0, 5).map((tech) => (
                          <Tag key={tech.slug} tone="outline" dir="ltr" className="font-mono">
                            {tech.name}
                          </Tag>
                        ))}
                      </div>
                    ) : null}

                    {/* Molten underline action cue (inside single outer link) */}
                    <div className="pt-1">
                      <span className="relative inline-flex items-center gap-3 pb-2 text-sm font-medium text-text transition-colors duration-300 group-hover:text-lava-100">
                        <span>{openLabel}</span>
                        <span
                          aria-hidden="true"
                          className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-line-strong text-accent transition-all duration-300 ease-[var(--ease-out-expo)] group-hover:border-line-lava-strong group-hover:bg-accent/15 group-hover:text-ember"
                        >
                          <ArrowUpRightIcon
                            size={15}
                            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:group-hover:-translate-x-0.5"
                          />
                        </span>
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-line-strong"
                        />
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-x-0 bottom-0 h-[1.5px] origin-left rtl:origin-right scale-x-0 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-x-100"
                          style={{ background: "var(--gradient-lava)" }}
                        />
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
