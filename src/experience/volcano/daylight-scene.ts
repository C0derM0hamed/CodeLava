import { ease, mix } from "./geometry";

type Scene = { setVisible(value: boolean): void; dispose(): void };

const CODE_SNIPPETS: ReadonlyArray<readonly [string, string, string]> = [
  ["const ", "flux", " = ignite();"],
  ["async ", "stream", "(events)"],
  ["SELECT ", "*", " FROM magma"],
  ["await ", "deploy", ".release()"],
  ["// ", "ابتكار يتدفق برمجياً", ""],
  ["type ", "Core", "<T> = Flow<T>"],
  ["fn ", "compile", "() -> Product"],
  ["yield ", "spark", ".emit()"],
  ["// ", "تدفّق برمجي حي", ""],
  ["return ", "scale", "(region)"],
  ["import ", "ai", " from '@lava/core'"],
  ["let ", "pulse", " = 0xFF6A00"],
];

interface CraterAnchor {
  x: number;
  y: number;
  scale: number;
}

/**
 * Computes exact screen coordinates of the volcano crater mouth (source 1280×720 -> crater at 0.50, 0.39)
 * matching CSS `object-fit: cover` and `object-position` across every viewport aspect ratio and RTL/LTR.
 */
function getCraterAnchor(width: number, height: number, isRtl: boolean, isCompact: boolean): CraterAnchor {
  const srcW = 1280;
  const srcH = 720;
  const scale = Math.max(width / srcW, height / srcH);
  const renderedW = srcW * scale;
  const renderedH = srcH * scale;
  const posX = isCompact ? 0.5 : isRtl ? 0.66 : 0.34;
  const posY = isCompact ? 0.42 : 0.46;
  const offsetX = (width - renderedW) * posX;
  const offsetY = (height - renderedH) * posY;
  return {
    x: offsetX + renderedW * 0.5,
    y: offsetY + renderedH * 0.39,
    scale,
  };
}

/**
 * GPU WebGL incandescent volcanic ember renderer:
 * - Always gently emits rising embers from the crater & lava slopes at p = 0 so the hero feels alive.
 * - Intensifies into dramatic ballistic fire-fountain sparks synchronized with the real footage on scroll.
 */
