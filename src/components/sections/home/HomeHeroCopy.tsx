import type { CSSProperties } from "react";
import { ActionLink } from "@/components/ui/ActionLink";
import { cn } from "@/components/ui/cn";
import { splitHeadline } from "./utils";

export interface HomeHeroCopyProps {
  /** Short positioning line shown in the kicker chip. */
  eyebrow?: string;
  /** Headline; "\n" sets the break explicitly, otherwise it is balanced into two lines. */
  title: string;
  description?: string;
  primaryLabel: string;
  secondaryLabel: string;
  /** Element id for the H1 (the hero section's aria-labelledby). */
  titleId?: string;
  /** "dark" when overlaid over the full-bleed volcano hero; "light" on daylight pages like /about. */
  tone?: "light" | "dark";
}

/**
 * Self-contained hero copy block: kicker chip · two-line headline (second line in the lava
 * gradient) · intro · "Start your project" molten pill + secondary "View our work" pill.
 * The H1 paints immediately (LCP); only the supporting lines animate in.
 */
export function HomeHeroCopy({
  eyebrow,
  title,
  description,
  primaryLabel,
  secondaryLabel,
  titleId = "home-hero-title",
  tone = "light",
}: HomeHeroCopyProps) {
  const [first, second] = splitHeadline(title);
  const dark = tone === "dark";

  return (
    <div className="flex max-w-[38.5rem] flex-col items-start gap-4 sm:gap-6">
      {eyebrow ? (
        <p
          className={cn(
            "home-hero-enter inline-flex max-w-full items-center gap-2.5 rounded-[var(--radius-pill)] border py-1.5 ps-2 pe-4 text-[0.8125rem] font-semibold backdrop-blur-md",
            dark
              ? "border-white/15 bg-ink-950/60 text-ash-50 shadow-[0_8px_28px_-10px_rgba(0,0,0,0.65)]"
              : "border-line bg-surface/85 text-text shadow-[var(--shadow-xs)]",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "relative grid size-5 shrink-0 place-items-center rounded-full",
              dark ? "bg-lava-500/20" : "bg-accent-soft",
            )}
          >
            <span className="size-2 rounded-full [background-image:var(--gradient-cta)]" />
          </span>
          <span className="truncate">{eyebrow}</span>
        </p>
      ) : null}

      <h1
        id={titleId}
        className={cn(
          "home-hero-title",
          dark ? "text-ash-50 drop-shadow-[0_6px_24px_rgba(7,6,10,0.65)]" : "text-text",
        )}
      >
        <span className="block">{first}</span>
        {second ? (
          <>
            {" "}
            <span
              className={cn(
                "text-lava-gradient block pb-[0.06em]",
                dark && "drop-shadow-[0_6px_28px_rgba(255,106,0,0.28)]",
              )}
            >
              {second}
            </span>
          </>
        ) : null}
      </h1>

      {description ? (
        <p
          className={cn(
            "home-hero-enter text-lead max-w-[46ch]",
            dark && "text-ash-200/95 drop-shadow-[0_2px_12px_rgba(7,6,10,0.55)]",
          )}
          style={{ "--enter-delay": "120ms" } as CSSProperties}
        >
          {description}
        </p>
      ) : null}

      <div
        className="home-hero-enter flex flex-wrap items-center gap-x-4 gap-y-3 pt-1 sm:pt-2"
        style={{ "--enter-delay": "220ms" } as CSSProperties}
      >
        <ActionLink href="/quote" variant="primary" size="lg">
          {primaryLabel}
        </ActionLink>
        {dark ? (
          <ActionLink
            href="/work"
            variant="outline"
            size="lg"
            className="border-white/25 bg-white/10 text-ash-50 backdrop-blur-md hover:border-lava-400/70 hover:bg-white/16 hover:text-white"
          >
            {secondaryLabel}
          </ActionLink>
        ) : (
          <ActionLink href="/work" variant="secondary" size="lg">
            {secondaryLabel}
          </ActionLink>
        )}
      </div>
    </div>
  );
}
