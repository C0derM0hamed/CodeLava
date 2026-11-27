/**
 * Live procedural volcanic fire, volumetric bloom, convective heat shimmer, and ballistic ember
 * system composited directly onto the hero canvas inside daylight-scene.ts's single rAF loop.
 *
 * Palette is resolved once from :root Daylight Magma CSS custom properties (zero raw hex values).
 * All glows and sparks use pre-baked multi-stop offscreen radial sprites for silky 60fps performance
 * and zero 8-bit banding or hard edges.
 */

interface Rgb {
  r: number;
  g: number;
  b: number;
}

interface Palette {
  core: Rgb;      // --lava-100
  ember: Rgb;     // --ember
  bright: Rgb;    // --lava-300
  hot: Rgb;       // --lava-400
  lava: Rgb;      // --lava-500
  deep: Rgb;      // --lava-600
  cooling: Rgb;   // --lava-700
}

interface EmberParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  drag: number;
  age: number;
  life: number;
  size: number;
  streak: number;
  heat: number;       // 0..1 shifts initial temperature between ember-white and deep lava
  swayFreq: number;
  swayAmp: number;
  phase: number;
  mode: 0 | 1;        // 0 = crater eruption/ambient, 1 = identity logo mini-volcano
}

interface HeatWave {
  offsetX: number;
  phase: number;
  speed: number;
  widthScale: number;
  heightScale: number;
  sway: number;
}

export interface VolcanoFrameRect {
  x: number;
  y: number;
  width: number;
  height: number;
  reveal: number;
  progress: number;
  compact: boolean;
  dpr: number;
}

const clamp = (n: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, n));

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function parseCssColor(raw: string, fallback: Rgb): Rgb {
  const value = raw.trim();
  if (value.startsWith("#")) {
    const hex = value.slice(1);
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
      };
    }
    if (hex.length >= 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }
  }
  const m = value.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
  if (m) {
    return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) };
  }
  return fallback;
}

function rgba(c: Rgb, a: number): string {
  return `rgba(${c.r},${c.g},${c.b},${a.toFixed(4)})`;
}

function resolvePalette(): Palette {
  const styles = getComputedStyle(document.documentElement);
  const read = (token: string, fallback: Rgb) => parseCssColor(styles.getPropertyValue(token), fallback);
  return {
    core: read("--lava-100", { r: 255, g: 226, b: 199 }),
    ember: read("--ember", { r: 255, g: 207, b: 74 }),
    bright: read("--lava-300", { r: 255, g: 176, b: 102 }),
    hot: read("--lava-400", { r: 255, g: 138, b: 42 }),
    lava: read("--lava-500", { r: 255, g: 106, b: 0 }),
    deep: read("--lava-600", { r: 233, g: 78, b: 6 }),
    cooling: read("--lava-700", { r: 184, g: 54, b: 10 }),
  };
}

/**
 * Pre-renders a smooth multi-stop radial sprite to eliminate per-frame gradient allocations,
 * prevent 8-bit banding, and guarantee feathered edges that fade to zero well before the rim.
 */
function makeRadialSprite(size: number, stops: ReadonlyArray<readonly [number, Rgb, number]>): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d");
  if (!g) return c;
  const half = size * 0.5;
  const grad = g.createRadialGradient(half, half, 0, half, half, half);
  for (const [offset, col, alpha] of stops) {
    grad.addColorStop(offset, rgba(col, alpha));
  }
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

/**
 * Pre-renders a directional comet/spark streak sprite oriented along +X so velocity-aligned
 * erupting ejecta look like real molten droplets & sparks instead of flat dots.
 */
