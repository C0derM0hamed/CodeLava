import type { ReactNode } from "react";
import { HeroArt } from "./HeroArt";

/**
 * Hero shell. The copy (<HomeHeroCopy>) is passed as children so the visual can be swapped
 * without touching it. When the Hero lane ships `src/experience/volcano/HeroStage.tsx`, replace
 * the body of this component with:
 *
 *   import { HeroStage } from "@/experience/volcano/HeroStage";
 *   return <HeroStage locale={locale}>{children}</HeroStage>;
 *
 * Until then: copy start, static volcano end, both above the fold on desktop.
 */
export function HomeHero({
  children,
  titleId = "home-hero-title",
}: {
  locale: string;
  children: ReactNode;
  titleId?: string;
}) {
  return (
    <section
      aria-labelledby={titleId}
      className="page-wash relative overflow-hidden pt-[calc(var(--header-h)+2.5rem)] pb-10 sm:pt-[calc(var(--header-h)+3.5rem)] lg:pb-14"
    >
      <div className="container-lava grid items-center gap-8 lg:min-h-[min(640px,calc(100svh-var(--header-h)-7rem))] lg:grid-cols-12 lg:gap-6">
        <div className="relative z-10 lg:col-span-6">{children}</div>
        <HeroArt className="-mx-4 sm:mx-auto sm:w-[82%] lg:col-span-6 lg:-me-10 lg:ms-0 lg:w-auto" />
      </div>
    </section>
  );
}
