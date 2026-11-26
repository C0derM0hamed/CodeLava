import type { CSSProperties } from "react";
import { ActionLink } from "@/components/ui/ActionLink";
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
}

/**
 * Self-contained hero copy block: kicker chip · two-line headline (second line in the lava
 * gradient) · intro · "Start your project" pill + play-style "View our work".
 * No pinning or min-height of its own — it drops into <HeroStage> or the placeholder layout.
 * The H1 paints immediately (LCP); only the supporting lines fade in.
 */
export function HomeHeroCopy({
  eyebrow,
  title,
  description,
  primaryLabel,
  secondaryLabel,
  titleId = "home-hero-title",
}: HomeHeroCopyProps) {
  const [first, second] = splitHeadline(title);

  return (
    <div className="flex max-w-[38rem] flex-col items-start gap-6">
      {eyebrow ? (
        <p className="home-hero-enter inline-flex max-w-full items-center gap-2.5 rounded-[var(--radius-pill)] border border-line bg-surface/85 py-1.5 ps-2 pe-3.5 text-[0.8125rem] font-semibold text-text shadow-[var(--shadow-xs)] backdrop-blur-sm">
          <span
            aria-hidden="true"
            className="grid size-5 shrink-0 place-items-center rounded-full bg-accent-soft"
          >
            <span className="size-2 rounded-full [background-image:var(--gradient-cta)]" />
          </span>
          <span className="truncate">{eyebrow}</span>
        </p>
      ) : null}

      <h1 id={titleId} className="home-hero-title text-text">
        <span className="block">{first}</span>
        {second ? (
          <>
            {" "}
            <span className="text-lava-gradient block pb-[0.06em]">{second}</span>
          </>
        ) : null}
      </h1>

      {description ? (
        <p
          className="home-hero-enter text-lead max-w-[46ch]"
          style={{ "--enter-delay": "120ms" } as CSSProperties}
        >
          {description}
        </p>
      ) : null}

      <div
        className="home-hero-enter flex flex-wrap items-center gap-x-6 gap-y-4 pt-2"
        style={{ "--enter-delay": "220ms" } as CSSProperties}
      >
        <ActionLink href="/quote" variant="primary" size="lg">
          {primaryLabel}
        </ActionLink>
        <ActionLink href="/work" variant="play" size="md">
          {secondaryLabel}
        </ActionLink>
      </div>
    </div>
  );
}
