"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { Logo } from "@/components/brand/Logo";
import { ActionLink } from "@/components/ui/ActionLink";
import { MenuIcon } from "@/components/ui/Icons";
import { cn } from "@/components/ui/cn";
import { LocaleSwitch } from "./LocaleSwitch";
import { MobileMenu, type NavItem } from "./MobileMenu";

export const PRIMARY_NAV_ITEMS: readonly NavItem[] = [
  { key: "home", href: "/" },
  { key: "services", href: "/services" },
  { key: "work", href: "/work" },
  { key: "process", href: "/process" },
  { key: "about", href: "/about" },
  { key: "blog", href: "/blog" },
  { key: "contact", href: "/contact" },
] as const;

export function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/" || pathname === "";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export interface SiteHeaderProps {
  /** Defaults to "fixed". Use "sticky" or "static" for embedded previews. */
  position?: "fixed" | "sticky" | "static";
  /** Transparent at the very top (over the hero wash), white glass once scrolled. Default true. */
  transparentOverHero?: boolean;
  /** Slides away when scrolling down, returns on scroll up. Default true. */
  hideOnScrollDown?: boolean;
  /** Force the scrolled (white glass) look — used by the design lab. */
  forceElevated?: boolean;
  /** Nav items override (defaults to PRIMARY_NAV_ITEMS). */
  navItems?: readonly NavItem[];
  /** Optional override for lab/showcase locale toggling. */
  onLocaleChange?: (nextLocale: AppLocale) => void;
  /** Optional hook called when a nav item is clicked. */
  onNavigate?: (href: string) => void;
  className?: string;
}

/**
 * Light sticky site header (v2): logo start · centred nav with orange active underline ·
 * globe language switch + "Get a quote" pill at the end. Transparent over the hero, then
 * white glass + hairline + soft shadow on scroll. Below lg → burger + full-height light sheet.
 */
export function SiteHeader({
  position = "fixed",
  transparentOverHero = true,
  hideOnScrollDown = true,
  forceElevated = false,
  navItems = PRIMARY_NAV_ITEMS,
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
      setScrolled(y > 12);

      if (hideOnScrollDown && !menuOpen) {
        const delta = y - lastScrollY.current;
        if (y > 220 && delta > 8) setHidden(true);
        else if (delta < -6 || y <= 120) setHidden(false);
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

  const isElevated = forceElevated || scrolled || !transparentOverHero;

  return (
    <>
      <header
        data-elevated={isElevated ? "true" : "false"}
        aria-hidden={menuOpen || undefined}
        inert={menuOpen || undefined}
        className={cn(
          position === "fixed" ? "fixed inset-x-0 top-0" : position === "sticky" ? "sticky top-0" : "relative",
          "z-[var(--z-header)] border-b transition-[transform,background-color,border-color,box-shadow,backdrop-filter] duration-500 ease-[var(--ease-out-expo)]",
          "focus-within:translate-y-0",
          hidden && !menuOpen ? "-translate-y-full" : "translate-y-0",
          isElevated
            ? "border-line bg-surface-glass shadow-[var(--shadow-header)] backdrop-blur-xl backdrop-saturate-150"
            : "border-transparent bg-transparent",
          className,
        )}
      >
        <div className="container-lava flex h-[var(--header-h)] items-center justify-between gap-6">
          <Link
            href="/"
            aria-label={t("homeAria")}
            data-cursor="pointer"
            onClick={() => onNavigate?.("/")}
            className="shrink-0 rounded-md"
          >
            <Logo size="md" tone="light" />
          </Link>

          <nav aria-label={t("mainLabel")} className="hidden lg:block">
            <ul className="flex items-center gap-0.5 xl:gap-1.5">
              {navItems.map((item) => {
                const active = isNavActive(pathname, item.href);
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      data-cursor="pointer"
                      onClick={() => onNavigate?.(item.href)}
                      className={cn(
                        "group relative inline-flex h-11 items-center rounded-md px-2.5 text-[0.9rem] font-medium transition-colors duration-200 xl:px-3",
                        active ? "text-accent-text" : "text-text/80 hover:text-text",
                      )}
                    >
                      <span>{t(item.key)}</span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          "pointer-events-none absolute inset-x-2.5 bottom-1 h-[2px] origin-center rounded-full transition-transform duration-300 ease-[var(--ease-out-expo)] xl:inset-x-3",
                          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-60",
                        )}
                        style={{ background: "var(--gradient-cta)" }}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <LocaleSwitch onLocaleChange={onLocaleChange} />
            </div>
            <div className="hidden md:block">
              <ActionLink href="/quote" variant="primary" size="sm" onClick={() => onNavigate?.("/quote")}>
                {t("getQuote")}
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
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface text-text shadow-[var(--shadow-xs)] transition-colors hover:border-line-lava hover:text-accent-text lg:hidden"
            >
              <MenuIcon size={20} />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={closeMenu}
        navItems={navItems}
        activePath={pathname}
        onLocaleChange={onLocaleChange}
        onNavigate={onNavigate}
        menuId={menuId}
      />
    </>
  );
}
