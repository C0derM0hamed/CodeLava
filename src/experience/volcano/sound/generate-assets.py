#!/usr/bin/env python3
"""
CodeLava Volcano Hero — Procedural Cinematic Audio Stem Generator
=================================================================
Generates 100% original, royalty-free (CC0 1.0) volcanic & digital sound stems
at 48 kHz stereo PCM and compresses them with ffmpeg into tiny Opus (.webm)
and AAC (.m4a) assets under `public/media/hero/sound/`.

Dependencies: Python 3 standard library + ffmpeg (libopus, aac).
Run from `web/`:
    python3 src/experience/volcano/sound/generate-assets.py
"""

from __future__ import annotations

import math
import os
import random
import struct
import subprocess
import tempfile
import wave
from pathlib import Path

SR = 48_000
TWO_PI = 2.0 * math.pi


def clamp(v: float, lo: float = -1.0, hi: float = 1.0) -> float:
    return lo if v < lo else (hi if v > hi else v)


def soft_clip(v: float, drive: float = 1.0) -> float:
    return math.tanh(v * drive)


def biquad_coeffs(kind: str, freq: float, q: float = 0.7071) -> tuple[float, float, float, float, float]:
    """Compute normalized biquad coefficients (b0, b1, b2, a1, a2)."""
    f = clamp(freq, 12.0, SR * 0.46)
    w0 = TWO_PI * f / SR
    cw = math.cos(w0)
    sw = math.sin(w0)
    alpha = sw / (2.0 * max(0.05, q))

    if kind == "lp":
        b0 = (1.0 - cw) * 0.5
        b1 = 1.0 - cw
        b2 = (1.0 - cw) * 0.5
        a0 = 1.0 + alpha
        a1 = -2.0 * cw
        a2 = 1.0 - alpha
    elif kind == "hp":
        b0 = (1.0 + cw) * 0.5
        b1 = -(1.0 + cw)
        b2 = (1.0 + cw) * 0.5
        a0 = 1.0 + alpha
        a1 = -2.0 * cw
        a2 = 1.0 - alpha
    elif kind == "bp":
        b0 = alpha
        b1 = 0.0
        b2 = -alpha
        a0 = 1.0 + alpha
        a1 = -2.0 * cw
        a2 = 1.0 - alpha
    else:
        raise ValueError(f"Unknown filter kind: {kind}")

    inv = 1.0 / a0
    return (b0 * inv, b1 * inv, b2 * inv, a1 * inv, a2 * inv)


class Biquad:
    __slots__ = ("b0", "b1", "b2", "a1", "a2", "x1", "x2", "y1", "y2")

    def __init__(self, kind: str, freq: float, q: float = 0.7071) -> None:
        self.x1 = self.x2 = self.y1 = self.y2 = 0.0
        self.set_params(kind, freq, q)

    def set_params(self, kind: str, freq: float, q: float = 0.7071) -> None:
        self.b0, self.b1, self.b2, self.a1, self.a2 = biquad_coeffs(kind, freq, q)

    def step(self, x: float) -> float:
        y = self.b0 * x + self.b1 * self.x1 + self.b2 * self.x2 - self.a1 * self.y1 - self.a2 * self.y2
        self.x2 = self.x1
        self.x1 = x
        self.y2 = self.y1
        self.y1 = y
        return y


class PinkNoise:
    """Paul Kellet's refined pink-noise filter."""

    __slots__ = ("rng", "b0", "b1", "b2", "b3", "b4", "b5", "b6")

    def __init__(self, seed: int) -> None:
        self.rng = random.Random(seed)
        self.b0 = self.b1 = self.b2 = self.b3 = self.b4 = self.b5 = self.b6 = 0.0

    def next(self) -> float:
        w = self.rng.uniform(-1.0, 1.0)
        self.b0 = 0.99886 * self.b0 + w * 0.0555179
        self.b1 = 0.99332 * self.b1 + w * 0.0750759
        self.b2 = 0.96900 * self.b2 + w * 0.1538520
        self.b3 = 0.86650 * self.b3 + w * 0.3104856
        self.b4 = 0.55000 * self.b4 + w * 0.5329522
        self.b5 = -0.7616 * self.b5 - w * 0.0168980
        pink = self.b0 + self.b1 + self.b2 + self.b3 + self.b4 + self.b5 + self.b6 + w * 0.5362
        self.b6 = w * 0.115926
        return pink * 0.11


