"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { getVolcanoSoundController } from "./controller";
import type {
  UseVolcanoSoundOptions,
  UseVolcanoSoundReturn,
  VolcanoSoundState,
} from "./types";

const SERVER_SNAPSHOT: VolcanoSoundState = {
  enabled: false,
  loading: false,
  ready: false,
  active: false,
  reducedMotion: false,
};

/**
 * React hook connecting HeroStage to the optional volcanic soundscape.
 *
 * - Muted by default; persists user choice in localStorage (try/catch).
 * - Lazy-loads compressed Opus/AAC audio only after the user enables sound.
 * - Automatically fades out when the hero leaves the viewport (via `stageRef`)
 *   or when the browser tab becomes hidden.
 * - Respects `prefers-reduced-motion` while keeping the toggle functional.
 */
export function useVolcanoSound(options: UseVolcanoSoundOptions = {}): UseVolcanoSoundReturn {
  const {
    stageRef,
    controller: customController,
    thresholds,
    autoTrackEnvironment = true,
  } = options;

  const controller = customController ?? getVolcanoSoundController();

  const state = useSyncExternalStore(
    useCallback((cb: () => void) => controller.subscribe(cb), [controller]),
    useCallback(() => controller.getState(), [controller]),
    () => SERVER_SNAPSHOT,
  );

  // Apply custom threshold overrides when provided
  useEffect(() => {
    if (thresholds) {
      controller.configureThresholds(thresholds);
    }
  }, [controller, thresholds]);

  // Hydrate saved localStorage choice & observe tab visibility + reduced motion
  useEffect(() => {
    controller.hydratePreference();
    if (!autoTrackEnvironment) return;

    const motionQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    const syncMotion = () => {
      if (motionQuery) controller.setReducedMotion(motionQuery.matches);
    };
    const syncVisibility = () => {
      controller.setDocumentHidden(document.hidden);
    };

    syncMotion();
    syncVisibility();

    motionQuery?.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", syncVisibility);

    return () => {
      motionQuery?.removeEventListener("change", syncMotion);
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, [controller, autoTrackEnvironment]);

  // Fade out automatically when the hero stage leaves the viewport
  useEffect(() => {
    const el = stageRef?.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          controller.setInView(entry.isIntersecting);
        }
      },
      { threshold: 0.01 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      controller.setInView(false);
    };
  }, [controller, stageRef]);

  const toggle = useCallback(() => controller.toggle(), [controller]);
  const setEnabled = useCallback((next: boolean) => controller.setEnabled(next), [controller]);
  const setProgress = useCallback((p: number) => controller.setProgress(p), [controller]);
  const setInView = useCallback((visible: boolean) => controller.setInView(visible), [controller]);

  return {
    ...state,
    toggle,
    setEnabled,
    setProgress,
    setInView,
    controller,
  };
}
