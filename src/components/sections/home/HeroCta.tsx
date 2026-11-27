"use client";

import type { ReactNode } from "react";
import { Link as IntlLink } from "@/i18n/navigation";
import { MagneticLink } from "@/experience/fx/MagneticLink";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { cn } from "@/components/ui/cn";

export interface HeroCtaProps {
  href: string;
  variant: "primary" | "secondary";
  tone?: "dark" | "light";
  children: ReactNode;
  className?: string;
}

/**
 * Hero-scoped tactile CTA buttons with magnetic fine-pointer pull, layered molten / frosted-glass
 * surfaces, hairline gradient borders, and dual sliding directional arrows inside circular wells.
 */
export function HeroCta({
  href,
  variant,
  tone = "dark",
  children,
  className,
}: HeroCtaProps) {
  const isPrimary = variant === "primary";

  return (
    <MagneticLink
      strength={isPrimary ? 0.2 : 0.16}
      maxOffset={isPrimary ? 8 : 6}
      className="max-w-full"
    >
      <IntlLink
        href={href}
        data-cursor="pointer"
        data-tone={tone}
        className={cn(
          "hero-cta group",
          isPrimary ? "hero-cta--primary" : "hero-cta--secondary",
          className,
        )}
      >
        {isPrimary ? <span aria-hidden="true" className="hero-cta__sheen" /> : null}
        <span className="hero-cta__label">{children}</span>
        <span aria-hidden="true" className="hero-cta__well">
          <span className="hero-cta__arrow hero-cta__arrow--out">
            <ArrowRightIcon size={isPrimary ? 15 : 14} />
          </span>
          <span className="hero-cta__arrow hero-cta__arrow--in">
            <ArrowRightIcon size={isPrimary ? 15 : 14} />
          </span>
        </span>
      </IntlLink>
    </MagneticLink>
  );
}
