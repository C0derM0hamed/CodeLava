import type { CSSProperties } from "react";
import Image from "next/image";
import { HomeHeroCopy } from "@/components/sections/home/HomeHeroCopy";

export interface AboutHeroHighlight {
  value: string;
  label: string;
}

/** About hero: Daylight Magma editorial split with framed brand key art & live proof strip. */
export function AboutHero({
  eyebrow,
  title,
  description,
  primaryLabel,
  secondaryLabel,
  imageAlt,
  highlights = [],
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  primaryLabel: string;
  secondaryLabel: string;
  imageAlt: string;
  highlights?: AboutHeroHighlight[];
}) {
  return (
    <section
      aria-labelledby="about-hero-title"
      className="about-hero-stage pt-[calc(var(--header-h)+var(--hero-top))] pb-14 sm:pb-20"
    >
      <div aria-hidden="true" className="about-hero-grid" />

      <div className="container-lava relative grid items-center gap-[var(--space-split)] lg:grid-cols-12">
        <div className="lg:col-span-6">
          <HomeHeroCopy
            eyebrow={eyebrow}
            title={title}
            description={description}
            primaryLabel={primaryLabel}
            secondaryLabel={secondaryLabel}
            titleId="about-hero-title"
          />
        </div>

        <div
          className="home-hero-enter relative lg:col-span-6"
          style={{ "--enter-delay": "150ms" } as CSSProperties}
        >
          <div aria-hidden="true" className="about-key-art-halo" />

          <div className="about-key-art-shell">
            <div className="about-key-art-frame aspect-[16/10]">
              <Image
                src="/brand/logo-key-art.png"
                alt={imageAlt}
                fill
                priority
                sizes="(max-width: 1023px) 92vw, 640px"
                className="object-cover"
              />
            </div>

            {highlights.length > 0 ? (
              <dl className="mt-2.5 grid grid-cols-3 divide-x divide-line rounded-[var(--radius-md)] border border-line bg-surface/95 px-2 py-3 shadow-xs rtl:divide-x-reverse">
                {highlights.map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col items-center justify-center gap-0.5 px-2 text-center"
                  >
                    <dd
                      dir="ltr"
                      className="font-display text-lg font-bold text-accent-text tabular-nums sm:text-xl"
                    >
                      {item.value}
                    </dd>
                    <dt className="text-[11px] font-medium leading-tight text-muted sm:text-xs">
                      {item.label}
                    </dt>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        </div>
      </div>

      <div aria-hidden="true" className="about-heat-seam absolute inset-x-0 bottom-0" />
    </section>
  );
}
