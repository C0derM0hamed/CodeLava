/**
 * Lightweight procedural Web Audio API fallback synthesizer.
 * Used only if a compressed audio asset cannot be fetched or decoded (e.g. offline mode),
 * and for the ultra-subtle toggle acknowledgement chime.
 */

function createNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + white * 0.029;
      b1 = 0.985 * b1 + white * 0.032;
      b2 = 0.95 * b2 + white * 0.048;
      data[i] = Math.tanh((b0 + b1 + b2 + white * 0.02) * 1.4);
    }
  }
  return buffer;
}

export function createProceduralRumbleBuffer(ctx: AudioContext): AudioBuffer {
  return createNoiseBuffer(ctx, 4.0);
}

export function createProceduralLavaBuffer(ctx: AudioContext): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * 4.0);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    let lp = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      lp = lp * 0.96 + white * 0.04;
      data[i] = lp * 2.2;
    }
    // Add a handful of viscous magma pops
    for (let b = 0; b < 18; b++) {
      const start = Math.floor((b / 18 + Math.random() * 0.04) * length) % length;
      const len = Math.floor(ctx.sampleRate * (0.06 + Math.random() * 0.06));
      const f0 = 110 + Math.random() * 140;
      let phase = 0;
      for (let j = 0; j < len; j++) {
        const u = j / len;
        const env = Math.sin(Math.min(1, u / 0.15) * Math.PI * 0.5) * Math.exp(-u * 4.5);
        phase += (2 * Math.PI * f0 * (1 + 0.6 * u)) / ctx.sampleRate;
        data[(start + j) % length] += Math.sin(phase) * env * 0.25;
      }
    }
  }
  return buffer;
}

export function playProceduralEruption(ctx: AudioContext, destination: AudioNode): void {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(98, now);
  osc.frequency.exponentialRampToValueAtTime(28, now + 0.9);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.55, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
  osc.connect(gain);
  gain.connect(destination);
  osc.start(now);
  osc.stop(now + 1.85);

  const noise = ctx.createBufferSource();
  noise.buffer = createNoiseBuffer(ctx, 2.0);
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(2200, now);
  filter.frequency.exponentialRampToValueAtTime(160, now + 1.7);
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.0001, now);
  nGain.gain.linearRampToValueAtTime(0.45, now + 0.03);
  nGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.9);
  noise.connect(filter);
  filter.connect(nGain);
  nGain.connect(destination);
  noise.start(now);
  noise.stop(now + 1.95);
}

export function playProceduralCodeSpark(
  ctx: AudioContext,
  destination: AudioNode,
  variant: number,
): void {
  const chords = [
    [587.33, 880.0, 1318.51],
    [739.99, 880.0, 1174.66],
    [440.0, 659.25, 1174.66],
  ];
  const notes = chords[Math.abs(variant) % chords.length];
  const now = ctx.currentTime;
  notes.forEach((freq, idx) => {
    const t = now + idx * 0.032;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.09, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
    osc.connect(g);
    g.connect(destination);
    osc.start(t);
    osc.stop(t + 0.26);
  });
}

export function playProceduralLogoSignature(ctx: AudioContext, destination: AudioNode): void {
  const now = ctx.currentTime;
  const motif = [
    { f: 146.83, t: 0.0, dur: 1.8, amp: 0.14 },
    { f: 440.0, t: 0.04, dur: 1.1, amp: 0.11 },
    { f: 587.33, t: 0.14, dur: 1.25, amp: 0.12 },
    { f: 739.99, t: 0.24, dur: 1.5, amp: 0.14 },
  ];
  for (const n of motif) {
    const start = now + n.t;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(n.f, start);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(n.amp, start + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, start + n.dur);
    osc.connect(g);
    g.connect(destination);
    osc.start(start);
    osc.stop(start + n.dur + 0.05);
  }
}

/** Very subtle warm acknowledgement ping when user clicks Sound On. */
export function playSubtleUnlockCue(ctx: AudioContext, destination: AudioNode): void {
  const now = ctx.currentTime;
  const freqs = [440, 659.25];
  freqs.forEach((freq, i) => {
    const t = now + i * 0.045;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.055, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    osc.connect(gain);
    gain.connect(destination);
    osc.start(t);
    osc.stop(t + 0.25);
  });
}