def apply_stereo_reverb(
    left: list[float],
    right: list[float],
    wet: float = 0.28,
    decay: float = 0.48,
    damping: float = 0.35,
) -> tuple[list[float], list[float]]:
    """Lightweight prime-tap stereo feedback delay diffusion for cinematic space."""
    n = len(left)
    taps_l = (1429, 2087, 3023, 4159)
    taps_r = (1553, 2237, 3251, 4397)
    bufs_l = [[0.0] * d for d in taps_l]
    bufs_r = [[0.0] * d for d in taps_r]
    idx_l = [0] * len(taps_l)
    idx_r = [0] * len(taps_r)
    lp_l = [0.0] * len(taps_l)
    lp_r = [0.0] * len(taps_r)

    out_l = [0.0] * n
    out_r = [0.0] * n
    inv_taps = 1.0 / len(taps_l)
    dry = 1.0 - wet * 0.35

    for i in range(n):
        xl = left[i]
        xr = right[i]
        acc_l = 0.0
        acc_r = 0.0
        for k in range(len(taps_l)):
            dl = taps_l[k]
            dr = taps_r[k]
            il = idx_l[k]
            ir = idx_r[k]
            yl = bufs_l[k][il]
            yr = bufs_r[k][ir]
            lp_l[k] = lp_l[k] * damping + yl * (1.0 - damping)
            lp_r[k] = lp_r[k] * damping + yr * (1.0 - damping)
            # Cross-couple slightly for stereo width
            bufs_l[k][il] = xl + (lp_l[k] * 0.82 + lp_r[k] * 0.18) * decay
            bufs_r[k][ir] = xr + (lp_r[k] * 0.82 + lp_l[k] * 0.18) * decay
            idx_l[k] = (il + 1) % dl
            idx_r[k] = (ir + 1) % dr
            acc_l += yl
            acc_r += yr

        out_l[i] = xl * dry + acc_l * inv_taps * wet
        out_r[i] = xr * dry + acc_r * inv_taps * wet

    return out_l, out_r


def make_seamless_loop(
    left: list[float], right: list[float], loop_samples: int, xfade_samples: int
) -> tuple[list[float], list[float]]:
    """Equal-power overlap-add tail onto head for click-free seamless looping."""
    out_l = left[:loop_samples]
    out_r = right[:loop_samples]
    for i in range(xfade_samples):
        t = i / xfade_samples
        fade_in = math.sin(t * math.pi * 0.5)
        fade_out = math.cos(t * math.pi * 0.5)
        tail_idx = loop_samples + i
        out_l[i] = out_l[i] * fade_in + left[tail_idx] * fade_out
        out_r[i] = out_r[i] * fade_in + right[tail_idx] * fade_out
    return out_l, out_r


def normalize_stereo(
    left: list[float], right: list[float], target_peak: float = 0.84
) -> tuple[list[float], list[float]]:
    peak = 1e-9
    for i in range(len(left)):
        al = abs(left[i])
        ar = abs(right[i])
        if al > peak:
            peak = al
        if ar > peak:
            peak = ar
    gain = target_peak / peak
    return [x * gain for x in left], [x * gain for x in right]


def write_wav(path: Path, left: list[float], right: list[float]) -> None:
    n = len(left)
    frames = bytearray(n * 4)
    for i in range(n):
        sl = int(clamp(left[i]) * 32767.0)
        sr = int(clamp(right[i]) * 32767.0)
        struct.pack_into("<hh", frames, i * 4, sl, sr)
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(frames)


