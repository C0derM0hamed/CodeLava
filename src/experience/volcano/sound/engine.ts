import { loadVolcanoAudioBuffers } from "./assets";
import {
  createProceduralLavaBuffer,
  createProceduralRumbleBuffer,
  playProceduralCodeSpark,
  playProceduralEruption,
  playProceduralLogoSignature,
  playSubtleUnlockCue,
} from "./synth-fallback";
import type { ContinuousBedParams, TimelineCueEvent } from "./timeline";
import type { SoundStemId } from "./types";

interface ActiveVoice {
  source: AudioBufferSourceNode;
  gain: GainNode;
}

const CODE_STEMS: readonly SoundStemId[] = ["code1", "code2", "code3"];
const MASTER_TARGET_GAIN = 0.85;
const SILENT_GAIN = 0.0001;
const MAX_CODE_VOICES = 2;

function getAudioContextConstructor(): typeof AudioContext | null {
  if (typeof window === "undefined") return null;
  const win = window as Window & { webkitAudioContext?: typeof AudioContext };
  return window.AudioContext ?? win.webkitAudioContext ?? null;
}

/**
 * Low-level Web Audio API mixer & voice manager for the volcano hero soundscape.
 * Maintains a single AudioContext with a safety DynamicsCompressor, smooth bed
 * cross-modulation, strict single-instance/voice-capped one-shots, and click-free
 * fade-out + suspend when muted or hidden.
 */
export class VolcanoSoundEngine {
  private ctx: AudioContext | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private masterGain: GainNode | null = null;
  private bedDuckGain: GainNode | null = null;

  private rumbleFilter: BiquadFilterNode | null = null;
  private rumbleGain: GainNode | null = null;
  private rumbleSource: AudioBufferSourceNode | null = null;

  private lavaFilter: BiquadFilterNode | null = null;
  private lavaGain: GainNode | null = null;
  private lavaSource: AudioBufferSourceNode | null = null;

  private buffers: Partial<Record<SoundStemId, AudioBuffer>> = {};
  private buffersLoaded = false;
  private loadPromise: Promise<void> | null = null;
  private loadAbort: AbortController | null = null;

  private eruptionVoice: ActiveVoice | null = null;
  private logoVoice: ActiveVoice | null = null;
  private codeVoices: ActiveVoice[] = [];

  private audible = false;
  private suspendTimer: ReturnType<typeof setTimeout> | null = null;
  private disposed = false;

  /**
   * Synchronously creates and resumes the AudioContext (safe to call directly inside
   * a click/keydown gesture handler for iOS Safari / Chrome autoplay policies).
   */
  public ensureContext(): AudioContext | null {
    if (this.disposed) return null;
    if (!this.ctx) {
      const Ctor = getAudioContextConstructor();
      if (!Ctor) return null;
      try {
        const ctx = new Ctor();
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.value = -12;
        compressor.knee.value = 18;
        compressor.ratio.value = 4;
        compressor.attack.value = 0.004;
        compressor.release.value = 0.18;

        const masterGain = ctx.createGain();
        masterGain.gain.value = SILENT_GAIN;

        const bedDuckGain = ctx.createGain();
        bedDuckGain.gain.value = 1.0;

        const rumbleFilter = ctx.createBiquadFilter();
        rumbleFilter.type = "lowpass";
        rumbleFilter.frequency.value = 110;
        rumbleFilter.Q.value = 0.85;

        const rumbleGain = ctx.createGain();
        rumbleGain.gain.value = 0.11;

        const lavaFilter = ctx.createBiquadFilter();
        lavaFilter.type = "lowpass";
        lavaFilter.frequency.value = 540;
        lavaFilter.Q.value = 0.75;

        const lavaGain = ctx.createGain();
        lavaGain.gain.value = 0.06;

        rumbleFilter.connect(rumbleGain);
        rumbleGain.connect(bedDuckGain);
        lavaFilter.connect(lavaGain);
        lavaGain.connect(bedDuckGain);
        bedDuckGain.connect(compressor);
        compressor.connect(masterGain);
        masterGain.connect(ctx.destination);

        this.ctx = ctx;
        this.compressor = compressor;
        this.masterGain = masterGain;
        this.bedDuckGain = bedDuckGain;
        this.rumbleFilter = rumbleFilter;
        this.rumbleGain = rumbleGain;
        this.lavaFilter = lavaFilter;
        this.lavaGain = lavaGain;
      } catch {
        return null;
      }
    }
    return this.ctx;
  }

  public isRunning(): boolean {
    return this.ctx?.state === "running";
  }

  public isReady(): boolean {
    return this.buffersLoaded;
  }

  public async resume(): Promise<boolean> {
    const ctx = this.ensureContext();
    if (!ctx) return false;
    if (ctx.state === "running") return true;
    try {
      await ctx.resume();
      return (ctx.state as AudioContextState) === "running";
    } catch {
      return false;
    }
  }

