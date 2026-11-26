import Image from "next/image";
import { LogoMark } from "@/components/brand/LogoMark";
import { cn } from "@/components/ui/cn";

/**
 * Static placeholder for the hero visual until the Hero lane's scroll-pinned <HeroStage> lands:
 * the daylight volcano still (the story's opening frame) dissolving into the pearl page, the
 * code ribbon ring and the </> mark floating above the crater. Decorative only.
 */
export function HeroArt({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("home-hero-art", className)}>
      <div className="home-hero-art__sky" />
      <Image
        src="/media/hero/daylight.webp"
        alt=""
        fill
        priority
        sizes="(max-width: 1023px) 92vw, 640px"
        className="home-hero-art__image object-cover object-[50%_60%]"
      />
      <svg className="home-hero-art__ring" viewBox="0 0 400 90" fill="none" preserveAspectRatio="none">
        <defs>
          <linearGradient id="home-ring" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="var(--code-cyan)" stopOpacity="0" />
            <stop offset="0.22" stopColor="var(--code-cyan)" stopOpacity="0.85" />
            <stop offset="0.55" stopColor="var(--lava-400)" stopOpacity="0.95" />
            <stop offset="0.85" stopColor="var(--ember)" stopOpacity="0.75" />
            <stop offset="1" stopColor="var(--ember)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <ellipse cx="200" cy="45" rx="196" ry="38" stroke="url(#home-ring)" strokeWidth="2.5" />
        <ellipse cx="200" cy="45" rx="186" ry="31" stroke="url(#home-ring)" strokeWidth="1" strokeOpacity="0.5" />
      </svg>
      <div className="home-hero-art__mark">
        <LogoMark size={64} detail="simple" glow aria-hidden />
      </div>
    </div>
  );
}
