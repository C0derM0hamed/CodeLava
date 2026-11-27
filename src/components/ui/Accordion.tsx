"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "./cn";

export interface AccordionItemData {
  id: string;
  question: string;
  answer: ReactNode;
  meta?: string;
}

export interface AccordionProps {
  items: AccordionItemData[];
  /** Allow only one open item or multiple simultaneously. Default "single". */
  type?: "single" | "multiple";
  /** Initial open item IDs. */
  defaultOpenIds?: string[];
  /** Display mono index numbers (01, 02...). Default true. */
  numbered?: boolean;
  /** "lines": hairline-divided list (default). "cards": each item is a white rounded card. */
  variant?: "lines" | "cards";
  className?: string;
}

/**
 * Accessible editorial FAQ Accordion (WAI-ARIA Accordion pattern).
 * Supports ArrowUp/ArrowDown/Home/End keyboard navigation, smooth CSS grid-row height
 * transitions (zero layout thrash), and molten active seam highlights.
 */
export function Accordion({
  items,
  type = "single",
  defaultOpenIds = [],
  numbered = true,
  variant = "lines",
  className,
}: AccordionProps) {
  const uid = useId();
  const [openIds, setOpenIds] = useState<string[]>(defaultOpenIds);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const exists = prev.includes(id);
      if (type === "single") {
        return exists ? [] : [id];
      }
      return exists ? prev.filter((item) => item !== id) : [...prev, id];
    });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, idx: number) => {
    const count = items.length;
    if (count === 0) return;

    let nextIdx: number | null = null;
    if (e.key === "ArrowDown") nextIdx = (idx + 1) % count;
    else if (e.key === "ArrowUp") nextIdx = (idx - 1 + count) % count;
    else if (e.key === "Home") nextIdx = 0;
    else if (e.key === "End") nextIdx = count - 1;

    if (nextIdx !== null) {
      e.preventDefault();
      triggerRefs.current[nextIdx]?.focus();
    }
  };

  const isCards = variant === "cards";

  return (
    <div
      className={cn(
        isCards ? "flex flex-col gap-4" : "divide-y divide-line-strong border-y border-line-strong",
        className,
      )}
    >
      {items.map((item, idx) => {
        const isOpen = openIds.includes(item.id);
        const buttonId = `${uid}-trigger-${item.id}`;
        const panelId = `${uid}-panel-${item.id}`;

        return (
          <div
            key={item.id}
            data-state={isOpen ? "open" : "closed"}
            className={cn(
              "relative transition-[box-shadow,border-color,background-color] duration-300",
              isCards &&
                cn(
                  "rounded-[var(--radius-md)] border bg-surface px-6 sm:px-7",
                  isOpen
                    ? "border-line-lava shadow-[var(--shadow-card)]"
                    : "border-line shadow-[var(--shadow-xs)] hover:border-line-strong",
                ),
            )}
          >
            <h3>
              <button
                ref={(el) => {
                  triggerRefs.current[idx] = el;
                }}
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                onKeyDown={(e) => onKeyDown(e, idx)}
                data-cursor="pointer"
                className={cn(
                  "group flex w-full items-center justify-between gap-5 text-start",
                  "focus-visible:outline-offset-4",
                  isCards ? "py-5" : "py-6",
                )}
              >
                <span className="flex items-baseline gap-4 sm:gap-5">
                  {numbered ? (
                    <span
                      dir="ltr"
                      className={cn(
                        "shrink-0 font-mono text-xs font-medium tabular-nums transition-colors duration-250",
                        isOpen ? "text-accent-text" : "text-faint",
                      )}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  ) : null}
                  <span className="flex flex-col gap-1">
                    <span
                      className={cn(
                        "font-display text-[1.0625rem] font-semibold leading-snug transition-colors duration-250 sm:text-lg",
                        isOpen ? "text-text" : "text-text group-hover:text-accent-text",
                      )}
                    >
                      {item.question}
                    </span>
                    {item.meta ? <span className="text-xs text-faint">{item.meta}</span> : null}
                  </span>
                </span>

                {/* plus → minus */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color,color,transform] duration-300 ease-[var(--ease-out-expo)]",
                    isOpen
                      ? "border-transparent text-on-accent [background-image:var(--gradient-cta)] shadow-[var(--shadow-lava)]"
                      : "border-line-strong bg-surface text-text group-hover:border-line-lava group-hover:text-accent-text",
                  )}
                >
                  <span className="absolute h-[1.75px] w-3.5 rounded-full bg-current" />
                  <span
                    className={cn(
                      "absolute h-3.5 w-[1.75px] rounded-full bg-current transition-transform duration-300 ease-[var(--ease-out-expo)]",
                      isOpen ? "scale-y-0" : "scale-y-100",
                    )}
                  />
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className="grid transition-[grid-template-rows,opacity] duration-400 ease-[var(--ease-out-expo)]"
              style={{
                gridTemplateRows: isOpen ? "1fr" : "0fr",
                opacity: isOpen ? 1 : 0,
              }}
            >
              <div className="overflow-hidden" inert={!isOpen}>
                <div
                  className={cn(
                    "max-w-3xl pe-12 text-[0.9375rem] leading-relaxed text-muted",
                    isCards ? "pb-5" : "pb-6",
                    numbered ? "ps-8 sm:ps-9" : "",
                  )}
                >
                  {item.answer}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
