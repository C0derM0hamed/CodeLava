"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { PlusIcon } from "./Icons";
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
  /** Display editorial mono index numbers (01, 02...). Default true. */
  numbered?: boolean;
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

  return (
    <div className={cn("divide-y divide-line border-y border-line", className)}>
      {items.map((item, idx) => {
        const isOpen = openIds.includes(item.id);
        const buttonId = `${uid}-trigger-${item.id}`;
        const panelId = `${uid}-panel-${item.id}`;

        return (
          <div key={item.id} className="relative">
            {/* Molten top highlight when open */}
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-x-0 top-0 h-px transition-opacity duration-400",
                isOpen ? "opacity-100" : "opacity-0",
              )}
              style={{ background: "var(--gradient-heat-seam)" }}
            />

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
                className="group flex w-full items-center justify-between gap-5 py-6 text-start transition-colors"
              >
                <span className="flex items-baseline gap-4 sm:gap-6">
                  {numbered ? (
                    <span
                      dir="ltr"
                      className={cn(
                        "shrink-0 font-mono text-xs tabular-nums transition-colors duration-250",
                        isOpen ? "text-accent" : "text-faint group-hover:text-muted",
                      )}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  ) : null}
                  <span className="flex flex-col gap-1">
                    <span
                      className={cn(
                        "font-display text-lg font-medium transition-colors duration-250 sm:text-xl",
                        isOpen ? "text-lava-100" : "text-text group-hover:text-lava-100",
                      )}
                    >
                      {item.question}
                    </span>
                    {item.meta ? (
                      <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-faint rtl:font-sans rtl:tracking-normal rtl:normal-case">
                        {item.meta}
                      </span>
                    ) : null}
                  </span>
                </span>

                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ease-[var(--ease-out-expo)]",
                    isOpen
                      ? "rotate-45 border-line-lava-strong bg-accent/12 text-ember"
                      : "border-line-strong text-muted group-hover:border-line-lava group-hover:text-text",
                  )}
                >
                  <PlusIcon size={15} />
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
              <div className="overflow-hidden">
                <div
                  className={cn(
                    "pb-6 text-sm leading-relaxed text-muted sm:text-[0.98rem]",
                    numbered ? "ps-8 sm:ps-11" : "",
                    "pe-10 max-w-3xl",
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
