import { Fragment, type CSSProperties } from "react";
import { cn } from "@/components/ui/cn";
import { HeroCta } from "./HeroCta";
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

function renderSplitWords(
  text: string,
  startIndex: number,
  wordClassName: string,
) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.map((word, index) => (
    <Fragment key={`${startIndex + index}-${word}`}>
      {index > 0 ? " " : null}
      <span className="hero-word-clip">
        <span
          className={cn("hero-word", wordClassName)}
          style={{ "--word-idx": startIndex + index } as CSSProperties}
        >
          {word}
        </span>
      </span>
    </Fragment>
  ));
}

/**
 * Self-contained hero copy block:
 * - Precision molten-glass technical eyebrow chip with `</>` code glyph
 * - Editorial two-line headline with subtle split-word rise & incandescent magma highlight
 * - Refined subcopy with controlled measure
 * - Hero-scoped magnetic primary & frosted-glass secondary CTAs with circular sliding arrow wells
 * - Layered scroll-reactive wrappers driven by HeroStage custom properties (zero extra scroll listeners)
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
  const firstWordsCount = first.trim().split(/\s+/).filter(Boolean).length;
  const dark = tone === "dark";

  return (
    <div className="hero-copy-stack">
      {eyebrow ? (
        <div className="hero-scroll-layer hero-scroll-layer--eyebrow">
          <div
            className="home-hero-enter hero-eyebrow"
            data-tone={tone}
            style={{ "--enter-delay": "20ms" } as CSSProperties}
          >
            <span aria-hidden="true" dir="ltr" className="hero-eyebrow__code">
              &lt;/&gt;
            </span>
            <span className="hero-eyebrow__label">{eyebrow}</span>
          </div>
        </div>
      ) : null}

      <h1
        id={titleId}
        data-tone={tone}
        className={cn("home-hero-title", dark ? "home-hero-title--dark" : "home-hero-title--light")}
      >
        <span className="block hero-scroll-layer hero-scroll-layer--line1">
          {renderSplitWords(
            first,
            0,
            dark ? "hero-word--base-dark" : "hero-word--base-light",
          )}
        </span>
        {second ? (
          <>
            {" "}
            <span className="block hero-scroll-layer hero-scroll-layer--line2">
              {renderSplitWords(
                second,
                firstWordsCount,
                dark ? "hero-word--accent-dark" : "hero-word--accent-light",
              )}
            </span>
          </>
        ) : null}
      </h1>

      {description ? (
        <div className="hero-scroll-layer hero-scroll-layer--lead">
          <p
            data-tone={tone}
            className="home-hero-enter hero-lead"
            style={{ "--enter-delay": "150ms" } as CSSProperties}
          >
            {description}
          </p>
        </div>
      ) : null}

      <div className="hero-scroll-layer hero-scroll-layer--cta">
        <div
          className="home-hero-enter hero-actions"
          style={{ "--enter-delay": "240ms" } as CSSProperties}
        >
          <HeroCta href="/quote" variant="primary" tone={tone}>
            {primaryLabel}
          </HeroCta>
          <HeroCta href="/work" variant="secondary" tone={tone}>
            {secondaryLabel}
          </HeroCta>
        </div>
      </div>
    </div>
  );
}
