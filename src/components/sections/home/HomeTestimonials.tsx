"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from "react";
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
  verifiedPlatforms: string;
  averageRating: string;
  verifiedOn: string;
  deliveredProject: string;
  reviewsCountLabel: string;
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

function VerifiedCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={cn("size-4 shrink-0", className)}>
      <path
        d="M10 1.8l2.1 1.6 2.6-.2.9 2.5 2.2 1.4-.5 2.6 1.2 2.4-1.7 2 .1 2.6-2.5.9-1.4 2.2-2.6-.5-2.4 1.2-2-1.7-2.6.1-.9-2.5-2.2-1.4.5-2.6-1.2-2.4 1.7-2-.1-2.6 2.5-.9 1.4-2.2 2.6.5L10 1.8z"
        fill="currentColor"
        fillOpacity="0.18"
      />
      <path
        d="M6.8 10.2l2.1 2.1 4.4-4.6"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Stars({ rating, label, size = "sm" }: { rating: number; label: string; size?: "sm" | "md" }) {
  const rounded = Math.round(Math.min(5, Math.max(0, rating)) * 2) / 2;
  return (
    <span role="img" aria-label={label} className="inline-flex items-center gap-0.5 text-ember">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={cn(size === "md" ? "size-4.5" : "size-3.5", i + 0.5 > rounded && "opacity-25")}
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M10 1.8l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.43 5.06 17l.94-5.5-4-3.9 5.53-.8L10 1.8z"
          />
        </svg>
      ))}
    </span>
  );
}

