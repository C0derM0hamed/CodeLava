"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export interface CounterProps {
  /** Target numeric value (fed dynamically from DB achievements — never invent stats on public pages). */
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  /** Roll-up duration in ms. Default 1350. */
  duration?: number;
  /** Locale for number formatting ("en" | "ar"). */
  locale?: "en" | "ar";
  /** When true (default) and locale is "ar", formats with Eastern Arabic-Indic digits (١٢٣). */
  useLocaleDigits?: boolean;
  className?: string;
}

/**
 * Editorial achievement counter with smooth ease-out-expo roll-up triggered on scroll.
 * Uses `tabular-nums` to prevent horizontal layout jitter; renders final value immediately
 * when `prefers-reduced-motion: reduce` is active.
 */
export function Counter({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1350,
  locale = "en",
  useLocaleDigits = true,
  className = "",
}: CounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [displayValue, setDisplayValue] = useState<number>(value);
  const hasAnimatedRef = useRef(false);

  const formatter = useMemo(() => {
    const numberingSystem = locale === "ar" && useLocaleDigits ? "arab" : "latn";
    return new Intl.NumberFormat(locale, {
      numberingSystem,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }, [decimals, locale, useLocaleDigits]);

  useEffect(() => {
    hasAnimatedRef.current = false;
    if (typeof window === "undefined") return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = requestAnimationFrame(() => setDisplayValue(value));
      return () => cancelAnimationFrame(id);
    }

    const node = ref.current;
    if (!node) return;

    let rafId = 0;

    const runAnimation = () => {
      if (hasAnimatedRef.current) return;
      hasAnimatedRef.current = true;

      const startTime = performance.now();
      const tick = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        // Expo ease-out curve
        const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        setDisplayValue(value * eased);
        if (t < 1) {
          rafId = requestAnimationFrame(tick);
        } else {
          setDisplayValue(value);
        }
      };
      setDisplayValue(0);
      rafId = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          runAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (rafId !== 0) cancelAnimationFrame(rafId);
    };
  }, [value, duration]);

  return (
    <span
      ref={ref}
      dir="ltr"
      className={`inline-block tabular-nums ${className}`}
      aria-label={`${prefix}${formatter.format(value)}${suffix}`}
    >
      <span aria-hidden="true">
        {prefix}
        {formatter.format(displayValue)}
        {suffix}
      </span>
    </span>
  );
}