# ---------------------------------------------------------------------------
# 1. Volcanic Rumble Bed (8.0s seamless loop)
# ---------------------------------------------------------------------------
def synth_rumble_loop() -> tuple[list[float], list[float]]:
    dur = 8.0
    xfade = 1.25
    loop_n = int(dur * SR)
    xfade_n = int(xfade * SR)
    total_n = loop_n + xfade_n

    pink_l = PinkNoise(101)
    pink_r = PinkNoise(202)
    lp1_l = Biquad("lp", 92.0, 0.85)
    lp1_r = Biquad("lp", 96.0, 0.85)
    lp2_l = Biquad("lp", 150.0, 0.72)
    lp2_r = Biquad("lp", 145.0, 0.72)
    bp_l = Biquad("bp", 132.0, 1.3)
    bp_r = Biquad("bp", 144.0, 1.3)
    hp_l = Biquad("hp", 26.0, 0.707)
    hp_r = Biquad("hp", 26.0, 0.707)

    left = [0.0] * total_n
    right = [0.0] * total_n

    brown_l = 0.0
    brown_r = 0.0
    for i in range(total_n):
        t = i / SR
        # Slow pressure waves whose periods divide 8.0s cleanly
        swell_l = 0.72 + 0.28 * math.sin(TWO_PI * (t / 8.0) + 0.2) * math.cos(TWO_PI * (t / 4.0) * 0.5)
        swell_r = 0.72 + 0.28 * math.sin(TWO_PI * (t / 8.0) + 1.1) * math.cos(TWO_PI * (t / 4.0) * 0.5 + 0.4)

        if i % 128 == 0:
            c_l = 78.0 + 34.0 * (0.5 + 0.5 * math.sin(TWO_PI * t / 4.0))
            c_r = 82.0 + 34.0 * (0.5 + 0.5 * math.sin(TWO_PI * t / 4.0 + 0.9))
            lp1_l.set_params("lp", c_l, 0.9)
            lp1_r.set_params("lp", c_r, 0.9)

        pl = pink_l.next()
        pr = pink_r.next()
        brown_l = brown_l * 0.992 + pl * 0.095
        brown_r = brown_r * 0.992 + pr * 0.095

        # Subtle earth resonance (fundamental + 5th, integer cycles in 8.0s)
        sub_l = 0.14 * math.sin(TWO_PI * 38.0 * t) + 0.07 * math.sin(TWO_PI * 57.0 * t + 0.5)
        sub_r = 0.14 * math.sin(TWO_PI * 38.0 * t + 0.18) + 0.07 * math.sin(TWO_PI * 57.0 * t + 0.9)

        body_l = lp2_l.step(lp1_l.step(brown_l * 3.4 + pl * 0.55)) * swell_l
        body_r = lp2_r.step(lp1_r.step(brown_r * 3.4 + pr * 0.55)) * swell_r

        # Warm tectonic stone groan mid-low texture
        groan_l = bp_l.step(pl) * 0.42 * (0.65 + 0.35 * math.sin(TWO_PI * t / 2.6666667))
        groan_r = bp_r.step(pr) * 0.42 * (0.65 + 0.35 * math.sin(TWO_PI * t / 2.6666667 + 1.4))

        left[i] = hp_l.step(soft_clip(body_l + sub_l * swell_l + groan_l, 1.35))
        right[i] = hp_r.step(soft_clip(body_r + sub_r * swell_r + groan_r, 1.35))

    left, right = make_seamless_loop(left, right, loop_n, xfade_n)
    return normalize_stereo(left, right, 0.78)


