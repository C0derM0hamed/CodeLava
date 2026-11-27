import { Link } from "@/i18n/navigation";
import { cn } from "@/components/ui/cn";

export interface BlogTopicOption {
  value: string;
  label: string;
  count?: string;
  href: string;
}

/**
 * URL-driven topic filter rail: single smooth scrollable strip on mobile (keeps the featured story
 * above the fold with zero page overflow), refined wrapping pill bar on tablet/desktop.
 */
export function BlogTopicFilter({
  options,
  value,
  ariaLabel,
  className,
}: {
  options: BlogTopicOption[];
  value: string;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <nav aria-label={ariaLabel} className={cn("relative", className)}>
      <div className="relative -mx-[var(--gutter)] px-[var(--gutter)] sm:mx-0 sm:px-0">
        <ul className="scrollbar-none flex items-center gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
          {options.map((option) => {
            const active = option.value === value;
            return (
              <li key={option.value || "all"} className="shrink-0">
                <Link
                  href={option.href}
                  aria-current={active ? "true" : undefined}
                  data-cursor="pointer"
                  className={cn(
                    "group inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-pill border px-4 text-sm font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-200",
                    active
                      ? "border-transparent bg-ink-900 text-pearl-50 shadow-[var(--shadow-card)]"
                      : "border-line-strong/80 bg-surface text-muted shadow-[var(--shadow-xs)] hover:-translate-y-px hover:border-line-lava-strong hover:text-text hover:shadow-[var(--shadow-card)] motion-reduce:hover:translate-y-0",
                  )}
                >
                  {active ? (
                    <span
                      aria-hidden="true"
                      className="size-1.5 rounded-full"
                      style={{ background: "var(--gradient-lava)" }}
                    />
                  ) : null}
                  <span>{option.label}</span>
                  {option.count !== undefined ? (
                    <span
                      dir="ltr"
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[11px] leading-none font-semibold tabular-nums",
                        active ? "bg-white/14 text-pearl-50/90" : "bg-bg text-faint group-hover:text-accent-text",
                      )}
                    >
                      {option.count}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
