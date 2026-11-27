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

/** Recognized brand accents & clean badge glyphs for standard stack technologies. */
const TECH_PALETTE: Record<string, { color: string; badge: string }> = {
  "next-js": { color: "#151a29", badge: "N" },
  nextdotjs: { color: "#151a29", badge: "N" },
  react: { color: "#00b4d8", badge: "Re" },
  typescript: { color: "#3178c6", badge: "TS" },
  "tailwind-css": { color: "#06b6d4", badge: "TW" },
  tailwindcss: { color: "#06b6d4", badge: "TW" },
  "node-js": { color: "#339933", badge: "JS" },
  nodedotjs: { color: "#339933", badge: "JS" },
  python: { color: "#3776ab", badge: "Py" },
  fastapi: { color: "#009688", badge: "FA" },
  postgresql: { color: "#336791", badge: "PG" },
  redis: { color: "#dc382d", badge: "Rd" },
  flutter: { color: "#02569b", badge: "Fl" },
  swift: { color: "#f05138", badge: "Sw" },
  kotlin: { color: "#7f52ff", badge: "Kt" },
  pytorch: { color: "#ee4c2c", badge: "PT" },
  "hugging-face": { color: "#f59e0b", badge: "HF" },
  huggingface: { color: "#f59e0b", badge: "HF" },
  docker: { color: "#2496ed", badge: "Dk" },
  cloudflare: { color: "#f38020", badge: "CF" },
  "github-actions": { color: "#2088ff", badge: "GA" },
  githubactions: { color: "#2088ff", badge: "GA" },
  figma: { color: "#a259ff", badge: "Fg" },
};

/**
 * Brand-tinted technology badge. Uses uploaded media icon when present, otherwise a crisp
 * brand-accented geometric badge so technology grids look intentional and cohesive.
 */
export function TechnologyLogo({
  technology,
  size = "md",
  bare = false,
  className,
}: {
  technology: Pick<Technology, "name" | "icon" | "color"> & Partial<Pick<Technology, "slug" | "iconSlug">>;
  size?: "sm" | "md" | "lg";
  bare?: boolean;
  className?: string;
}) {
  const key = (technology.iconSlug || technology.slug || technology.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")).toLowerCase();
  const preset = TECH_PALETTE[key];
  const brand =
    technology.color && HEX.test(technology.color)
      ? technology.color
      : preset?.color ?? "#e94e06";
  const glyph = preset?.badge ?? monogram(technology.name);

  const box = size === "lg" ? "size-16 rounded-2xl" : size === "sm" ? "size-10 rounded-xl" : "size-14 rounded-2xl";
  const img = size === "lg" ? 40 : size === "sm" ? 24 : 32;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative grid shrink-0 place-items-center border transition-transform duration-300",
        box,
        className,
      )}
      style={{
        backgroundColor: `color-mix(in oklab, ${brand} ${bare ? "11%" : "10%"}, white)`,
        borderColor: `color-mix(in oklab, ${brand} 24%, transparent)`,
      }}
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
            "font-mono font-bold tracking-tight",
            size === "lg" ? "text-xl" : size === "sm" ? "text-[0.8125rem]" : "text-base",
          )}
          style={{ color: `color-mix(in oklab, ${brand} 45%, var(--ink-900))` }}
        >
          {glyph}
        </span>
      )}
      <span className="absolute end-1.5 top-1.5 size-1.5 rounded-full opacity-80" style={{ backgroundColor: brand }} />
    </span>
  );
}
