import Image from "next/image";
import { cn } from "@/components/ui/cn";
import type { MediaView } from "@/server/queries/types";

/** Bracket motif used when an article has no cover: a quiet code ornament, never a fake photo. */
export function BracketOrnament({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 100" fill="none" aria-hidden="true" className={cn("w-24", className)}>
      <defs>
        <linearGradient id="bo-cyan" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#28d7f0" />
          <stop offset="1" stopColor="#2f8bff" />
        </linearGradient>
        <linearGradient id="bo-lava" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7802b" />
          <stop offset="1" stopColor="#d9480a" />
        </linearGradient>
      </defs>
      <g strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M52 20 20 50l32 30" stroke="url(#bo-cyan)" />
        <path d="M108 20l32 30-32 30" stroke="url(#bo-lava)" />
        <path d="M89 14 71 86" stroke="var(--ink-900)" opacity="0.85" />
      </g>
    </svg>
  );
}

export function ArticleCover({
  cover,
  title,
  sizes,
  priority = false,
  className,
}: {
  cover: MediaView | null;
  title: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative aspect-[16/10] w-full overflow-hidden bg-[color-mix(in_oklab,var(--lava-100)_55%,var(--mist))]", className)}>
      {cover ? (
        <Image
          src={cover.url}
          alt={cover.alt || title}
          width={cover.width ?? 1280}
          height={cover.height ?? 800}
          sizes={sizes}
          priority={priority}
          placeholder={cover.blurDataUrl ? "blur" : "empty"}
          blurDataURL={cover.blurDataUrl ?? undefined}
          className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
        />
      ) : (
        <div className="grid h-full w-full place-items-center">
          <BracketOrnament className="w-1/4 min-w-14 max-w-28 opacity-80" />
        </div>
      )}
    </div>
  );
}
