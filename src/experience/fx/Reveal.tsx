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
  as?: "div" | "h1" | "h2" | "h3" | "h4" | "p" | "span" | "li" | "section" | "article" | "header";
  /** Initial delay in ms before the stagger begins. */
  delay?: number;
  /** Stagger interval between words/lines in ms. */
  stagger?: number;
  /** Reveal immediately on mount instead of waiting for viewport intersection. */
  immediate?: boolean;
  /** words mode: a phrase inside the text to paint with the lava gradient (e.g. "Digital Products"). */
  highlight?: string;
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
  highlight,
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
      { threshold: 0.03, rootMargin: "0px 0px -2% 0px" },
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

  // Word-level rise + fade (never splits letters — Arabic cursive safe). Supports "\n" line breaks
  // and an optional highlighted phrase rendered with the lava display gradient.
  if (mode === "words" && typeof children === "string") {
    const plain = children.replace(/\s*\n\s*/g, " ").trim();
    const tokens = tokenizeWords(children, highlight);
    let wordIndex = 0;
    return (
      <Tag ref={setRef as never} className={className} aria-label={plain}>
        {tokens.map((tok, i) => {
          if (tok.type === "br") return <br key={`br-${i}`} aria-hidden="true" />;
          const idx = wordIndex++;
          const d = delay + idx * stagger;
          return (
            <span
              key={`${i}-${tok.text}`}
              aria-hidden="true"
              className={`inline-block will-change-transform ${tok.highlight ? "text-lava-gradient" : ""}`}
              style={{
                transform: shown ? "translate3d(0, 0, 0)" : "translate3d(0, 0.42em, 0)",
                opacity: shown ? 1 : 0,
                transition: `transform 760ms var(--ease-out-expo) ${d}ms, opacity 560ms ease-out ${d}ms`,
              }}
            >
              {tok.text}
              {tok.space ? "\u00A0" : ""}
            </span>
          );
        })}
      </Tag>
    );
  }

  // Block mode (any ReactNode)
  return (
    <Tag
      ref={setRef as never}
      className={className}
      style={{
        transform: shown ? "translate3d(0, 0, 0)" : "translate3d(0, 20px, 0)",
        opacity: shown ? 1 : 0,
        transition: `transform 580ms var(--ease-out-expo) ${delay}ms, opacity 460ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}

type WordToken = { type: "word"; text: string; space: boolean; highlight: boolean } | { type: "br" };

function tokenizeWords(text: string, highlight?: string): WordToken[] {
  const hl = highlight?.trim();
  let hlStart = -1;
  let hlEnd = -1;
  if (hl) {
    hlStart = text.indexOf(hl);
    if (hlStart >= 0) hlEnd = hlStart + hl.length;
  }
  const out: WordToken[] = [];
  const re = /(\n)|([^\s]+)(\s*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m[1]) {
      // drop the trailing nbsp of the previous word before a line break
      const prev = out[out.length - 1];
      if (prev && prev.type === "word") prev.space = false;
      out.push({ type: "br" });
      continue;
    }
    const start = m.index;
    const word = m[2] ?? "";
    const trailing = m[3] ?? "";
    const isHl = hlStart >= 0 && start >= hlStart && start + word.length <= hlEnd;
    out.push({ type: "word", text: word, space: trailing.length > 0 && !trailing.includes("\n"), highlight: isHl });
    if (trailing.includes("\n")) out.push({ type: "br" });
  }
  const last = out[out.length - 1];
  if (last && last.type === "word") last.space = false;
  return out;
}
