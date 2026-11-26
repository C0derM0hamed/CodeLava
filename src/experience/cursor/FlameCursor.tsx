"use client";

import { useEffect, useRef } from "react";

interface Rgb {
  r: number;
  g: number;
  b: number;
}

interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  size: number;
  phase: number;
  isSmoke: boolean;
}

export interface FlameCursorProps {
  /** Override default "View" label shown on [data-cursor="view"] in LTR. */
  viewLabelEn?: string;
  /** Override default "عرض" label shown on [data-cursor="view"] in RTL. */
  viewLabelAr?: string;
  /** Disable custom cursor programmatically (e.g., admin routes). */
  disabled?: boolean;
}

const POOL_SIZE = 88;

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], [role="tab"], summary, label[for], [data-cursor="pointer"], [data-cursor="magnetic"]';

const NATIVE_TEXT_SELECTOR =
  'input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]):not([type="range"]), textarea, select, [contenteditable="true"], [data-cursor="native"], [data-cursor="hidden"]';

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

function lerpRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return {
    r: (a.r + (b.r - a.r) * t) | 0,
    g: (a.g + (b.g - a.g) * t) | 0,
    b: (a.b + (b.b - a.b) * t) | 0,
  };
}

/**
 * CodeLava signature Flame Cursor.
 * Keeps a crisp, familiar arrow pointer (warm-white with molten lava rim) that
 * emits pooled 2D canvas embers & rising heat wisps from its tip and trail.
 * Zero React state updates per frame; fine-pointer only; disabled for reduced motion.
 */