function SourcePill({
  testimonial,
  labels,
  onDark = false,
}: {
  testimonial: Testimonial;
  labels: HomeTestimonialsLabels;
  onDark?: boolean;
}) {
  const name = labels.sources[testimonial.source];
  const meta = PLATFORM_META[testimonial.source] ?? PLATFORM_META.other;
  const body = (
    <>
      <PlatformIcon source={testimonial.source} size={18} />
      <span>{onDark ? labels.verifiedOn.replace("{source}", name) : name}</span>
      {isSafeHttpUrl(testimonial.sourceUrl) ? <ArrowUpRightIcon size={12} className="opacity-70" /> : null}
    </>
  );

  const cls = cn(
    "inline-flex h-8 items-center gap-2 rounded-[var(--radius-pill)] border ps-1.5 pe-3 text-xs font-semibold transition-all duration-200",
    onDark
      ? "border-white/15 bg-white/8 text-ash-50 backdrop-blur-sm hover:border-white/30 hover:bg-white/14"
      : "border-line bg-surface-2 text-text hover:border-line-lava hover:bg-surface",
  );

  return isSafeHttpUrl(testimonial.sourceUrl) ? (
    <a
      href={testimonial.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={labels.viewSource.replace("{source}", name)}
      data-cursor="pointer"
      className={cls}
      style={!onDark ? { borderColor: `${meta.accent}35` } : undefined}
    >
      {body}
    </a>
  ) : (
    <span className={cls} style={!onDark ? { borderColor: `${meta.accent}35` } : undefined}>
      {body}
    </span>
  );
}

function StreamCard({
  testimonial,
  labels,
  active,
  onSelect,
}: {
  testimonial: Testimonial;
  labels: HomeTestimonialsLabels;
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
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      data-cursor="pointer"
      className={cn(
        "reviews-card group relative flex h-full flex-col gap-4 overflow-hidden rounded-[var(--radius-md)] border bg-surface p-5 text-start transition-all duration-300 sm:p-6",
        active
          ? "border-lava-500/60 shadow-[0_18px_42px_-16px_color-mix(in_oklab,var(--lava-500)_35%,transparent)]"
          : "border-line shadow-card hover:-translate-y-0.5 hover:border-line-lava hover:shadow-lift",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-2.5 py-1 text-xs font-semibold"
          style={{ background: meta.soft, color: meta.badgeText }}
        >
          <PlatformIcon source={testimonial.source} size={16} />
          <span>{labels.sources[testimonial.source]}</span>
        </span>
        {testimonial.rating ? (
          <div className="inline-flex items-center gap-1.5">
            <Stars rating={testimonial.rating} label={labels.rating.replace("{value}", String(testimonial.rating))} />
            <span dir="ltr" className="font-mono text-xs font-semibold text-text tabular-nums">
              {testimonial.rating.toFixed(1)}
            </span>
          </div>
        ) : null}
      </div>

      <blockquote
        lang={testimonial.quoteLocale ?? undefined}
        className="line-clamp-4 text-[0.9375rem] leading-relaxed text-text/92"
      >
        “{testimonial.quote}”
      </blockquote>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-accent-soft font-display text-sm font-bold text-accent-text ring-2 ring-bg">
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
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  const platformStats = useMemo(() => {
    const grouped = new Map<SourceKey, { source: SourceKey; count: number; sum: number; rated: number }>();
    for (const item of testimonials) {
      const current = grouped.get(item.source) ?? { source: item.source, count: 0, sum: 0, rated: 0 };
      current.count += 1;
      if (typeof item.rating === "number" && item.rating > 0) {
        current.sum += item.rating;
        current.rated += 1;
      }
      grouped.set(item.source, current);
    }
    return Array.from(grouped.values()).sort((a, b) => b.count - a.count);
  }, [testimonials]);

  const aggregateRating = useMemo(() => {
    const rated = testimonials.filter((t) => typeof t.rating === "number" && t.rating > 0);
    if (rated.length === 0) return 5.0;
    const sum = rated.reduce((acc, t) => acc + (t.rating ?? 5), 0);
    return sum / rated.length;
  }, [testimonials]);

  const filtered = useMemo(
    () => (selectedPlatform === "all" ? testimonials : testimonials.filter((t) => t.source === selectedPlatform)),
    [selectedPlatform, testimonials],
  );

  const activeIndex = useMemo(() => {
    const idx = filtered.findIndex((item) => item.id === activeId);
    return idx >= 0 ? idx : 0;
  }, [activeId, filtered]);

  const activeItem = filtered[activeIndex] ?? testimonials[0];

  useEffect(() => {
    if (filtered.length <= 1 || paused) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    timerRef.current = window.setInterval(() => {
      setActiveId((prevId) => {
        const idx = filtered.findIndex((item) => item.id === prevId);
        const next = filtered[(idx + 1) % filtered.length];
        return next?.id ?? prevId;
      });
    }, 6500);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [filtered, paused]);

  if (testimonials.length === 0 || !activeItem) return null;

  const stepSpotlight = (dir: 1 | -1) => {
    if (filtered.length <= 1) return;
    const nextIdx = (activeIndex + dir + filtered.length) % filtered.length;
    setActiveId(filtered[nextIdx].id);
  };

  const activeMeta = PLATFORM_META[activeItem.source] ?? PLATFORM_META.other;
  const activeRole = [activeItem.authorRole, activeItem.company].filter(Boolean).join(" · ");
  const marqueeItems = testimonials.length >= 3 ? [...testimonials, ...testimonials] : testimonials;
  const marqueeDuration = `${Math.max(26, testimonials.length * 6.5)}s`;

  return (
    <section
      aria-labelledby="home-testimonials-title"
      className="section-y relative overflow-x-clip"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="container-lava space-y-8 sm:space-y-10">
        {/* Top Row: Editorial Heading + Aggregate Verified Freelance Rating Card */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            layout="intro"
            size="md"
            kicker={eyebrow || labels.verifiedPlatforms}
            title={title}
            lead={description}
            titleId="home-testimonials-title"
            className="max-w-2xl"
          />

          <div className="inline-flex flex-wrap items-center gap-4 self-start rounded-[var(--radius-lg)] border border-line bg-surface px-5 py-3.5 shadow-card lg:self-end">
            <div className="flex items-baseline gap-1.5">
              <span dir="ltr" className="font-display text-3xl font-bold leading-none text-text tabular-nums">
                {aggregateRating.toFixed(1)}
              </span>
              <span dir="ltr" className="text-sm font-medium text-faint">
                / 5
              </span>
            </div>
            <div className="h-9 w-px bg-line" aria-hidden="true" />
            <div className="grid gap-1">
              <Stars
                rating={aggregateRating}
                label={labels.rating.replace("{value}", aggregateRating.toFixed(1))}
                size="md"
              />
              <span className="text-xs font-medium text-muted">
                {labels.reviewsCountLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Freelance Platform Dock */}
        {platformStats.length > 1 ? (
          <div
            role="tablist"
            aria-label={labels.verifiedPlatforms}
            className="flex flex-wrap items-center gap-2"
          >
            <button
              type="button"
              role="tab"
              aria-selected={selectedPlatform === "all"}
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
              const avg = stat.rated > 0 ? (stat.sum / stat.rated).toFixed(1) : "5.0";
              return (
                <button
                  key={stat.source}
                  type="button"
                  role="tab"
                  aria-selected={active}
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
                  <span
                    dir="ltr"
                    className={cn(
                      "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-mono text-[0.72rem] tabular-nums",
                      active ? "bg-white/15 text-ember" : "bg-surface-2 text-muted",
                    )}
                  >
                    ★ {avg}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        {/* Centerpiece Interactive Dark Obsidian Spotlight */}
        <div
          className="surface-dark reviews-spotlight relative overflow-hidden rounded-[var(--radius-xl)] border border-white/10 p-6 shadow-[var(--shadow-pop)] sm:p-9 lg:p-11"
          style={
            {
              "--platform-glow": activeMeta.accent,
            } as CSSProperties
          }
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

          <div key={activeItem.id} className="reviews-spotlight-enter relative z-10 grid gap-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <SourcePill testimonial={activeItem} labels={labels} onDark />
                {activeItem.rating ? (
                  <div className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-white/12 bg-white/6 px-3 py-1.5">
                    <Stars
                      rating={activeItem.rating}
                      label={labels.rating.replace("{value}", String(activeItem.rating))}
                      size="md"
                    />
                    <span dir="ltr" className="font-mono text-xs font-bold text-ash-50 tabular-nums">
                      {activeItem.rating.toFixed(1)}
                    </span>
                  </div>
                ) : null}
              </div>

              {activeItem.project ? (
                <Link
                  href={`/work/${activeItem.project.slug}`}
                  data-cursor="pointer"
                  className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-lava-400/35 bg-lava-500/12 px-3.5 py-1.5 text-xs font-semibold text-lava-100 transition-colors hover:border-lava-400/70 hover:bg-lava-500/20"
                >
                  <span className="text-lava-300">{labels.deliveredProject}:</span>
                  <span>{activeItem.project.title}</span>
                  <ArrowUpRightIcon size={12} />
                </Link>
              ) : null}
            </div>

            <blockquote
              lang={activeItem.quoteLocale ?? undefined}
              className="max-w-4xl font-display text-xl font-medium leading-[1.55] text-ash-50 sm:text-2xl lg:text-[1.75rem]"
            >
              “{activeItem.quote}”
            </blockquote>

            <div className="flex flex-wrap items-center justify-between gap-5 border-t border-white/10 pt-6">
              <div className="flex items-center gap-4">
                <span className="relative grid size-13 shrink-0 place-items-center overflow-hidden rounded-full bg-lava-500/20 font-display text-base font-bold text-lava-100 ring-2 ring-white/15">
                  {activeItem.avatar ? (
                    <Image src={activeItem.avatar.url} alt="" fill sizes="52px" className="object-cover" />
                  ) : (
                    <span aria-hidden="true">{initials(activeItem.authorName)}</span>
                  )}
                </span>
                <div>
                  <p className="flex items-center gap-1.5 font-display text-base font-semibold text-ash-50">
                    <span>{activeItem.authorName}</span>
                    <VerifiedCheck className="text-lava-400" />
                  </p>
                  <p className="text-sm text-ink-200">
                    {[activeRole, activeItem.countryName].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>

              {filtered.length > 1 ? (
                <div className="flex items-center gap-3">
                  <span dir="ltr" className="font-mono text-xs text-ink-300 tabular-nums">
                    {String(activeIndex + 1).padStart(2, "0")} / {String(filtered.length).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    onClick={() => stepSpotlight(-1)}
                    aria-label={labels.previous}
                    data-cursor="pointer"
                    className="grid size-11 place-items-center rounded-full border border-white/16 bg-white/6 text-ash-50 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/14"
                  >
                    <ArrowLeftIcon size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={() => stepSpotlight(1)}
                    aria-label={labels.next}
                    data-cursor="pointer"
                    className="grid size-11 place-items-center rounded-full text-white shadow-[var(--shadow-lava)] [background-image:var(--gradient-cta)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lava-hover)]"
                  >
                    <ArrowRightIcon size={17} />
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {/* Live animated progress bar along the bottom edge */}
          {filtered.length > 1 ? (
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] bg-white/8">
              <div
                key={`${activeItem.id}-${paused ? "paused" : "run"}`}
                className={cn("reviews-timer h-full [background-image:var(--gradient-cta)]", paused && "reviews-timer--paused")}
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* Stage B: Kinetic Continuous Infinite Stream ("All") OR Crisp Filtered Grid (Specific Platform) */}
      {selectedPlatform === "all" && testimonials.length >= 3 ? (
        <div
          aria-label={labels.region}
          className="reviews-marquee-wrap relative mt-8 sm:mt-10"
        >
          <div
            className="reviews-marquee-track flex w-max gap-4 py-2 sm:gap-5"
            style={{ "--reviews-dur": marqueeDuration } as CSSProperties}
          >
            {marqueeItems.map((testimonial, idx) => (
              <div
                key={`${testimonial.id}-${idx}`}
                className="w-[min(84vw,22.5rem)] shrink-0 sm:w-[23.5rem]"
              >
                <StreamCard
                  testimonial={testimonial}
                  labels={labels}
                  active={testimonial.id === activeItem.id}
                  onSelect={() => setActiveId(testimonial.id)}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="container-lava mt-8 sm:mt-10">
          <ul
            aria-label={labels.region}
            className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
          >
            {filtered.map((testimonial) => (
              <li key={testimonial.id} className="min-w-0">
                <StreamCard
                  testimonial={testimonial}
                  labels={labels}
                  active={testimonial.id === activeItem.id}
                  onSelect={() => setActiveId(testimonial.id)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