# ---------------------------------------------------------------------------
# 2. Realistic Molten Lava Bubbling & Flow (8.0s seamless loop)
# ---------------------------------------------------------------------------
def synth_lava_loop() -> tuple[list[float], list[float]]:
    dur = 8.0
    xfade = 1.2
    loop_n = int(dur * SR)
    xfade_n = int(xfade * SR)
    total_n = loop_n + xfade_n

    rng = random.Random(777)
    pink_l = PinkNoise(303)
    pink_r = PinkNoise(404)
    flow_l = Biquad("bp", 310.0, 0.85)
    flow_r = Biquad("bp", 335.0, 0.85)
    hiss_l = Biquad("bp", 2400.0, 1.15)
    hiss_r = Biquad("bp", 2650.0, 1.15)
    hp_l = Biquad("hp", 55.0, 0.707)
    hp_r = Biquad("hp", 55.0, 0.707)

    left = [0.0] * total_n
    right = [0.0] * total_n

    # Layer A: Viscous molten river flow & thermal crust sizzle
    for i in range(total_n):
        t = i / SR
        if i % 160 == 0:
            fc_l = 260.0 + 140.0 * (0.5 + 0.5 * math.sin(TWO_PI * t / 4.0 + 0.3))
            fc_r = 280.0 + 145.0 * (0.5 + 0.5 * math.sin(TWO_PI * t / 4.0 + 1.7))
            flow_l.set_params("bp", fc_l, 0.9)
            flow_r.set_params("bp", fc_r, 0.9)
        pl = pink_l.next()
        pr = pink_r.next()
        mod_l = 0.65 + 0.35 * math.sin(TWO_PI * t / 2.0 + 0.2)
        mod_r = 0.65 + 0.35 * math.sin(TWO_PI * t / 2.0 + 1.5)
        left[i] = flow_l.step(pl) * 0.78 * mod_l + hiss_l.step(pl) * 0.14 * mod_r
        right[i] = flow_r.step(pr) * 0.78 * mod_r + hiss_r.step(pr) * 0.14 * mod_l

    left, right = make_seamless_loop(left, right, loop_n, xfade_n)

    # Layer B: Minnaert viscous magma bubble pops (wrap seamlessly around loop_n)
    bubble_count = 46
    for _ in range(bubble_count):
        start = rng.randint(0, loop_n - 1)
        is_deep = rng.random() < 0.55
        b_dur = rng.uniform(0.065, 0.165) if is_deep else rng.uniform(0.032, 0.075)
        b_len = int(b_dur * SR)
        f0 = rng.uniform(82.0, 175.0) if is_deep else rng.uniform(195.0, 410.0)
        chirp = rng.uniform(0.45, 1.05)  # upward pitch rise as bubble reaches magma surface
        amp = rng.uniform(0.22, 0.48) if is_deep else rng.uniform(0.11, 0.24)
        pan = rng.uniform(-0.72, 0.72)
        gl = math.cos((pan + 1.0) * math.pi * 0.25)
        gr = math.sin((pan + 1.0) * math.pi * 0.25)
        phase = 0.0
        for j in range(b_len):
            u = j / b_len
            # Fast rounded pop attack, viscous damped ring
            env = math.sin(min(1.0, u / 0.14) * math.pi * 0.5) * math.exp(-u * 4.4)
            freq = f0 * (1.0 + chirp * (u ** 1.35))
            phase += TWO_PI * freq / SR
            # Slight warm 2nd harmonic for thick liquid body
            val = (math.sin(phase) + 0.24 * math.sin(phase * 2.04) * math.exp(-u * 6.0)) * env * amp
            idx = (start + j) % loop_n
            left[idx] += val * gl
            right[idx] += val * gr

    # Layer C: Fine incandescent crust crackles
    crackle_count = 64
    for _ in range(crackle_count):
        start = rng.randint(0, loop_n - 1)
        c_len = int(rng.uniform(0.004, 0.016) * SR)
        f_cr = rng.uniform(1900.0, 5200.0)
        amp = rng.uniform(0.035, 0.11)
        pan = rng.uniform(-0.85, 0.85)
        gl = math.cos((pan + 1.0) * math.pi * 0.25)
        gr = math.sin((pan + 1.0) * math.pi * 0.25)
        for j in range(c_len):
            u = j / c_len
            env = math.exp(-u * 7.5)
            s = (math.sin(TWO_PI * f_cr * (j / SR)) * 0.5 + rng.uniform(-0.5, 0.5)) * env * amp
            idx = (start + j) % loop_n
            left[idx] += s * gl
            right[idx] += s * gr

    for i in range(loop_n):
        left[i] = hp_l.step(soft_clip(left[i], 1.2))
        right[i] = hp_r.step(soft_clip(right[i], 1.2))

    return normalize_stereo(left, right, 0.78)


