"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
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

export interface WorkLedgerProps {
  locale: AppLocale;
  projects: WorkIndexItem[];
  sectionIndex?: string;
  headingKicker?: string;
  headingTitle?: string;
  openLabel: string;
}

const PREVIEW_WIDTH = 410;
const PREVIEW_HEIGHT = 264;

export function WorkLedger({
  locale,
  projects,
  headingKicker,
  headingTitle,
  openLabel,
}: WorkLedgerProps) {
  const isRtl = locale === "ar";
  const filterId = useId().replace(/:/g, "");
  const heatFilterId = `lava-heat-${filterId}`;

  const rootRef = useRef<HTMLElement | null>(null);
  const previewWrapRef = useRef<HTMLDivElement | null>(null);
  const turbulenceRef = useRef<SVGFETurbulenceElement | null>(null);
  const displacementRef = useRef<SVGFEDisplacementMapElement | null>(null);

  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [finePointerEnabled, setFinePointerEnabled] = useState(false);

  const pointerPos = useRef({
    targetX: 0,
    targetY: 0,
    currX: 0,
    currY: 0,
    lastX: 0,
    tilt: 0,
    active: false,
    rafId: 0,
    heatScale: 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mqFine = window.matchMedia("(pointer: fine) and (hover: hover)");
    const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => {
      setFinePointerEnabled(mqFine.matches && !mqReduced.matches);
    };
    sync();

    mqFine.addEventListener("change", sync);
    mqReduced.addEventListener("change", sync);
    return () => {
      mqFine.removeEventListener("change", sync);
      mqReduced.removeEventListener("change", sync);
    };
  }, []);

  // GSAP ScrollTrigger subtle lift for rows
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray<HTMLElement>("[data-ledger-row]", root);
      for (const row of rows) {
        gsap.fromTo(
          row,
          { y: 18 },
          {
            y: 0,
            duration: 0.65,
            ease: "power3.out",
            clearProps: "transform",
            scrollTrigger: {
              trigger: row,
              start: "top 92%",
              once: true,
            },
          },
        );
      }
    }, root);

    return () => ctx.revert();
  }, [projects]);

  const stopPreviewLoop = useCallback(() => {
    if (pointerPos.current.rafId !== 0) {
      cancelAnimationFrame(pointerPos.current.rafId);
      pointerPos.current.rafId = 0;
    }
  }, []);

  const tickPreview = useCallback(() => {
    const step = () => {
      const state = pointerPos.current;
      const el = previewWrapRef.current;
      if (!el || !state.active) {
        state.rafId = 0;
        return;
      }

      const dx = state.targetX - state.currX;
      const dy = state.targetY - state.currY;
      state.currX += dx * 0.16;
      state.currY += dy * 0.16;

      const velX = state.targetX - state.lastX;
      state.lastX = state.targetX;
      const targetTilt = Math.max(-4, Math.min(4, velX * 0.24));
      state.tilt += (targetTilt - state.tilt) * 0.18;

      // Gentle decaying heat distortion pulse on movement / hover entry
      state.heatScale = Math.max(1.2, state.heatScale * 0.92 + Math.min(4.5, Math.abs(dx) * 0.08));
      if (displacementRef.current) {
        displacementRef.current.setAttribute("scale", state.heatScale.toFixed(2));
      }
      if (turbulenceRef.current) {
        const freq = 0.016 + Math.sin(performance.now() * 0.0028) * 0.004;
        turbulenceRef.current.setAttribute("baseFrequency", `${freq.toFixed(4)} ${(freq * 1.4).toFixed(4)}`);
      }

      el.style.transform = `translate3d(${state.currX.toFixed(1)}px, ${state.currY.toFixed(1)}px, 0) rotate(${state.tilt.toFixed(2)}deg)`;

      state.rafId = requestAnimationFrame(step);
    };

    step();
  }, []);

  const updatePointerTarget = useCallback(
    (clientX: number, clientY: number, snap = false) => {
      if (typeof window === "undefined") return;
      const margin = 20;
      const offsetX = isRtl ? -(PREVIEW_WIDTH + 34) : 34;
      const rawX = clientX + offsetX;
      const rawY = clientY - PREVIEW_HEIGHT * 0.52;

      const clampedX = Math.max(margin, Math.min(window.innerWidth - PREVIEW_WIDTH - margin, rawX));
      const clampedY = Math.max(margin, Math.min(window.innerHeight - PREVIEW_HEIGHT - margin, rawY));

      pointerPos.current.targetX = clampedX;
      pointerPos.current.targetY = clampedY;

      if (snap) {
        pointerPos.current.currX = clampedX;
        pointerPos.current.currY = clampedY;
        pointerPos.current.lastX = clampedX;
        pointerPos.current.heatScale = 7;
        if (previewWrapRef.current) {
          previewWrapRef.current.style.transform = `translate3d(${clampedX}px, ${clampedY}px, 0) rotate(0deg)`;
        }
      }
    },
    [isRtl],
  );

  const handleRowPointerEnter = (slug: string, e: React.PointerEvent<HTMLAnchorElement>) => {
    if (!finePointerEnabled || e.pointerType !== "mouse") return;
    const wasInactive = !pointerPos.current.active;
    pointerPos.current.active = true;
    pointerPos.current.heatScale = 7.5;
    updatePointerTarget(e.clientX, e.clientY, wasInactive);
    setHoveredSlug(slug);
    if (pointerPos.current.rafId === 0) {
      pointerPos.current.rafId = requestAnimationFrame(tickPreview);
    }
  };

  const handleRowPointerMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (!finePointerEnabled || e.pointerType !== "mouse") return;
    updatePointerTarget(e.clientX, e.clientY, false);
  };

  const handleListPointerLeave = () => {
    pointerPos.current.active = false;
    setHoveredSlug(null);
    stopPreviewLoop();
  };

  useEffect(() => {
    return () => stopPreviewLoop();
  }, [stopPreviewLoop]);

  if (projects.length === 0) return null;

  const activeProject = projects.find((item) => item.slug === hoveredSlug) ?? null;

  return (
    <section ref={rootRef} className="py-12 sm:py-16">
      {/* Subtle SVG turbulence filter for lava-tinted heat shimmer on floating preview */}
      <svg aria-hidden="true" className="pointer-events-none fixed h-0 w-0 overflow-hidden">
        <defs>
          <filter id={heatFilterId} x="-8%" y="-8%" width="116%" height="116%">
            <feTurbulence
              ref={turbulenceRef}
              type="fractalNoise"
              baseFrequency="0.016 0.022"
              numOctaves="2"
              seed="7"
              result="noise"
            />
            <feDisplacementMap
              ref={displacementRef}
              in="SourceGraphic"
              in2="noise"
              scale="2"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <div className="container-lava space-y-10">
        {headingTitle ? (
          <div className="flex flex-col items-start gap-4">
            {headingKicker ? <Kicker>{headingKicker}</Kicker> : null}
            <h2 className="text-display-md text-text">{headingTitle}</h2>
          </div>
        ) : null}

        <div
          onPointerLeave={handleListPointerLeave}
          className="divide-y divide-line overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-card"
        >
          {projects.map((project, idx) => {
            const isHovered = hoveredSlug === project.slug;
            const rowNo = formatNumber(idx + 1, locale, { minimumIntegerDigits: 2 });
            const yearText = project.year
              ? formatNumber(project.year, locale, { useGrouping: false })
              : null;

            return (
              <div key={project.id} data-ledger-row>
                <Link
                  href={`/work/${project.slug}`}
                  data-cursor="view"
                  data-project-slug={project.slug}
                  onPointerEnter={(e) => handleRowPointerEnter(project.slug, e)}
                  onPointerMove={handleRowPointerMove}
                  className={cn(
                    "group relative grid grid-cols-1 gap-6 px-4 py-7 transition-colors duration-300 sm:px-6 sm:py-9 lg:grid-cols-12 lg:items-center lg:gap-8",
                    "hover:bg-[color-mix(in_oklab,var(--lava-100)_22%,white)] focus-visible:bg-[color-mix(in_oklab,var(--lava-100)_30%,white)]",
                  )}
                >
                  {/* Hover molten start-edge seam */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none absolute inset-y-0 start-0 w-[3px] origin-top transition-transform duration-300 ease-[var(--ease-out-expo)]",
                      isHovered ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100 group-focus-visible:scale-y-100",
                    )}
                    style={{ background: "var(--gradient-lava)" }}
                  />

                  {/* Touch / Mobile / Coarse-pointer inline cover */}
                  {project.cover ? (
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[var(--radius-md)] border border-line bg-pearl-300 lg:hidden">
                      <Image
                        src={project.cover.url}
                        alt={project.cover.alt || project.title}
                        width={project.cover.width ?? 1200}
                        height={project.cover.height ?? 750}
                        sizes="(max-width: 640px) 100vw, 640px"
                        placeholder={project.cover.blurDataUrl ? "blur" : "empty"}
                        blurDataURL={project.cover.blurDataUrl ?? undefined}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}

                  {/* Index + Title + Mono Metadata */}
                  <div className="flex items-start gap-4 ps-3 sm:gap-6 sm:ps-4 lg:col-span-7">
                    <span
                      dir="ltr"
                      className="mt-2 shrink-0 text-xs font-semibold text-accent-text tabular-nums"
                    >
                      {rowNo}
                    </span>

                    <div className="min-w-0 space-y-2.5">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3
                          className={cn(
                            project.featured ? "text-display-md" : "text-display-sm",
                            "text-text transition-colors duration-300 group-hover:text-accent-text",
                          )}
                        >
                          {project.title}
                        </h3>
                        {project.featured ? (
                          <Chip tone="accent">{isRtl ? "مميز" : "Featured"}</Chip>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-faint">
                        {project.clientName ? (
                          <span className="font-semibold text-text">{project.clientName}</span>
                        ) : null}
                        {project.industry ? (
                          <>
                            {project.clientName ? <span aria-hidden="true">/</span> : null}
                            <span>{project.industry}</span>
                          </>
                        ) : null}
                        {project.clientCountryName ? (
                          <>
                            <span aria-hidden="true">/</span>
                            <span>{project.clientCountryName}</span>
                          </>
                        ) : null}
                        {yearText ? (
                          <>
                            <span aria-hidden="true">/</span>
                            <span className="tabular-nums text-muted">{yearText}</span>
                          </>
                        ) : null}
                      </div>

                      {project.summary ? (
                        <p className="line-clamp-2 max-w-2xl text-sm leading-relaxed text-muted">
                          {project.summary}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* Category + Mono Tech Tags + Arrow */}
                  <div className="flex flex-wrap items-center justify-between gap-4 ps-3 sm:ps-4 lg:col-span-5 lg:justify-end lg:ps-0 lg:pe-4">
                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      {project.category ? <Chip tone="accent">{project.category.name}</Chip> : null}
                      {project.technologies?.slice(0, 3).map((tech) => (
                        <Chip key={tech.slug}>
                          <span dir="ltr">{tech.name}</span>
                        </Chip>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="sr-only">{openLabel}</span>
                      <span
                        aria-hidden="true"
                        className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface text-muted transition-all duration-300 ease-[var(--ease-out-expo)] group-hover:border-transparent group-hover:bg-[image:var(--gradient-cta)] group-hover:text-white group-hover:shadow-lava"
                      >
                        <ArrowUpRight
                          aria-hidden="true"
                          className="rtl-flip size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:group-hover:-translate-x-0.5"
                        />
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop fine-pointer floating cover/video preview following cursor */}
      {finePointerEnabled ? (
        <div
          ref={previewWrapRef}
          aria-hidden="true"
          data-floating-preview={activeProject ? activeProject.slug : "idle"}
          className={cn(
            "pointer-events-none fixed left-0 top-0 z-[var(--z-sticky)] hidden lg:block will-change-transform",
            "transition-opacity duration-250 ease-[var(--ease-out-expo)]",
            activeProject && (activeProject.cover || activeProject.video)
              ? "opacity-100"
              : "opacity-0",
          )}
          style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }}
        >
          {/* Framed cover / video with lava-tinted heat distortion */}
          <div className="relative h-full w-full overflow-hidden rounded-[var(--radius-lg)] border-[6px] border-white bg-pearl-300 shadow-lift">
            {projects.map((item) => {
              const isCurrent = activeProject?.slug === item.slug;
              if (!item.cover && !item.video) return null;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "absolute inset-0 transition-opacity duration-250",
                    isCurrent ? "opacity-100" : "opacity-0",
                  )}
                  style={{
                    filter: isCurrent ? `url(#${heatFilterId})` : undefined,
                  }}
                >
                  {item.video && isCurrent ? (
                    <video
                      src={item.video.url}
                      poster={item.cover?.url}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  ) : item.cover ? (
                    <Image
                      src={item.cover.url}
                      alt=""
                      width={item.cover.width ?? 820}
                      height={item.cover.height ?? 528}
                      sizes="410px"
                      placeholder={item.cover.blurDataUrl ? "blur" : "empty"}
                      blurDataURL={item.cover.blurDataUrl ?? undefined}
                      className="h-full w-full object-cover"
                    />
                  ) : null}

                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-ink-900/80 via-ink-900/35 to-transparent px-4 py-3 text-white">
                    <span className="truncate text-xs font-semibold text-white">{item.title}</span>
                    {item.category ? (
                      <span className="shrink-0 text-[11px] font-semibold text-lava-300">
                        {item.category.name}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
