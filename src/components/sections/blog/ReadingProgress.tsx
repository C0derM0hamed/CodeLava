"use client";

import { useEffect, useRef } from "react";

/** Thin lava bar that fills as the article body scrolls past. Decorative (aria-hidden). */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const barRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const target = document.getElementById(targetId);
    const bar = barRef.current;
    if (!target || !bar) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = target.getBoundingClientRect();
      const total = Math.max(1, rect.height - window.innerHeight * 0.45);
      const progress = Math.min(1, Math.max(0, -rect.top / total));
      bar.style.transform = `scaleX(${progress.toFixed(4)})`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [targetId]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[45] h-[3px] bg-transparent">
      <span
        ref={barRef}
        className="block h-full origin-left bg-[image:var(--gradient-cta)] shadow-[0_0_12px_color-mix(in_oklab,var(--lava-500)_60%,transparent)] rtl:origin-right"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