# ---------------------------------------------------------------------------
# 3. Powerful Volcanic Eruption Hit (3.2s stereo one-shot)
# ---------------------------------------------------------------------------
def synth_eruption_hit() -> tuple[list[float], list[float]]:
    dur = 3.2
    n = int(dur * SR)
    rng = random.Random(909)
    pink_l = PinkNoise(505)
    pink_r = PinkNoise(606)

    blast_lp_l = Biquad("lp", 3200.0, 0.95)
    blast_lp_r = Biquad("lp", 3100.0, 0.95)
    crack_bp = Biquad("bp", 1250.0, 1.1)
    out_hp_l = Biquad("hp", 24.0, 0.707)
    out_hp_r = Biquad("hp", 24.0, 0.707)

    left = [0.0] * n
    right = [0.0] * n

    sub_phase = 0.0
    punch_phase = 0.0

    for i in range(n):
        t = i / SR

        # 1. Brief 22ms pressure intake before main blast at t = 0.022s
        dt = t - 0.022
        intake = 0.0
        if 0.0 <= t < 0.022:
            u = t / 0.022
            intake = (u * u) * 0.22 * pink_l.next()

        if dt < 0.0:
            left[i] = intake
            right[i] = intake
            continue

        # 2. Rock-fracture transient punch (first 110ms)
        punch_env = math.exp(-dt * 28.0) * min(1.0, dt / 0.0025)
        punch_f = 190.0 * math.exp(-dt * 22.0) + 46.0
        punch_phase += TWO_PI * punch_f / SR
        crack = crack_bp.step(rng.uniform(-1.0, 1.0)) * math.exp(-dt * 36.0) * 0.75
        punch = (math.sin(punch_phase) * 0.85 + crack) * punch_env

        # 3. Massive seismic sub-drop (105Hz -> 27Hz)
        sub_env = min(1.0, dt / 0.008) * math.exp(-dt * 1.45)
        sub_f = 27.0 + 78.0 * math.exp(-dt * 5.2)
        sub_phase += TWO_PI * sub_f / SR
        sub = soft_clip(math.sin(sub_phase) * 1.15 + 0.32 * math.sin(sub_phase * 2.0), 1.65) * sub_env

        # 4. Sweeping magma blast roar
        if i % 64 == 0:
            cutoff = 175.0 + 3100.0 * math.exp(-dt * 2.35)
            blast_lp_l.set_params("lp", cutoff, 1.05)
            blast_lp_r.set_params("lp", cutoff * 0.96, 1.05)

        roar_env = min(1.0, dt / 0.015) * math.exp(-dt * 1.18)
        pl = pink_l.next()
        pr = pink_r.next()
        roar_l = blast_lp_l.step(pl) * 1.45 * roar_env
        roar_r = blast_lp_r.step(pr) * 1.45 * roar_env

        # Smooth tail fade to zero over last 0.45s
        tail_fade = 1.0
        if t > dur - 0.45:
            tail_fade = max(0.0, (dur - t) / 0.45) ** 1.6

        left[i] = (punch * 0.72 + sub * 0.88 + roar_l * 0.72) * tail_fade
        right[i] = (punch * 0.72 + sub * 0.88 + roar_r * 0.72) * tail_fade

    # 5. Glowing ember / ash shower stereo particles (0.14s .. 2.3s)
    for _ in range(38):
        t0 = rng.uniform(0.14, 1.85)
        start = int(t0 * SR)
        c_len = int(rng.uniform(0.005, 0.022) * SR)
        freq = rng.uniform(1800.0, 5600.0)
        amp = rng.uniform(0.03, 0.11) * math.exp(-(t0 - 0.14) * 0.95)
        pan = rng.uniform(-0.9, 0.9)
        gl = math.cos((pan + 1.0) * math.pi * 0.25)
        gr = math.sin((pan + 1.0) * math.pi * 0.25)
        for j in range(c_len):
            idx = start + j
            if idx >= n:
                break
            u = j / c_len
            env = math.exp(-u * 6.5)
            s = (math.sin(TWO_PI * freq * (j / SR)) * 0.65 + rng.uniform(-0.35, 0.35)) * env * amp
            left[idx] += s * gl
            right[idx] += s * gr

    left, right = apply_stereo_reverb(left, right, wet=0.26, decay=0.45, damping=0.42)

    for i in range(n):
        t = i / SR
        end_fade = 1.0 if t < dur - 0.35 else max(0.0, (dur - t) / 0.35) ** 1.8
        left[i] = out_hp_l.step(soft_clip(left[i], 1.25)) * end_fade
        right[i] = out_hp_r.step(soft_clip(right[i], 1.25)) * end_fade

    return normalize_stereo(left, right, 0.90)


