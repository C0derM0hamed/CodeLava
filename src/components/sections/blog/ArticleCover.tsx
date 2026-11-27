import { useId } from "react";
import Image from "next/image";
import { cn } from "@/components/ui/cn";
import type { MediaView } from "@/server/queries/types";

/** Bracket motif used when an article has no cover: a quiet code ornament, never a fake photo. */
export function BracketOrnament({ className }: { className?: string }) {
  const uid = useId().replace(/[:«»]/g, "");
  const cyanId = `bo-cyan-${uid}`;
  const lavaId = `bo-lava-${uid}`;
  return (
    <svg viewBox="0 0 160 100" fill="none" aria-hidden="true" className={cn("w-24", className)}>
      <defs>
        <linearGradient id={cyanId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--brand-cyan)" />
          <stop offset="1" stopColor="var(--brand-blue)" />
        </linearGradient>
        <linearGradient id={lavaId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--lava-400)" />
          <stop offset="1" stopColor="var(--lava-600)" />
        </linearGradient>
      </defs>
      <g strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M52 20 20 50l32 30" stroke={`url(#${cyanId})`} />
        <path d="M108 20l32 30-32 30" stroke={`url(#${lavaId})`} />
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
    <div
      className={cn(
        "relative aspect-[16/10] w-full overflow-hidden bg-[color-mix(in_oklab,var(--lava-100)_45%,var(--mist))]",
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-[color-mix(in_oklab,var(--ink-900)_8%,transparent)]",
        className,
      )}
    >
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
          className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.035] motion-reduce:group-hover:scale-100"
        />
      ) : (
        <div className="magma-grid-bg grid h-full w-full place-items-center">
          <BracketOrnament className="w-1/4 min-w-14 max-w-28 opacity-85" />
        </div>
      )}
    </div>
  );
}
