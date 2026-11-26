"use client";

import { useEffect, useRef, type ReactNode } from "react";

export interface MagneticLinkProps {
  children: ReactNode;
  /** Magnetic pull multiplier (0.15 - 0.45 recommended). Default 0.26. */
  strength?: number;
  /** Maximum pixel offset from rest. Default 12px. */
  maxOffset?: number;
  className?: string;
  disabled?: boolean;
}

/**
 * Tactile magnetic attraction wrapper for CTAs, icons, and nav triggers.
 * Uses rAF-damped direct DOM transforms (zero React re-renders during hover).
 * Automatically disabled on coarse pointers and prefers-reduced-motion.
 */
export function MagneticLink({
  children,
  strength = 0.26,
  maxOffset = 12,
  className = "",
  disabled = false,
}: MagneticLinkProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (disabled || typeof window === "undefined") return;
    if (
      !window.matchMedia("(pointer: fine) and (hover: hover)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const el = wrapRef.current;
    if (!el) return;

    let targetX = 0;
    let targetY = 0;
    let currX = 0;
    let currY = 0;
    let rafId = 0;
    let rect: DOMRect | null = null;

    const animate = () => {
      rafId = 0;
      currX += (targetX - currX) * 0.18;
      currY += (targetY - currY) * 0.18;

      el.style.transform = `translate3d(${currX.toFixed(2)}px, ${currY.toFixed(2)}px, 0)`;

      if (Math.abs(targetX - currX) > 0.08 || Math.abs(targetY - currY) > 0.08) {
        rafId = requestAnimationFrame(animate);
      } else if (targetX === 0 && targetY === 0) {
        el.style.transform = "";
      }
    };

    const kick = () => {
      if (rafId === 0) rafId = requestAnimationFrame(animate);
    };

    const onEnter = () => {
      rect = el.getBoundingClientRect();
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!rect) rect = el.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      targetX = Math.max(-maxOffset, Math.min(maxOffset, relX * strength));
      targetY = Math.max(-maxOffset, Math.min(maxOffset, relY * strength));
      kick();
    };

    const onLeave = () => {
      rect = null;
      targetX = 0;
      targetY = 0;
      kick();
    };

    el.addEventListener("pointerenter", onEnter, { passive: true });
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave, { passive: true });

    return () => {
      if (rafId !== 0) cancelAnimationFrame(rafId);
      el.style.transform = "";
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [disabled, maxOffset, strength]);

  return (
    <div
      ref={wrapRef}
      data-cursor="magnetic"
      className={`inline-block will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}
