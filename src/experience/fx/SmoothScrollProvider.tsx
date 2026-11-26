"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export interface SmoothScrollContextValue {
  lenis: Lenis | null;
  isActive: boolean;
  scrollTo: (
    target: string | number | HTMLElement,
    options?: { offset?: number; immediate?: boolean; duration?: number },
  ) => void;
  stop: () => void;
  start: () => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
  isActive: false,
  scrollTo: (target, options) => {
    if (typeof window === "undefined") return;
    if (typeof target === "number") {
      window.scrollTo({ top: target, behavior: options?.immediate ? "auto" : "smooth" });
    } else if (typeof target === "string") {
      document.querySelector(target)?.scrollIntoView({
        behavior: options?.immediate ? "auto" : "smooth",
      });
    } else {
      target.scrollIntoView({ behavior: options?.immediate ? "auto" : "smooth" });
    }
  },
  stop: () => {},
  start: () => {},
});

export interface SmoothScrollProviderProps {
  children: ReactNode;
  /** Disable smooth scrolling explicitly (e.g. inside admin). */
  disabled?: boolean;
  /** Lenis lerp factor (lower = silkier). Default 0.095. */
  lerp?: number;
}

/**
 * Coordinates Lenis inertia scrolling with GSAP ScrollTrigger.
 * Exposes the active instance on `window.__lenis` and via `useSmoothScroll()`.
 * Automatically disabled when `prefers-reduced-motion: reduce` is active.
 */
export function SmoothScrollProvider({
  children,
  disabled = false,
  lerp = 0.095,
}: SmoothScrollProviderProps) {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (disabled || typeof window === "undefined") return;

    const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    gsap.registerPlugin(ScrollTrigger);

    let activeLenis: Lenis | null = null;
    let tickerFn: ((time: number) => void) | null = null;

    const teardown = () => {
      if (tickerFn) {
        gsap.ticker.remove(tickerFn);
        tickerFn = null;
      }
      if (activeLenis) {
        activeLenis.destroy();
        activeLenis = null;
      }
      if (window.__lenis === lenisRef.current) {
        delete window.__lenis;
      }
      lenisRef.current = null;
      setLenisInstance(null);
    };

    const setup = () => {
      if (mqReduced.matches) {
        teardown();
        return;
      }
      if (activeLenis) return;

      activeLenis = new Lenis({
        lerp,
        smoothWheel: true,
        wheelMultiplier: 0.95,
        touchMultiplier: 1.25,
        autoRaf: false,
      });

      activeLenis.on("scroll", ScrollTrigger.update);

      tickerFn = (time: number) => {
        activeLenis?.raf(time * 1000);
      };
      gsap.ticker.add(tickerFn);
      gsap.ticker.lagSmoothing(0);

      lenisRef.current = activeLenis;
      window.__lenis = activeLenis;
      setLenisInstance(activeLenis);
      ScrollTrigger.refresh();
    };

    setup();

    const onReducedChange = () => setup();
    mqReduced.addEventListener("change", onReducedChange);

    return () => {
      mqReduced.removeEventListener("change", onReducedChange);
      teardown();
    };
  }, [disabled, lerp]);

  const scrollTo = useCallback(
    (
      target: string | number | HTMLElement,
      options?: { offset?: number; immediate?: boolean; duration?: number },
    ) => {
      const instance = lenisRef.current;
      if (instance) {
        instance.scrollTo(target, {
          offset: options?.offset ?? 0,
          immediate: options?.immediate ?? false,
          duration: options?.duration,
        });
        return;
      }

      if (typeof window === "undefined") return;
      const behavior: ScrollBehavior = options?.immediate ? "auto" : "smooth";
      if (typeof target === "number") {
        window.scrollTo({ top: target + (options?.offset ?? 0), behavior });
      } else if (typeof target === "string") {
        const el = document.querySelector(target);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY + (options?.offset ?? 0);
          window.scrollTo({ top, behavior });
        }
      } else {
        const top = target.getBoundingClientRect().top + window.scrollY + (options?.offset ?? 0);
        window.scrollTo({ top, behavior });
      }
    },
    [],
  );

  const stop = useCallback(() => {
    lenisRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    lenisRef.current?.start();
  }, []);

  const value = useMemo<SmoothScrollContextValue>(
    () => ({
      lenis: lenisInstance,
      isActive: lenisInstance !== null,
      scrollTo,
      stop,
      start,
    }),
    [lenisInstance, scrollTo, stop, start],
  );

  return <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>;
}

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}
