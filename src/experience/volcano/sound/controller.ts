import { VolcanoSoundEngine } from "./engine";
import { VolcanoSoundTimeline } from "./timeline";
import type {
  VolcanoSoundController,
  VolcanoSoundState,
  VolcanoSoundThresholds,
} from "./types";

export const HERO_SOUND_STORAGE_KEY = "codelava:hero-sound";

function readStoredPreference(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(HERO_SOUND_STORAGE_KEY) === "on";
  } catch {
    return false;
  }
}

function writeStoredPreference(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HERO_SOUND_STORAGE_KEY, enabled ? "on" : "off");
  } catch {
    // Ignore storage quota or private-mode security errors
  }
}

function nowMs(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

export function createVolcanoSoundController(
  thresholds?: Partial<VolcanoSoundThresholds>,
): VolcanoSoundController {
  const engine = new VolcanoSoundEngine();
  const timeline = new VolcanoSoundTimeline(thresholds);
  const listeners = new Set<() => void>();

  let state: VolcanoSoundState = {
    enabled: false,
    loading: false,
    ready: false,
    active: false,
    reducedMotion: false,
  };

  let progress = 0;
  let inView = true;
  let documentHidden = false;
  let unlocked = false;
  let hydrated = false;
  let gestureUnlockCleanup: (() => void) | null = null;

  function emit(patch: Partial<VolcanoSoundState>): void {
    const next: VolcanoSoundState = { ...state, ...patch };
    if (
      next.enabled === state.enabled &&
      next.loading === state.loading &&
      next.ready === state.ready &&
      next.active === state.active &&
      next.reducedMotion === state.reducedMotion
    ) {
      return;
    }
    state = next;
    listeners.forEach((fn) => fn());
  }

  function clearGestureUnlock(): void {
    gestureUnlockCleanup?.();
    gestureUnlockCleanup = null;
  }

  function shouldBeAudible(): boolean {
    return state.enabled && unlocked && inView && !documentHidden;
  }

  function reconcileAudibility(): void {
    const nextAudible = shouldBeAudible();
    const beds = timeline.computeBeds(progress, state.reducedMotion);
    engine.setAudible(nextAudible, beds);
    emit({ active: nextAudible });
  }

  async function activateAndLazyLoad(playAck: boolean): Promise<void> {
    if (!state.enabled) return;

    // Create/resume synchronously inside user gesture whenever possible
    const resumed = await engine.resume();
    if (!state.enabled) return;

    if (!resumed) {
      // Browser autoplay policy blocked unlock (e.g. restored from localStorage before first tap)
      unlocked = false;
      armGestureUnlock();
      emit({ active: false });
      return;
    }

    unlocked = true;
    clearGestureUnlock();
    timeline.syncPosition(progress);

    if (playAck) {
      engine.playUnlockCue();
    }

    if (!engine.isReady()) {
      emit({ loading: true });
      await engine.loadAssets();
      if (!state.enabled) {
        emit({ loading: false, active: false });
        return;
      }
      emit({ loading: false, ready: engine.isReady() });
    } else {
      emit({ ready: true });
    }

    reconcileAudibility();
  }

  function armGestureUnlock(): void {
    if (typeof window === "undefined" || gestureUnlockCleanup) return;

    const onGesture = (event: Event) => {
      // If user clicked the sound toggle itself, let toggle() handle turning sound off cleanly
      if (
        event.target instanceof Element &&
        event.target.closest("[data-volcano-sound-toggle]")
      ) {
        return;
      }
      clearGestureUnlock();
      if (state.enabled) {
        void activateAndLazyLoad(false);
      }
    };

    window.addEventListener("pointerdown", onGesture, { passive: true });
    window.addEventListener("keydown", onGesture, { passive: true });
    gestureUnlockCleanup = () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
  }

  function setEnabledInternal(next: boolean, persist: boolean, fromUserToggle: boolean): void {
    if (persist) {
      writeStoredPreference(next);
    }

    if (!next) {
      clearGestureUnlock();
      engine.cancelPendingLoad();
      emit({ enabled: false, loading: false, active: false });
      engine.setAudible(false);
      return;
    }

    // Create AudioContext synchronously during user gesture before any await
    if (fromUserToggle) {
      engine.ensureContext();
    }

    emit({ enabled: true });
    void activateAndLazyLoad(fromUserToggle);
  }

  return {
    getState(): VolcanoSoundState {
      return state;
    },

    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    hydratePreference(): void {
      if (hydrated || typeof window === "undefined") return;
      hydrated = true;

      if (typeof window.matchMedia === "function") {
        emit({ reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches });
      }
      if (typeof document !== "undefined") {
        documentHidden = document.hidden;
      }

      // Muted by default unless the user previously turned sound ON in localStorage
      const savedOn = readStoredPreference();
      if (savedOn) {
        // Arm unlock on first user gesture so cold loads never violate autoplay or download early
        emit({ enabled: true });
        armGestureUnlock();
      }
    },

    toggle(): void {
      setEnabledInternal(!state.enabled, true, true);
    },

    setEnabled(next: boolean): void {
      setEnabledInternal(next, true, true);
    },

    setProgress(nextProgress: number): void {
      const clamped = Number.isFinite(nextProgress)
        ? Math.max(0, Math.min(1, nextProgress))
        : 0;
      progress = clamped;

      if (!state.enabled || !state.active) {
        // Keep timeline synced silently while muted or out of view so re-entry never misfires
        timeline.syncPosition(clamped);
        return;
      }

      const { beds, events } = timeline.step(clamped, nowMs(), state.reducedMotion);
      engine.updateBeds(beds);
      if (events.length > 0) {
        engine.triggerEvents(events);
      }
    },

    setInView(nextInView: boolean): void {
      if (inView === nextInView) return;
      inView = nextInView;
      if (!inView) {
        reconcileAudibility();
      } else if (state.enabled) {
        timeline.syncPosition(progress);
        reconcileAudibility();
      }
    },

    setDocumentHidden(hidden: boolean): void {
      if (documentHidden === hidden) return;
      documentHidden = hidden;
      if (hidden) {
        reconcileAudibility();
      } else if (state.enabled) {
        timeline.syncPosition(progress);
        reconcileAudibility();
      }
    },

    setReducedMotion(reduced: boolean): void {
      if (state.reducedMotion === reduced) return;
      emit({ reducedMotion: reduced });
      if (state.enabled && state.active) {
        engine.updateBeds(timeline.computeBeds(progress, reduced));
      }
    },

    configureThresholds(nextThresholds: Partial<VolcanoSoundThresholds>): void {
      timeline.configure(nextThresholds);
    },

    dispose(): void {
      clearGestureUnlock();
      engine.dispose();
      listeners.clear();
      unlocked = false;
      hydrated = false;
      state = {
        enabled: false,
        loading: false,
        ready: false,
        active: false,
        reducedMotion: false,
      };
    },
  };
}

let sharedController: VolcanoSoundController | null = null;

/**
 * Shared singleton controller so `HeroStage`, its scroll renderer, and `<VolcanoSoundToggle />`
 * can communicate seamlessly even across separate client modules without prop drilling.
 */
export function getVolcanoSoundController(): VolcanoSoundController {
  if (!sharedController) {
    sharedController = createVolcanoSoundController();
  }
  return sharedController;
}

/** Convenience facade for imperative callers (e.g. non-React scroll/rAF loops). */
export const volcanoSound = {
  setProgress(progress: number): void {
    getVolcanoSoundController().setProgress(progress);
  },
  setInView(inView: boolean): void {
    getVolcanoSoundController().setInView(inView);
  },
  toggle(): void {
    getVolcanoSoundController().toggle();
  },
  setEnabled(enabled: boolean): void {
    getVolcanoSoundController().setEnabled(enabled);
  },
  getState(): VolcanoSoundState {
    return getVolcanoSoundController().getState();
  },
};
