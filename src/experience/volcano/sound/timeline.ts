import type { VolcanoSoundThresholds } from "./types";

export const DEFAULT_THRESHOLDS: VolcanoSoundThresholds = {
  eruptionOn: 0.26,
  eruptionRearm: 0.14,
  logoOn: 0.80,
  logoRearm: 0.64,
  codeMilestones: [0.33, 0.43, 0.53, 0.63],
  codeHysteresis: 0.06,
  eruptionCooldownMs: 3500,
  logoCooldownMs: 3000,
  codeCooldownMs: 420,
  postEruptionCodeDelayMs: 450,
};

export interface ContinuousBedParams {
  rumbleGain: number;
  rumbleCutoffHz: number;
  lavaGain: number;
  lavaCutoffHz: number;
}

export interface TimelineCueEvent {
  type: "eruption" | "code" | "logo";
  /** Variant index (0..2) for code bursts. */
  variant?: number;
  /** Stereo pan hint (-0.4..0.4) for code bursts. */
  pan?: number;
}

export interface TimelineStepResult {
  beds: ContinuousBedParams;
  events: TimelineCueEvent[];
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge1 <= edge0) return x >= edge1 ? 1 : 0;
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * Pure, deterministic scroll-to-sound state machine.
 * Enforces upward-only directional crossing, hysteresis bands, cooldowns,
 * rapid-jump suppression, and reduced-motion attenuation so reversible
 * scrolling can never spam or overlap transient cues.
 */
export class VolcanoSoundTimeline {
  private thresholds: VolcanoSoundThresholds;
  private initialized = false;
  private lastProgress = 0;

  private eruptionArmed = true;
  private logoArmed = true;
  private codeArmed: boolean[];

  private lastEruptionAt = -Infinity;
  private lastLogoAt = -Infinity;
  private lastCodeAt = -Infinity;
  private codeVariantCursor = 0;

  constructor(overrides?: Partial<VolcanoSoundThresholds>) {
    this.thresholds = {
      ...DEFAULT_THRESHOLDS,
      ...overrides,
      codeMilestones: overrides?.codeMilestones ?? DEFAULT_THRESHOLDS.codeMilestones,
    };
    this.codeArmed = this.thresholds.codeMilestones.map(() => true);
  }

  public configure(overrides: Partial<VolcanoSoundThresholds>): void {
    this.thresholds = {
      ...this.thresholds,
      ...overrides,
      codeMilestones: overrides.codeMilestones ?? this.thresholds.codeMilestones,
    };
    this.codeArmed = this.thresholds.codeMilestones.map(
      (m) => this.lastProgress <= m - this.thresholds.codeHysteresis,
    );
    this.eruptionArmed = this.lastProgress <= this.thresholds.eruptionRearm;
    this.logoArmed = this.lastProgress <= this.thresholds.logoRearm;
  }

  /**
   * Aligns internal arm/disarm state to the current scroll position without
   * firing past cues (e.g., when the user toggles sound ON partway down the hero).
   */
  public syncPosition(progress: number): void {
    const p = clamp01(progress);
    this.initialized = true;
    this.lastProgress = p;
    this.eruptionArmed = p <= this.thresholds.eruptionRearm;
    this.logoArmed = p <= this.thresholds.logoRearm;
    this.codeArmed = this.thresholds.codeMilestones.map(
      (m) => p <= m - this.thresholds.codeHysteresis,
    );
  }

