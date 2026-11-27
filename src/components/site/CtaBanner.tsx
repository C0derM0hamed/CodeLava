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

  const eyebrowLabel = eyebrow ?? t("closingEyebrow");

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "surface-dark group/cta relative isolate overflow-hidden rounded-[var(--radius-xl)] shadow-[0_40px_80px_-38px_color-mix(in_oklab,var(--ink-900)_76%,transparent)]",
        className,
      )}
    >
      {/* Top molten filament rim */}
      <div
        aria-hidden="true"
        className="lava-seam-hairline pointer-events-none absolute inset-x-10 top-0 z-10 h-[1.5px] opacity-85"
      />

      {/* Volcano art — anchored to the end side, mirrored in RTL */}
      {imageSrc ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 md:start-auto md:w-[82%] md:ltr:[mask-image:linear-gradient(to_left,black_62%,transparent)] md:rtl:[mask-image:linear-gradient(to_right,black_62%,transparent)]"
        >
          <Image
            src={imageSrc}
            alt=""
            fill
            sizes="(min-width: 1280px) 1520px, 100vw"
            className="object-cover object-[50%_40%] opacity-95 transition-transform duration-1000 ease-[var(--ease-out-expo)] group-hover/cta:scale-[1.025] motion-reduce:group-hover/cta:scale-100 rtl:-scale-x-100 max-md:object-[50%_68%]"
          />
        </div>
      ) : null}

      {/* CSS lava light (also the fallback when no image) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 transition-opacity duration-700 group-hover/cta:opacity-100"
        style={{
          background:
            "radial-gradient(62% 95% at 58% 115%, color-mix(in oklab, var(--lava-500) 44%, transparent) 0%, color-mix(in oklab, var(--lava-700) 20%, transparent) 42%, transparent 72%)",
        }}
      />
      {/* Ink veil — solid behind the copy, clear over the volcano, soft again behind the actions */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 hidden md:block ltr:bg-[linear-gradient(90deg,var(--ink-900)_0%,color-mix(in_oklab,var(--ink-900)_90%,transparent)_32%,color-mix(in_oklab,var(--ink-900)_14%,transparent)_58%,color-mix(in_oklab,var(--ink-900)_58%,transparent)_82%,color-mix(in_oklab,var(--ink-900)_84%,transparent)_100%)] rtl:bg-[linear-gradient(270deg,var(--ink-900)_0%,color-mix(in_oklab,var(--ink-900)_90%,transparent)_32%,color-mix(in_oklab,var(--ink-900)_14%,transparent)_58%,color-mix(in_oklab,var(--ink-900)_58%,transparent)_82%,color-mix(in_oklab,var(--ink-900)_84%,transparent)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,var(--ink-900)_0%,color-mix(in_oklab,var(--ink-900)_90%,transparent)_54%,color-mix(in_oklab,var(--ink-900)_32%,transparent)_100%)] md:hidden"
      />
      {/* Hairline rim */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] border border-[color-mix(in_oklab,var(--ash-50)_11%,transparent)]"
      />

      <div className="relative flex flex-col gap-7 px-6 pt-9 pb-32 sm:px-10 sm:pb-36 md:flex-row md:items-center md:justify-between md:gap-12 md:py-14 lg:px-16 lg:py-16">
        <div className="max-w-xl space-y-3.5">
          {eyebrowLabel ? <p className="kicker-rule">{eyebrowLabel}</p> : null}
          <Heading id={headingId} className="text-display-md text-text">{titleNode}</Heading>
          <p className="max-w-[46ch] text-body text-muted">{lead ?? t("ctaLead")}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3 max-sm:grid max-sm:w-full max-sm:grid-cols-2">
          <ActionLink href={primaryLink.href} variant="inverse" size="md" className="max-sm:w-full">
            {primaryLink.label}
          </ActionLink>
          {secondaryLink ? (
            <ActionLink
              href={secondaryLink.href}
              variant="outline"
              size="md"
              arrow="none"
              className="backdrop-blur-sm max-sm:w-full"
            >
              {secondaryLink.label}
            </ActionLink>
          ) : null}
        </div>
      </div>
    </section>
  );
}
