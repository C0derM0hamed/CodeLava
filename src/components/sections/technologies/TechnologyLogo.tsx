import Image from "next/image";
import { cn } from "@/components/ui/cn";
import type { Technology } from "@/server/queries/types";

function monogram(name: string) {
  const words = name.replace(/[^\p{L}\p{N}\s-]/gu, "").split(/[\s-]+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  const word = words[0] ?? name;
  const secondCapital = word.slice(1).match(/\p{Lu}/u)?.[0];
  if (secondCapital) return (word[0] + secondCapital).toUpperCase();
  return word[0].toUpperCase() + (word[1] ?? "").toLowerCase();
}

const HEX = /^#[0-9a-f]{3,8}$/i;

/**
 * White square logo tile. Uses the uploaded media icon when present, otherwise an elegant
 * monogram tinted with the technology's brand colour (never a fake logo).
 */
export function TechnologyLogo({
  technology,
  size = "md",
  bare = false,
  className,
}: {
  technology: Pick<Technology, "name" | "icon" | "color">;
  size?: "sm" | "md" | "lg";
  /** No tile chrome (when already placed on a white card). */
  bare?: boolean;
  className?: string;
}) {
  const brand = technology.color && HEX.test(technology.color) ? technology.color : null;
  const box = size === "lg" ? "size-16 rounded-2xl" : size === "sm" ? "size-11 rounded-xl" : "size-14 rounded-2xl";
  const img = size === "lg" ? 40 : size === "sm" ? 24 : 32;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative grid shrink-0 place-items-center",
        !bare && "border border-line bg-white shadow-xs",
        box,
        className,
      )}
      style={brand && !bare ? { backgroundColor: `color-mix(in oklab, ${brand} 9%, white)` } : undefined}
    >
      {technology.icon ? (
        <Image
          src={technology.icon.url}
          alt=""
          width={img}
          height={img}
          sizes={`${img}px`}
          className="object-contain"
          style={{ width: img, height: img }}
        />
      ) : (
        <span
          dir="ltr"
          className={cn(
            "font-display font-bold tracking-tight text-text",
            size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-lg",
          )}
        >
          {monogram(technology.name)}
        </span>
      )}
      {brand ? (
        <span className="absolute end-1.5 top-1.5 size-1.5 rounded-full" style={{ backgroundColor: brand }} />
      ) : null}
    </span>
  );
}