  /**
   * Lazily fetches & decodes compressed Opus/AAC assets once, only after user opts in.
   */
  public async loadAssets(): Promise<void> {
    if (this.disposed || this.buffersLoaded) return;
    if (this.loadPromise) return this.loadPromise;

    const ctx = this.ensureContext();
    if (!ctx) return;

    const abort = new AbortController();
    this.loadAbort = abort;

    this.loadPromise = (async () => {
      try {
        const decoded = await loadVolcanoAudioBuffers(ctx, abort.signal);
        if (abort.signal.aborted || this.disposed) return;
        this.buffers = decoded;
        this.buffersLoaded = true;
        if (this.audible) {
          this.ensureBedsRunning();
        }
      } finally {
        if (this.loadAbort === abort) {
          this.loadAbort = null;
        }
        if (!this.buffersLoaded) {
          this.loadPromise = null;
        }
      }
    })();

    return this.loadPromise;
  }

  public cancelPendingLoad(): void {
    this.loadAbort?.abort();
    this.loadAbort = null;
    if (!this.buffersLoaded) {
      this.loadPromise = null;
    }
  }

  private ensureBedsRunning(): void {
    if (this.disposed || !this.ctx || !this.rumbleFilter || !this.lavaFilter) return;

    if (!this.rumbleSource) {
      const rumbleBuffer = this.buffers.rumble ?? createProceduralRumbleBuffer(this.ctx);
      const src = this.ctx.createBufferSource();
      src.buffer = rumbleBuffer;
      src.loop = true;
      src.connect(this.rumbleFilter);
      try {
        src.start(0);
        this.rumbleSource = src;
      } catch {
        // Ignore start failures on closed context
      }
    }

    if (!this.lavaSource) {
      const lavaBuffer = this.buffers.lava ?? createProceduralLavaBuffer(this.ctx);
      const src = this.ctx.createBufferSource();
      src.buffer = lavaBuffer;
      src.loop = true;
      src.connect(this.lavaFilter);
      try {
        src.start(0);
        this.lavaSource = src;
      } catch {
        // Ignore start failures on closed context
      }
    }
  }

  public setAudible(next: boolean, beds?: ContinuousBedParams): void {
    if (this.disposed) return;
    if (this.suspendTimer) {
      clearTimeout(this.suspendTimer);
      this.suspendTimer = null;
    }

    this.audible = next;
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(Math.max(SILENT_GAIN, this.masterGain.gain.value), now);

    if (next) {
      if (this.ctx.state === "suspended") {
        void this.ctx.resume().catch(() => {});
      }
      if (this.buffersLoaded) {
        this.ensureBedsRunning();
      }
      if (beds) {
        this.updateBeds(beds, true);
      }
      this.masterGain.gain.setTargetAtTime(MASTER_TARGET_GAIN, now, 0.11);
    } else {
      // Smooth ~350ms fade-out before suspending AudioContext to save battery/CPU
      this.masterGain.gain.setTargetAtTime(SILENT_GAIN, now, 0.085);
      const targetCtx = this.ctx;
      this.suspendTimer = setTimeout(() => {
        this.suspendTimer = null;
        if (!this.audible && !this.disposed && targetCtx.state === "running") {
          void targetCtx.suspend().catch(() => {});
        }
      }, 420);
    }
  }

  public playUnlockCue(): void {
    if (this.disposed || !this.ctx || !this.compressor || this.ctx.state !== "running") return;
    playSubtleUnlockCue(this.ctx, this.compressor);
  }

  public updateBeds(beds: ContinuousBedParams, immediate = false): void {
    if (
      this.disposed ||
      !this.ctx ||
      !this.rumbleGain ||
      !this.rumbleFilter ||
      !this.lavaGain ||
      !this.lavaFilter
    ) {
      return;
    }

    const now = this.ctx.currentTime;
    const tc = immediate ? 0.03 : 0.12;
    this.rumbleGain.gain.setTargetAtTime(Math.max(0, beds.rumbleGain), now, tc);
    this.rumbleFilter.frequency.setTargetAtTime(beds.rumbleCutoffHz, now, tc);
    this.lavaGain.gain.setTargetAtTime(Math.max(0, beds.lavaGain), now, tc);
    this.lavaFilter.frequency.setTargetAtTime(beds.lavaCutoffHz, now, tc);
  }

  public triggerEvents(events: readonly TimelineCueEvent[]): void {
    if (this.disposed || !this.audible || !this.ctx || !this.compressor) return;
    if (this.ctx.state !== "running") return;

    for (const ev of events) {
      if (ev.type === "eruption") {
        this.playEruption();
      } else if (ev.type === "code") {
        this.playCodeBurst(ev.variant ?? 0, ev.pan ?? 0);
      } else if (ev.type === "logo") {
        this.playLogoReveal();
      }
    }
  }

