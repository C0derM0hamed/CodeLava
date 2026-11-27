"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
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

  // Deterministic scroll-spy: picks the latest section whose top has passed the reading threshold,
  // and always resets cleanly to the first anchor when near the top of the page.
  useEffect(() => {
    if (typeof window === "undefined" || allAnchors.length === 0) return;

    let rafId = 0;

    const updateActive = () => {
      rafId = 0;
      const elements = allAnchors
        .map((a) => document.getElementById(a.id))
        .filter((el): el is HTMLElement => el !== null);

      if (elements.length === 0) return;

      const threshold = 160;
      let current = elements[0]!.id;

      for (const el of elements) {
        if (el.getBoundingClientRect().top <= threshold) {
          current = el.id;
        } else {
          break;
        }
      }

      setActiveId((prev) => (prev === current ? prev : current));
    };

    const scheduleUpdate = () => {
      if (rafId !== 0) return;
      rafId = requestAnimationFrame(updateActive);
    };

    updateActive();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });

    return () => {
      if (rafId !== 0) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [allAnchors]);

  if (chapters.length === 0) return null;

  const activeIdx = Math.max(
    0,
    allAnchors.findIndex((a) => a.id === activeId),
  );
  const progressPct =
    allAnchors.length > 1
      ? Math.round(((activeIdx + 1) / allAnchors.length) * 100)
      : 100;

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    setActiveId(id);
    scrollTo(target, { offset: -104 });
  };

  return (
    <section className="py-10 sm:py-16">
      <div className="container-lava">
        {/* Compact mobile chapter jump bar (< lg) so the narrative starts immediately */}
        <nav
          aria-label={isRtl ? "فهرس الفصول" : "Case study sections"}
          className="mb-7 lg:hidden"
        >
          <ul className="work-filter-rail">
            {allAnchors.map((anchor, idx) => {
              const active = activeId === anchor.id;
              const idxLabel = formatNumber(idx + 1, locale, { minimumIntegerDigits: 2 });
              return (
                <li key={anchor.id} className="shrink-0">
                  <a
                    href={`#${anchor.id}`}
                    onClick={(e) => handleAnchorClick(e, anchor.id)}
                    aria-current={active ? "location" : undefined}
                    className={cn(
                      "work-filter-pill",
                      active && "work-filter-pill--active-primary",
                    )}
                  >
                    <span
                      dir="ltr"
                      className={cn(
                        "font-mono text-[11px] tabular-nums",
                        active ? "text-lava-300" : "text-faint",
                      )}
                    >
                      {idxLabel}
                    </span>
                    <span>{anchor.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Desktop Sticky Chapter Index */}
          <aside className="hidden lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:col-span-4 lg:block lg:self-start">
            <div className="overflow-hidden rounded-[var(--radius-xl)] border border-line bg-surface p-6 shadow-card">
              <div className="space-y-3 border-b border-line pb-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />
                    <h2 className="text-sm font-semibold text-text">
                      {isRtl ? "فصول دراسة الحالة" : "Case study index"}
                    </h2>
                  </div>
                  <span
                    dir="ltr"
                    className="font-mono text-[11px] font-medium text-faint tabular-nums"
                  >
                    {formatNumber(activeIdx + 1, locale, { minimumIntegerDigits: 2 })} /{" "}
                    {formatNumber(allAnchors.length, locale, { minimumIntegerDigits: 2 })}
                  </span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-pearl-300">
                  <div
                    className="h-full rounded-full transition-[width] duration-300 ease-[var(--ease-out-expo)]"
                    style={{
                      width: `${progressPct}%`,
                      background: "var(--gradient-lava)",
                    }}
                  />
                </div>
              </div>

              <nav aria-label={isRtl ? "فهرس الفصول" : "Case study sections"} className="py-4">
                <ol className="space-y-1">
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
                              ? "bg-[color-mix(in_oklab,var(--lava-500)_9%,white)] font-semibold text-text"
                              : "text-muted hover:bg-pearl-200/80 hover:text-text",
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className={cn(
                              "h-4 w-[2.5px] rounded-full transition-all duration-300",
                              active ? "bg-accent" : "bg-transparent group-hover:bg-line-strong",
                            )}
                          />
                          <span
                            dir="ltr"
                            className={cn(
                              "font-mono text-xs tabular-nums",
                              active ? "font-semibold text-accent-text" : "text-faint group-hover:text-muted",
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
                <Link href="/quote" data-cursor="pointer" className="work-cta-btn w-full justify-between">
                  <span>{ctaLabel}</span>
                  <span aria-hidden="true" className="work-cta-btn__well">
                    <ArrowRight className="rtl-flip size-4" />
                  </span>
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Challenge -> Solution -> Results Editorial Narrative */}
          <div className="space-y-6 lg:col-span-8 sm:space-y-8">
            {chapters.map((chapter, idx) => {
              const num = formatNumber(idx + 1, locale, { minimumIntegerDigits: 2 });
              return (
                <article
                  key={chapter.id}
                  id={chapter.id}
                  className="case-chapter-card scroll-mt-[calc(var(--header-h)+2.5rem)] p-6 sm:p-8 lg:p-10"
                >
                  <header className="mb-6 flex items-center gap-4 border-b border-line pb-5">
                    <span
                      dir="ltr"
                      className="grid size-11 shrink-0 place-items-center rounded-[12px] border border-line-lava bg-[color-mix(in_oklab,var(--lava-500)_9%,white)] font-mono text-sm font-bold text-accent-text tabular-nums"
                    >
                      {num}
                    </span>
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-semibold tracking-[0.12em] text-accent-text uppercase rtl:tracking-normal rtl:normal-case">
                        {isRtl ? `الفصل ${num}` : `Chapter ${num}`}
                      </p>
                      <h2 className="text-display-md text-text">{chapter.label}</h2>
                    </div>
                  </header>

                  {/* HTML produced by renderMarkdown() in src/lib/markdown.ts (already sanitized via sanitize-html) */}
                  <div
                    className="work-prose"
                    dangerouslySetInnerHTML={{ __html: chapter.html }}
                  />
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
