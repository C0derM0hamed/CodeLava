"use client";

import Image from "next/image";
import { useMemo, useState, type CSSProperties, type MouseEvent } from "react";
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon } from "@/components/ui/Icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/components/ui/cn";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { formatNumber } from "@/lib/i18n-content";
import type { Testimonial } from "@/server/queries/types";
import { initials, isSafeHttpUrl } from "./utils";

type SourceKey = Testimonial["source"];

export interface HomeTestimonialsLabels {
  previous: string;
  next: string;
  rating: string;
  sources: Record<SourceKey, string>;
  viewSource: string;
  region: string;
  allPlatforms: string;
  deliveredProject: string;
  ratedReviewsLabel: string;
}

const PLATFORM_META: Record<
  SourceKey,
  { accent: string; soft: string; badgeText: string; glyph: string }
> = {
  upwork: { accent: "#14a800", soft: "rgba(20, 168, 0, 0.14)", badgeText: "#108a00", glyph: "Up" },
  mostaql: { accent: "#2386c8", soft: "rgba(35, 134, 200, 0.14)", badgeText: "#1b6ca3", glyph: "م" },
  khamsat: { accent: "#e59a00", soft: "rgba(229, 154, 0, 0.16)", badgeText: "#a96d00", glyph: "٥" },
  fiverr: { accent: "#1dbf73", soft: "rgba(29, 191, 115, 0.15)", badgeText: "#149055", glyph: "fi" },
  bahr: { accent: "#0d9488", soft: "rgba(13, 148, 136, 0.14)", badgeText: "#0b756c", glyph: "ب" },
  freelancer: { accent: "#29b2fe", soft: "rgba(41, 178, 254, 0.14)", badgeText: "#0f7ab8", glyph: "FL" },
  clutch: { accent: "#ef4335", soft: "rgba(239, 67, 53, 0.14)", badgeText: "#c53024", glyph: "C" },
  direct: { accent: "#ff6a00", soft: "rgba(255, 106, 0, 0.14)", badgeText: "#c2470a", glyph: "CL" },
  other: { accent: "#ff8a2a", soft: "rgba(255, 138, 42, 0.14)", badgeText: "#c2470a", glyph: "★" },
};

function PlatformIcon({ source, size = 20 }: { source: SourceKey; size?: number }) {
  const meta = PLATFORM_META[source] ?? PLATFORM_META.other;
  return (
    <span
      aria-hidden="true"
      className="inline-grid shrink-0 place-items-center rounded-full font-display font-bold leading-none text-white shadow-xs"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(9, Math.round(size * 0.46)),
        background: meta.accent,
      }}
    >
      {meta.glyph}
    </span>
  );
}

