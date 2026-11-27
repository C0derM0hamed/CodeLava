"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { Logo } from "@/components/brand/Logo";
import { ActionLink } from "@/components/ui/ActionLink";
import { ArrowRightIcon, CloseIcon } from "@/components/ui/Icons";
import { cn } from "@/components/ui/cn";
import { LocaleSwitch } from "./LocaleSwitch";

export interface NavItem {
  key: "home" | "services" | "work" | "about" | "process" | "technologies" | "blog" | "faq" | "contact";
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
 * Full-height light navigation sheet: large display links, language switch, CTA pair at the bottom.
 * Focus-trapped, Escape closes, body + Lenis scroll locked while open.
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
      inert={!open || undefined}
      className={cn(
        "page-wash fixed inset-0 z-[var(--z-drawer)] flex flex-col bg-bg duration-400 ease-[var(--ease-out-expo)] lg:hidden",
        open
          ? "pointer-events-auto visible translate-y-0 opacity-100 transition-[opacity,transform]"
          : "pointer-events-none invisible -translate-y-3 opacity-0 transition-[opacity,transform,visibility]",
      )}
    >
      {/* Sheet header */}
      <div className="container-lava relative flex h-[var(--header-h)] shrink-0 items-center justify-between border-b border-line bg-surface/65 backdrop-blur-md">
        <span aria-hidden="true" className="lava-seam-hairline pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-55" />
        <Link
          href="/"
          aria-label={t("homeAria")}
          className="rounded-md"
          onClick={() => {
            onNavigate?.("/");
            onClose();
          }}
        >
          <Logo size="md" tone="light" />
        </Link>

        <button
          type="button"
          aria-label={t("menuClose")}
          onClick={onClose}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-surface text-text shadow-[var(--shadow-xs)] transition-[border-color,color,transform] duration-200 hover:border-line-lava hover:text-accent-text active:scale-95"
        >
          <CloseIcon size={18} />
        </button>
      </div>

      {/* Large nav */}
      <nav aria-label={t("mainLabel")} className="container-lava flex-1 overflow-y-auto py-5">
        <ul className="flex flex-col">
          {navItems.map((item, idx) => {
            const isActive =
              item.href === "/"
                ? activePath === "/" || activePath === ""
                : activePath === item.href || activePath.startsWith(`${item.href}/`);

            return (
              <li
                key={item.key}
                style={{ transitionDelay: open ? `${40 + idx * 35}ms` : "0ms" }}
                className={cn(
                  "border-b border-line/80 transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)]",
                  open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                )}
              >
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => {
                    onNavigate?.(item.href);
                    onClose();
                  }}
                  className={cn(
                    "group flex min-h-14 items-center justify-between gap-4 rounded-[var(--radius-md)] px-2 py-2.5 transition-colors duration-200",
                    isActive ? "bg-accent-soft/75" : "hover:bg-surface/70",
                  )}
                >
                  <span className="flex items-baseline gap-3.5">
                    <span
                      dir="ltr"
                      aria-hidden="true"
                      className={cn(
                        "font-mono text-xs tabular-nums transition-colors",
                        isActive ? "font-semibold text-accent-text" : "text-faint group-hover:text-accent-text",
                      )}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "font-display text-[1.5rem] font-bold leading-tight tracking-[-0.02em] transition-colors rtl:tracking-normal",
                        isActive ? "text-accent-text" : "text-text group-hover:text-accent-text",
                      )}
                    >
                      {t(item.key)}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-[background-color,color,transform] duration-300",
                      isActive
                        ? "bg-surface text-accent-text shadow-[var(--shadow-xs)]"
                        : "text-faint group-hover:translate-x-0.5 group-hover:text-accent-text rtl:group-hover:-translate-x-0.5",
                    )}
                  >
                    <ArrowRightIcon size={18} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-line bg-surface/85 px-4 py-3 shadow-[var(--shadow-xs)]">
          <span className="text-sm font-medium text-muted">{t("language")}</span>
          <LocaleSwitch
            size="sm"
            className="border-line-strong bg-bg/70"
            onLocaleChange={
              onLocaleChange
                ? (next) => {
                    onLocaleChange(next);
                    onClose();
                  }
                : undefined
            }
          />
        </div>
      </nav>

      {/* Bottom CTA */}
      <div className="container-lava shrink-0 border-t border-line bg-surface/90 py-4 backdrop-blur-md">
        <div className="grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2">
          <ActionLink
            href="/quote"
            variant="primary"
            size="md"
            fullWidth
            onClick={() => {
              onNavigate?.("/quote");
              onClose();
            }}
          >
            {t("getQuote")}
          </ActionLink>
          <ActionLink
            href="/contact"
            variant="secondary"
            size="md"
            fullWidth
            arrow="none"
            onClick={() => {
              onNavigate?.("/contact");
              onClose();
            }}
          >
            {t("contact")}
          </ActionLink>
        </div>
      </div>
    </div>
  );
}
