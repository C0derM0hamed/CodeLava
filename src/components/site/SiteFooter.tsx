"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/Logo";
import { LavaDivider } from "@/experience/fx/LavaDivider";
import { ActionLink } from "@/components/ui/ActionLink";
import { ArrowUpRightIcon } from "@/components/ui/Icons";
import { cn } from "@/components/ui/cn";

export interface FooterContactInfo {
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  availability?: string | null;
}

export interface FooterSocialLink {
  label: string;
  href: string;
}

export interface SiteFooterProps {
  /** Dynamic contact data from DB settings. If omitted or all fields empty, the contact column hides cleanly. */
  contact?: FooterContactInfo | null;
  /** Dynamic social profile links from DB settings. Hidden when empty. */
  socials?: FooterSocialLink[];
  /** Optional extra legal links alongside Privacy Policy. */
  legalLinks?: Array<{ label: string; href: string }>;
  /** Override copyright year (defaults to current year). */
  year?: number;
  className?: string;
}

const EXPLORE_LINKS = [
  { key: "services", href: "/services" },
  { key: "work", href: "/work" },
  { key: "about", href: "/about" },
  { key: "process", href: "/process" },
  { key: "technologies", href: "/technologies" },
] as const;

const RESOURCE_LINKS = [
  { key: "blog", href: "/blog" },
  { key: "faq", href: "/faq" },
  { key: "contact", href: "/contact" },
  { key: "startProject", href: "/quote" },
] as const;

/**
 * Editorial CodeLava site footer.
 * Features a bold closing statement + molten CTA, structured navigation columns,
 * and strictly dynamic contact/social slots (never hardcodes addresses, phones, or cities).
 */
export function SiteFooter({
  contact,
  socials = [],
  legalLinks = [],
  year,
  className,
}: SiteFooterProps) {
  const t = useTranslations("footer");
  const tn = useTranslations("nav");
  const displayYear = year ?? new Date().getFullYear();

  const hasContact = Boolean(
    contact && (contact.email || contact.phone || contact.location || contact.availability),
  );
  const hasSocials = socials.length > 0;

  return (
    <footer className={cn("relative overflow-hidden bg-bg pt-20 pb-10 sm:pt-28", className)}>
      {/* Ambient volcanic warmth along the bottom horizon */}
      <div
        aria-hidden="true"
        className="heat-haze-radial pointer-events-none absolute inset-x-0 bottom-0 h-[420px] opacity-85"
      />

      <div className="container-lava relative z-10">
        {/* Big editorial closing statement */}
        <div className="flex flex-col items-start justify-between gap-10 pb-16 lg:flex-row lg:items-end lg:pb-20">
          <div className="max-w-4xl space-y-5">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_var(--lava-500)]"
              />
              <span className="text-kicker text-muted">{t("closingEyebrow")}</span>
            </div>
            <h2 className="text-display-lg text-text">{t("closingTitle")}</h2>
          </div>

          <div className="shrink-0">
            <ActionLink href="/quote" variant="molten" size="lg" magnetic>
              {t("closingCta")}
            </ActionLink>
          </div>
        </div>

        <LavaDivider variant="crack" className="my-2" />

        {/* Multi-column editorial footer grid */}
        <div
          className={cn(
            "grid grid-cols-1 gap-12 py-14 sm:grid-cols-2",
            hasContact ? "lg:grid-cols-12" : "lg:grid-cols-10",
          )}
        >
          {/* Brand column */}
          <div className="space-y-5 sm:col-span-2 lg:col-span-4">
            <Logo size="md" animated />
            <p className="max-w-sm text-sm leading-relaxed text-muted">{t("tagline")}</p>

            {hasSocials ? (
              <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2">
                {socials.map((social) => (
                  <li key={`${social.label}-${social.href}`}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="pointer"
                      className="group inline-flex items-center gap-1 text-xs font-medium text-muted transition-colors hover:text-lava-100"
                    >
                      <span>{social.label}</span>
                      <ArrowUpRightIcon
                        size={13}
                        className="text-faint transition-colors group-hover:text-accent"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {/* Explore navigation */}
          <div className="space-y-4 lg:col-span-3">
            <h3 className="text-kicker text-faint">{t("exploreHeading")}</h3>
            <ul className="space-y-2.5">
              {EXPLORE_LINKS.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    data-cursor="pointer"
                    className="text-sm text-ash-200 transition-colors hover:text-accent"
                  >
                    {tn(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources navigation */}
          <div className="space-y-4 lg:col-span-3">
            <h3 className="text-kicker text-faint">{t("resourcesHeading")}</h3>
            <ul className="space-y-2.5">
              {RESOURCE_LINKS.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    data-cursor="pointer"
                    className="text-sm text-ash-200 transition-colors hover:text-accent"
                  >
                    {tn(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Dynamic Direct Contact column — hides completely if no DB contact data is supplied */}
          {hasContact && contact ? (
            <div className="space-y-4 lg:col-span-2">
              <h3 className="text-kicker text-faint">{t("contactHeading")}</h3>
              <ul className="space-y-2.5 text-sm text-ash-200">
                {contact.email ? (
                  <li>
                    <a
                      href={`mailto:${contact.email}`}
                      dir="ltr"
                      data-cursor="pointer"
                      className="inline-block break-all transition-colors hover:text-accent"
                    >
                      {contact.email}
                    </a>
                  </li>
                ) : null}
                {contact.phone ? (
                  <li>
                    <a
                      href={`tel:${contact.phone.replace(/\s+/g, "")}`}
                      dir="ltr"
                      data-cursor="pointer"
                      className="inline-block font-mono text-xs tabular-nums text-muted transition-colors hover:text-text"
                    >
                      {contact.phone}
                    </a>
                  </li>
                ) : null}
                {contact.location ? (
                  <li className="text-xs leading-relaxed text-muted">{contact.location}</li>
                ) : null}
                {contact.availability ? (
                  <li className="inline-flex items-center gap-2 pt-1 text-xs text-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
                    <span>{contact.availability}</span>
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}
        </div>

        {/* Bottom legal & neutral signature bar */}
        <div className="flex flex-col gap-4 border-t border-line pt-7 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span dir="ltr" className="font-mono text-[11px] tabular-nums">
              © {displayYear} CodeLava
            </span>
            <span>{t("rights")}</span>
            <Link
              href="/privacy"
              data-cursor="pointer"
              className="text-muted transition-colors hover:text-text"
            >
              {t("privacy")}
            </Link>
            {legalLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-cursor="pointer"
                className="text-muted transition-colors hover:text-text"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <p className="font-mono text-[11px] tracking-[0.06em] text-faint rtl:font-sans rtl:tracking-normal">
            {t("signature")}
          </p>
        </div>
      </div>
    </footer>
  );
}
