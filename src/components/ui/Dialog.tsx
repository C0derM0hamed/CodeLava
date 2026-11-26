"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "./Icons";
import { cn } from "./cn";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  /** Accessible label for the close button (localized). */
  closeLabel?: string;
  size?: "sm" | "md" | "lg";
  /** "light" (default) white panel; "dark" ink panel for media lightboxes — same chrome, tokens flip. */
  tone?: "light" | "dark";
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

const SIZE_CLASSES = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
} as const;

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible modal Dialog (light by default; `tone="dark"` for media lightboxes).
 * Traps keyboard focus, closes on Escape or backdrop click, pauses Lenis smooth scroll
 * while open, and restores focus to the triggering element on close.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  closeLabel = "Close",
  size = "md",
  tone = "light",
  children,
  footer,
  className,
}: DialogProps) {
  const uid = useId();
  const titleId = `${uid}-title`;
  const descId = description ? `${uid}-desc` : undefined;
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.__lenis?.stop();

    // Move focus inside dialog
    const focusTimer = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const firstFocusable = panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (firstFocusable ?? panel).focus();
    });

    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && panelRef.current) {
        const focusables = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
        );
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      window.__lenis?.start();
      previousFocusRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      {/* Ink scrim */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-ink-900/45 backdrop-blur-[6px] transition-opacity"
      />

      {/* Dialog panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        className={cn(
          "relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-pop)] focus:outline-none",
          SIZE_CLASSES[size],
          tone === "dark" && "surface-dark border-[color-mix(in_oklab,var(--ash-50)_10%,transparent)]",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 sm:px-7">
          <div className="space-y-1">
            <h2 id={titleId} className="font-display text-xl font-bold tracking-[-0.01em] text-text sm:text-2xl rtl:tracking-normal">
              {title}
            </h2>
            {description ? (
              <p id={descId} className="text-sm text-muted">
                {description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            aria-label={closeLabel}
            onClick={onClose}
            data-cursor="pointer"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface text-muted transition-colors hover:border-line-lava hover:text-accent-text"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 pb-6 text-[0.9375rem] leading-relaxed text-muted sm:px-7">
          {children}
        </div>

        {footer ? (
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line bg-surface-2 px-6 py-4 sm:px-7">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