  public computeBeds(progress: number, reducedMotion: boolean): ContinuousBedParams {
    const p = clamp01(progress);

    if (reducedMotion) {
      // Gentle, steady volcanic ambience under prefers-reduced-motion
      const calmTaper = 1 - smoothstep(0.88, 1.0, p) * 0.55;
      return {
        rumbleGain: 0.13 * calmTaper,
        rumbleCutoffHz: 135,
        lavaGain: 0.09 * calmTaper,
        lavaCutoffHz: 850,
      };
    }

    // Volcanic rumble rises with pressure from calm -> eruption peak, eases on logo reveal -> exit
    const pressureRise = smoothstep(0.03, 0.34, p);
    const eruptivePeak = smoothstep(0.22, 0.44, p) * (1 - smoothstep(0.66, 0.88, p));
    const exitTaper = 1 - smoothstep(0.84, 1.0, p) * 0.72;

    const rumbleGain = (0.11 + pressureRise * 0.21 + eruptivePeak * 0.09) * exitTaper;
    const rumbleCutoffHz = 95 + pressureRise * 195 + eruptivePeak * 115;

    // Lava bubbling/flow swells through ignition, eruption and code-ribbon flow, softening for logo clarity
    const lavaSwell = smoothstep(0.06, 0.32, p);
    const lavaRibbon = smoothstep(0.26, 0.55, p) * (1 - smoothstep(0.72, 0.90, p));
    const lavaLogoDuck = 1 - smoothstep(0.78, 0.96, p) * 0.65;

    const lavaGain = (0.055 + lavaSwell * 0.17 + lavaRibbon * 0.085) * lavaLogoDuck;
    const lavaCutoffHz = 480 + lavaSwell * 1650 + lavaRibbon * 1150;

    return {
      rumbleGain,
      rumbleCutoffHz,
      lavaGain,
      lavaCutoffHz,
    };
  }

  public step(progress: number, nowMs: number, reducedMotion: boolean): TimelineStepResult {
    const p = clamp01(progress);
    const beds = this.computeBeds(p, reducedMotion);

    if (!this.initialized) {
      this.syncPosition(p);
      return { beds, events: [] };
    }

    const prev = this.lastProgress;
    const delta = p - prev;
    this.lastProgress = p;

    const events: TimelineCueEvent[] = [];
    const t = this.thresholds;

    // 1. Re-arm thresholds only after scrolling back past hysteresis bands
    if (!this.eruptionArmed && p <= t.eruptionRearm) {
      this.eruptionArmed = true;
    }
    if (!this.logoArmed && p <= t.logoRearm) {
      this.logoArmed = true;
    }
    for (let i = 0; i < t.codeMilestones.length; i++) {
      if (!this.codeArmed[i] && p <= t.codeMilestones[i] - t.codeHysteresis) {
        this.codeArmed[i] = true;
      }
    }

    // Reverse scroll or reduced motion: never fire forward transient hits
    if (delta <= 0 || reducedMotion) {
      return { beds, events };
    }

    // Detect sudden teleport jumps (e.g., "Skip animation" link or instant scrollbar drag)
    const isMassiveJump = delta > 0.38;

    // 2. Powerful eruption hit (single threshold, strict hysteresis & cooldown)
    if (this.eruptionArmed && prev < t.eruptionOn && p >= t.eruptionOn) {
      this.eruptionArmed = false;
      if (!isMassiveJump && nowMs - this.lastEruptionAt >= t.eruptionCooldownMs) {
        this.lastEruptionAt = nowMs;
        events.push({ type: "eruption" });
      }
    }

    // 3. Light digital code effects as code bursts (suppressed during jumps & right after blast)
    const isCodeJump = delta > 0.30;
    let codeFiredThisStep = false;
    for (let i = 0; i < t.codeMilestones.length; i++) {
      const milestone = t.codeMilestones[i];
      if (this.codeArmed[i] && prev < milestone && p >= milestone) {
        this.codeArmed[i] = false;
        const cooldownOk = nowMs - this.lastCodeAt >= t.codeCooldownMs;
        const postBlastOk = nowMs - this.lastEruptionAt >= t.postEruptionCodeDelayMs;
        if (!isCodeJump && !codeFiredThisStep && cooldownOk && postBlastOk) {
          this.lastCodeAt = nowMs;
          codeFiredThisStep = true;
          const variant = this.codeVariantCursor % 3;
          this.codeVariantCursor += 1;
          const panPattern = [-0.34, 0.32, -0.18, 0.24];
          events.push({
            type: "code",
            variant,
            pan: panPattern[i % panPattern.length],
          });
        }
      }
    }

    // 4. Distinctive CodeLava logo reveal signature
    if (this.logoArmed && prev < t.logoOn && p >= t.logoOn) {
      this.logoArmed = false;
      if (!isMassiveJump && nowMs - this.lastLogoAt >= t.logoCooldownMs) {
        this.lastLogoAt = nowMs;
        events.push({ type: "logo" });
      }
    }

    return { beds, events };
  }
}
