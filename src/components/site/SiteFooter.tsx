"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "@/components/brand/Logo";
import { ActionLink } from "@/components/ui/ActionLink";
import {
  ArrowUpRightIcon,
  ClockIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  SocialIcon,
  detectSocialNetwork,
} from "@/components/ui/Icons";
import { cn } from "@/components/ui/cn";
import { CtaBanner, type CtaBannerProps } from "./CtaBanner";
import { LocaleSwitch } from "./LocaleSwitch";

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

export interface FooterLink {
  label: string;
  href: string;
}

export interface SiteFooterProps {
  /** Contact data from DB settings. Empty fields are skipped; the column hides when all are empty. */
  contact?: FooterContactInfo | null;
  /** Social profile links from DB settings (icon inferred from the URL). Hidden when empty. */
  socials?: FooterSocialLink[];
  /**
   * Published services from the DB (e.g. first 6: `{ label: s.title, href: \`/services/${s.slug}\` }`).
   * When omitted/empty, the column falls back to static "Company" links (process, technologies, FAQ, blog).
   */
  services?: FooterLink[];
  /** Extra legal links next to Privacy. */
  legalLinks?: FooterLink[];
  /** Hide the CTA banner entirely. */
  hideCta?: boolean;
  /** Paths (locale-less) where the CTA banner is skipped automatically. Default ["/quote", "/contact"]. */
  hideCtaOn?: string[];
  /** Props forwarded to the CTA banner (copy/link overrides). */
  cta?: CtaBannerProps;
  /** Override copyright year (defaults to current year). */
  year?: number;
  className?: string;
}

const QUICK_LINKS = [
  { key: "home", href: "/" },
  { key: "services", href: "/services" },
  { key: "work", href: "/work" },
  { key: "about", href: "/about" },
  { key: "blog", href: "/blog" },
  { key: "contact", href: "/contact" },
] as const;

const COMPANY_FALLBACK_LINKS = [
  { key: "process", href: "/process" },
  { key: "technologies", href: "/technologies" },
  { key: "faq", href: "/faq" },
  { key: "quote", href: "/quote" },
] as const;

function FooterHeading({ children }: { children: ReactNode }) {
  return <h2 className="mb-5 font-display text-base font-semibold text-text">{children}</h2>;
}

const LINK_CLASS =
  "inline-flex min-h-7 items-center text-[0.9375rem] text-muted transition-colors duration-200 hover:text-accent-text";

/**
 * Site footer (v2): CTA banner overlapping the top edge (once per page), then a dark ink band with
 * brand + socials · quick links · services · contact info · "Start a project" block, and a bottom bar
 * (© · privacy · language). All contact/social/service data comes from props (DB) — nothing hardcoded.
 */
