"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export type RevealMode = "words" | "lines" | "block";

export interface RevealProps {
  /** Text string (for words/lines split) or arbitrary ReactNode (for block mode). */
  children: ReactNode;
  /**
   * "words" splits on spaces — safe for Arabic cursive shaping (never splits letters!).
   * "lines" splits on newlines ("\n") or accepts `lines` prop.
   * "block" reveals the full element as a single masked/gliding unit.
   */
  mode?: RevealMode;
  /** Optional explicit array of lines when mode="lines". */
  lines?: string[];
  as?: "div" | "h1" | "h2" | "h3" | "h4" | "p" | "span";
  /** Initial delay in ms before the stagger begins. */
  delay?: number;
  /** Stagger interval between words/lines in ms. */
  stagger?: number;
  /** Reveal immediately on mount instead of waiting for viewport intersection. */
  immediate?: boolean;
  className?: string;
}

/**
 * Editorial masked text & block reveal engineered for EN + AR bilingual layouts.
 * Arabic script is NEVER split into characters (which destroys cursive ligatures);
 * vertical mask padding prevents clipping of tall Arabic ascenders & diacritics.
 */
export function Reveal({
  children,
  mode = "words",
  lines,
  as: Tag = "div",
  delay = 0,
  stagger = 42,
  immediate = false,
  className = "",
}: RevealProps) {
  const hostRef = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(immediate);

  useEffect(() => {
    if (immediate) {
      const id = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(id);
    }

    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(id);
    }

    const node = hostRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [immediate]);

  const setRef = (el: HTMLElement | null) => {
    hostRef.current = el;
  };

  // Explicit lines array or newline-delimited text
  if (mode === "lines" && (lines || typeof children === "string")) {
    const lineList = lines ?? String(children).split("\n");
    return (
      <Tag ref={setRef as never} className={className}>
        {lineList.map((line, i) => (
          <span
            key={`${i}-${line}`}
            className="block overflow-hidden py-[0.14em] -my-[0.14em]"
          >
            <span
              className="block will-change-transform"
              style={{
                transform: shown ? "translate3d(0, 0%, 0)" : "translate3d(0, 108%, 0)",
                opacity: shown ? 1 : 0,
                transition: `transform 760ms var(--ease-out-expo) ${delay + i * Math.max(stagger, 70)}ms, opacity 540ms ease-out ${delay + i * Math.max(stagger, 70)}ms`,
              }}
            >
              {line}
            </span>
          </span>
        ))}
      </Tag>
    );
  }

  // Word-level masked split (100% Arabic cursive safe)
  if (mode === "words" && typeof children === "string") {
    const words = children.trim().split(/\s+/);
    return (
      <Tag ref={setRef as never} className={className} aria-label={children}>
        {words.map((word, i) => (
          <span
            key={`${i}-${word}`}
            aria-hidden="true"
            className="inline-block overflow-hidden align-bottom py-[0.14em] -my-[0.14em]"
          >
            <span
              className="inline-block will-change-transform"
              style={{
                transform: shown ? "translate3d(0, 0%, 0)" : "translate3d(0, 112%, 0)",
                opacity: shown ? 1 : 0,
                transition: `transform 720ms var(--ease-out-expo) ${delay + i * stagger}ms, opacity 500ms ease-out ${delay + i * stagger}ms`,
              }}
            >
              {word}
              {i < words.length - 1 ? "\u00A0" : ""}
            </span>
          </span>
        ))}
      </Tag>
    );
  }

  // Block mode (any ReactNode)
  return (
    <Tag
      ref={setRef as never}
      className={className}
      style={{
        transform: shown ? "translate3d(0, 0, 0)" : "translate3d(0, 22px, 0)",
        opacity: shown ? 1 : 0,
        transition: `transform 780ms var(--ease-out-expo) ${delay}ms, opacity 620ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}