# ---------------------------------------------------------------------------
# 4. Light Digital Code Burst Effects (3 musical variations, ~0.65s each)
# ---------------------------------------------------------------------------
def synth_code_burst(
    notes_hz: tuple[float, ...], stagger_s: float, seed: int, dur: float = 0.68
) -> tuple[list[float], list[float]]:
    n = int(dur * SR)
    rng = random.Random(seed)
    left = [0.0] * n
    right = [0.0] * n
    sparkle_hp = Biquad("hp", 3600.0, 0.9)

    for idx_note, freq in enumerate(notes_hz):
        t_start = 0.008 + idx_note * stagger_s
        start = int(t_start * SR)
        pan = -0.38 + (idx_note / max(1, len(notes_hz) - 1)) * 0.76
        gl = math.cos((pan + 1.0) * math.pi * 0.25)
        gr = math.sin((pan + 1.0) * math.pi * 0.25)

        for i in range(start, n):
            dt = (i - start) / SR
            # Tactile glass-FM code ping: crisp 2.5ms attack, silky exponential decay
            env = min(1.0, dt / 0.0025) * math.exp(-dt * 9.2)
            if dt > 0.015 and env < 1e-4:
                break
            mod_index = 1.35 * math.exp(-dt * 28.0)
            mod = math.sin(TWO_PI * (freq * 2.0) * dt) * mod_index
            tone = (
                math.sin(TWO_PI * freq * dt + mod) * 0.72
                + math.sin(TWO_PI * (freq * 3.0) * dt) * 0.14 * math.exp(-dt * 22.0)
            )
            # Tiny keystroke/sparkle tick at onset
            tick = sparkle_hp.step(rng.uniform(-1.0, 1.0)) * math.exp(-dt * 85.0) * 0.18
            val = (tone + tick) * env * 0.42
            left[i] += val * gl
            right[i] += val * gr

    left, right = apply_stereo_reverb(left, right, wet=0.22, decay=0.34, damping=0.25)
    for i in range(n):
        t = i / SR
        fade = 1.0 if t < dur - 0.12 else max(0.0, (dur - t) / 0.12) ** 1.6
        left[i] *= fade
        right[i] *= fade

    return normalize_stereo(left, right, 0.72)


# ---------------------------------------------------------------------------
# 5. Distinctive CodeLava Logo Signature (2.8s stereo one-shot, Dmaj9)
# ---------------------------------------------------------------------------
def synth_logo_reveal() -> tuple[list[float], list[float]]:
    dur = 2.8
    n = int(dur * SR)
    left = [0.0] * n
    right = [0.0] * n

    # Layer A: Warm molten harmonic anchor (D2, A2, D3, A3)
    pad_voices = (
        (73.416, 0.34, 0.00, 0.0),    # D2
        (110.000, 0.24, 0.02, -0.15), # A2
        (146.832, 0.20, 0.04, 0.15),  # D3
        (220.000, 0.12, 0.08, -0.22), # A3
    )
    for freq, amp, t0, pan in pad_voices:
        gl = math.cos((pan + 1.0) * math.pi * 0.25)
        gr = math.sin((pan + 1.0) * math.pi * 0.25)
        start = int(t0 * SR)
        for i in range(start, n):
            dt = (i - start) / SR
            attack = 1.0 - math.exp(-dt / 0.095)
            decay = math.exp(-dt * 1.12)
            # Subtle dual-detuned chorus warmth
            s = (
                0.68 * math.sin(TWO_PI * freq * dt)
                + 0.22 * math.sin(TWO_PI * (freq * 1.003) * dt)
                + 0.10 * math.sin(TWO_PI * (freq * 2.0) * dt) * math.exp(-dt * 2.4)
            )
            val = s * attack * decay * amp
            left[i] += val * gl
            right[i] += val * gr

    # Layer B: `< / >` CodeLava crystalline signature motif (A4 -> D5 -> F#5 + E6 halo)
    chime_notes = (
        (440.000, 0.04, 0.28, -0.34, 2.2),  # < (A4)
        (587.330, 0.14, 0.32, 0.00, 2.0),   # / (D5)
        (739.989, 0.24, 0.36, 0.34, 1.75),  # > (F#5)
        (1318.51, 0.28, 0.14, 0.18, 2.1),   # Luminous 9th halo (E6)
        (1174.66, 0.30, 0.12, -0.18, 2.3),  # Octave shimmer (D6)
    )
    for freq, t0, amp, pan, decay_rate in chime_notes:
        gl = math.cos((pan + 1.0) * math.pi * 0.25)
        gr = math.sin((pan + 1.0) * math.pi * 0.25)
        start = int(t0 * SR)
        for i in range(start, n):
            dt = (i - start) / SR
            env = min(1.0, dt / 0.004) * math.exp(-dt * decay_rate)
            if dt > 0.02 and env < 1e-4:
                break
            fm_idx = 0.95 * math.exp(-dt * 14.0)
            fm = math.sin(TWO_PI * (freq * 2.0) * dt) * fm_idx
            bell = (
                0.76 * math.sin(TWO_PI * freq * dt + fm)
                + 0.16 * math.sin(TWO_PI * (freq * 2.002) * dt) * math.exp(-dt * 4.5)
                + 0.08 * math.sin(TWO_PI * (freq * 3.0) * dt) * math.exp(-dt * 9.0)
            )
            val = bell * env * amp
            left[i] += val * gl
            right[i] += val * gr

    # Layer C: Velvet ember rise shimmer behind the resolve
    pink_l = PinkNoise(808)
    pink_r = PinkNoise(809)
    shimmer_bp_l = Biquad("bp", 2600.0, 2.2)
    shimmer_bp_r = Biquad("bp", 2950.0, 2.2)
    for i in range(n):
        t = i / SR
        if t < 1.5:
            env = math.sin(min(1.0, t / 0.32) * math.pi * 0.5) * math.exp(-max(0.0, t - 0.25) * 3.2)
            left[i] += shimmer_bp_l.step(pink_l.next()) * env * 0.09
            right[i] += shimmer_bp_r.step(pink_r.next()) * env * 0.09

    left, right = apply_stereo_reverb(left, right, wet=0.34, decay=0.52, damping=0.28)

    hp_l = Biquad("hp", 32.0, 0.707)
    hp_r = Biquad("hp", 32.0, 0.707)
    for i in range(n):
        t = i / SR
        end_fade = 1.0 if t < dur - 0.35 else max(0.0, (dur - t) / 0.35) ** 1.8
        left[i] = hp_l.step(soft_clip(left[i], 1.08)) * end_fade
        right[i] = hp_r.step(soft_clip(right[i], 1.08)) * end_fade

    return normalize_stereo(left, right, 0.84)


