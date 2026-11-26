import type { ReactNode } from "react";
import { HeroStage } from "@/experience/volcano/HeroStage";
import type { AppLocale } from "@/i18n/routing";

/**
 * Hero: the Hero lane's scroll-pinned volcano story with our copy block (<HomeHeroCopy>) as
 * children. The static <HeroArt> stays available as a fallback/placeholder.
 */
export function HomeHero({
  locale,
  children,
  titleId = "home-hero-title",
}: {
  locale: AppLocale;
  children: ReactNode;
  titleId?: string;
}) {
  return (
    <HeroStage locale={locale} titleId={titleId}>
      {children}
    </HeroStage>
  );
}
