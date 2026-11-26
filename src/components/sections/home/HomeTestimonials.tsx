"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/Icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/components/ui/cn";
import type { Testimonial } from "@/server/queries/types";
import { initials, isSafeHttpUrl } from "./utils";

export interface HomeTestimonialsLabels {
  previous: string;
  next: string;
  /** Accessible rating label with a `{value}` placeholder, e.g. "Rated {value} out of 5". */
  rating: string;
  sources: Record<Testimonial["source"], string>;
  /** Outbound source link label with a `{source}` placeholder. */
  viewSource: string;
  region: string;
}

function Stars({ rating, label }: { rating: number; label: string }) {
  const rounded = Math.round(Math.min(5, Math.max(0, rating)));
  return (
    <span role="img" aria-label={label} className="flex gap-0.5 text-accent">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20" className={cn("size-4", i >= rounded && "opacity-25")} aria-hidden="true">
          <path fill="currentColor" d="M10 1.8l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.43 5.06 17l.94-5.5-4-3.9 5.53-.8L10 1.8z" />
        </svg>
      ))}
    </span>
  );
}

function SourceBadge({ testimonial, labels }: { testimonial: Testimonial; labels: HomeTestimonialsLabels }) {
  const name = labels.sources[testimonial.source];
  const tone =
    testimonial.source === "upwork" ? "bg-code-green" : testimonial.source === "mostaql" ? "bg-code-cyan" : "bg-accent";
  const body = (
    <>
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", tone)} />
      {name}
    </>
  );
  const className =
    "inline-flex h-7 items-center gap-1.5 rounded-[var(--radius-pill)] border border-line bg-surface-2 px-2.5 text-xs font-medium text-muted";
  return isSafeHttpUrl(testimonial.sourceUrl) ? (
    <a
      href={testimonial.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={labels.viewSource.replace("{source}", name)}
      data-cursor="pointer"
      className={cn(className, "transition-colors hover:border-line-lava hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus")}
    >
      {body}
    </a>
  ) : (
    <span className={className}>{body}</span>
  );
}

function TestimonialCard({ testimonial, labels }: { testimonial: Testimonial; labels: HomeTestimonialsLabels }) {
  const role = [testimonial.authorRole, testimonial.company].filter(Boolean).join(" · ");
  return (
    <figure className="flex h-full flex-col gap-5 rounded-[var(--radius-md)] border border-line bg-surface p-6 shadow-card sm:p-7">
      <div className="flex items-start gap-4">
        <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-accent-soft font-display text-lg font-semibold text-accent-text ring-4 ring-bg">
          {testimonial.avatar ? (
            <Image src={testimonial.avatar.url} alt="" fill sizes="56px" className="object-cover" />
          ) : (
            <span aria-hidden="true">{initials(testimonial.authorName)}</span>
          )}
        </span>
        <div className="grid gap-2 pt-1">
          {testimonial.rating ? (
            <Stars rating={testimonial.rating} label={labels.rating.replace("{value}", String(testimonial.rating))} />
          ) : null}
          <blockquote lang={testimonial.quoteLocale ?? undefined} className="text-[0.975rem] leading-relaxed text-text">
            <p>“{testimonial.quote}”</p>
          </blockquote>
        </div>
      </div>
      <figcaption className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-line pt-4">
        <span className="grid gap-0.5">
          <span className="font-display text-base font-semibold text-text">{testimonial.authorName}</span>
          {role ? <span className="text-[0.8125rem] text-muted">{role}</span> : null}
        </span>
        <span className="flex flex-wrap items-center gap-2">
          <SourceBadge testimonial={testimonial} labels={labels} />
          {testimonial.countryName ? (
            <span className="inline-flex h-7 items-center gap-1.5 text-xs font-medium text-muted">
              {testimonial.country ? (
                <span dir="ltr" aria-hidden="true" className="rounded-sm bg-surface-2 px-1 font-mono text-[0.6875rem] text-faint">
                  {testimonial.country.toUpperCase()}
                </span>
              ) : null}
              {testimonial.countryName}
            </span>
          ) : null}
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * Testimonials (reference): split intro with the big orange quote mark and prev/next round
 * buttons beside a scroll-snap track of cards (two visible on desktop). Native scrolling keeps
 * swipe, keyboard and RTL behaviour; buttons simply page the track.
 */
export function HomeTestimonials({
  eyebrow,
  title,
  description,
  testimonials,
  labels,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  testimonials: Testimonial[];
  labels: HomeTestimonialsLabels;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft);
    setEdges({ start: pos <= 2, end: pos >= max - 2 });
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      ro.disconnect();
    };
  }, [measure]);

  const page = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === "rtl";
    const card = el.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 20 : el.clientWidth;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: step * direction * (rtl ? -1 : 1), behavior: reduce ? "auto" : "smooth" });
  };

  if (testimonials.length === 0) return null;
  const pageable = !(edges.start && edges.end);
  const buttonBase =
    "grid size-12 place-items-center rounded-full transition-[transform,box-shadow,opacity] duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-focus disabled:pointer-events-none disabled:opacity-40";

  return (
    <section aria-labelledby="home-testimonials-title" className="section-y">
      <div className="container-lava grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
        <div className="flex gap-4 lg:col-span-4">
          <span aria-hidden="true" className="home-quote-mark shrink-0 select-none">
            “
          </span>
          <div className="grid gap-6">
            <SectionHeading layout="intro" size="md" kicker={eyebrow} title={title} lead={description} titleId="home-testimonials-title" />
            {pageable ? (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => page(-1)}
                  disabled={edges.start}
                  aria-label={labels.previous}
                  aria-controls="home-testimonials-track"
                  data-cursor="pointer"
                  className={cn(buttonBase, "border border-line-strong bg-surface text-text shadow-[var(--shadow-xs)] hover:shadow-card")}
                >
                  <ArrowLeftIcon size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => page(1)}
                  disabled={edges.end}
                  aria-label={labels.next}
                  aria-controls="home-testimonials-track"
                  data-cursor="pointer"
                  className={cn(buttonBase, "text-on-accent shadow-[var(--shadow-lava)] [background-image:var(--gradient-cta)] hover:shadow-[var(--shadow-lava-hover)]")}
                >
                  <ArrowRightIcon size={18} />
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="min-w-0 lg:col-span-8">
          <ul
            id="home-testimonials-track"
            ref={trackRef}
            aria-label={labels.region}
            className="home-carousel -mx-[var(--gutter)] -my-6 flex gap-5 overflow-x-auto px-[var(--gutter)] py-6 lg:mx-0 lg:px-0"
          >
            {testimonials.map((testimonial) => (
              <li key={testimonial.id} className="shrink-0 basis-[86%] sm:basis-[calc(50%-10px)]">
                <TestimonialCard testimonial={testimonial} labels={labels} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
