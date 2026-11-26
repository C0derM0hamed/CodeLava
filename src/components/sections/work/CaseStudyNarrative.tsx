"use client";

import { useEffect, useMemo, useState } from "react";
import { ActionLink } from "@/components/ui/ActionLink";
import { LavaDivider } from "@/experience/fx/LavaDivider";
import { useSmoothScroll } from "@/experience/fx/SmoothScrollProvider";
import { cn } from "@/components/ui/cn";
import type { AppLocale } from "@/i18n/routing";
import { formatNumber } from "@/lib/i18n-content";
import "./work-prose.css";

export interface NarrativeChapter {
  id: string;
  label: string;
  html: string;
}

export interface SecondaryChapter {
  id: string;
  label: string;
}

export interface CaseStudyNarrativeProps {
  locale: AppLocale;
  chapters: NarrativeChapter[];
  secondaryChapters?: SecondaryChapter[];
  ctaLabel: string;
}

export function CaseStudyNarrative({
  locale,
  chapters,
  secondaryChapters = [],
  ctaLabel,
}: CaseStudyNarrativeProps) {
  const isRtl = locale === "ar";
  const { scrollTo } = useSmoothScroll();

  const allAnchors = useMemo(
    () => [
      ...chapters.map((c) => ({ id: c.id, label: c.label })),
      ...secondaryChapters,
    ],
    [chapters, secondaryChapters],
  );

  const [activeId, setActiveId] = useState<string>(allAnchors[0]?.id ?? "");

  useEffect(() => {
    if (typeof window === "undefined" || allAnchors.length === 0) return;

    const elements = allAnchors
      .map((a) => document.getElementById(a.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-22% 0px -60% 0px", threshold: 0.01 },
    );

    for (const el of elements) io.observe(el);
    return () => io.disconnect();
  }, [allAnchors]);

  if (chapters.length === 0) return null;

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    setActiveId(id);
    scrollTo(target, { offset: -96 });
  };

  return (
    <section className="py-12 sm:py-20">
      <div className="container-lava">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Sticky Chapter Index */}
          <aside className="lg:col-span-4 lg:sticky lg:top-[calc(var(--header-h)+2.5rem)] lg:self-start">
            <div className="space-y-6 rounded-[var(--radius-lg)] border border-line bg-bg-elevated/75 p-6">
              <div className="flex items-center gap-2.5 border-b border-line pb-4">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--lava-500)]"
                />
                <h2 className="text-kicker text-muted">
                  {isRtl ? "فصول دراسة الحالة" : "Case study index"}
                </h2>
              </div>

              <nav aria-label={isRtl ? "فهرس الفصول" : "Case study sections"}>
                <ol className="space-y-1.5">
                  {allAnchors.map((anchor, idx) => {
                    const active = activeId === anchor.id;
                    const idxLabel = formatNumber(idx + 1, locale, { minimumIntegerDigits: 2 });

                    return (
                      <li key={anchor.id}>
                        <a
                          href={`#${anchor.id}`}
                          onClick={(e) => handleAnchorClick(e, anchor.id)}
                          aria-current={active ? "location" : undefined}
                          data-cursor="pointer"
                          className={cn(
                            "group relative flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm transition-colors duration-200",
                            active
                              ? "bg-surface text-text font-medium"
                              : "text-muted hover:bg-surface/60 hover:text-ash-200",
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className={cn(
                              "h-4 w-[2px] rounded-full transition-all duration-300",
                              active ? "bg-accent shadow-[0_0_8px_var(--lava-500)]" : "bg-transparent",
                            )}
                          />
                          <span
                            dir="ltr"
                            className={cn(
                              "font-mono text-xs tabular-nums",
                              active ? "text-accent" : "text-faint group-hover:text-muted",
                            )}
                          >
                            {idxLabel}
                          </span>
                          <span className="truncate">{anchor.label}</span>
                        </a>
                      </li>
                    );
                  })}
                </ol>
              </nav>

              <div className="border-t border-line pt-5">
                <ActionLink href="/quote" variant="molten" size="sm" magnetic>
                  {ctaLabel}
                </ActionLink>
              </div>
            </div>
          </aside>

          {/* Main Challenge -> Solution -> Results Prose */}
          <div className="space-y-14 lg:col-span-8 sm:space-y-16">
            {chapters.map((chapter, idx) => {
              const num = formatNumber(idx + 1, locale, { minimumIntegerDigits: 2 });
              return (
                <article
                  key={chapter.id}
                  id={chapter.id}
                  className="scroll-mt-[calc(var(--header-h)+2.5rem)] space-y-6"
                >
                  <header className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span
                        dir="ltr"
                        className="font-mono text-xs font-medium tracking-[0.12em] text-accent tabular-nums"
                      >
                        {num} /
                      </span>
                      <span className="text-kicker text-faint">
                        {isRtl ? "القسم التحليلي" : "Chapter"}
                      </span>
                    </div>
                    <h2 className="text-display-md text-text">{chapter.label}</h2>
                  </header>

                  {/* HTML produced by renderMarkdown() in src/lib/markdown.ts (already sanitized via sanitize-html) */}
                  <div
                    className="work-prose"
                    dangerouslySetInnerHTML={{ __html: chapter.html }}
                  />

                  {idx < chapters.length - 1 ? <LavaDivider variant="seam" className="pt-8" /> : null}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
