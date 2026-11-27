import { cn } from "@/components/ui/cn";
import { Counter } from "@/experience/fx/Counter";
import { StepIcon } from "@/components/sections/process/step-icon";
import type { AppLocale } from "@/i18n/routing";
import type { Achievement } from "@/server/queries/types";
import { parseStat } from "./utils";

const FALLBACK_ICONS = ["Rocket", "Users", "Trophy", "Globe"];

function StatValue({ item, locale }: { item: Achievement; locale: AppLocale }) {
  const parsed = parseStat(item.value);
  return (
    <span dir="ltr" className="inline-block tabular-nums">
      {parsed ? (
        <Counter
          value={parsed.value}
          decimals={parsed.decimals}
          prefix={item.prefix ?? ""}
          suffix={item.suffix ?? ""}
          locale={locale}
        />
      ) : (
        `${item.prefix ?? ""}${item.value}${item.suffix ?? ""}`
      )}
    </span>
  );
}

/**
 * The reference's achievements card: one white card, 2×2 grid with hairline dividers,
 * orange line icon + big number + small label. DB achievements only; nothing when empty.
 * `layout="row"` lays the same items out in a single row (About page).
 */
export function AchievementsCard({
  achievements,
  locale,
  layout = "grid",
  responsiveRowOnLg = false,
  label,
  className,
}: {
  achievements: Achievement[];
  locale: AppLocale;
  layout?: "grid" | "row";
  /** On medium-large screens (lg..xl), lay a 4-item grid out as a single row before snapping to 2x2 at xl. */
  responsiveRowOnLg?: boolean;
  /** Accessible name for the list. */
  label?: string;
  className?: string;
}) {
  const items = layout === "grid" ? achievements.slice(0, 4) : achievements.slice(0, 6);
  if (items.length === 0) return null;
  const row = layout === "row";

  return (
    <div className={cn("overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-card", className)}>
      <dl
        aria-label={label}
        className={cn(
          "grid gap-px bg-line",
          row
            ? items.length > 3
              ? "grid-cols-2 lg:grid-cols-4"
              : items.length === 3
                ? "grid-cols-1 sm:grid-cols-3"
                : items.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-1"
            : items.length === 1
              ? "grid-cols-1"
              : responsiveRowOnLg && items.length === 4
                ? "grid-cols-2 lg:grid-cols-4 xl:grid-cols-2"
                : "grid-cols-2",
        )}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "home-stat-cell flex flex-col justify-between gap-3",
              row ? "p-[var(--space-card)]" : "p-5 sm:p-6",
              // An odd last item spans the row so the card never shows an empty cell.
              !row && items.length === 3 && index === 2 && "col-span-2",
            )}
          >
            <dd className={cn("flex", row ? "items-center gap-3.5" : "flex-col items-start gap-3")}>
              <span
                aria-hidden="true"
                className="grid size-10 shrink-0 place-items-center rounded-xl border border-lava-500/15 bg-accent-soft text-accent-text"
              >
                <StepIcon icon={item.icon || FALLBACK_ICONS[index % FALLBACK_ICONS.length]} className="size-[1.125rem]" />
              </span>
              <span
                className={cn(
                  "font-display font-bold leading-none tracking-tight text-text whitespace-nowrap",
                  row ? "text-3xl sm:text-4xl" : "text-[clamp(1.6rem,1.25rem+0.85vw,2.05rem)]",
                )}
              >
                <StatValue item={item} locale={locale} />
              </span>
            </dd>
            <dt className="text-[0.8125rem] font-medium leading-snug text-muted sm:text-sm">
              {item.label}
              {row && item.description ? (
                <span className="mt-1 block text-[0.8125rem] font-normal text-faint">{item.description}</span>
              ) : null}
            </dt>
          </div>
        ))}
      </dl>
    </div>
  );
}
