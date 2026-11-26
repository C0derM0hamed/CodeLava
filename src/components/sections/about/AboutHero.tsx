import type { CSSProperties } from "react";
import Image from "next/image";
import { HomeHeroCopy } from "@/components/sections/home/HomeHeroCopy";

/** About hero: same copy block as the home hero beside the framed brand key art. */
export function AboutHero({
  eyebrow,
  title,
  description,
  primaryLabel,
  secondaryLabel,
  imageAlt,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  primaryLabel: string;
  secondaryLabel: string;
  imageAlt: string;
}) {
  return (
    <section
      aria-labelledby="about-hero-title"
      className="page-wash relative overflow-hidden pt-[calc(var(--header-h)+3rem)] pb-12 sm:pt-[calc(var(--header-h)+4.5rem)] lg:pb-20"
    >
      <div className="container-lava grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
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
        <div className="home-hero-enter relative lg:col-span-6" style={{ "--enter-delay": "160ms" } as CSSProperties}>
          <div
            aria-hidden="true"
            className="absolute -inset-6 -z-10 rounded-[40px] bg-[radial-gradient(60%_60%_at_50%_60%,color-mix(in_oklab,var(--lava-400)_28%,transparent),transparent)] blur-2xl"
          />
          <div className="home-key-art aspect-[16/10]">
            <Image src="/brand/logo-key-art.png" alt={imageAlt} fill priority sizes="(max-width: 1023px) 92vw, 600px" className="object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}
