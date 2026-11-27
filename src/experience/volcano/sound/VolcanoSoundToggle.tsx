"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useVolcanoSound } from "./useVolcanoSound";
import type { UseVolcanoSoundReturn, VolcanoSoundLabels } from "./types";
import "./sound.css";

export interface VolcanoSoundToggleProps {
  /** Optional hook return from `useVolcanoSound()`. Uses the shared hero controller if omitted. */
  sound?: Pick<UseVolcanoSoundReturn, "enabled" | "loading" | "active" | "reducedMotion" | "toggle">;
  /** Surface tone for contrast harmony: "dark" over obsidian hero (default), "light" over daylight pearl. */
  tone?: "dark" | "light";
  /** "floating" pins cleanly at top-end below the site header; "inline" renders in normal flow (e.g. inside cue bar). */
  position?: "floating" | "inline";
  /** Optional label overrides (e.g. for standalone lab pages outside NextIntlClientProvider). */
  labels?: VolcanoSoundLabels;
  className?: string;
}

function SoundIcon({ enabled, active }: { enabled: boolean; active: boolean }) {
  return (
    <span className="cl-sound-icon" aria-hidden="true">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M11 5L6 9H2v6h4l5 4V5z" />
        {enabled ? (
          <>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" className="cl-sound-wave-outer" />
          </>
        ) : (
          <>
            <line x1="22" y1="9" x2="16" y2="15" />
            <line x1="16" y1="9" x2="22" y2="15" />
          </>
        )}
      </svg>
      <span className="cl-sound-eq" data-active={active ? "true" : "false"}>
        <i />
        <i />
        <i />
      </span>
    </span>
  );
}

function VolcanoSoundToggleView({
  sound,
  tone = "dark",
  position = "floating",
  labels,
  className,
}: Omit<VolcanoSoundToggleProps, "labels"> & { labels: VolcanoSoundLabels }) {
  const hasExternalSound = Boolean(sound);
  const fallbackSound = useVolcanoSound({ autoTrackEnvironment: !hasExternalSound });
  const { setInView: fallbackSetInView } = fallbackSound;
  const api = sound ?? fallbackSound;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  // When rendered standalone without an explicit `sound` hook binding, automatically
  // fade out when the enclosing hero section scrolls out of the viewport.
  useEffect(() => {
    if (hasExternalSound) return;
    const node = wrapRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const target = node.closest<HTMLElement>("[data-daylight-stage], section") ?? node;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) fallbackSetInView(entry.isIntersecting);
      },
      { threshold: 0.01 },
    );
    observer.observe(target);
    return () => {
      observer.disconnect();
      fallbackSetInView(false);
    };
  }, [hasExternalSound, fallbackSetInView]);

  const visibleLabel = api.loading
    ? labels.loading
    : api.enabled
      ? labels.soundOn
      : labels.soundOff;

  const ariaLabel = api.enabled ? labels.disableAria : labels.enableAria;
  const liveStatus = hasInteracted
    ? api.enabled
      ? labels.statusOn
      : labels.statusOff
    : "";

  const handleClick = () => {
    setHasInteracted(true);
    api.toggle();
  };

  return (
    <div
      ref={wrapRef}
      className={[
        "cl-sound-wrap",
        position === "floating" ? "cl-sound-wrap--floating" : "cl-sound-wrap--inline",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        data-volcano-sound-toggle=""
        data-tone={tone}
        data-state={api.enabled ? "on" : "off"}
        aria-pressed={api.enabled}
        aria-label={ariaLabel}
        aria-busy={api.loading || undefined}
        onClick={handleClick}
        className="cl-sound-pill"
      >
        <SoundIcon enabled={api.enabled} active={api.active} />
        <span className="cl-sound-label">{visibleLabel}</span>
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {liveStatus}
      </span>
    </div>
  );
}

function VolcanoSoundToggleIntl(props: Omit<VolcanoSoundToggleProps, "labels">) {
  const t = useTranslations("heroSound");
  const labels: VolcanoSoundLabels = {
    soundOn: t("soundOn"),
    soundOff: t("soundOff"),
    loading: t("loading"),
    enableAria: t("enableAria"),
    disableAria: t("disableAria"),
    statusOn: t("statusOn"),
    statusOff: t("statusOff"),
  };
  return <VolcanoSoundToggleView {...props} labels={labels} />;
}

/**
 * Accessible, bilingual (EN/AR) Sound On/Off pill toggle for the CodeLava volcano hero.
 * Muted by default, keyboard navigable, supports `aria-pressed` and `prefers-reduced-motion`.
 */
export function VolcanoSoundToggle({ labels, ...rest }: VolcanoSoundToggleProps) {
  if (labels) {
    return <VolcanoSoundToggleView {...rest} labels={labels} />;
  }
  return <VolcanoSoundToggleIntl {...rest} />;
}