function Stars({ rating, label, size = "sm" }: { rating: number; label: string; size?: "sm" | "md" }) {
  const rounded = Math.round(Math.min(5, Math.max(0, rating)) * 2) / 2;
  return (
    <span role="img" aria-label={label} className="inline-flex items-center gap-0.5 text-ember">
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.max(0, Math.min(1, rounded - i));
        return (
          <svg
            key={i}
            viewBox="0 0 20 20"
            className={size === "md" ? "size-4.5" : "size-3.5"}
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              opacity={0.25}
              d="M10 1.8l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.43 5.06 17l.94-5.5-4-3.9 5.53-.8L10 1.8z"
            />
            <path
              fill="currentColor"
              style={{ clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)` }}
              d="M10 1.8l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.43 5.06 17l.94-5.5-4-3.9 5.53-.8L10 1.8z"
            />
          </svg>
        );
      })}
    </span>
  );
}

function SourcePill({
  testimonial,
  labels,
}: {
  testimonial: Testimonial;
  labels: HomeTestimonialsLabels;
}) {
  const name = labels.sources[testimonial.source];
  const body = (
    <>
      <PlatformIcon source={testimonial.source} size={18} />
      <span>{name}</span>
      {isSafeHttpUrl(testimonial.sourceUrl) ? <ArrowUpRightIcon size={12} className="opacity-70" /> : null}
    </>
  );

  const cls = "inline-flex h-8 items-center gap-2 rounded-[var(--radius-pill)] border border-white/15 bg-white/8 ps-1.5 pe-3 text-xs font-semibold text-ash-50 backdrop-blur-sm";

  return isSafeHttpUrl(testimonial.sourceUrl) ? (
    <a
      href={testimonial.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={labels.viewSource.replace("{source}", name)}
      data-cursor="pointer"
      className={cls}
    >
      {body}
    </a>
  ) : (
    <span className={cls}>
      {body}
    </span>
  );
}

function StreamCard({
  testimonial,
  labels,
  formatRating,
  active,
  onSelect,
}: {
  testimonial: Testimonial;
  labels: HomeTestimonialsLabels;
  formatRating: (value: number) => string;
  active: boolean;
  onSelect: () => void;
}) {
  const role = [testimonial.authorRole, testimonial.company].filter(Boolean).join(" · ");
  const meta = PLATFORM_META[testimonial.source] ?? PLATFORM_META.other;

  const handleMove = (e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <article
      onMouseMove={handleMove}
      onClick={onSelect}
      role="button"
      aria-pressed={active}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      data-cursor="pointer"
      className={cn(
        "reviews-card group relative flex h-full flex-col gap-4 overflow-hidden rounded-[var(--radius-md)] border bg-surface p-5 text-start transition-all duration-300 sm:gap-5 sm:p-6",
        active
          ? "border-lava-500/60 shadow-[0_18px_42px_-16px_color-mix(in_oklab,var(--lava-500)_35%,transparent)]"
          : "border-line shadow-card hover:-translate-y-0.5 hover:border-line-lava hover:shadow-lift",
      )}
    >
      {active ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-0.5 [background-image:var(--gradient-heat-seam)]"
        />
      ) : null}
      <div className="flex items-center justify-between gap-2.5">
        <span
          className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-2.5 py-1 text-xs font-semibold"
          style={{ background: meta.soft, color: meta.badgeText }}
        >
          <PlatformIcon source={testimonial.source} size={16} />
          <span>{labels.sources[testimonial.source]}</span>
        </span>
        {testimonial.rating !== null ? (
          <div className="inline-flex items-center gap-1.5">
            <Stars rating={testimonial.rating} label={labels.rating.replace("{value}", formatRating(testimonial.rating))} />
            <span dir="ltr" className="font-mono text-xs font-semibold text-text tabular-nums">
              {formatRating(testimonial.rating)}
            </span>
          </div>
        ) : null}
      </div>

      <blockquote
        lang={testimonial.quoteLocale} dir="auto"
        className="line-clamp-4 text-[0.92rem] leading-relaxed text-text/92"
      >
        “{testimonial.quote}”
      </blockquote>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-accent-soft font-display text-xs font-bold text-accent-text ring-2 ring-bg sm:size-10 sm:text-sm">
            {testimonial.avatar ? (
              <Image src={testimonial.avatar.url} alt="" fill sizes="40px" className="object-cover" />
            ) : (
              <span aria-hidden="true">{initials(testimonial.authorName)}</span>
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold text-text">{testimonial.authorName}</p>
            {role ? <p className="truncate text-xs text-muted">{role}</p> : null}
          </div>
        </div>
        {testimonial.country ? (
          <span
            dir="ltr"
            className="shrink-0 rounded-md border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[0.6875rem] font-semibold text-faint"
          >
            {testimonial.country.toUpperCase()}
          </span>
        ) : null}
      </div>
    </article>
  );
}

/**
 * Freelance Platforms Reviews Hub:
 * Live per-platform rating dock (Upwork, Mostaql, Khamsat, Fiverr, Bahr, Clutch, Direct) +
 * interactive dark obsidian spotlight stage with glowing timer + GPU kinetic infinite stream
 * (or staggered filtered grid when a platform is selected). 100% DB-driven.
 */
export function HomeTestimonials({
  locale = "en",
  eyebrow,
  title,
  description,
  testimonials,
  labels,
}: {
  locale?: AppLocale;
  eyebrow?: string;
  title: string;
  description?: string;
  testimonials: Testimonial[];
  labels: HomeTestimonialsLabels;
}) {
  const [selectedPlatform, setSelectedPlatform] = useState<SourceKey | "all">("all");
  const [activeId, setActiveId] = useState<string>(testimonials[0]?.id ?? "");

  const platformStats = useMemo(() => {
    const grouped = new Map<SourceKey, { source: SourceKey; count: number; sum: number; rated: number }>();
    for (const item of testimonials) {
      const current = grouped.get(item.source) ?? { source: item.source, count: 0, sum: 0, rated: 0 };
      current.count += 1;
      if (item.rating !== null) {
        current.sum += item.rating;
        current.rated += 1;
      }
      grouped.set(item.source, current);
    }
    return Array.from(grouped.values()).sort((a, b) => b.count - a.count);
  }, [testimonials]);

  const ratedCount = platformStats.reduce((total, stat) => total + stat.rated, 0);
  const aggregateRating = ratedCount
    ? platformStats.reduce((total, stat) => total + stat.sum, 0) / ratedCount
    : null;
  const displayRating = (rating: number) => formatNumber(rating, locale, {
    minimumFractionDigits: 1, maximumFractionDigits: 1,
  });

  const filtered = useMemo(
    () => (selectedPlatform === "all" ? testimonials : testimonials.filter((t) => t.source === selectedPlatform)),
    [selectedPlatform, testimonials],
  );

  const activeIndex = useMemo(() => {
    const idx = filtered.findIndex((item) => item.id === activeId);
    return idx >= 0 ? idx : 0;
  }, [activeId, filtered]);

  const activeItem = filtered[activeIndex];

  if (!activeItem) return null;

  const stepSpotlight = (dir: 1 | -1) => {
    if (filtered.length <= 1) return;
    const nextIdx = (activeIndex + dir + filtered.length) % filtered.length;
    setActiveId(filtered[nextIdx].id);
  };

  const activeMeta = PLATFORM_META[activeItem.source] ?? PLATFORM_META.other;
  const activeRole = [activeItem.authorRole, activeItem.company].filter(Boolean).join(" · ");
  const maxFive = formatNumber(5, locale, { useGrouping: false });
  const slideCurrent = formatNumber(activeIndex + 1, locale, { minimumIntegerDigits: 2, useGrouping: false });
  const slideTotal = formatNumber(filtered.length, locale, { minimumIntegerDigits: 2, useGrouping: false });

  // Prevent orphan trailing cards on desktop grids while keeping mobile as a sleek snap-scroll rail.
  const desktopGridCols =
    filtered.length === 1
      ? "sm:grid-cols-1 sm:max-w-xl"
      : filtered.length === 2
        ? "sm:grid-cols-2"
        : filtered.length === 4 || filtered.length === 8 || filtered.length >= 12
          ? "sm:grid-cols-2 xl:grid-cols-4"
          : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section
      aria-labelledby="home-testimonials-title"
      className="section-y home-band--tinted relative overflow-x-clip"
    >
      <div className="container-lava space-y-[var(--space-heading)]">
        {/* Heading and rating across the displayed reviews */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            layout="intro"
            size="md"
            kicker={eyebrow}
            title={title}
            lead={description}
            titleId="home-testimonials-title"
            className="max-w-2xl"
          />

          {aggregateRating !== null && (
            <div className="inline-flex max-w-full flex-nowrap items-center gap-3.5 self-start rounded-[var(--radius-lg)] border border-line bg-surface px-4 py-3 shadow-card sm:gap-4 sm:px-5 sm:py-3.5 lg:self-end">
              <div className="flex shrink-0 items-baseline gap-1">
                <span dir="ltr" className="font-display text-2xl font-bold leading-none text-text tabular-nums sm:text-3xl">
                  {displayRating(aggregateRating)}
                </span>
                <span dir="ltr" className="text-xs font-medium text-faint sm:text-sm">
                  / {maxFive}
                </span>
              </div>
              <div className="h-8 w-px shrink-0 bg-line sm:h-9" aria-hidden="true" />
              <div className="grid min-w-0 gap-1">
                <Stars
                  rating={aggregateRating}
                  label={labels.rating.replace("{value}", displayRating(aggregateRating))}
                  size="md"
                />
                <span className="truncate text-[0.72rem] font-medium text-muted sm:text-xs">
                  {labels.ratedReviewsLabel.replace("{count}", formatNumber(ratedCount, locale))}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Freelance Platform Dock */}
        {platformStats.length > 1 ? (
          <div
            role="group"
            aria-label={labels.allPlatforms}
            className="flex flex-wrap items-center gap-2"
          >
            <button
              type="button"
              aria-pressed={selectedPlatform === "all"}
              data-cursor="pointer"
              onClick={() => setSelectedPlatform("all")}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-[var(--radius-pill)] border px-3.5 text-[0.8125rem] font-semibold transition-all duration-300",
                selectedPlatform === "all"
                  ? "border-transparent bg-ink-900 text-ash-50 shadow-card"
                  : "border-line bg-surface text-muted shadow-[var(--shadow-xs)] hover:border-line-lava hover:text-text",
              )}
            >
              <span>{labels.allPlatforms}</span>
              <span
                dir="ltr"
                className={cn(
                  "rounded-full px-1.5 py-0.5 font-mono text-[0.72rem] tabular-nums",
                  selectedPlatform === "all" ? "bg-white/15 text-ash-50" : "bg-surface-2 text-faint",
                )}
              >
                {formatNumber(testimonials.length, locale, { useGrouping: false })}
              </span>
            </button>

            {platformStats.map((stat) => {
              const active = selectedPlatform === stat.source;
              const avg = stat.rated > 0 ? displayRating(stat.sum / stat.rated) : null;
              return (
                <button
                  key={stat.source}
                  type="button"
                  aria-pressed={active}
                  data-cursor="pointer"
                  onClick={() => {
                    setSelectedPlatform(stat.source);
                    const first = testimonials.find((t) => t.source === stat.source);
                    if (first) setActiveId(first.id);
                  }}
                  className={cn(
                    "inline-flex h-10 items-center gap-1.5 rounded-[var(--radius-pill)] border ps-1.5 pe-3 text-[0.8125rem] font-semibold transition-all duration-300",
                    active
                      ? "border-transparent bg-ink-900 text-ash-50 shadow-card"
                      : "border-line bg-surface text-text shadow-[var(--shadow-xs)] hover:-translate-y-0.5 hover:border-line-lava hover:shadow-card",
                  )}
                >
                  <PlatformIcon source={stat.source} size={22} />
                  <span>{labels.sources[stat.source]}</span>
                  {avg !== null && (
                    <span
                      dir="ltr"
                      className={cn(
                        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-mono text-[0.72rem] tabular-nums",
                        active ? "bg-white/15 text-ember" : "bg-surface-2 text-muted",
                      )}
                    >
                      ★ {avg}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : null}

        {/* Centerpiece Interactive Dark Obsidian Spotlight */}
        <div
          className="surface-dark reviews-spotlight relative overflow-hidden rounded-[var(--radius-xl)] border border-white/10 p-6 shadow-[var(--shadow-pop)] sm:p-10 lg:p-14"
          style={{ "--platform-glow": activeMeta.accent } as CSSProperties}
        >
          {/* Ambient glow tinted subtly by the active freelance platform + volcanic ember */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-28 -end-20 size-80 rounded-full opacity-25 blur-3xl transition-colors duration-700"
            style={{ background: activeMeta.accent }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -start-16 size-80 rounded-full opacity-20 blur-3xl"
            style={{ background: "var(--lava-500)" }}
          />
          {/* Subtle oversized editorial quotation watermark */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-4 end-8 select-none font-display text-[9rem] font-bold leading-none text-white/[0.04] sm:text-[12rem]"
          >
            “
          </span>

          <div className="relative z-10 flex min-w-0 flex-col gap-6 sm:gap-7">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3.5">
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                <SourcePill testimonial={activeItem} labels={labels} />
                {activeItem.rating !== null ? (
                  <div className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-white/12 bg-white/6 px-3 py-1.5">
                    <Stars
                      rating={activeItem.rating}
                      label={labels.rating.replace("{value}", displayRating(activeItem.rating))}
                      size="md"
                    />
                    <span dir="ltr" className="font-mono text-xs font-bold text-ash-50 tabular-nums">
                      {displayRating(activeItem.rating)}
                    </span>
                  </div>
                ) : null}
              </div>

              {activeItem.project ? (
                <Link
                  href={`/work/${activeItem.project.slug}`}
                  data-cursor="pointer"
                  className="inline-flex max-w-full items-center gap-2 rounded-[var(--radius-pill)] border border-lava-400/35 bg-lava-500/12 px-3.5 py-1.5 text-xs font-semibold text-lava-100 transition-colors hover:border-lava-400/70 hover:bg-lava-500/20"
                >
                  <span className="shrink-0 text-lava-300">{labels.deliveredProject}:</span>
                  <span className="truncate">{activeItem.project.title}</span>
                  <ArrowUpRightIcon size={12} className="shrink-0" />
                </Link>
              ) : null}
            </div>

            <blockquote
              aria-live="polite"
              lang={activeItem.quoteLocale} dir="auto"
              className="max-w-4xl break-words font-display text-lg font-medium leading-[1.6] text-ash-50 sm:text-2xl lg:text-[1.75rem]"
            >
              “{activeItem.quote}”
            </blockquote>

            <div className="flex min-w-0 flex-col gap-5 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3.5 sm:gap-4">
                <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-lava-500/20 font-display text-sm font-bold text-lava-100 ring-2 ring-white/15 sm:size-13 sm:text-base">
                  {activeItem.avatar ? (
                    <Image src={activeItem.avatar.url} alt="" fill sizes="52px" className="object-cover" />
                  ) : (
                    <span aria-hidden="true">{initials(activeItem.authorName)}</span>
                  )}
                </span>
                <div className="min-w-0">
                  <p className="font-display text-base font-semibold text-ash-50">
                    {activeItem.authorName}
                  </p>
                  <p className="text-sm leading-snug text-ink-200">
                    {[activeRole, activeItem.countryName].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>

              {filtered.length > 1 ? (
                <div className="flex items-center gap-3">
                  <div className="hidden items-center gap-1.5 sm:flex" aria-hidden="true">
                    {filtered.map((item) => {
                      const isCurrent = item.id === activeItem.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          tabIndex={-1}
                          onClick={() => setActiveId(item.id)}
                          data-cursor="pointer"
                          className={cn(
                            "h-1.5 rounded-full transition-all duration-300",
                            isCurrent ? "w-6 bg-lava-400" : "w-1.5 bg-white/20 hover:bg-white/40",
                          )}
                        />
                      );
                    })}
                  </div>
                  <span dir="ltr" className="font-mono text-xs text-ink-300 tabular-nums">
                    {slideCurrent} / {slideTotal}
                  </span>
                  <button
                    type="button"
                    onClick={() => stepSpotlight(-1)}
                    aria-label={labels.previous}
                    data-cursor="pointer"
                    className="grid size-10 place-items-center rounded-full border border-white/16 bg-white/6 text-ash-50 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/14 sm:size-11"
                  >
                    <ArrowLeftIcon size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={() => stepSpotlight(1)}
                    aria-label={labels.next}
                    data-cursor="pointer"
                    className="grid size-10 place-items-center rounded-full text-white shadow-[var(--shadow-lava)] [background-image:var(--gradient-cta)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lava-hover)] sm:size-11"
                  >
                    <ArrowRightIcon size={17} />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="container-lava mt-[var(--space-grid-lg)]">
        <ul
          aria-label={labels.region}
          className={cn(
            "home-reviews-rail flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 sm:grid sm:gap-[var(--space-grid)] sm:overflow-visible sm:pb-0",
            desktopGridCols,
          )}
        >
          {filtered.map((testimonial) => (
            <li key={testimonial.id} className="w-[82vw] max-w-[20.5rem] shrink-0 snap-start sm:w-auto sm:max-w-none sm:min-w-0">
              <StreamCard
                testimonial={testimonial}
                labels={labels}
                formatRating={displayRating}
                active={testimonial.id === activeItem.id}
                onSelect={() => setActiveId(testimonial.id)}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
