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
  /** Transparent at the very top (over the hero), glass once scrolled. Default true. */
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
 * Adaptive sticky site header: switches seamlessly between dark-hero overlay mode
 * (crisp white wordmark & links over the full-bleed volcano hero) and daylight frosted
 * white glass across the rest of the site.
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

  const isHomeRoute = pathname === "/" || pathname === "";
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [overDarkHero, setOverDarkHero] = useState(isHomeRoute && !forceElevated);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (position === "static" || typeof window === "undefined") return;

    const evaluate = () => {
      const y = window.scrollY;
      setScrolled(y > 12);

      const darkHero = document.querySelector<HTMLElement>('[data-hero-dark="true"]');
      if (darkHero && !forceElevated) {
        const rect = darkHero.getBoundingClientRect();
        setOverDarkHero(rect.bottom > 76 && rect.top <= 76);
      } else {
        setOverDarkHero(false);
      }

      if (hideOnScrollDown && !menuOpen) {
        const delta = y - lastScrollY.current;
        if (y > 220 && delta > 8) setHidden(true);
        else if (delta < -6 || y <= 120) setHidden(false);
      } else {
        setHidden(false);
      }
      lastScrollY.current = y;
    };

    evaluate();
    window.addEventListener("scroll", evaluate, { passive: true });
    window.addEventListener("resize", evaluate, { passive: true });
    return () => {
      window.removeEventListener("scroll", evaluate);
      window.removeEventListener("resize", evaluate);
    };
  }, [forceElevated, hideOnScrollDown, menuOpen, pathname, position]);

  const closeMenu = () => {
    setMenuOpen(false);
    requestAnimationFrame(() => menuTriggerRef.current?.focus());
  };

  const isElevated = forceElevated || scrolled || !transparentOverHero;
  const darkChrome = overDarkHero && !forceElevated;

  return (
    <>
      <header
        data-elevated={isElevated ? "true" : "false"}
        data-surface={darkChrome ? "dark" : undefined}
        aria-hidden={menuOpen || undefined}
        inert={menuOpen || undefined}
        className={cn(
          position === "fixed" ? "fixed inset-x-0 top-0" : position === "sticky" ? "sticky top-0" : "relative",
          "z-[var(--z-header)] border-b transition-[transform,background-color,border-color,box-shadow,backdrop-filter] duration-500 ease-[var(--ease-out-expo)]",
          "focus-within:translate-y-0",
          hidden && !menuOpen ? "-translate-y-full" : "translate-y-0",
          darkChrome && "surface-dark !bg-transparent",
          isElevated
            ? darkChrome
              ? "border-white/10 !bg-ink-950/75 shadow-[0_12px_32px_-16px_rgba(0,0,0,0.7)] backdrop-blur-xl backdrop-saturate-150"
              : "border-line bg-surface-glass shadow-[var(--shadow-header)] backdrop-blur-xl backdrop-saturate-150"
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
            <Logo size="md" tone={darkChrome ? "dark" : "light"} />
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
                        darkChrome
                          ? active
                            ? "text-lava-300"
                            : "text-ash-50/88 hover:text-white"
                          : active
                            ? "text-accent-text"
                            : "text-text/80 hover:text-text",
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
              <LocaleSwitch
                onLocaleChange={onLocaleChange}
                className={
                  darkChrome
                    ? "text-ash-50/90 hover:border-white/20 hover:bg-white/10 hover:text-white"
                    : undefined
                }
              />
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
              className={cn(
                "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border shadow-[var(--shadow-xs)] transition-colors lg:hidden",
                darkChrome
                  ? "border-white/20 bg-white/10 text-ash-50 backdrop-blur-md hover:border-lava-400/60 hover:text-lava-300"
                  : "border-line-strong bg-surface text-text hover:border-line-lava hover:text-accent-text",
              )}
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
