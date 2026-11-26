"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HeatEdge } from "@/experience/fx/LavaDivider";
import type { MediaView } from "@/server/queries";
import { cn } from "@/components/ui/cn";

export interface CaseStudyMediaFrameProps {
  title: string;
  cover: MediaView | null;
  video: MediaView | null;
  playLabel: string;
  pauseLabel: string;
}

export function CaseStudyMediaFrame({
  title,
  cover,
  video,
  playLabel,
  pauseLabel,
}: CaseStudyMediaFrameProps) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const mediaInnerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // GSAP subtle depth scale on scroll (ScrollTrigger + Lenis aware)
  useEffect(() => {
    if (reducedMotion || typeof window === "undefined") return;
    const inner = mediaInnerRef.current;
    const frame = frameRef.current;
    if (!inner || !frame) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        inner,
        { scale: 1.05 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: frame,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    }, frame);

    return () => ctx.revert();
  }, [reducedMotion]);

  // Autoplay-on-visible video when not reduced motion
  useEffect(() => {
    const vid = videoRef.current;
    const frame = frameRef.current;
    if (!vid || !frame || !video || reducedMotion) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting ?? false;
        if (visible && !userPaused) {
          void vid.play().then(
            () => setIsPlaying(true),
            () => setIsPlaying(false),
          );
        } else {
          vid.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.25 },
    );

    io.observe(frame);
    return () => io.disconnect();
  }, [video, reducedMotion, userPaused]);

  const togglePlayback = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      setUserPaused(false);
      void vid.play().then(
        () => setIsPlaying(true),
        () => setIsPlaying(false),
      );
    } else {
      setUserPaused(true);
      vid.pause();
      setIsPlaying(false);
    }
  };

  if (!cover && !video) return null;

  return (
    <div
      ref={frameRef}
      className="relative overflow-hidden rounded-[var(--radius-lg)] border border-line-strong bg-bg-elevated shadow-[0_28px_80px_-28px_rgba(0,0,0,0.85)]"
    >
      <div
        ref={mediaInnerRef}
        className="relative aspect-[16/9] w-full overflow-hidden will-change-transform sm:aspect-[16/9]"
      >
        {/* Poster / Cover Image (always rendered as LCP anchor & reduced-motion fallback) */}
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.alt || title}
            width={cover.width ?? 1920}
            height={cover.height ?? 1080}
            sizes="(max-width: 768px) 100vw, (max-width: 1440px) 92vw, 1360px"
            priority
            placeholder={cover.blurDataUrl ? "blur" : "empty"}
            blurDataURL={cover.blurDataUrl ?? undefined}
            className="h-full w-full object-cover"
          />
        ) : null}

        {/* Muted autoplay-on-visible video when present and reduced motion is off */}
        {video && !reducedMotion ? (
          <video
            ref={videoRef}
            src={video.url}
            poster={cover?.url}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={title}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
              isPlaying || !cover ? "opacity-100" : "opacity-0",
            )}
          />
        ) : null}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian-950/60 via-transparent to-obsidian-950/15"
        />
      </div>

      {video && !reducedMotion ? (
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={isPlaying ? pauseLabel : playLabel}
          data-cursor="pointer"
          className="absolute end-4 bottom-4 z-10 inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-line-strong bg-obsidian-950/85 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-text backdrop-blur-md transition-colors hover:border-line-lava-strong hover:text-lava-100"
        >
          <span
            aria-hidden="true"
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              isPlaying ? "bg-accent shadow-[0_0_8px_var(--lava-500)]" : "bg-ash-500",
            )}
          />
          <span>{isPlaying ? pauseLabel : playLabel}</span>
        </button>
      ) : null}

      <HeatEdge position="bottom" intensity="medium" />
    </div>
  );
}