export function FlameCursor({
  viewLabelEn = "View",
  viewLabelAr = "عرض",
  disabled = false,
}: FlameCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef<HTMLDivElement | null>(null);
  const arrowWrapRef = useRef<HTMLDivElement | null>(null);
  const badgeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (disabled || typeof window === "undefined") return;

    const mqFine = window.matchMedia("(pointer: fine) and (hover: hover)");
    const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!mqFine.matches || mqReduced.matches) {
      return;
    }

    const canvas = canvasRef.current;
    const pointerEl = pointerRef.current;
    const arrowWrapEl = arrowWrapRef.current;
    const badgeEl = badgeRef.current;
    if (!canvas || !pointerEl || !arrowWrapEl || !badgeEl) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Resolve palette once from CSS custom properties (zero hardcoded hex)
    const styles = getComputedStyle(document.documentElement);
    const cCore = parseCssColor(styles.getPropertyValue("--lava-100"), { r: 255, g: 226, b: 199 });
    const cEmber = parseCssColor(styles.getPropertyValue("--ember"), { r: 255, g: 207, b: 74 });
    const cLavaHot = parseCssColor(styles.getPropertyValue("--lava-400"), { r: 255, g: 138, b: 42 });
    const cLava = parseCssColor(styles.getPropertyValue("--lava-500"), { r: 255, g: 106, b: 0 });
    const cCooling = parseCssColor(styles.getPropertyValue("--lava-700"), { r: 184, g: 54, b: 10 });
    const cAsh = parseCssColor(styles.getPropertyValue("--ash-500"), { r: 140, g: 131, b: 121 });

    // Pre-allocated particle pool (zero GC churn)
    const pool: Particle[] = Array.from({ length: POOL_SIZE }, () => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      age: 0,
      life: 0.5,
      size: 2,
      phase: 0,
      isSmoke: false,
    }));
    let cursorPoolIdx = 0;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // Mutable frame state (no React state)
    let x = -200;
    let y = -200;
    let lastX = -200;
    let lastY = -200;
    let speed = 0;
    let visible = false;
    let isNativeMode = false;
    let isHover = false;
    let isView = false;
    let isPressed = false;
    let isRtlContext = document.documentElement.dir === "rtl";
    let currentScale = 1;
    let currentRotate = 0;
    let spawnCarry = 0;
    let rafId = 0;
    let lastTime = 0;
    let activeCount = 0;
    let activeClassApplied = false;
    // Track previous frame's painted bounds so we only clear dirty pixels (95%+ less fill-rate)
    let dirtyMinX = 0;
    let dirtyMinY = 0;
    let dirtyMaxX = 0;
    let dirtyMaxY = 0;
    let hasDirty = false;

    const enableCursorClass = (enable: boolean) => {
      if (enable === activeClassApplied) return;
      activeClassApplied = enable;
      document.documentElement.classList.toggle("cursor-flame-active", enable);
    };

    const spawnParticle = (
      px: number,
      py: number,
      boostX: number,
      boostY: number,
      intensity: number,
      smoke = false,
    ) => {
      const p = pool[cursorPoolIdx];
      cursorPoolIdx = (cursorPoolIdx + 1) % POOL_SIZE;
      if (!p.active) activeCount++;

      const spread = (Math.random() - 0.5) * (smoke ? 26 : 18 + intensity * 14);
      p.active = true;
      p.x = px + (Math.random() - 0.5) * 3.5;
      p.y = py + (Math.random() - 0.5) * 3.5;
      p.vx = spread - boostX * 0.16;
      p.vy = -(22 + Math.random() * (smoke ? 24 : 38 + intensity * 26)) - boostY * 0.12;
      p.age = 0;
      p.life = smoke
        ? 0.52 + Math.random() * 0.38
        : 0.3 + Math.random() * (0.34 + intensity * 0.22);
      p.size = smoke
        ? 2.4 + Math.random() * 2.5
        : 1.25 + Math.random() * (2.0 + intensity * 1.25);
      p.phase = Math.random() * Math.PI * 2;
      p.isSmoke = smoke;
    };

    const inspectTarget = (target: EventTarget | null) => {
      if (!(target instanceof Element)) {
        isNativeMode = false;
        isHover = false;
        isView = false;
        badgeEl.style.opacity = "0";
        return;
      }

      const dirHost = target.closest("[dir]");
      isRtlContext = (dirHost?.getAttribute("dir") ?? document.documentElement.dir) === "rtl";

      if (target.closest(NATIVE_TEXT_SELECTOR)) {
        isNativeMode = true;
        isHover = false;
        isView = false;
        badgeEl.style.opacity = "0";
        return;
      }

      isNativeMode = false;

      const viewHost = target.closest('[data-cursor="view"], [data-cursor-label]');
      if (viewHost) {
        const customLabel = viewHost.getAttribute("data-cursor-label");
        const labelText = customLabel || (isRtlContext ? viewLabelAr : viewLabelEn);
        if (badgeEl.textContent !== labelText) {
          badgeEl.textContent = labelText;
        }
        badgeEl.dir = isRtlContext ? "rtl" : "ltr";
        isView = true;
        isHover = true;
        badgeEl.style.opacity = "1";
        badgeEl.style.transform = isRtlContext
          ? "translate3d(-14px, 18px, 0) scale(1)"
          : "translate3d(20px, 18px, 0) scale(1)";
        return;
      }

      isView = false;
      badgeEl.style.opacity = "0";
      badgeEl.style.transform = isRtlContext
        ? "translate3d(-10px, 22px, 0) scale(0.9)"
        : "translate3d(16px, 22px, 0) scale(0.9)";

      isHover = Boolean(target.closest(INTERACTIVE_SELECTOR));
    };

    const startLoop = () => {
      if (rafId !== 0 || document.hidden) return;
      lastTime = performance.now();
      rafId = requestAnimationFrame(tick);
    };

    const stopLoop = () => {
      if (rafId !== 0) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const tick = (now: number) => {
      rafId = 0;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Velocity & intensity
      const dx = x - lastX;
      const dy = y - lastY;
      const instSpeed = dt > 0 ? Math.hypot(dx, dy) / dt : 0;
      speed = speed * 0.72 + instSpeed * 0.28;
      lastX = x;
      lastY = y;

      const speedNorm = Math.min(speed / 1350, 1);
      const flare = isHover ? 0.55 : 0;
      const intensity = Math.min(1.25, speedNorm * 0.95 + flare + (isPressed ? 0.45 : 0));

      // Imperative pointer arrow positioning — zero React re-renders, zero lag
      const showArrow = visible && !isNativeMode;
      pointerEl.style.opacity = showArrow ? "1" : "0";
      if (showArrow) {
        pointerEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;

        const targetScale = isPressed ? 0.9 : isView ? 1.16 : isHover ? 1.11 : 1;
        const targetRotate = Math.max(-14, Math.min(14, dx * 0.45));
        currentScale += (targetScale - currentScale) * Math.min(1, dt * 18);
        currentRotate += (targetRotate - currentRotate) * Math.min(1, dt * 14);
        arrowWrapEl.style.transform = `scale(${currentScale.toFixed(3)}) rotate(${currentRotate.toFixed(2)}deg)`;
        arrowWrapEl.dataset.hot = isHover || speedNorm > 0.35 ? "1" : "0";
      }

      // Emit particles when visible and not over native text inputs
      if (showArrow) {
        // Idle = subtle smoulder (~10/sec); movement/hover ramps smoothly up to ~75/sec
        const rate = 11 + intensity * 62;
        spawnCarry += rate * dt;

        const count = Math.min(4, Math.floor(spawnCarry));
        spawnCarry -= count;

        // Emit near pointer tip + fiery flank edge
        const tipX = x + 3;
        const tipY = y + 4;
        for (let i = 0; i < count; i++) {
          const frac = count > 1 ? i / count : 0;
          const sx = tipX - dx * frac * 0.65;
          const sy = tipY - dy * frac * 0.65;
          spawnParticle(sx, sy, dx, dy, intensity, false);
          if (Math.random() < 0.24) {
            spawnParticle(sx + 2, sy + 4, dx * 0.4, dy * 0.4, intensity * 0.5, true);
          }
        }
      }

      // Clear only previous frame's painted dirty rect instead of full viewport
      if (hasDirty) {
        const cx = Math.max(0, Math.floor(dirtyMinX) - 2);
        const cy = Math.max(0, Math.floor(dirtyMinY) - 2);
        const cw = Math.min(width - cx, Math.ceil(dirtyMaxX - cx) + 4);
        const ch = Math.min(height - cy, Math.ceil(dirtyMaxY - cy) + 4);
        if (cw > 0 && ch > 0) {
          ctx.clearRect(cx, cy, cw, ch);
        }
        hasDirty = false;
      }

      if (activeCount > 0) {
        let nextMinX = width;
        let nextMinY = height;
        let nextMaxX = 0;
        let nextMaxY = 0;
        const markDirty = (px: number, py: number, pr: number) => {
          if (px - pr < nextMinX) nextMinX = px - pr;
          if (py - pr < nextMinY) nextMinY = py - pr;
          if (px + pr > nextMaxX) nextMaxX = px + pr;
          if (py + pr > nextMaxY) nextMaxY = py + pr;
          hasDirty = true;
        };

        // Subtle incandescent aura directly at the arrow tip when flaring or moving fast
        if (showArrow && (isHover || speedNorm > 0.12)) {
          const auraR = 14 + intensity * 14;
          const aura = ctx.createRadialGradient(x + 3, y + 4, 0, x + 3, y + 4, auraR);
          const auraAlpha = Math.min(0.32, 0.1 + intensity * 0.18);
          aura.addColorStop(0, `rgba(${cEmber.r},${cEmber.g},${cEmber.b},${auraAlpha})`);
          aura.addColorStop(0.5, `rgba(${cLava.r},${cLava.g},${cLava.b},${auraAlpha * 0.45})`);
          aura.addColorStop(1, `rgba(${cLava.r},${cLava.g},${cLava.b},0)`);
          ctx.globalCompositeOperation = "lighter";
          ctx.fillStyle = aura;
          ctx.beginPath();
          ctx.arc(x + 3, y + 4, auraR, 0, Math.PI * 2);
          ctx.fill();
          markDirty(x + 3, y + 4, auraR + 1);
        }

        // Pass 1: Fading ash smoke wisps (normal blend)
        ctx.globalCompositeOperation = "source-over";
        for (let i = 0; i < POOL_SIZE; i++) {
          const p = pool[i];
          if (!p.active) continue;

          p.age += dt;
          if (p.age >= p.life) {
            p.active = false;
            activeCount--;
            continue;
          }

          // Thermal rise + subtle organic turbulence
          const turb = Math.sin(p.age * 11 + p.phase) * 26;
          p.vx += turb * dt;
          p.vx *= 0.95;
          p.vy -= (p.isSmoke ? 14 : 32) * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;

          if (p.isSmoke) {
            const t = p.age / p.life;
            const alpha = (1 - t) * (1 - t) * 0.18;
            const rad = p.size * (1 + t * 1.45);
            ctx.fillStyle = `rgba(${cAsh.r},${cAsh.g},${cAsh.b},${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
            ctx.fill();
            markDirty(p.x, p.y, rad + 1);
          }
        }

        // Pass 2: Hot embers & fire core (additive blend for crisp volcanic light)
        ctx.globalCompositeOperation = "lighter";
        for (let i = 0; i < POOL_SIZE; i++) {
          const p = pool[i];
          if (!p.active || p.isSmoke) continue;

          const t = p.age / p.life;
          let col: Rgb;
          if (t < 0.18) {
            col = lerpRgb(cCore, cEmber, t / 0.18);
          } else if (t < 0.5) {
            col = lerpRgb(cEmber, cLavaHot, (t - 0.18) / 0.32);
          } else if (t < 0.8) {
            col = lerpRgb(cLavaHot, cLava, (t - 0.5) / 0.3);
          } else {
            col = lerpRgb(cLava, cCooling, (t - 0.8) / 0.2);
          }

          const alpha = (1 - t) * (1 - t * 0.45) * 0.88;
          const rad = Math.max(0.45, p.size * (1 - t * 0.72));

          ctx.fillStyle = `rgba(${col.r},${col.g},${col.b},${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
          ctx.fill();
          markDirty(p.x, p.y, rad + 1);
        }
        ctx.globalCompositeOperation = "source-over";

        if (hasDirty) {
          dirtyMinX = nextMinX;
          dirtyMinY = nextMinY;
          dirtyMaxX = nextMaxX;
          dirtyMaxY = nextMaxY;
        }
      }

      // Keep running only while pointer is active or particles are still alive
      if ((showArrow || activeCount > 0) && !document.hidden) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") {
        visible = false;
        enableCursorClass(false);
        return;
      }

      if (!visible) {
        lastX = e.clientX;
        lastY = e.clientY;
        visible = true;
        enableCursorClass(true);
      }
      x = e.clientX;
      y = e.clientY;
      inspectTarget(e.target);
      startLoop();
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      isPressed = true;
      if (visible && !isNativeMode) {
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.4;
          spawnParticle(
            e.clientX + 3,
            e.clientY + 4,
            Math.cos(angle) * -90,
            Math.sin(angle) * -90,
            1.1,
            false,
          );
        }
        startLoop();
      }
    };

    const onPointerUp = () => {
      isPressed = false;
    };

    const onPointerLeave = () => {
      visible = false;
      isHover = false;
      isView = false;
      isPressed = false;
      pointerEl.style.opacity = "0";
      badgeEl.style.opacity = "0";
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        stopLoop();
      } else if (visible || activeCount > 0) {
        startLoop();
      }
    };

    const onMediaChange = () => {
      if (!mqFine.matches || mqReduced.matches) {
        visible = false;
        enableCursorClass(false);
        stopLoop();
        ctx.clearRect(0, 0, width, height);
        pointerEl.style.opacity = "0";
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave, { passive: true });
    window.addEventListener("blur", onPointerLeave, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    mqFine.addEventListener("change", onMediaChange);
    mqReduced.addEventListener("change", onMediaChange);

    return () => {
      stopLoop();
      enableCursorClass(false);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("blur", onPointerLeave);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      mqFine.removeEventListener("change", onMediaChange);
      mqReduced.removeEventListener("change", onMediaChange);
    };
  }, [disabled, viewLabelEn, viewLabelAr]);

  if (disabled) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[var(--z-cursor)] overflow-hidden"
    >
      {/* Pooled Canvas 2D ember & heat particle layer */}
      <canvas ref={canvasRef} className="block h-full w-full" />

      {/* Natural crisp SVG arrow pointer + contextual View/عرض badge */}
      <div
        ref={pointerRef}
        className="fixed left-0 top-0 opacity-0 will-change-transform"
        style={{ transition: "opacity 140ms ease-out" }}
      >
        <div
          ref={arrowWrapRef}
          className="origin-[2px_2px] will-change-transform [&[data-hot='1']_svg]:drop-shadow-[0_0_8px_var(--lava-500)]"
        >
          <svg
            width="23"
            height="27"
            viewBox="0 0 23 27"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="block overflow-visible"
          >
            {/* Outer molten lava edge */}
            <path
              d="M2.2 1.8L20.4 15.1L12.1 16.4L15.7 23.6L12.7 25.1L9.1 17.8L3.4 22.7L2.2 1.8Z"
              fill="var(--obsidian-950)"
              stroke="var(--lava-500)"
              strokeWidth="2.1"
              strokeLinejoin="round"
            />
            {/* Warm-white core arrow blade */}
            <path
              d="M3.1 3.4L18.4 14.6L11.1 15.7L14.5 22.6L13.1 23.3L9.6 16.3L4.4 20.8L3.1 3.4Z"
              fill="var(--ash-50)"
            />
            {/* Hot incandescent glint at the pointer tip */}
            <circle cx="3.2" cy="3.5" r="1.45" fill="var(--ember)" />
          </svg>
        </div>

        {/* Floating contextual label for [data-cursor="view"] */}
        <div
          ref={badgeRef}
          className="absolute left-0 top-0 whitespace-nowrap rounded-[var(--radius-sm)] border border-line-lava-strong bg-obsidian-950/92 px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-ash-50 opacity-0 shadow-[var(--lava-glow-sm)] backdrop-blur-md will-change-transform rtl:font-sans rtl:tracking-normal rtl:normal-case"
          style={{
            transition: "opacity 160ms var(--ease-out-expo), transform 180ms var(--ease-out-expo)",
          }}
        >
          {viewLabelEn}
        </div>
      </div>
    </div>
  );
}