def encode_stem(wav_path: Path, out_dir: Path, name: str, opus_kbps: int, aac_kbps: int) -> None:
    webm_path = out_dir / f"{name}.webm"
    m4a_path = out_dir / f"{name}.m4a"

    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-loglevel",
            "error",
            "-i",
            str(wav_path),
            "-c:a",
            "libopus",
            "-b:a",
            f"{opus_kbps}k",
            "-vbr",
            "on",
            "-application",
            "audio",
            str(webm_path),
        ],
        check=True,
    )

    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-loglevel",
            "error",
            "-i",
            str(wav_path),
            "-c:a",
            "aac",
            "-b:a",
            f"{aac_kbps}k",
            "-movflags",
            "+faststart",
            str(m4a_path),
        ],
        check=True,
    )


def main() -> None:
    repo_web = Path(__file__).resolve().parents[4]
    out_dir = repo_web / "public" / "media" / "hero" / "sound"
    out_dir.mkdir(parents=True, exist_ok=True)

    stems: list[tuple[str, tuple[list[float], list[float]], int, int]] = [
        ("rumble-loop", synth_rumble_loop(), 32, 48),
        ("lava-loop", synth_lava_loop(), 40, 56),
        ("eruption-hit", synth_eruption_hit(), 48, 64),
        ("code-burst-1", synth_code_burst((587.33, 880.00, 1318.51), 0.030, 11), 40, 56),
        ("code-burst-2", synth_code_burst((739.99, 880.00, 1174.66), 0.034, 22), 40, 56),
        ("code-burst-3", synth_code_burst((440.00, 659.25, 739.99, 1174.66), 0.026, 33), 40, 56),
        ("logo-reveal", synth_logo_reveal(), 48, 64),
    ]

    with tempfile.TemporaryDirectory(prefix="codelava-sound-") as tmp:
        tmp_dir = Path(tmp)
        for name, (l_ch, r_ch), opus_k, aac_k in stems:
            wav_path = tmp_dir / f"{name}.wav"
            write_wav(wav_path, l_ch, r_ch)
            encode_stem(wav_path, out_dir, name, opus_k, aac_k)

    # Print manifest & total sizes
    total_all = 0
    total_opus = 0
    total_aac = 0
    for f in sorted(out_dir.iterdir()):
        if f.suffix not in {".webm", ".m4a"}:
            continue
        sz = f.stat().st_size
        total_all += sz
        if f.suffix == ".webm":
            total_opus += sz
        else:
            total_aac += sz
        print(f"{f.name:22s} {sz:7d} bytes ({sz / 1024:5.1f} KB)")

    print("-" * 46)
    print(f"Opus (.webm) total:    {total_opus:7d} bytes ({total_opus / 1024:5.1f} KB)")
    print(f"AAC  (.m4a)  total:    {total_aac:7d} bytes ({total_aac / 1024:5.1f} KB)")
    print(f"Combined on disk:      {total_all:7d} bytes ({total_all / 1024:5.1f} KB)")


if __name__ == "__main__":
    main()
