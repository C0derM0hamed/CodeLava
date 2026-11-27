"use client";

import { useMemo, useState } from "react";
import { cn } from "@/components/ui/cn";
import { Reveal } from "@/experience/fx/Reveal";
import type { Technology } from "@/server/queries/types";
import { TechnologyLogo } from "./TechnologyLogo";

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
}

const ORDER = ["frontend", "backend", "mobile", "ai", "cloud", "database", "design", "other"];

export function TechnologyExplorer({
  technologies,
  categoryLabels,
  allLabel,
  filterLabel,
  counts,
  totalCount,
  countLabels,
  statusLabels,
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
      <div className="flex flex-col gap-4">
        <div role="group" aria-label={filterLabel} className="flex flex-wrap items-center gap-2.5">
          {[["", allLabel, totalCount] as const, ...groups.map(([category]) => [category, labelOf(category), counts[category]] as const)].map(
            ([value, label, count]) => {
              const selected = value === active;
              return (
                <button
                  key={value || "all"}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setActive(value)}
                  data-cursor="pointer"
                  className={cn(
                    "inline-flex h-10 items-center gap-2 rounded-pill border px-4 text-sm font-medium transition-[background-color,border-color,color,box-shadow] duration-200",
                    selected
                      ? "border-transparent bg-text text-bg shadow-card"
                      : "border-line bg-surface text-muted hover:border-line-lava-strong hover:text-text",
                  )}
                >
                  <span>{label}</span>
                  <span dir="ltr" className={cn("text-xs tabular-nums", selected ? "text-bg/70" : "text-faint")}>
                    {count}
                  </span>
                </button>
              );
            },
          )}
        </div>
        <p role="status" aria-live="polite" className="sr-only">
          {active ? statusLabels[active] : statusLabels[""]}
        </p>
      </div>

      <div className="space-y-[var(--space-heading)]">
        {visible.map(([category, items]) => (
          <Reveal key={`${active}-${category}`} mode="block">
            <section
              aria-labelledby={`tech-${category}`}
              className="grid gap-[var(--space-split)] lg:grid-cols-12"
            >
              <header className="lg:col-span-3">
                <h2 id={`tech-${category}`} className="text-display-sm text-text">
                  {labelOf(category)}
                </h2>
                <p className="mt-2 text-sm text-faint">{countLabels[category]}</p>
              </header>
              <ul className="grid grid-cols-2 gap-[var(--space-grid)] sm:grid-cols-3 lg:col-span-9 xl:grid-cols-4">
                {items.map((technology) => (
                  <li
                    key={technology.id}
                    className="group flex flex-col gap-4 rounded-[var(--radius-md)] border border-line bg-surface p-[var(--space-card)] shadow-card transition-[transform,box-shadow] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:shadow-lift"
                  >
                    <TechnologyLogo technology={technology} />
                    <div className="min-w-0 space-y-1.5">
                      <h3 dir="auto" className="truncate font-display text-base font-semibold text-text">
                        {technology.name}
                      </h3>
                      {technology.description ? (
                        <p className="text-[0.8125rem] leading-relaxed text-muted">
                          {technology.description}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
