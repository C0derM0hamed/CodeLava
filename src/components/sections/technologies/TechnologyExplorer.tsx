"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  Brain,
  Cloud,
  Cpu,
  Database,
  Layers,
  Palette,
  Server,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/components/ui/cn";
import { Reveal } from "@/experience/fx/Reveal";
import type { Technology } from "@/server/queries/types";
import { resolveTechnologyBrand, TechnologyLogo } from "./TechnologyLogo";
import "./technologies.css";

export interface TechnologyExplorerProps {
  technologies: Technology[];
  categoryLabels: Record<string, string>;
  /** Pre-formatted (locale digits) counts so the client never has to format numbers. */
  allLabel: string;
  filterLabel: string;
  counts: Record<string, string>;
  totalCount: string;
  countLabels: Record<string, string>;
  statusLabels: Record<string, string>;
  /** Pre-formatted ordinal indices (e.g. "01", "02" or "٠١", "٠٢") keyed by category. */
  ordinals?: Record<string, string>;
}

const ORDER = ["frontend", "backend", "mobile", "ai", "cloud", "database", "design", "other"];

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  frontend: Layers,
  backend: Server,
  mobile: Smartphone,
  ai: Brain,
  cloud: Cloud,
  database: Database,
  design: Palette,
  other: Cpu,
};

export function TechnologyExplorer({
  technologies,
  categoryLabels,
  allLabel,
  filterLabel,
  counts,
  totalCount,
  countLabels,
  statusLabels,
  ordinals,
}: TechnologyExplorerProps) {
  const [active, setActive] = useState("");

  const groups = useMemo(() => {
    const map = new Map<string, Technology[]>();
    for (const technology of technologies) {
      const list = map.get(technology.category) ?? [];
      list.push(technology);
      map.set(technology.category, list);
    }
    const rank = (category: string) => {
      const index = ORDER.indexOf(category);
      return index === -1 ? ORDER.length : index;
    };
    return [...map].sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b));
  }, [technologies]);

  const visible = active ? groups.filter(([category]) => category === active) : groups;
  const labelOf = (category: string) =>
    categoryLabels[category] ?? category.replace(/[-_]+/g, " ").replace(/^./, (c) => c.toUpperCase());

  return (
    <div className="space-y-[var(--space-heading)]">
      {/* Sticky Frosted Filter Bar */}
      <div className="tech-filter-bar">
        <div role="group" aria-label={filterLabel} className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {[
            ["", allLabel, totalCount] as const,
            ...groups.map(([category]) => [category, labelOf(category), counts[category]] as const),
          ].map(([value, label, count]) => {
            const selected = value === active;
            return (
              <button
                key={value || "all"}
                type="button"
                aria-pressed={selected}
                onClick={() => setActive(value)}
                data-cursor="pointer"
                className="tech-filter-pill"
              >
                <span>{label}</span>
                <span
                  dir="ltr"
                  className={cn(
                    "inline-flex min-w-[1.35rem] items-center justify-center rounded-[var(--radius-pill)] px-1.5 py-0.5 text-[0.7rem] font-semibold tabular-nums",
                    selected ? "bg-white/20 text-on-accent" : "bg-surface-2 text-faint",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <p role="status" aria-live="polite" className="sr-only">
          {active ? statusLabels[active] : statusLabels[""]}
        </p>
      </div>

      {/* Category Sections */}
      <div className="divide-y divide-line">
        {visible.map(([category, items], groupIndex) => {
          const Icon = CATEGORY_ICONS[category] ?? Cpu;
          const ordinal = ordinals?.[category] ?? String(groupIndex + 1).padStart(2, "0");

          // Smart grid columns per category size to eliminate awkward half-empty orphan rows
          const gridClass =
            items.length === 1
              ? "grid-cols-1 sm:max-w-lg"
              : items.length === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : items.length === 3
                  ? "grid-cols-1 min-[360px]:grid-cols-2 xl:grid-cols-3"
                  : "grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

          return (
            <Reveal key={`${active}-${category}`} mode="block">
              <section
                aria-labelledby={`tech-${category}`}
                className={cn(
                  "grid gap-[var(--space-split)] lg:grid-cols-12",
                  groupIndex === 0 ? "pb-[var(--space-heading)]" : "py-[var(--space-heading)]",
                  groupIndex === visible.length - 1 && "pb-0",
                )}
              >
                <header className="flex flex-col items-start gap-3 lg:sticky lg:top-[calc(var(--header-h)+5.5rem)] lg:col-span-3 lg:self-start">
                  <div className="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className="grid size-9 place-items-center rounded-[11px] border border-line-lava bg-accent-soft text-accent-text"
                    >
                      <Icon size={17} strokeWidth={1.75} />
                    </span>
                    <span dir="ltr" className="font-mono text-xs font-semibold tracking-wider text-accent-text tabular-nums">
                      {ordinal}
                    </span>
                  </div>
                  <h2 id={`tech-${category}`} className="text-display-sm text-text">
                    {labelOf(category)}
                  </h2>
                  <p className="inline-flex items-center rounded-[var(--radius-pill)] border border-line bg-surface px-3 py-1 text-xs font-medium text-muted shadow-xs">
                    {countLabels[category]}
                  </p>
                </header>

                <ul className={cn("grid gap-[var(--space-grid)] lg:col-span-9", gridClass)}>
                  {items.map((technology) => {
                    const brand = resolveTechnologyBrand(technology);
                    return (
                      <li
                        key={technology.id}
                        className="tech-card group"
                        style={{ "--tech-brand": brand } as CSSProperties}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <TechnologyLogo technology={technology} className="tech-card-logo" />
                          <span
                            aria-hidden="true"
                            className="size-2 rounded-full opacity-55 transition-opacity duration-300 group-hover:opacity-100"
                            style={{ backgroundColor: brand }}
                          />
                        </div>
                        <div className="min-w-0 space-y-1.5">
                          <h3
                            dir="auto"
                            className="break-words font-display text-[0.95rem] font-semibold leading-snug text-text sm:text-base"
                          >
                            {technology.name}
                          </h3>
                          {technology.description ? (
                            <p className="text-[0.8125rem] leading-relaxed text-muted sm:text-[0.84375rem]">
                              {technology.description}
                            </p>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
