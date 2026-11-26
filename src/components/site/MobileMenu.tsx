"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { Logo } from "@/components/brand/Logo";
import { ActionLink } from "@/components/ui/ActionLink";
import { CloseIcon } from "@/components/ui/Icons";
import { cn } from "@/components/ui/cn";
import { LocaleSwitch } from "./LocaleSwitch";

export interface NavItem {
  key: "services" | "work" | "about" | "process" | "blog" | "contact";
  href: string;
}

export interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  navItems: readonly NavItem[];
  activePath: string;
  onLocaleChange?: (nextLocale: AppLocale) => void;
  onNavigate?: (href: string) => void;
  menuId: string;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Full-screen obsidian editorial navigation drawer with crisp curtain animation,
 * indexed display links, keyboard focus trap, Escape dismissal, and Lenis scroll lock.
 */
export function MobileMenu({
  open,
  onClose,
  navItems,
  activePath,
  onLocaleChange,
  onNavigate,
  menuId,
}: MobileMenuProps) {
  const t = useTranslations("nav");
  const tf = useTranslations("footer");
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.__lenis?.stop();

    const frame = requestAnimationFrame(() => {
      const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      first?.focus();
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const nodes = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
        );
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
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
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      window.__lenis?.start();
    };
  }, [open, onClose]);

  return (
    <div
      id={menuId}
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={t("mainLabel")}
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-[var(--z-drawer)] flex flex-col justify-between bg-obsidian-950/98 backdrop-blur-xl transition-all duration-400 ease-[var(--ease-out-expo)] lg:hidden",
        open
          ? "pointer-events-auto visible opacity-100 translate-y-0"
          : "pointer-events-none invisible opacity-0 -translate-y-4",
      )}
    >
      {/* Top incandescent edge seam */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px]"
        style={{ background: "var(--gradient-heat-seam)" }}
      />

      {/* Ambient bottom caldera haze */}
      <div
        aria-hidden="true"
        className="heat-haze-radial pointer-events-none absolute inset-x-0 bottom-0 h-72 opacity-80"
      />

      {/* Drawer header */}
      <div className="container-lava relative z-10 flex h-[var(--header-h)] items-center justify-between border-b border-line">
        <Link
          href="/"
          aria-label={t("homeAria")}
          onClick={() => {
            onNavigate?.("/");
            onClose();
          }}
        >
          <Logo size="sm" />
        </Link>

        <div className="flex items-center gap-2.5">
          <LocaleSwitch
            onLocaleChange={
              onLocaleChange
                ? (next) => {
                    onLocaleChange(next);
                    onClose();
                  }
                : undefined
            }
          />
          <button
            type="button"
            aria-label={t("menuClose")}
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border border-line-strong bg-surface text-text transition-colors hover:border-line-lava-strong hover:text-ember"
          >
            <CloseIcon size={18} />
          </button>
        </div>
      </div>

      {/* Editorial display nav list */}
      <nav aria-label={t("mainLabel")} className="container-lava relative z-10 flex-1 overflow-y-auto py-8">
        <ul className="divide-y divide-line">
          {navItems.map((item, idx) => {
            const isActive =
              activePath === item.href ||
              (item.href !== "/" && activePath.startsWith(`${item.href}/`));

            return (
              <li
                key={item.key}
                style={{
                  transitionDelay: open ? `${60 + idx * 38}ms` : "0ms",
                }}
                className={cn(
                  "transition-all duration-450 ease-[var(--ease-out-expo)]",
                  open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                )}
              >
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => {
                    onNavigate?.(item.href);
                    onClose();
                  }}
                  className="group flex items-baseline justify-between py-4"
                >
                  <span className="flex items-baseline gap-4">
                    <span
                      dir="ltr"
                      className={cn(
                        "font-mono text-xs tabular-nums transition-colors",
                        isActive ? "text-accent" : "text-faint group-hover:text-accent",
                      )}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "font-display text-3xl font-medium transition-colors sm:text-4xl",
                        isActive ? "text-lava-100" : "text-text group-hover:text-lava-100",
                      )}
                    >
                      {t(item.key)}
                    </span>
                  </span>

                  {isActive ? (
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_var(--lava-500)]"
                    />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Drawer footer CTA */}
      <div className="container-lava relative z-10 flex flex-col gap-5 border-t border-line py-6">
        <div className="flex items-center justify-between gap-4">
          <ActionLink
            href="/quote"
            variant="molten"
            size="lg"
            onClick={() => {
              onNavigate?.("/quote");
              onClose();
            }}
          >
            {t("startProject")}
          </ActionLink>
        </div>
        <p className="text-xs text-faint">{tf("tagline")}</p>
      </div>
    </div>
  );
}
