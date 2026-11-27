"use client";

import Image from "next/image";
import { useId, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ActionLink } from "@/components/ui/ActionLink";
import { cn } from "@/components/ui/cn";

export interface CtaBannerLink {
  href: string;
  label: string;
}

export interface CtaBannerProps {
  eyebrow?: string;
  /** Headline override. Defaults to `footer.ctaTitle` (rich: wrap the hot word in <hl>…</hl>). */
  title?: ReactNode;
  /** Supporting line override. Defaults to `footer.ctaLead`. */
  lead?: ReactNode;
  /** Primary (white pill) action. Defaults to /quote · `footer.ctaPrimary`. */
  primary?: CtaBannerLink;
  /** Secondary (outlined pill) action. Defaults to /contact · `footer.ctaSecondary`. Pass `null` to hide. */
  secondary?: CtaBannerLink | null;
  /** Background art. Defaults to the calm volcano poster. Pass `null` for the pure CSS lava light. */
  imageSrc?: string | null;
  headingLevel?: "h2" | "h3";
  className?: string;
}

/**
 * Dark ink CTA card (radius-xl) with volcano light bleeding in from the end side.
 * Rendered once per page by <SiteFooter> (overlapping the footer top) — pages should not add
 * their own closing CTA band. Can also be placed standalone.
 */
export function CtaBanner({
  eyebrow,
  title,
  lead,
  primary,
  secondary,
  imageSrc = "/media/hero/poster-calm.jpg",
  headingLevel = "h2",
  className,
}: CtaBannerProps) {
  const t = useTranslations("footer");
  const Heading = headingLevel;
  const headingId = useId();

  const titleNode =
    title ??
    t.rich("ctaTitle", {
      hl: (chunks) => <span className="text-lava-gradient">{chunks}</span>,
    });
  const primaryLink = primary ?? { href: "/quote", label: t("ctaPrimary") };
  const secondaryLink =
    secondary === null ? null : (secondary ?? { href: "/contact", label: t("ctaSecondary") });

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "surface-dark relative isolate overflow-hidden rounded-[var(--radius-xl)] shadow-[0_40px_80px_-40px_color-mix(in_oklab,var(--ink-900)_70%,transparent)]",
        className,
      )}
    >
      {/* Volcano art — anchored to the end side, mirrored in RTL */}
      {imageSrc ? (
        <div aria-hidden="true" className="absolute inset-0 -z-10 md:start-auto md:w-[80%] md:ltr:[mask-image:linear-gradient(to_left,black_60%,transparent)] md:rtl:[mask-image:linear-gradient(to_right,black_60%,transparent)]">
          <Image
            src={imageSrc}
            alt=""
            fill
            sizes="(min-width: 1280px) 1520px, 100vw"
            className="object-cover object-[50%_42%] opacity-95 rtl:-scale-x-100 max-md:object-[55%_62%]"
          />
        </div>
      ) : null}

      {/* CSS lava light (also the fallback when no image) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 90% at 58% 115%, color-mix(in oklab, var(--lava-500) 38%, transparent) 0%, color-mix(in oklab, var(--lava-700) 18%, transparent) 40%, transparent 70%)",
        }}
      />
      {/* Ink veil — solid behind the copy, clear over the volcano, soft again behind the actions */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 hidden md:block ltr:bg-[linear-gradient(90deg,var(--ink-900)_0%,color-mix(in_oklab,var(--ink-900)_88%,transparent)_30%,color-mix(in_oklab,var(--ink-900)_10%,transparent)_56%,color-mix(in_oklab,var(--ink-900)_55%,transparent)_80%,color-mix(in_oklab,var(--ink-900)_80%,transparent)_100%)] rtl:bg-[linear-gradient(270deg,var(--ink-900)_0%,color-mix(in_oklab,var(--ink-900)_88%,transparent)_30%,color-mix(in_oklab,var(--ink-900)_10%,transparent)_56%,color-mix(in_oklab,var(--ink-900)_55%,transparent)_80%,color-mix(in_oklab,var(--ink-900)_80%,transparent)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,var(--ink-900)_0%,color-mix(in_oklab,var(--ink-900)_86%,transparent)_48%,color-mix(in_oklab,var(--ink-900)_35%,transparent)_100%)] md:hidden"
      />
      {/* Hairline rim */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] border border-[color-mix(in_oklab,var(--ash-50)_9%,transparent)]"
      />

      <div className="relative flex flex-col gap-8 px-6 pt-10 pb-44 sm:px-10 md:flex-row md:items-center md:justify-between md:gap-12 md:py-14 lg:px-16 lg:py-16">
        <div className="max-w-xl space-y-4">
          {eyebrow && <p className="kicker-rule">{eyebrow}</p>}
          <Heading id={headingId} className="text-display-md text-text">{titleNode}</Heading>
          <p className="max-w-[46ch] text-body text-muted">{lead ?? t("ctaLead")}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3.5">
          <ActionLink href={primaryLink.href} variant="inverse" size="md">
            {primaryLink.label}
          </ActionLink>
          {secondaryLink ? (
            <ActionLink href={secondaryLink.href} variant="outline" size="md" arrow="none">
              {secondaryLink.label}
            </ActionLink>
          ) : null}
        </div>
      </div>
    </section>
  );
}
