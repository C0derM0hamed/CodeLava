"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function DaylightMotion({ locale, className, children, onProgress }: {
  locale: "en" | "ar"; className?: string; children: ReactNode; onProgress?: (progress: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const art = ref.current;
    if (!art || !("IntersectionObserver" in window)) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let mounted = true;
    let attempt: AbortController | undefined;
    let visible = false;
    let failed = false;
    let cancelIdle: (() => void) | undefined;
    let scene: Awaited<ReturnType<typeof import("./daylight-scene").mountDaylight>> | undefined;
    function reconcile() {
      cancelIdle?.();
      cancelIdle = undefined;
      const active = visible && !document.hidden && !motion.matches;
      if (motion.matches) {
        scene?.dispose();
        scene = undefined;
      }
      scene?.setVisible(active);
      if (!active) attempt?.abort();
      if (!art || !active || scene || attempt || failed) return;
      const start = async () => {
        const controller = new AbortController();
        attempt = controller;
        try {
          const { mountDaylight } = await import("./daylight-scene");
          if (controller.signal.aborted) return;
          const next = await mountDaylight(art, controller.signal, onProgress);
          if (controller.signal.aborted) next?.dispose();
          else if (next) scene = next;
          else failed = true;
        } catch {
          failed = !controller.signal.aborted;
        } finally {
          attempt = undefined;
          if (mounted) reconcile();
        }
      };
      if (typeof window.requestIdleCallback === "function") {
        const id = window.requestIdleCallback(start, { timeout: 900 });
        cancelIdle = () => window.cancelIdleCallback(id);
      } else {
        const id = window.setTimeout(start, 90);
        cancelIdle = () => clearTimeout(id);
      }
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      reconcile();
    });
    observer.observe(art);
    motion.addEventListener("change", reconcile);
    document.addEventListener("visibilitychange", reconcile);
    return () => {
      mounted = false;
      attempt?.abort();
      cancelIdle?.();
      scene?.dispose();
      observer.disconnect();
      motion.removeEventListener("change", reconcile);
      document.removeEventListener("visibilitychange", reconcile);
    };
  }, [onProgress]);

  return <div ref={ref} className={["dl-art", className].filter(Boolean).join(" ")} aria-hidden="true" dir="ltr" lang={locale}>{children}</div>;
}