  private fadeAndStopVoice(voice: ActiveVoice | null, fadeSec = 0.055): void {
    if (!voice || !this.ctx) return;
    const now = this.ctx.currentTime;
    try {
      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setValueAtTime(Math.max(SILENT_GAIN, voice.gain.gain.value), now);
      voice.gain.gain.linearRampToValueAtTime(SILENT_GAIN, now + fadeSec);
      voice.source.stop(now + fadeSec + 0.01);
    } catch {
      // Voice already stopped
    }
  }

  private playEruption(): void {
    if (!this.ctx || !this.compressor) return;
    const buffer = this.buffers.eruption;
    if (!buffer) {
      playProceduralEruption(this.ctx, this.compressor);
      return;
    }

    // Strict single-instance eruption voice
    if (this.eruptionVoice) {
      this.fadeAndStopVoice(this.eruptionVoice, 0.05);
      this.eruptionVoice = null;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.88;
    source.connect(gain);
    gain.connect(this.compressor);

    const voice: ActiveVoice = { source, gain };
    this.eruptionVoice = voice;
    source.onended = () => {
      if (this.eruptionVoice === voice) {
        this.eruptionVoice = null;
      }
      source.disconnect();
      gain.disconnect();
    };
    source.start(0);
  }

  private playCodeBurst(variant: number, pan: number): void {
    if (!this.ctx || !this.compressor) return;
    const stemId = CODE_STEMS[Math.abs(variant) % CODE_STEMS.length];
    const buffer = this.buffers[stemId];
    if (!buffer) {
      playProceduralCodeSpark(this.ctx, this.compressor, variant);
      return;
    }

    // Cap concurrent code sparks to prevent overlapping clutter
    while (this.codeVoices.length >= MAX_CODE_VOICES) {
      const oldest = this.codeVoices.shift() ?? null;
      this.fadeAndStopVoice(oldest, 0.04);
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    // Subtle musical micro-variation across scrolls
    const detuneRatios = [0.985, 1.0, 1.03];
    source.playbackRate.value = detuneRatios[Math.abs(variant) % detuneRatios.length];

    const gain = this.ctx.createGain();
    gain.gain.value = 0.42;

    let tailNode: AudioNode = gain;
    if (typeof this.ctx.createStereoPanner === "function") {
      const panner = this.ctx.createStereoPanner();
      panner.pan.value = Math.max(-0.6, Math.min(0.6, pan));
      source.connect(gain);
      gain.connect(panner);
      tailNode = panner;
    } else {
      source.connect(gain);
    }
    tailNode.connect(this.compressor);

    const voice: ActiveVoice = { source, gain };
    this.codeVoices.push(voice);
    source.onended = () => {
      const idx = this.codeVoices.indexOf(voice);
      if (idx !== -1) this.codeVoices.splice(idx, 1);
      source.disconnect();
      gain.disconnect();
      if (tailNode !== gain) tailNode.disconnect();
    };
    source.start(0);
  }

  private playLogoReveal(): void {
    if (!this.ctx || !this.compressor) return;
    const buffer = this.buffers.logo;

    // Gently duck rumble/lava bed so CodeLava's sonic signature breathes cleanly
    if (this.bedDuckGain) {
      const now = this.ctx.currentTime;
      this.bedDuckGain.gain.cancelScheduledValues(now);
      this.bedDuckGain.gain.setValueAtTime(this.bedDuckGain.gain.value, now);
      this.bedDuckGain.gain.linearRampToValueAtTime(0.68, now + 0.14);
      this.bedDuckGain.gain.setTargetAtTime(1.0, now + 1.15, 0.45);
    }

    if (!buffer) {
      playProceduralLogoSignature(this.ctx, this.compressor);
      return;
    }

    // Strict single-instance signature voice
    if (this.logoVoice) {
      this.fadeAndStopVoice(this.logoVoice, 0.08);
      this.logoVoice = null;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.78;
    source.connect(gain);
    gain.connect(this.compressor);

    const voice: ActiveVoice = { source, gain };
    this.logoVoice = voice;
    source.onended = () => {
      if (this.logoVoice === voice) {
        this.logoVoice = null;
      }
      source.disconnect();
      gain.disconnect();
    };
    source.start(0);
  }

  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.audible = false;
    this.cancelPendingLoad();
    if (this.suspendTimer) {
      clearTimeout(this.suspendTimer);
      this.suspendTimer = null;
    }
    try {
      this.rumbleSource?.stop();
      this.lavaSource?.stop();
      this.eruptionVoice?.source.stop();
      this.logoVoice?.source.stop();
      for (const v of this.codeVoices) v.source.stop();
    } catch {
      // Already stopped
    }
    this.rumbleSource = null;
    this.lavaSource = null;
    this.eruptionVoice = null;
    this.logoVoice = null;
    this.codeVoices = [];
    this.buffers = {};

    const ctx = this.ctx;
    this.ctx = null;
    this.compressor = null;
    this.masterGain = null;
    this.bedDuckGain = null;
    this.rumbleFilter = null;
    this.rumbleGain = null;
    this.lavaFilter = null;
    this.lavaGain = null;
    if (ctx && ctx.state !== "closed") {
      void ctx.close().catch(() => {});
    }
  }
}
