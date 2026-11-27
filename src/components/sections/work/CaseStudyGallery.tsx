"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Dialog } from "@/components/ui/Dialog";
import { ArrowLeft, ArrowRight, Maximize2 } from "lucide-react";
import { cn } from "@/components/ui/cn";
import type { AppLocale } from "@/i18n/routing";
import { formatNumber } from "@/lib/i18n-content";
import { Chip, Kicker } from "../process/kit";
import type { CaseStudyGalleryItem } from "./types";

export interface CaseStudyGalleryProps {
  locale: AppLocale;
  projectTitle: string;
  gallery: CaseStudyGalleryItem[];
  headingTitle: string;
  sectionIndex?: string;
  labels: {
    close: string;
    previousSlide: string;
    nextSlide: string;
    goToSlidePrefix: string;
  };
}

/**
 * Keeps widescreen UI screenshots & mockups uncropped on their horizontal edges.
 * - 1 item: full-width 16:9
 * - 2 items: balanced 6/6 split at 16:10 (never squashes widescreen interfaces into a square)
 * - 3+ odd items: lead hero 12-col 16:9 followed by balanced 6/6 16:10 pairs
 * - 4+ even items: balanced 6/6 16:10 pairs
 */
function getGridItemLayout(index: number, total: number) {
  if (total === 1) return { colClass: "md:col-span-12", aspectClass: "aspect-[16/9]" };
  if (total % 2 === 1 && index === 0) {
    return { colClass: "md:col-span-12", aspectClass: "aspect-[16/9]" };
  }
  return { colClass: "md:col-span-6", aspectClass: "aspect-[16/10]" };
}

