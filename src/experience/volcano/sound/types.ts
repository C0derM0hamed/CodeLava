import type { RefObject } from "react";

export type SoundStemId =
  | "rumble"
  | "lava"
  | "eruption"
  | "code1"
  | "code2"
  | "code3"
  | "logo";

export interface VolcanoSoundThresholds {
  /** Scroll progress at which the eruption hit fires when scrolling downward. */
  eruptionOn: number;
  /** Scroll progress below which the eruption hit re-arms when scrolling back up. */
  eruptionRearm: number;
  /** Scroll progress at which the CodeLava logo signature fires. */
  logoOn: number;
  /** Scroll progress below which the logo signature re-arms. */
  logoRearm: number;
  /** Discrete progress checkpoints for light digital code bursts. */
  codeMilestones: readonly number[];
  /** Distance below each milestone required to re-arm that code burst. */
  codeHysteresis: number;
  /** Minimum ms between eruption hits. */
  eruptionCooldownMs: number;
  /** Minimum ms between logo signature plays. */
  logoCooldownMs: number;
  /** Minimum ms between code burst sparks. */
  codeCooldownMs: number;
  /** Quiet window (ms) after eruption hit before code sparks begin. */
  postEruptionCodeDelayMs: number;
}

export interface VolcanoSoundState {
  /** User's opt-in preference (muted/false by default). */
  enabled: boolean;
  /** True while compressed audio assets are being fetched and decoded. */
  loading: boolean;
  /** True once assets are ready (or procedural Web Audio fallback is active). */
  ready: boolean;
  /** True when audio is actively playing (enabled + unlocked + visible + tab active). */
  active: boolean;
  /** Reflects prefers-reduced-motion: reduce (toggle remains usable with softened audio). */
  reducedMotion: boolean;
}

export interface VolcanoSoundLabels {
  soundOn: string;
  soundOff: string;
  loading: string;
  enableAria: string;
  disableAria: string;
  statusOn: string;
  statusOff: string;
}

export interface VolcanoSoundController {
  getState(): VolcanoSoundState;
  subscribe(listener: () => void): () => void;
  /** Restores saved preference from localStorage on client mount without causing SSR mismatch. */
  hydratePreference(): void;
  /** Toggle sound on/off from a user gesture. */
  toggle(): void;
  /** Explicitly turn sound on or off and persist choice. */
  setEnabled(next: boolean): void;
  /** Feed normalized hero scroll progress (0..1) from HeroStage's scroll/rAF loop. */
  setProgress(progress: number): void;
  /** Inform engine whether the hero stage is currently intersecting the viewport. */
  setInView(inView: boolean): void;
  /** Inform engine whether the browser tab is hidden. */
  setDocumentHidden(hidden: boolean): void;
  /** Inform engine whether prefers-reduced-motion: reduce is active. */
  setReducedMotion(reduced: boolean): void;
  /** Override timeline thresholds if HeroStage's beat map shifts. */
  configureThresholds(thresholds: Partial<VolcanoSoundThresholds>): void;
  /** Release AudioContext, buffers, timers and listeners. */
  dispose(): void;
}

export interface UseVolcanoSoundOptions {
  /** Optional ref to the HeroStage root element for automatic IntersectionObserver fade-out. */
  stageRef?: RefObject<HTMLElement | null>;
  /** Custom controller instance (defaults to shared hero sound controller). */
  controller?: VolcanoSoundController;
  /** Optional threshold overrides to align with HeroStage's beat map. */
  thresholds?: Partial<VolcanoSoundThresholds>;
  /** Automatically observe document visibility and prefers-reduced-motion (default: true). */
  autoTrackEnvironment?: boolean;
}

export interface UseVolcanoSoundReturn extends VolcanoSoundState {
  toggle: () => void;
  setEnabled: (next: boolean) => void;
  setProgress: (progress: number) => void;
  setInView: (inView: boolean) => void;
  controller: VolcanoSoundController;
}
