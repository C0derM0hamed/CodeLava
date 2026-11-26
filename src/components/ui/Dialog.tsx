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
 * Accessible obsidian modal Dialog.
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
      {/* Obsidian scrim */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-obsidian-950/82 backdrop-blur-sm transition-opacity"
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
          "relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line-strong bg-bg-elevated shadow-[0_32px_96px_rgba(0,0,0,0.75)] focus:outline-none",
          SIZE_CLASSES[size],
          className,
        )}
      >
        {/* Top molten hairline */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: "var(--gradient-heat-seam)" }}
        />

        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div className="space-y-1">
            <h2 id={titleId} className="font-display text-xl font-medium text-text sm:text-2xl">
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
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-line text-muted transition-colors hover:border-line-lava-strong hover:bg-surface hover:text-text"
          >
            <CloseIcon size={15} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 text-sm leading-relaxed text-ash-200">
          {children}
        </div>

        {footer ? (
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line bg-surface/50 px-6 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
