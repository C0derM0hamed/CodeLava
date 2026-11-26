"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";

export interface PageTransitionProps {
  children: ReactNode;
}

/**
 * Lightweight App Router route transition cue.
 * Never blocks or hides initial SSR paint (zero LCP impact).
 * On subsequent client route navigations, fires a crisp GPU-composited molten
 * heat-seam wipe across the top edge of the viewport. Disabled for reduced motion.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const isFirstRender = useRef(true);
  const [wipeKey, setWipeKey] = useState(0);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      setWipeKey((k) => k + 1);
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return (
    <>
      {wipeKey > 0 ? (
        <div
          key={wipeKey}
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 top-0 z-[var(--z-transition)] h-[2.5px] overflow-hidden"
        >
          <div
            className="animate-page-wipe h-full w-full shadow-[var(--lava-glow-sm)]"
            style={{ background: "var(--gradient-heat-seam)" }}
          />
        </div>
      ) : null}
      {children}
    </>
  );
}