function makeStreakSprite(width: number, height: number, head: Rgb, mid: Rgb, tail: Rgb): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const g = c.getContext("2d");
  if (!g) return c;

  const cy = height * 0.5;
  // Soft elongated molten tail
  const tailGrad = g.createLinearGradient(width * 0.04, cy, width * 0.86, cy);
  tailGrad.addColorStop(0, rgba(tail, 0));
  tailGrad.addColorStop(0.28, rgba(tail, 0.24));
  tailGrad.addColorStop(0.62, rgba(mid, 0.68));
  tailGrad.addColorStop(0.86, rgba(head, 0.96));
  tailGrad.addColorStop(1, rgba(head, 0));

  g.save();
  g.translate(width * 0.5, cy);
  g.scale(1, (height * 0.34) / (width * 0.48));
  g.beginPath();
  g.arc(0, 0, width * 0.46, 0, Math.PI * 2);
  g.fillStyle = tailGrad;
  g.fill();
  g.restore();

  // Bright incandescent spark head
  const headX = width * 0.76;
  const headR = height * 0.42;
  const headGrad = g.createRadialGradient(headX, cy, 0, headX, cy, headR);
  headGrad.addColorStop(0, rgba(head, 1));
  headGrad.addColorStop(0.32, rgba(mid, 0.82));
  headGrad.addColorStop(0.68, rgba(tail, 0.22));
  headGrad.addColorStop(1, rgba(tail, 0));
  g.fillStyle = headGrad;
  g.fillRect(0, 0, width, height);

  return c;
}

