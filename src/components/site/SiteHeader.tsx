"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { Logo } from "@/components/brand/Logo";
import { ActionLink } from "@/components/ui/ActionLink";
import { cn } from "@/components/ui/cn";
import { LocaleSwitch } from "./LocaleSwitch";
import { MobileMenu, type NavItem } from "./MobileMenu";

export const PRIMARY_NAV_ITEMS: readonly NavItem[] = [
  { key: "services", href: "/services" },
  { key: "work", href: "/work" },
  { key: "about", href: "/about" },
  { key: "process", href: "/process" },
  { key: "blog", href: "/blog" },
  { key: "contact", href: "/contact" },
] as const;

export interface SiteHeaderProps {
  /** Defaults to "fixed". Use "sticky" or "static" for embedded previews. */
  position?: "fixed" | "sticky" | "static";
  /** Starts transparent over the hero and transitions to obsidian blur on scroll. Default true. */
  transparentOverHero?: boolean;
  /** Hides smoothly when scrolling down and reveals on scroll up. Default true. */
  hideOnScrollDown?: boolean;
  /** Optional override for lab/showcase locale toggling. */
  onLocaleChange?: (nextLocale: AppLocale) => void;
  /** Optional hook called when a nav item is clicked. */
  onNavigate?: (href: string) => void;
  className?: string;
}

/**
 * Primary CodeLava site header.
 * Features the brand lockup, 6 core routes, EN/AR path-preserving language switch,
 * signature molten "Start a project" CTA, scroll-aware hide/reveal + obsidian glass blur,
 * and a full-screen editorial mobile drawer.
 */
export function SiteHeader({
  position = "fixed",
  transparentOverHero = true,
  hideOnScrollDown = true,
  onLocaleChange,
  onNavigate,
  className,
}: SiteHeaderProps) {
  const t = useTranslations("nav");
  const pathname = usePathname() || "/";
  const menuId = useId();
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (position === "static" || typeof window === "undefined") return;

    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 28);

      if (hideOnScrollDown && !menuOpen) {
        const delta = y - lastScrollY.current;
        if (y > 140 && delta > 8) {
          setHidden(true);
        } else if (delta < -6 || y <= 80) {
          setHidden(false);
        }
      } else {
        setHidden(false);
      }

      lastScrollY.current = y;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hideOnScrollDown, menuOpen, position]);

  const closeMenu = () => {
    setMenuOpen(false);
    requestAnimationFrame(() => menuTriggerRef.current?.focus());
  };

  const isElevated = scrolled || !transparentOverHero || position === "static";

  return (
    <>
      <header
        aria-hidden={menuOpen || undefined}
        className={cn(
          position === "fixed"
            ? "fixed inset-x-0 top-0"
            : position === "sticky"
              ? "sticky top-0"
              : "relative",
          "z-[var(--z-header)] transition-[transform,background-color,border-color,backdrop-filter] duration-400 ease-[var(--ease-out-expo)]",
          "focus-within:translate-y-0",
          hidden && !menuOpen ? "-translate-y-full" : "translate-y-0",
          isElevated
            ? "border-b border-line bg-obsidian-950/82 backdrop-blur-md"
            : "border-b border-transparent bg-gradient-to-b from-obsidian-950/70 via-obsidian-950/25 to-transparent",
          className,
        )}
      >
        <div className="container-lava flex h-[var(--header-h)] items-center justify-between gap-4">
          {/* Brand lockup */}
          <Link
            href="/"
            aria-label={t("homeAria")}
            data-cursor="pointer"
            onClick={() => onNavigate?.("/")}
            className="shrink-0 transition-opacity hover:opacity-95"
          >
            <Logo size="md" />
          </Link>

          {/* Desktop navigation */}
          <nav aria-label={t("mainLabel")} className="hidden items-center gap-1 lg:flex">
            {PRIMARY_NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(`${item.href}/`));

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  data-cursor="pointer"
                  onClick={() => onNavigate?.(item.href)}
                  className={cn(
                    "group relative px-3.5 py-2 text-sm font-medium transition-colors duration-200",
                    isActive ? "text-text" : "text-muted hover:text-text",
                  )}
                >
                  <span>{t(item.key)}</span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none absolute inset-x-3.5 bottom-0.5 h-px origin-left rtl:origin-right transition-transform duration-300 ease-[var(--ease-out-expo)]",
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                    )}
                    style={{ background: "var(--gradient-lava)" }}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Trailing actions: locale toggle + signature CTA + mobile menu trigger */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden items-center gap-3 md:flex md:gap-4">
              <LocaleSwitch onLocaleChange={onLocaleChange} />

              <ActionLink
                href="/quote"
                variant="molten"
                size="sm"
                onClick={() => onNavigate?.("/quote")}
              >
                {t("startProject")}
              </ActionLink>
            </div>

            <button
              ref={menuTriggerRef}
              type="button"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={t("menuOpen")}
              onClick={() => setMenuOpen((v) => !v)}
              data-cursor="pointer"
              className="inline-flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-line-strong bg-bg-elevated/80 text-text transition-colors hover:border-line-lava-strong hover:bg-surface lg:hidden"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "h-[1.5px] w-4.5 rounded-full bg-current transition-transform duration-300",
                  menuOpen && "translate-y-[3.75px] rotate-45",
                )}
              />
              <span
                aria-hidden="true"
                className={cn(
                  "h-[1.5px] w-4.5 rounded-full bg-current transition-transform duration-300",
                  menuOpen && "-translate-y-[3.75px] -rotate-45",
                )}
              />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={closeMenu}
        navItems={PRIMARY_NAV_ITEMS}
        activePath={pathname}
        onLocaleChange={onLocaleChange}
        onNavigate={onNavigate}
        menuId={menuId}
      />
    </>
  );
}