function createHeroEmbers(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!gl) return null;

  const vert = `
    attribute float seed;
    uniform float time, progress, width, height, craterX, craterY, ratio;
    varying float heat, alpha;
    float hash(float n) { return fract(sin(n * 127.1 + 311.7) * 43758.5453); }
    void main() {
      float r1 = hash(seed);
      float r2 = hash(seed + 19.3);
      float r3 = hash(seed + 47.1);
      float r4 = hash(seed + 83.7);
      bool isAmbient = mod(seed, 3.0) < 1.0;

      float px, py;
      if (isAmbient) {
        // Gentle continuous rising embers from the crater & warm basalt flanks even at scroll 0
        float life = fract(r1 + time * (0.075 + r2 * 0.085));
        float spread = (r3 - 0.5) * width * (0.14 + life * 0.24);
        float drift = sin(time * (1.2 + r4) + seed) * 18.0 * life;
        px = craterX + spread + drift;
        py = craterY + (r4 - 0.15) * height * 0.22 - life * height * (0.28 + r2 * 0.22);
        alpha = smoothstep(0.0, 0.14, life) * (1.0 - smoothstep(0.62, 1.0, life)) * (0.42 + 0.35 * r3);
        heat = 0.45 + 0.55 * (1.0 - life);
      } else {
        // Scroll-driven eruptive volcanic spark volleys synced to the real fire fountain
        float burst = smoothstep(0.03, 0.24, progress) * (1.0 - smoothstep(0.58, 0.88, progress));
        float cycle = fract(r1 + progress * (1.9 + r2 * 0.8) + time * 0.03);
        float angle = (r3 - 0.5) * 2.15;
        float speedX = sin(angle) * width * (0.22 + r4 * 0.26);
        float speedY = (0.34 + r2 * 0.38) * height;
        float gravity = 0.28 * height;
        px = craterX + speedX * cycle + sin(cycle * 6.0 + seed) * 9.0;
        py = craterY - speedY * cycle + gravity * cycle * cycle;
        alpha = burst * smoothstep(0.0, 0.08, cycle) * (1.0 - smoothstep(0.58, 1.0, cycle)) * 0.92;
        heat = clamp(1.0 - cycle * 0.65 + r4 * 0.25, 0.0, 1.0);
      }

      vec2 clip = vec2((px / width) * 2.0 - 1.0, 1.0 - (py / height) * 2.0);
      gl_Position = vec4(clip, 0.0, 1.0);
      gl_PointSize = ratio * (isAmbient ? (1.4 + r2 * 2.4) : (1.8 + r2 * 3.4));
    }
  `;

  const frag = `
    precision mediump float;
    varying float heat, alpha;
    void main() {
      float d = length(gl_PointCoord - 0.5) * 2.0;
      float core = 1.0 - smoothstep(0.08, 1.0, d);
      vec3 col = mix(vec3(0.95, 0.28, 0.04), vec3(1.0, 0.84, 0.38), heat);
      gl_FragColor = vec4(col, alpha * core);
    }
  `;

  const program = gl.createProgram();
  if (!program) return null;

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return false;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const ok = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (ok) gl.attachShader(program, shader);
    gl.deleteShader(shader);
    return Boolean(ok);
  };

  if (!compile(gl.VERTEX_SHADER, vert) || !compile(gl.FRAGMENT_SHADER, frag)) {
    gl.deleteProgram(program);
    return null;
  }

  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  gl.useProgram(program);
  const maxParticles = 300;
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    Float32Array.from({ length: maxParticles }, (_, i) => i + 1),
    gl.STATIC_DRAW,
  );
  const seedLoc = gl.getAttribLocation(program, "seed");
  gl.enableVertexAttribArray(seedLoc);
  gl.vertexAttribPointer(seedLoc, 1, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(program, "time");
  const uProgress = gl.getUniformLocation(program, "progress");
  const uWidth = gl.getUniformLocation(program, "width");
  const uHeight = gl.getUniformLocation(program, "height");
  const uCraterX = gl.getUniformLocation(program, "craterX");
  const uCraterY = gl.getUniformLocation(program, "craterY");
  const uRatio = gl.getUniformLocation(program, "ratio");

  gl.enable(gl.BLEND);
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE);

  let count = maxParticles;
  let w = 1;
  let h = 1;
  let dpr = 1;

  return {
    resize(width: number, height: number, compact: boolean) {
      w = Math.max(1, width);
      h = Math.max(1, height);
      dpr = Math.min(window.devicePixelRatio || 1, compact ? 1.25 : 1.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uWidth, w);
      gl.uniform1f(uHeight, h);
      gl.uniform1f(uRatio, dpr);
      count = compact ? 140 : maxParticles;
    },
    draw(timeSec: number, progress: number, crater: CraterAnchor) {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, timeSec);
      gl.uniform1f(uProgress, progress);
      gl.uniform1f(uCraterX, crater.x);
      gl.uniform1f(uCraterY, crater.y);
      gl.drawArrays(gl.POINTS, 0, count);
    },
    dispose() {
      gl.disableVertexAttribArray(seedLoc);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.useProgram(null);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
  };
}

/**
 * Crisp 2D Canvas ballistic syntax-highlighted code fragments erupting out of the crater
 * and dispersing organically across the dark sky with fine glowing ember trails.
 */
