"use client";

import { List } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/components/ui/cn";

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

/** "In this article" navigation with scroll-spy. Falls back to plain anchors without JS. */
export function ArticleToc({
  items,
  label,
  hideHeading = false,
}: {
  items: TocItem[];
  label: string;
  hideHeading?: boolean;
}) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-18% 0px -68% 0px", threshold: 0 },
    );
    for (const heading of headings) observer.observe(heading);
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label={label}>
      {!hideHeading ? (
        <p className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-text">
          <List aria-hidden="true" className="size-4 text-accent-text" />
          <span>{label}</span>
        </p>
      ) : null}
      <ol className="space-y-1 border-s border-line">
        {items.map((item) => {
          const selected = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={selected ? "location" : undefined}
                data-cursor="pointer"
                className={cn(
                  "-ms-px block rounded-e-[8px] border-s-2 py-1.5 pe-2 text-sm leading-snug transition-[color,border-color,background-color] duration-200",
                  item.level >= 3 ? "ps-6" : "ps-4",
                  selected
                    ? "border-accent bg-accent-soft/75 font-semibold text-accent-text"
                    : "border-transparent text-muted hover:bg-bg/80 hover:text-text",
                )}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