export function SiteFooter({
  contact,
  socials = [],
  services = [],
  legalLinks = [],
  hideCta = false,
  hideCtaOn = ["/quote", "/contact"],
  cta,
  year,
  className,
}: SiteFooterProps) {
  const t = useTranslations("footer");
  const tn = useTranslations("nav");
  const pathname = usePathname() || "/";
  const displayYear = year ?? new Date().getFullYear();

  const showCta =
    !hideCta &&
    !hideCtaOn.some((p) => (p === "/" ? pathname === "/" : pathname === p || pathname.startsWith(`${p}/`)));

  const contactRows: Array<{ key: string; icon: ReactNode; node: ReactNode }> = [];
  if (contact?.location) {
    contactRows.push({
      key: "location",
      icon: <MapPinIcon size={17} />,
      node: <span className="whitespace-pre-line">{contact.location}</span>,
    });
  }
  if (contact?.email) {
    contactRows.push({
      key: "email",
      icon: <MailIcon size={17} />,
      node: (
        <a href={`mailto:${contact.email}`} dir="ltr" data-cursor="pointer" className={cn(LINK_CLASS, "break-all")}>
          {contact.email}
        </a>
      ),
    });
  }
  if (contact?.phone) {
    contactRows.push({
      key: "phone",
      icon: <PhoneIcon size={17} />,
      node: (
        <a
          href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
          dir="ltr"
          data-cursor="pointer"
          className={cn(LINK_CLASS, "tabular-nums")}
        >
          {contact.phone}
        </a>
      ),
    });
  }
  if (contact?.availability) {
    contactRows.push({ key: "hours", icon: <ClockIcon size={17} />, node: <span>{contact.availability}</span> });
  }

  return (
    <footer className={cn("relative [--cta-overlap:clamp(5rem,7vw,6.5rem)]", className)}>
      {showCta ? (
        <div className="container-lava relative z-10 pt-[clamp(2.5rem,4.5vw,4.5rem)]">
          <CtaBanner {...cta} />
        </div>
      ) : null}

      <div
        className={cn(
          "surface-dark relative overflow-hidden",
          showCta
            ? "-mt-[var(--cta-overlap)] pt-[calc(var(--cta-overlap)+clamp(4rem,6.5vw,6rem))]"
            : "pt-[clamp(4.5rem,7vw,6.5rem)]",
        )}
      >
        {/* faint volcanic warmth along the bottom horizon */}
        <div
          aria-hidden="true"
          className="heat-haze-radial pointer-events-none absolute inset-x-0 bottom-0 h-[360px] opacity-70"
        />

        <div className="container-lava relative">
          <div className="grid grid-cols-2 gap-x-[var(--space-grid-lg)] gap-y-12 pb-16 md:grid-cols-3 lg:grid-cols-[1.45fr_0.8fr_1fr_1.25fr_1.4fr]">
            {/* Brand */}
            <div className="col-span-2 space-y-5 md:col-span-3 lg:col-span-1">
              <Link href="/" aria-label={tn("homeAria")} className="inline-block rounded-md" data-cursor="pointer">
                <Logo size="md" tone="dark" />
              </Link>
              <p className="max-w-[34ch] text-[0.9375rem] leading-relaxed text-muted">{t("blurb")}</p>
              {socials.length > 0 ? (
                <ul aria-label={t("socialsLabel")} className="flex flex-wrap items-center gap-2.5 pt-1">
                  {socials.map((social) => {
                    const network = detectSocialNetwork(social.href) ?? detectSocialNetwork(social.label);
                    return (
                      <li key={`${social.label}-${social.href}`}>
                        <a
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-cursor="pointer"
                          aria-label={network ? t("followOn", { network: social.label }) : undefined}
                          className={cn(
                            "inline-flex h-10 items-center justify-center rounded-full border border-line bg-[color-mix(in_oklab,var(--ash-50)_5%,transparent)] text-text transition-[background-color,border-color,color,transform] duration-300 hover:-translate-y-0.5 hover:border-transparent hover:text-on-accent hover:[background-image:var(--gradient-cta)]",
                            network ? "w-10" : "gap-1.5 px-3.5 text-sm font-medium",
                          )}
                        >
                          {network ? (
                            <SocialIcon network={network} size={17} />
                          ) : (
                            <>
                              <span>{social.label}</span>
                              <ArrowUpRightIcon size={13} />
                            </>
                          )}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>

            {/* Quick links */}
            <nav aria-labelledby="footer-quick-links">
              <FooterHeading>
                <span id="footer-quick-links">{t("quickLinksHeading")}</span>
              </FooterHeading>
              <ul className="space-y-1.5">
                {QUICK_LINKS.map((item) => (
                  <li key={item.key}>
                    <Link href={item.href} data-cursor="pointer" className={LINK_CLASS}>
                      {tn(item.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Services (DB) or company fallback */}
            <nav aria-labelledby="footer-services">
              <FooterHeading>
                <span id="footer-services">
                  {services.length > 0 ? t("servicesHeading") : t("companyHeading")}
                </span>
              </FooterHeading>
              <ul className="space-y-1.5">
                {services.length > 0
                  ? services.map((item) => (
                      <li key={item.href}>
                        <Link href={item.href} data-cursor="pointer" className={LINK_CLASS}>
                          {item.label}
                        </Link>
                      </li>
                    ))
                  : COMPANY_FALLBACK_LINKS.map((item) => (
                      <li key={item.key}>
                        <Link href={item.href} data-cursor="pointer" className={LINK_CLASS}>
                          {tn(item.key)}
                        </Link>
                      </li>
                    ))}
              </ul>
            </nav>

            {/* Contact info (DB) */}
            {contactRows.length > 0 ? (
              <div className="col-span-2 md:col-span-1">
                <FooterHeading>{t("contactInfoHeading")}</FooterHeading>
                <ul className="space-y-3.5">
                  {contactRows.map((row) => (
                    <li key={row.key} className="flex items-start gap-3 text-[0.9375rem] text-muted">
                      <span className="mt-[0.2rem] text-accent-text">{row.icon}</span>
                      <span className="min-w-0">{row.node}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Start a project (replaces the reference newsletter — no backend needed) */}
            <div
              className={cn(
                "col-span-2 md:col-span-3 lg:col-span-1",
                contactRows.length === 0 && "lg:col-span-2 lg:w-full lg:max-w-sm lg:justify-self-end",
              )}
            >
              <div className="rounded-[var(--radius-md)] border border-line bg-[color-mix(in_oklab,var(--ash-50)_4%,transparent)] p-5 sm:p-6">
                <h2 className="font-display text-base font-semibold text-text">{t("startHeading")}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t("startLead")}</p>
                <ActionLink href="/quote" variant="primary" size="sm" className="mt-5">
                  {t("startCta")}
                </ActionLink>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col gap-4 border-t border-line py-6 text-sm text-faint md:flex-row md:items-center md:justify-between">
            <p>
              <bdi dir="ltr">© {displayYear} CodeLava.</bdi> {t("rights")}
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <nav aria-label={t("legalLabel")} className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <Link href="/privacy" data-cursor="pointer" className="inline-flex min-h-7 items-center transition-colors hover:text-text">
                  {t("privacy")}
                </Link>
                {legalLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-cursor="pointer"
                    className="inline-flex min-h-7 items-center transition-colors hover:text-text"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <LocaleSwitch className="-me-3" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