function createHeroCode(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const computed = getComputedStyle(canvas);
  const tokenColor = (name: string, fallback: string) =>
    computed.getPropertyValue("--" + name).trim() || fallback;

  const palette = [
    tokenColor("syntax-cyan", "#5ee7f0"),
    tokenColor("ember", "#ffcf4a"),
    tokenColor("lava-300", "#ffb066"),
    tokenColor("syntax-blue", "#6aa8ff"),
    tokenColor("syntax-green", "#7fe08a"),
  ];
  const ash = tokenColor("ash-50", "#fbf7f2");
  const lava = tokenColor("lava-500", "#ff6a00");
  const ember = tokenColor("ember", "#ffcf4a");
  const fontMono = computed.getPropertyValue("--font-code").trim() || "ui-monospace, monospace";
  const fontAr = computed.getPropertyValue("--font-body-arabic").trim() || "sans-serif";

  const depths = [1.0, 0.82, 0.94, 0.62, 0.88, 0.56];
  let baked: { img: HTMLCanvasElement; w: number; h: number }[] = [];
  let w = 1;
  let h = 1;
  let dpr = 1;
  let compact = false;
  let hadPaint = false;

  function bakeSprites() {
    if (!ctx) return;
    baked = CODE_SNIPPETS.map((parts, idx) => {
      const depth = depths[Math.floor(idx / 2) % depths.length];
      const hasArabic = /[\u0600-\u06FF]/.test(parts.join(""));
      const fontSize = (compact ? 11 : 12.5) + depth * (compact ? 2.5 : 4.5);
      const fontFamily = hasArabic ? `${fontAr}, ${fontMono}` : `${fontMono}, monospace`;
      const face = `${depth > 0.8 ? 600 : 500} ${fontSize}px ${fontFamily}`;

      ctx.font = face;
      const textWidth = ctx.measureText(parts.join("")).width;
      const padX = 12;
      const padY = 8;
      const logicalW = Math.ceil(textWidth + padX * 2);
      const logicalH = Math.ceil(fontSize * 1.7 + padY * 2);
      const scale = 2;

      const off = document.createElement("canvas");
      off.width = logicalW * scale;
      off.height = logicalH * scale;
      const g = off.getContext("2d")!;
      g.scale(scale, scale);
      g.font = face;
      g.direction = hasArabic ? "rtl" : "ltr";
      g.textBaseline = "middle";
      if (depth < 0.65) g.filter = "blur(0.75px)";
      g.shadowColor = "rgba(7, 6, 10, 0.92)";
      g.shadowBlur = 10;

      if (hasArabic) {
        g.textAlign = "center";
        g.fillStyle = palette[idx % palette.length];
        g.fillText(parts.join(""), logicalW / 2, logicalH / 2);
      } else {
        let cursorX = padX;
        for (let k = 0; k < parts.length; k++) {
          const chunk = parts[k];
          if (!chunk) continue;
          g.fillStyle = k === 2 ? ash : palette[(idx + k) % palette.length];
          g.fillText(chunk, cursorX, logicalH / 2);
          cursorX += g.measureText(chunk).width;
        }
      }
      return { img: off, w: logicalW, h: logicalH };
    });
  }

  return {
    resize(width: number, height: number, isCompact: boolean) {
      w = Math.max(1, width);
      h = Math.max(1, height);
      compact = isCompact;
      dpr = Math.min(window.devicePixelRatio || 1, compact ? 1.25 : 1.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      bakeSprites();
      hadPaint = false;
    },
    draw(progress: number, crater: CraterAnchor, isRtl: boolean) {
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (hadPaint) ctx.clearRect(0, 0, w, h);

      // Visible during the volcanic eruption and code-flow stages (p = 0.08 -> 0.92)
      const masterGain = ease(0.08, 0.22, progress) * (1 - ease(0.76, 0.95, progress));
      hadPaint = masterGain > 0.005;
      if (!hadPaint) return;

      const count = compact ? 6 : 10;
      const orbitBlend = ease(0.48, 0.8, progress);
      const occupied: Array<{ x: number; y: number; hw: number; hh: number }> = [];

      // Distinct non-overlapping fan slots fanning wide into the dark sky above/beside the crater
      const slots: ReadonlyArray<readonly [number, number]> = [
        [-0.36, 0.28],
        [0.32, 0.3],
        [-0.22, 0.4],
        [0.18, 0.42],
        [-0.44, 0.16],
        [0.42, 0.18],
        [-0.1, 0.46],
        [0.08, 0.34],
        [-0.3, 0.18],
        [0.28, 0.2],
      ];

      for (let i = 0; i < count; i++) {
        const sprite = baked[i];
        if (!sprite) continue;

        const [slotX, slotY] = slots[i % slots.length];
        const depth = depths[Math.floor(i / 2) % depths.length];
        const launchAt = 0.08 + i * 0.014;
        const t = Math.max(0, Math.min(1, (progress - launchAt) / 0.34));
        if (t <= 0.001) continue;

        const easedT = 1 - Math.pow(1 - t, 2.2);
        const spanX = compact ? w * 0.72 : w * 0.82;
        const spanY = compact ? h * 0.62 : h * 0.72;
        const horizBias = compact ? 0 : isRtl ? -w * 0.06 : w * 0.06;

        const arcX = crater.x + horizBias + slotX * spanX * easedT;
        const arcY = crater.y - slotY * spanY * easedT - Math.sin(t * Math.PI) * 18;

        // Graceful wide celestial arc above the volcano peak as eruption settles
        const arcAngle = ((i / (count - 1)) - 0.5) * Math.PI * 0.92;
        const rx = w * (compact ? 0.38 : 0.31);
        const ry = h * 0.13;
        const flowX = crater.x + horizBias + Math.sin(arcAngle) * rx;
        const flowY = Math.max(88, crater.y - h * 0.25 - Math.cos(arcAngle) * ry);

        const padX = sprite.w * 0.5 + 16;
        const x = Math.max(padX, Math.min(w - padX, mix(arcX, flowX, orbitBlend)));
        const y = Math.max(82, Math.min(crater.y - 26, mix(arcY, flowY, orbitBlend)));

        // Strict bounding-box collision check so snippets never overlap each other
        const hw = sprite.w * 0.5 + 10;
        const hh = sprite.h * 0.5 + 6;
        let collides = false;
        for (const box of occupied) {
          if (Math.abs(x - box.x) < hw + box.hw && Math.abs(y - box.y) < hh + box.hh) {
            collides = true;
            break;
          }
        }
        if (collides) continue;

        const itemAlpha = masterGain * ease(0.06, 0.26, t) * (0.68 + 0.32 * depth);
        if (itemAlpha <= 0.03) continue;
        occupied.push({ x, y, hw, hh });

        // Fine incandescent tracer connecting fragment trajectory back toward crater
        const trailAlpha = itemAlpha * (1 - orbitBlend) * 0.36;
        if (trailAlpha > 0.015) {
          const prevT = Math.max(0, easedT - 0.16);
          const tx = crater.x + horizBias + slotX * spanX * prevT;
          const ty = crater.y - slotY * spanY * prevT;
          ctx.globalAlpha = trailAlpha;
          ctx.strokeStyle = i % 2 === 0 ? ember : lava;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(x, y);
          ctx.stroke();
        }

        // Subtle obsidian glass pill halo keeps foreground syntax razor-sharp against flame glow
        ctx.globalAlpha = itemAlpha * 0.48;
        ctx.fillStyle = "rgba(8, 9, 15, 0.72)";
        ctx.beginPath();
        ctx.roundRect(x - sprite.w / 2 - 4, y - sprite.h / 2 + 2, sprite.w + 8, sprite.h - 4, 8);
        ctx.fill();

        ctx.globalAlpha = itemAlpha;
        ctx.drawImage(sprite.img, x - sprite.w / 2, y - sprite.h / 2, sprite.w, sprite.h);
      }
      ctx.globalAlpha = 1;
    },
  };
}

export async function mountDaylight(art: HTMLElement, signal: AbortSignal): Promise<Scene | null> {
  if (signal.aborted) return null;

  const stage = art.closest<HTMLElement>("[data-daylight-stage]");
  const pin = stage?.querySelector<HTMLElement>(".dl-pin");
  const video = art.querySelector<HTMLVideoElement>(".dl-video");
  const embersCanvas = art.querySelector<HTMLCanvasElement>("[data-dl-embers]");
  const codeCanvas = art.querySelector<HTMLCanvasElement>("[data-dl-code]");
  const phaseNodes = stage ? Array.from(stage.querySelectorAll<HTMLElement>("[data-dl-phase]")) : [];

  const isCompactQuery = matchMedia("(max-width: 900px), (pointer: coarse)");
  let compact = isCompactQuery.matches;
  const isRtl = (stage?.dir || document.documentElement.dir) === "rtl";

  const embers = embersCanvas ? createHeroEmbers(embersCanvas) : null;
  const code = codeCanvas ? createHeroCode(codeCanvas) : null;

  let active = false;
  let disposed = false;
  let raf = 0;
  let width = 1;
  let height = 1;
  let startY = 0;
  let travel = 1;
  let currentProgress = 0;
  let targetPointerX = 0;
  let targetPointerY = 0;
  let smoothPointerX = 0;
  let smoothPointerY = 0;
  let lastPhase = -1;
  let videoLoaded = false;
  let crater: CraterAnchor = { x: 0, y: 0, scale: 1 };
  const t0 = performance.now();

  const shared = window as Window & { __lenis?: { on(e: string, fn: () => void): void; off(e: string, fn: () => void): void } };
  let attachedLenis: typeof shared.__lenis;

  const styleCache: Record<string, string> = {};
  function setVar(target: HTMLElement | null | undefined, name: string, value: string) {
    if (!target || styleCache[name] === value) return;
    styleCache[name] = value;
    target.style.setProperty(name, value);
  }

  function seekVideo(p: number) {
    if (!video || !videoLoaded || video.readyState < 1 || video.seeking) return;
    const duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;
    // Map scroll 0.02 -> 0.62 smoothly across the full 3.625s eruption footage
    const targetTime = Math.min(duration - 1 / 24, ease(0.02, 0.62, p) * (duration - 1 / 24));
    if (Math.abs(video.currentTime - targetTime) >= 1 / 48) {
      video.currentTime = targetTime;
    }
  }

  function onVideoReady() {
    videoLoaded = true;
    art.dataset.videoReady = "";
    seekVideo(currentProgress);
  }

  function onVideoError() {
    videoLoaded = false;
    delete art.dataset.videoReady;
  }

  function onVideoSeeked() {
    if (active && !disposed) seekVideo(currentProgress);
  }

  function ensureVideoSource() {
    if (!video || video.hasAttribute("src")) return;
    video.preload = "auto";
    video.src = compact ? "/media/hero/fountain-480.mp4" : "/media/hero/fountain-720.mp4";
  }

  function measure() {
    if (disposed) return;
    compact = isCompactQuery.matches;
    const bounds = art.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    crater = getCraterAnchor(width, height, isRtl, compact);

    if (pin && stage) {
      const pinHeight = pin.offsetHeight;
      stage.style.setProperty("--dl-pin-height", `${pinHeight}px`);
      startY = stage.getBoundingClientRect().top + window.scrollY + Math.max(0, pinHeight - window.innerHeight);
      travel = Math.max(1, stage.offsetHeight - pinHeight);
    } else {
      startY = bounds.top + window.scrollY;
      travel = Math.max(1, height);
    }

    embers?.resize(width, height, compact);
    code?.resize(width, height, compact);
  }

  function onPointerMove(e: PointerEvent) {
    if (!active || e.pointerType !== "mouse") return;
    targetPointerX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetPointerY = (e.clientY / window.innerHeight - 0.5) * 2;
  }

  function onPointerLeave() {
    targetPointerX = 0;
    targetPointerY = 0;
  }

  function onScroll() {
    if (!active || disposed) return;
    currentProgress = Math.max(0, Math.min(1, (window.scrollY - startY) / travel));
    seekVideo(currentProgress);
  }

  function loop(now: number) {
    raf = 0;
    if (!active || disposed || document.hidden) return;

    if (shared.__lenis !== attachedLenis) {
      attachedLenis?.off("scroll", onScroll);
      attachedLenis = shared.__lenis;
      attachedLenis?.on("scroll", onScroll);
    }

    currentProgress = Math.max(0, Math.min(1, (window.scrollY - startY) / travel));
    const p = currentProgress;

    // Smooth pointer parallax damping
    smoothPointerX += (targetPointerX - smoothPointerX) * 0.08;
    smoothPointerY += (targetPointerY - smoothPointerY) * 0.08;

    const zoom = 1 + ease(0.02, 0.78, p) * 0.075;
    const panY = -ease(0.02, 0.85, p) * (compact ? 14 : 26);
    const heat = 0.42 + ease(0.04, 0.48, p) * 0.58;
    const copyY = -ease(0.55, 1.0, p) * 24;

    setVar(stage, "--dl-progress", (0.06 + p * 0.94).toFixed(4));
    setVar(stage, "--dl-zoom", zoom.toFixed(4));
    setVar(stage, "--dl-pan-y", `${panY.toFixed(1)}px`);
    setVar(stage, "--dl-mx", `${(smoothPointerX * (compact ? 0 : -9)).toFixed(2)}px`);
    setVar(stage, "--dl-my", `${(smoothPointerY * (compact ? 0 : -6)).toFixed(2)}px`);
    setVar(stage, "--dl-heat", heat.toFixed(3));
    setVar(stage, "--dl-copy-y", `${copyY.toFixed(1)}px`);

    const phaseIdx = p < 0.08 ? 0 : p < 0.25 ? 1 : p < 0.56 ? 2 : 3;
    if (phaseIdx !== lastPhase) {
      phaseNodes.forEach((node, idx) => {
        node.hidden = idx !== phaseIdx;
      });
      lastPhase = phaseIdx;
    }

    const timeSec = (now - t0) / 1000;
    embers?.draw(timeSec, p, crater);
    code?.draw(p, crater, isRtl);
    seekVideo(p);

    raf = requestAnimationFrame(loop);
  }

  function startLoop() {
    if (active && !disposed && !raf && !document.hidden) {
      raf = requestAnimationFrame(loop);
    }
  }

  function setVisible(value: boolean) {
    if (disposed || value === active) return;
    active = value;
    art.toggleAttribute("data-moving", active);
    if (active) {
      if (stage) stage.dataset.story = "";
      ensureVideoSource();
      measure();
      startLoop();
    } else {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(raf);
    ro.disconnect();
    attachedLenis?.off("scroll", onScroll);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", measure);
    window.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerleave", onPointerLeave);
    video?.removeEventListener("loadeddata", onVideoReady);
    video?.removeEventListener("error", onVideoError);
    video?.removeEventListener("seeked", onVideoSeeked);
    if (video) {
      video.removeAttribute("src");
      video.load();
    }
    embers?.dispose();
    delete stage?.dataset.story;
    delete art.dataset.videoReady;
    delete art.dataset.moving;
    for (const key of Object.keys(styleCache)) stage?.style.removeProperty(key);
    stage?.style.removeProperty("--dl-pin-height");
  }

  const ro = new ResizeObserver(measure);
  ro.observe(art);
  if (pin) ro.observe(pin);

  video?.addEventListener("loadeddata", onVideoReady);
  video?.addEventListener("error", onVideoError);
  video?.addEventListener("seeked", onVideoSeeked);
  signal.addEventListener("abort", dispose, { once: true });

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", measure, { passive: true });
  if (!compact) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);
  }

  return { setVisible, dispose };
}
