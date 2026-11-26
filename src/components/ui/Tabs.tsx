"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Link as IntlLink } from "@/i18n/navigation";
import { cn } from "./cn";

/* -------------------------------------------------------------------------- */
/* Tabs (WAI-ARIA Tablist + Tabpanel, RTL-aware arrow keys)                   */
/* -------------------------------------------------------------------------- */

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  content: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  ariaLabel?: string;
  className?: string;
}

export function Tabs({
  items,
  value,
  defaultValue,
  onChange,
  ariaLabel = "Tabs",
  className,
}: TabsProps) {
  const uid = useId();
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.id ?? "");
  const activeId = value ?? internal;
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const select = (id: string) => {
    if (value === undefined) setInternal(id);
    onChange?.(id);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, idx: number) => {
    const count = items.length;
    if (count === 0) return;

    const isRtl =
      typeof window !== "undefined" &&
      getComputedStyle(e.currentTarget).direction === "rtl";

    const nextKey = isRtl ? "ArrowLeft" : "ArrowRight";
    const prevKey = isRtl ? "ArrowRight" : "ArrowLeft";

    let target: number | null = null;
    if (e.key === nextKey) target = (idx + 1) % count;
    else if (e.key === prevKey) target = (idx - 1 + count) % count;
    else if (e.key === "Home") target = 0;
    else if (e.key === "End") target = count - 1;

    if (target !== null) {
      e.preventDefault();
      const item = items[target];
      if (item) {
        select(item.id);
        tabRefs.current[target]?.focus();
      }
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="flex flex-wrap items-center gap-x-2 border-b border-line-strong"
      >
        {items.map((item, idx) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[idx] = el;
              }}
              id={`${uid}-tab-${item.id}`}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`${uid}-panel-${item.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => select(item.id)}
              onKeyDown={(e) => onKeyDown(e, idx)}
              data-cursor="pointer"
              className={cn(
                "relative inline-flex min-h-11 items-center gap-2 px-3 text-[0.9375rem] font-semibold transition-colors duration-200",
                isActive ? "text-accent-text" : "text-muted hover:text-text",
              )}
            >
              <span>{item.label}</span>
              {typeof item.count === "number" ? (
                <span
                  dir="ltr"
                  className={cn(
                    "font-mono text-[11px] tabular-nums",
                    isActive ? "text-accent-text" : "text-faint",
                  )}
                >
                  {item.count}
                </span>
              ) : null}

              {/* Active molten underline */}
              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute inset-x-2 -bottom-px h-[2px] rounded-full transition-all duration-300 ease-[var(--ease-out-expo)]",
                  isActive ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0",
                )}
                style={{ background: "var(--gradient-cta)" }}
              />
            </button>
          );
        })}
      </div>

      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <div
            key={item.id}
            id={`${uid}-panel-${item.id}`}
            role="tabpanel"
            aria-labelledby={`${uid}-tab-${item.id}`}
            hidden={!isActive}
            tabIndex={0}
          >
            {isActive ? item.content : null}
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* FilterChips (for portfolio /work?category= or client-side filters)         */
/* -------------------------------------------------------------------------- */

export interface FilterChipOption {
  value: string;
  label: string;
  count?: number;
  /** Provide href for URL-driven filters (e.g. /work?category=ai). */
  href?: string;
}

export interface FilterChipsProps {
  options: FilterChipOption[];
  value: string;
  onChange?: (value: string) => void;
  ariaLabel?: string;
  className?: string;
}

export function FilterChips({
  options,
  value,
  onChange,
  ariaLabel = "Filters",
  className,
}: FilterChipsProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        const classes = cn(
          "relative inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-pill)] border px-4 text-sm font-semibold transition-[background-color,border-color,color,box-shadow] duration-200",
          active
            ? "border-transparent bg-text text-bg shadow-[var(--shadow-card)]"
            : "border-line-strong bg-surface text-muted shadow-[var(--shadow-xs)] hover:border-line-lava hover:text-text",
        );

        const inner = (
          <>
            {active ? (
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
            ) : null}
            <span>{opt.label}</span>
            {typeof opt.count === "number" ? (
              <span
                dir="ltr"
                className={cn(
                  "rounded-full px-1.5 text-xs tabular-nums",
                  active ? "bg-[color-mix(in_oklab,var(--bg)_16%,transparent)] text-bg" : "bg-surface-2 text-faint",
                )}
              >
                {opt.count}
              </span>
            ) : null}
          </>
        );

        if (opt.href) {
          return (
            <IntlLink
              key={opt.value}
              href={opt.href}
              aria-current={active ? "true" : undefined}
              data-cursor="pointer"
              className={classes}
            >
              {inner}
            </IntlLink>
          );
        }

        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange?.(opt.value)}
            data-cursor="pointer"
            className={classes}
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}
