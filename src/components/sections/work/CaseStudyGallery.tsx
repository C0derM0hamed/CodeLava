"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Dialog } from "@/components/ui/Dialog";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { LavaDivider } from "@/experience/fx/LavaDivider";
import { cn } from "@/components/ui/cn";
import type { AppLocale } from "@/i18n/routing";
import { formatNumber } from "@/lib/i18n-content";
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

function getGridItemLayout(index: number, total: number) {
  if (total === 1) return { colClass: "md:col-span-12", aspectClass: "aspect-[16/9]" };
  if (total % 2 === 1 && index === 0) {
    return { colClass: "md:col-span-12", aspectClass: "aspect-[16/9]" };
  }
  const adjustedIdx = total % 2 === 1 ? index - 1 : index;
  const pairIdx = Math.floor(adjustedIdx / 2);
  const posInPair = adjustedIdx % 2;
  const wideFirst = pairIdx % 2 === 0;
  const isWide = (wideFirst && posInPair === 0) || (!wideFirst && posInPair === 1);

  return isWide
    ? { colClass: "md:col-span-7", aspectClass: "aspect-[16/10]" }
    : { colClass: "md:col-span-5", aspectClass: "aspect-[4/3] md:aspect-[16/14]" };
}

export function CaseStudyGallery({
  locale,
  projectTitle,
  gallery,
  headingTitle,
  sectionIndex = "05",
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

  // Keyboard navigation while lightbox Dialog is open (Escape handled by Dialog)
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
      className="scroll-mt-[calc(var(--header-h)+2.5rem)] py-12 sm:py-16"
    >
      <div className="container-lava space-y-10">
        <LavaDivider variant="seam" />

        <SectionHeading
          index={sectionIndex}
          kicker={isRtl ? "لقطات ونماذج" : "Visuals & Mockups"}
          title={headingTitle}
          size="md"
        />

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
                  className="group relative block w-full overflow-hidden rounded-[var(--radius-md)] border border-line bg-bg-elevated text-start transition-colors duration-300 hover:border-line-lava-strong"
                >
                  <div className={cn("relative w-full overflow-hidden", aspectClass)}>
                    <Image
                      src={item.media.url}
                      alt={altText}
                      width={item.media.width ?? 1600}
                      height={item.media.height ?? 1000}
                      sizes={
                        colClass.includes("col-span-12")
                          ? "(max-width: 768px) 100vw, 1360px"
                          : "(max-width: 768px) 100vw, 56vw"
                      }
                      placeholder={item.media.blurDataUrl ? "blur" : "empty"}
                      blurDataURL={item.media.blurDataUrl ?? undefined}
                      className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian-950/60 via-transparent to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-45"
                    />
                  </div>

                  <div className="pointer-events-none absolute inset-x-3.5 top-3.5 flex items-center justify-between gap-2">
                    <Tag tone="default" className="bg-obsidian-950/85 backdrop-blur-sm">
                      {roleText}
                    </Tag>
                    <span
                      dir="ltr"
                      className="rounded-[var(--radius-sm)] border border-line bg-obsidian-950/85 px-2 py-0.5 font-mono text-[11px] text-ash-200 tabular-nums backdrop-blur-sm"
                    >
                      {numLabel}
                    </span>
                  </div>
                </button>

                {item.caption ? (
                  <figcaption className="text-xs leading-relaxed text-muted">
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
                          ? "border-line-lava-strong ring-1 ring-accent"
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
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-line-strong bg-bg-elevated text-text transition-colors hover:border-line-lava-strong hover:text-lava-100"
                >
                  <span className="inline-flex rotate-180">
                    <ArrowRightIcon size={15} />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label={labels.nextSlide}
                  data-cursor="pointer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-line-strong bg-bg-elevated text-text transition-colors hover:border-line-lava-strong hover:text-lava-100"
                >
                  <ArrowRightIcon size={15} />
                </button>
              </div>
            </div>
          ) : undefined
        }
      >
        {activeItem ? (
          <div className="relative overflow-hidden rounded-[var(--radius-md)] border border-line bg-obsidian-950">
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
