"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export interface MarqueeProps {
  children: ReactNode;
  /** Full loop duration in seconds (higher = slower). Default 34s. */
  speed?: number;
  /** Reverse relative to natural reading flow. */
  reverse?: boolean;
  /** Pause seamlessly on hover or keyboard focus within. Default true. */
  pauseOnHover?: boolean;
  /** Gap utility class between items. Default "gap-10". */
  gapClassName?: string;
  /** Fade outer inline edges into obsidian. Default true. */
  fadeEdges?: boolean;
  className?: string;
}

/**
 * RTL-aware infinite editorial marquee.
 * Automatically switches scroll axis direction when inside a `dir="rtl"` document or subtree,
 * pauses offscreen via IntersectionObserver, and renders calmly static under reduced motion.
 */
export function Marquee({
  children,
  speed = 34,
  reverse = false,
  pauseOnHover = true,
  gapClassName = "gap-10",
  fadeEdges = true,
  className = "",
}: MarqueeProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(true);
  const [isRtl, setIsRtl] = useState(false);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;

    const readDir = () => {
      const computed = getComputedStyle(node).direction;
      setIsRtl(computed === "rtl");
    };
    readDir();

    // Observe dir mutations on ancestors (e.g. lab RTL switcher)
    const mo = new MutationObserver(readDir);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["dir"] });
    const dirParent = node.closest("[dir]");
    if (dirParent && dirParent !== document.documentElement) {
      mo.observe(dirParent, { attributes: true, attributeFilter: ["dir"] });
    }

    const io = new IntersectionObserver(
      (entries) => setInView(entries[0]?.isIntersecting ?? false),
      { threshold: 0.02 },
    );
    io.observe(node);

    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  const animName = isRtl ? "marquee-scroll-rtl" : "marquee-scroll-ltr";

  return (
    <div
      ref={wrapRef}
      className={`group relative w-full overflow-hidden ${className}`}
      style={
        fadeEdges
          ? {
              maskImage:
                "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            }
          : undefined
      }
    >
      <div
        className={`flex w-max items-center ${
          pauseOnHover ? "group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]" : ""
        }`}
        style={{
          animationName: animName,
          animationDuration: `${speed}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationDirection: reverse ? "reverse" : "normal",
          animationPlayState: inView ? "running" : "paused",
        }}
      >
        <div className={`flex shrink-0 items-center pe-10 ${gapClassName}`}>{children}</div>
        <div
          aria-hidden="true"
          className={`flex shrink-0 items-center pe-10 ${gapClassName}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