export function CaseStudyGallery({
  locale,
  projectTitle,
  gallery,
  headingTitle,
  labels,
}: CaseStudyGalleryProps) {
  const isRtl = locale === "ar";
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const count = gallery.length;
  const isOpen = activeIndex !== null && activeIndex >= 0 && activeIndex < count;
  const activeItem = isOpen ? gallery[activeIndex] : null;

  const goPrev = useCallback(() => {
    setActiveIndex((curr) => (curr === null ? null : (curr - 1 + count) % count));
  }, [count]);

  const goNext = useCallback(() => {
    setActiveIndex((curr) => (curr === null ? null : (curr + 1) % count));
  }, [count]);

  useEffect(() => {
    if (!isOpen || count <= 1) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (isRtl) goPrev();
        else goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (isRtl) goNext();
        else goPrev();
      } else if (e.key === "Home") {
        e.preventDefault();
        setActiveIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setActiveIndex(count - 1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, count, isRtl, goPrev, goNext]);

  if (count === 0) return null;

  const roleLabels: Record<string, { en: string; ar: string }> = {
    mockup: { en: "Mockup", ar: "نموذج تصميمي" },
    screenshot: { en: "Interface", ar: "لقطة واجهة" },
    gallery: { en: "Visual", ar: "معرض" },
  };

  return (
    <section
      id="gallery"
      className="scroll-mt-[calc(var(--header-h)+2.5rem)] py-10 sm:py-14"
    >
      <div className="container-lava space-y-8 sm:space-y-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col items-start gap-3">
            <Kicker>{isRtl ? "لقطات ونماذج" : "Visuals & mockups"}</Kicker>
            <h2 className="text-display-md text-text">{headingTitle}</h2>
          </div>
          <p className="text-xs font-medium text-faint">
            {isRtl ? "اضغط على أي لقطة للتكبير" : "Select any visual to inspect"}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {gallery.map((item, idx) => {
            const { colClass, aspectClass } = getGridItemLayout(idx, count);
            const roleText = roleLabels[item.role]?.[locale] ?? item.role;
            const altText = item.media.alt || item.caption || `${projectTitle} — ${idx + 1}`;
            const numLabel = formatNumber(idx + 1, locale, { minimumIntegerDigits: 2 });

            return (
              <figure key={`${item.media.id}-${idx}`} className={cn("space-y-3", colClass)}>
                <button
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  data-cursor="view"
                  aria-label={`${altText} — ${numLabel}`}
                  className="group relative block w-full overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface p-2 text-start shadow-card transition-[box-shadow,transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-line-lava hover:shadow-lift"
                >
                  <div
                    className={cn(
                      "relative w-full overflow-hidden rounded-[calc(var(--radius-lg)-8px)] border border-line bg-pearl-200",
                      aspectClass,
                    )}
                  >
                    <Image
                      src={item.media.url}
                      alt={altText}
                      width={item.media.width ?? 1600}
                      height={item.media.height ?? 1000}
                      sizes={
                        colClass.includes("col-span-12")
                          ? "(max-width: 768px) 100vw, 1360px"
                          : "(max-width: 768px) 100vw, 48vw"
                      }
                      placeholder={item.media.blurDataUrl ? "blur" : "empty"}
                      blurDataURL={item.media.blurDataUrl ?? undefined}
                      className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
                    />
                  </div>

                  <div className="pointer-events-none absolute inset-x-4 top-4 flex items-center justify-between gap-2">
                    <Chip className="border-white/50 bg-white/92 text-text shadow-xs backdrop-blur-md">
                      {roleText}
                    </Chip>
                    <span
                      dir="ltr"
                      className="rounded-pill border border-white/50 bg-white/92 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-muted tabular-nums shadow-xs backdrop-blur-md"
                    >
                      {numLabel}
                    </span>
                  </div>

                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute end-4 bottom-4 grid size-9 place-items-center rounded-full border border-white/60 bg-ink-900/80 text-white opacity-0 shadow-card backdrop-blur-md transition-all duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                  >
                    <Maximize2 className="size-4" />
                  </span>
                </button>

                {item.caption ? (
                  <figcaption className="px-1 text-xs font-medium leading-relaxed text-muted">
                    {item.caption}
                  </figcaption>
                ) : null}
              </figure>
            );
          })}
        </div>
      </div>

      {/* Accessible Lightbox Dialog */}
      <Dialog
        open={isOpen}
        onClose={() => setActiveIndex(null)}
        title={activeItem?.caption || projectTitle}
        description={
          activeIndex !== null
            ? `${formatNumber(activeIndex + 1, locale, { minimumIntegerDigits: 2 })} / ${formatNumber(count, locale, { minimumIntegerDigits: 2 })}`
            : undefined
        }
        closeLabel={labels.close}
        size="lg"
        footer={
          count > 1 ? (
            <div className="flex w-full flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {gallery.map((thumb, idx) => {
                  const selected = idx === activeIndex;
                  const slideNo = formatNumber(idx + 1, locale, { minimumIntegerDigits: 2 });
                  return (
                    <button
                      key={`thumb-${thumb.media.id}-${idx}`}
                      type="button"
                      onClick={() => setActiveIndex(idx)}
                      aria-current={selected ? "true" : undefined}
                      aria-label={labels.goToSlidePrefix.replace("{number}", slideNo)}
                      data-cursor="pointer"
                      className={cn(
                        "relative h-10 w-16 overflow-hidden rounded-[var(--radius-sm)] border transition-all",
                        selected
                          ? "border-accent ring-1 ring-accent"
                          : "border-line opacity-60 hover:opacity-100",
                      )}
                    >
                      <Image
                        src={thumb.media.url}
                        alt=""
                        width={thumb.media.width ?? 160}
                        height={thumb.media.height ?? 100}
                        sizes="64px"
                        className="h-full w-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label={labels.previousSlide}
                  data-cursor="pointer"
                  className="inline-flex size-10 items-center justify-center rounded-full border border-line-strong bg-surface text-text transition-colors hover:border-line-lava-strong hover:text-accent-text"
                >
                  <ArrowLeft aria-hidden="true" className="rtl-flip size-4" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label={labels.nextSlide}
                  data-cursor="pointer"
                  className="inline-flex size-10 items-center justify-center rounded-full border border-line-strong bg-surface text-text transition-colors hover:border-line-lava-strong hover:text-accent-text"
                >
                  <ArrowRight aria-hidden="true" className="rtl-flip size-4" />
                </button>
              </div>
            </div>
          ) : undefined
        }
      >
        {activeItem ? (
          <div className="relative overflow-hidden rounded-[var(--radius-md)] border border-line bg-pearl-300">
            <Image
              src={activeItem.media.url}
              alt={activeItem.media.alt || activeItem.caption || projectTitle}
              width={activeItem.media.width ?? 1600}
              height={activeItem.media.height ?? 1000}
              sizes="(max-width: 1024px) 95vw, 860px"
              placeholder={activeItem.media.blurDataUrl ? "blur" : "empty"}
              blurDataURL={activeItem.media.blurDataUrl ?? undefined}
              className="mx-auto max-h-[62vh] w-full object-contain"
            />
          </div>
        ) : null}
      </Dialog>
    </section>
  );
}