export function createVolcanoFire() {
  const pal = resolvePalette();

  // Soft volumetric bloom sprites (7 perceptual stops each — zero banding, invisible edge feather)
  const bloomWide = makeRadialSprite(160, [
    [0.0, pal.hot, 0.42],
    [0.18, pal.lava, 0.30],
    [0.36, pal.deep, 0.17],
    [0.54, pal.cooling, 0.08],
    [0.72, pal.cooling, 0.025],
    [0.88, pal.cooling, 0.005],
    [1.0, pal.cooling, 0],
  ]);

  const bloomCore = makeRadialSprite(128, [
    [0.0, pal.core, 0.92],
    [0.14, pal.ember, 0.72],
    [0.30, pal.bright, 0.44],
    [0.50, pal.hot, 0.20],
    [0.70, pal.lava, 0.06],
    [0.86, pal.deep, 0.012],
    [1.0, pal.deep, 0],
  ]);

  const hazeWisp = makeRadialSprite(128, [
    [0.0, pal.bright, 0.22],
    [0.26, pal.hot, 0.13],
    [0.54, pal.lava, 0.05],
    [0.78, pal.deep, 0.012],
    [1.0, pal.deep, 0],
  ]);

  // 3 temperature-graded spark/ember sprites for rich color progression across particle lifetime
  const sparkHot = makeStreakSprite(64, 24, pal.core, pal.ember, pal.hot);
  const sparkWarm = makeStreakSprite(64, 24, pal.ember, pal.hot, pal.lava);
  const sparkCool = makeStreakSprite(64, 24, pal.bright, pal.lava, pal.cooling);

  // Soft glowing round ember sprites for gentle drifting sparks
  const dotHot = makeRadialSprite(48, [
    [0.0, pal.core, 1],
    [0.24, pal.ember, 0.85],
    [0.52, pal.hot, 0.34],
    [0.80, pal.lava, 0.06],
    [1.0, pal.lava, 0],
  ]);
  const dotCool = makeRadialSprite(48, [
    [0.0, pal.ember, 0.95],
    [0.28, pal.lava, 0.72],
    [0.58, pal.deep, 0.24],
    [0.84, pal.cooling, 0.04],
    [1.0, pal.cooling, 0],
  ]);

  const MAX_PARTICLES = 132;
  const particles: EmberParticle[] = Array.from({ length: MAX_PARTICLES }, () => ({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    gravity: 0,
    drag: 0.99,
    age: 99,
    life: 1,
    size: 2,
    streak: 1,
    heat: 0.5,
    swayFreq: 2,
    swayAmp: 12,
    phase: 0,
    mode: 0,
  }));

  const heatWaves: HeatWave[] = Array.from({ length: 7 }, (_, i) => ({
    offsetX: (i / 6 - 0.5) * 1.15,
    phase: i * 1.37,
    speed: 0.42 + (i % 3) * 0.14,
    widthScale: 0.72 + (i % 4) * 0.18,
    heightScale: 0.85 + (i % 3) * 0.22,
    sway: 0.6 + (i % 2) * 0.45,
  }));

  let poolCursor = 0;
  let spawnCarry = 0;
  let logoSpawnCarry = 0;
  let simTime = 0;
  let seeded = false;

  function craterPoint(rect: VolcanoFrameRect) {
    // Crater rim in 16:9 film image space (calibrated against hero sequence frames)
    return {
      cx: rect.x + rect.width * 0.662,
      cy: rect.y + rect.height * 0.408,
      scale: rect.height / 900,
    };
  }

  function logoPeakPoint(rect: VolcanoFrameRect) {
    // Mini volcano peak inside the CodeLava identity mark at reveal → 1
    return {
      lx: rect.x + rect.width * 0.50,
      ly: rect.y + rect.height * 0.34,
      scale: rect.height / 440,
    };
  }

  function spawnCraterParticle(
    rect: VolcanoFrameRect,
    eruption: number,
    codeFlow: number,
    initialAgeFraction = 0,
  ) {
    const p = particles[poolCursor];
    poolCursor = (poolCursor + 1) % MAX_PARTICLES;

    const { cx, cy, scale } = craterPoint(rect);
    const isBallistic = eruption > 0.12 && Math.random() < 0.35 + eruption * 0.55;
    const isHeroEjecta = isBallistic && Math.random() < 0.18;

    const mouthSpread = (26 + eruption * 48) * scale;
    p.mode = 0;
    p.x = cx + (Math.random() - 0.5) * mouthSpread;
    p.y = cy + (Math.random() - 0.5) * (14 * scale);

    if (isBallistic) {
      // Smooth volcanic fountain arc: upward cone fanning gently across the sky then curving under gravity
      const angle = -Math.PI * 0.5 + (Math.random() - 0.5) * (0.78 + eruption * 0.56);
      const speed = (165 + Math.random() * 290 + eruption * 240 + (isHeroEjecta ? 90 : 0)) * scale;
      p.vx = Math.cos(angle) * speed * (1 + codeFlow * 0.25);
      p.vy = Math.sin(angle) * speed;
      p.gravity = (195 + Math.random() * 195) * scale;
      p.drag = 0.992;
      p.life = 1.05 + Math.random() * 1.15;
      p.size = (isHeroEjecta ? 5.2 + Math.random() * 3.4 : 1.7 + Math.random() * 3.2) * Math.max(0.75, scale);
      p.streak = isHeroEjecta ? 2.6 + Math.random() * 1.1 : 1.5 + Math.random() * 1.6;
      p.heat = isHeroEjecta ? 0.85 + Math.random() * 0.15 : 0.45 + Math.random() * 0.55;
      p.swayFreq = 1.6 + Math.random() * 1.8;
      p.swayAmp = (10 + Math.random() * 18) * scale;
    } else {
      // Buoyant ambient thermal embers rising organically from the glowing caldera
      p.vx = (Math.random() - 0.5) * (34 + eruption * 55) * scale;
      p.vy = -(42 + Math.random() * 78 + eruption * 60) * scale;
      p.gravity = -(8 + Math.random() * 14) * scale; // gentle thermal buoyancy
      p.drag = 0.988;
      p.life = 1.6 + Math.random() * 1.8;
      p.size = (1.3 + Math.random() * 2.9) * Math.max(0.75, scale);
      p.streak = 0.95;
      p.heat = 0.35 + Math.random() * 0.6;
      p.swayFreq = 1.2 + Math.random() * 2.1;
      p.swayAmp = (18 + Math.random() * 28) * scale;
    }

    p.phase = Math.random() * Math.PI * 2;
    p.age = initialAgeFraction * p.life;

    if (initialAgeFraction > 0) {
      // Pre-integrate so opening frame already has graceful ambient embers in mid-air
      const dtSim = p.age;
      p.x += p.vx * dtSim;
      p.y += p.vy * dtSim + 0.5 * p.gravity * dtSim * dtSim;
      p.vy += p.gravity * dtSim;
    }
  }

  function spawnLogoEmber(rect: VolcanoFrameRect, initialAgeFraction = 0) {
    const p = particles[poolCursor];
    poolCursor = (poolCursor + 1) % MAX_PARTICLES;

    const { lx, ly, scale } = logoPeakPoint(rect);
    p.mode = 1;
    p.x = lx + (Math.random() - 0.5) * 34 * scale;
    p.y = ly + (Math.random() - 0.5) * 14 * scale;
    p.vx = (Math.random() - 0.5) * 24 * scale;
    p.vy = -(22 + Math.random() * 44) * scale;
    p.gravity = -6 * scale;
    p.drag = 0.992;
    p.life = 1.5 + Math.random() * 1.6;
    p.size = (1.1 + Math.random() * 2.1) * Math.max(0.7, scale);
    p.streak = 1;
    p.heat = 0.45 + Math.random() * 0.5;
    p.swayFreq = 1.4 + Math.random() * 1.6;
    p.swayAmp = 14 * scale;
    p.phase = Math.random() * Math.PI * 2;
    p.age = initialAgeFraction * p.life;

    if (initialAgeFraction > 0) {
      const dtSim = p.age;
      p.x += p.vx * dtSim;
      p.y += p.vy * dtSim + 0.5 * p.gravity * dtSim * dtSim;
      p.vy += p.gravity * dtSim;
    }
  }

  function step(dt: number, rect: VolcanoFrameRect) {
    const safeDt = Math.min(dt, 0.05);
    simTime += safeDt;

    const p = rect.progress;
    // Crater stays active from stillness (0.0) through eruption (0.20..0.55) and tapers cleanly by 0.74
    const craterVisibility = 1 - smoothstep(0.60, 0.78, p);
    // Smooth eruption intensity bell: rises cleanly at Ignition, peaks in Eruption, eases into Code Flow
    const eruption = smoothstep(0.14, 0.36, p) * (1 - smoothstep(0.54, 0.74, p));
    const codeFlow = smoothstep(0.42, 0.58, p) * (1 - smoothstep(0.68, 0.78, p));
    const logoPresence = smoothstep(0.76, 0.90, p);

    // Seed initial gentle embers on the very first paint so p=0 feels immediately alive
    if (!seeded) {
      seeded = true;
      const initialCount = rect.compact ? 14 : 24;
      for (let i = 0; i < initialCount; i++) {
        spawnCraterParticle(rect, eruption, codeFlow, Math.random() * 0.85);
      }
    }

    const densityScale = rect.compact ? 0.58 : 1;

    if (craterVisibility > 0.04) {
      // Smooth emission ramp: calm ambient embers at stillness → rich fountain volley during eruption
      const craterRate = (11 + eruption * 74 + codeFlow * 18) * craterVisibility * densityScale;
      spawnCarry += craterRate * safeDt;
      const toSpawn = Math.min(6, Math.floor(spawnCarry));
      spawnCarry -= toSpawn;
      for (let i = 0; i < toSpawn; i++) {
        spawnCraterParticle(rect, eruption, codeFlow, 0);
      }
    }

    if (logoPresence > 0.1) {
      const logoRate = 9 * logoPresence * densityScale;
      logoSpawnCarry += logoRate * safeDt;
      const toSpawn = Math.min(2, Math.floor(logoSpawnCarry));
      logoSpawnCarry -= toSpawn;
      for (let i = 0; i < toSpawn; i++) {
        spawnLogoEmber(rect, 0);
      }
    }

    // Integrate active particles
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const pt = particles[i];
      if (pt.age >= pt.life) continue;
      pt.age += safeDt;
      if (pt.age >= pt.life) continue;

      const sway = Math.sin(pt.age * pt.swayFreq + pt.phase) * pt.swayAmp;
      pt.vx *= Math.pow(pt.drag, safeDt * 60);
      pt.vy += pt.gravity * safeDt;
      pt.x += (pt.vx + sway) * safeDt;
      pt.y += pt.vy * safeDt;
    }
  }

  function drawCraterAtmosphere(ctx: CanvasRenderingContext2D, rect: VolcanoFrameRect) {
    const p = rect.progress;
    const craterVisibility = 1 - smoothstep(0.58, 0.76, p);
    if (craterVisibility <= 0.005) return;

    const eruption = smoothstep(0.14, 0.36, p) * (1 - smoothstep(0.54, 0.74, p));
    const pulse = 0.5 + 0.5 * Math.sin(simTime * 2.1 + Math.sin(simTime * 0.9) * 0.7);
    const fastFlicker = 0.5 + 0.5 * Math.sin(simTime * 6.4 + 1.1);
    const { cx, cy, scale } = craterPoint(rect);

    ctx.save();

    // 1. Wide volumetric volcanic sky bloom (screen blend preserves lush magma warmth without clipping)
    ctx.globalCompositeOperation = "screen";
    const wideRadius = (230 + eruption * 195 + pulse * 26) * scale;
    ctx.globalAlpha = clamp((0.26 + eruption * 0.44 + pulse * 0.06) * craterVisibility, 0, 0.85);
    ctx.drawImage(bloomWide, cx - wideRadius, cy - wideRadius * 1.08, wideRadius * 2, wideRadius * 2);

    // 2. Sculpted eruption plume halo rising smoothly above the crater during ignition & eruption
    if (eruption > 0.02) {
      const plumeY = cy - (56 + eruption * 95) * scale;
      const plumeRx = (125 + eruption * 110 + fastFlicker * 12) * scale;
      const plumeRy = (155 + eruption * 145) * scale;
      ctx.globalAlpha = clamp((0.24 + eruption * 0.34) * craterVisibility, 0, 0.65);
      ctx.drawImage(bloomWide, cx - plumeRx, plumeY - plumeRy, plumeRx * 2, plumeRy * 2);
    }

    // 3. Convective heat shimmer waves drifting upward above the caldera
    const shimmerStrength = (0.14 + eruption * 0.28) * craterVisibility;
    for (let i = 0; i < heatWaves.length; i++) {
      const w = heatWaves[i];
      const cycle = (simTime * w.speed + w.phase * 0.19) % 1;
      const fade = Math.sin(cycle * Math.PI);
      const rise = cycle * (155 + eruption * 135) * scale;
      const driftX =
        w.offsetX * (48 + eruption * 44) * scale +
        Math.sin(simTime * 2.3 + w.phase + cycle * 4.5) * 18 * w.sway * scale;
      const rx = (54 + cycle * 42) * w.widthScale * scale;
      const ry = (34 + cycle * 26) * w.heightScale * scale;
      ctx.globalAlpha = fade * shimmerStrength * 0.55;
      ctx.drawImage(hazeWisp, cx + driftX - rx, cy - rise - ry, rx * 2, ry * 2);
    }

    // 4. Incandescent caldera core glow (tighter lighter blend right on the molten mouth)
    ctx.globalCompositeOperation = "lighter";
    const coreRadius = (74 + eruption * 82 + fastFlicker * 10) * scale;
    ctx.globalAlpha = clamp((0.24 + eruption * 0.42 + pulse * 0.08) * craterVisibility, 0, 0.78);
    ctx.drawImage(bloomCore, cx - coreRadius, cy - coreRadius * 0.94, coreRadius * 2, coreRadius * 2);

    ctx.restore();
  }

  function drawLogoAtmosphere(ctx: CanvasRenderingContext2D, rect: VolcanoFrameRect) {
    const logoPresence = smoothstep(0.78, 0.92, rect.progress);
    if (logoPresence <= 0.01) return;

    const { lx, ly, scale } = logoPeakPoint(rect);
    const breathe = 0.5 + 0.5 * Math.sin(simTime * 1.85);

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const glowR = (88 + breathe * 16) * scale;
    ctx.globalAlpha = (0.18 + breathe * 0.09) * logoPresence;
    ctx.drawImage(bloomWide, lx - glowR, ly - glowR * 1.1, glowR * 2, glowR * 2);

    ctx.globalCompositeOperation = "lighter";
    const coreR = (34 + breathe * 6) * scale;
    ctx.globalAlpha = (0.14 + breathe * 0.08) * logoPresence;
    ctx.drawImage(bloomCore, lx - coreR, ly - coreR, coreR * 2, coreR * 2);
    ctx.restore();
  }

  function drawParticles(ctx: CanvasRenderingContext2D, rect: VolcanoFrameRect, modeFilter: 0 | 1) {
    const p = rect.progress;
    const modeAlpha =
      modeFilter === 0 ? 1 - smoothstep(0.64, 0.80, p) : smoothstep(0.78, 0.92, p);
    if (modeAlpha <= 0.01) return;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const pt = particles[i];
      if (pt.mode !== modeFilter || pt.age >= pt.life) continue;

      const t = pt.age / pt.life;
      const fadeIn = smoothstep(0, 0.1, t);
      const fadeOut = 1 - smoothstep(0.55, 1, t);
      const twinkle = 0.78 + 0.22 * Math.sin(simTime * 11 + pt.phase * 3);
      const alpha = fadeIn * fadeOut * twinkle * modeAlpha * (modeFilter === 0 ? 0.92 : 0.74);
      if (alpha <= 0.01) continue;

      const radius = pt.size * (1 - t * 0.45) * rect.dpr;
      const temp = pt.heat * (1 - t * 0.75);

      ctx.globalAlpha = alpha;

      const speed = Math.hypot(pt.vx, pt.vy);
      if (pt.streak > 1.15 && speed > 45) {
        // Velocity-aligned incandescent spark streak
        const angle = Math.atan2(pt.vy, pt.vx);
        const len = Math.max(radius * 3.2, Math.min(radius * 7.5, speed * 0.045 * pt.streak * rect.dpr));
        const thickness = radius * 2.4;
        const sprite = temp > 0.56 ? sparkHot : temp > 0.28 ? sparkWarm : sparkCool;
        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate(angle);
        ctx.drawImage(sprite, -len * 0.75, -thickness * 0.5, len, thickness);
        ctx.restore();
      } else {
        // Soft glowing floating ember
        const d = radius * 3.4;
        const sprite = temp > 0.42 ? dotHot : dotCool;
        ctx.drawImage(sprite, pt.x - d * 0.5, pt.y - d * 0.5, d, d);
      }
    }

    ctx.restore();
  }

  return {
    /** Call inside daylight-scene.ts's single rAF loop right after drawing the video frame. */
    renderCraterLayer(ctx: CanvasRenderingContext2D, dt: number, rect: VolcanoFrameRect) {
      step(dt, rect);
      drawCraterAtmosphere(ctx, rect);
      drawParticles(ctx, rect, 0);
    },
    /** Call after edge feathering so delicate logo embers sit cleanly on the obsidian identity stage. */
    renderIdentityLayer(ctx: CanvasRenderingContext2D, rect: VolcanoFrameRect) {
      drawLogoAtmosphere(ctx, rect);
      drawParticles(ctx, rect, 1);
    },
    reset() {
      seeded = false;
      spawnCarry = 0;
      logoSpawnCarry = 0;
      for (let i = 0; i < MAX_PARTICLES; i++) {
        particles[i].age = particles[i].life + 1;
      }
    },
  };
}
