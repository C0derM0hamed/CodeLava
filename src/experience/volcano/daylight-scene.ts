import manifest from "../../../public/media/hero/seq/manifest.json";
import { createVolcanoFire } from "./volcano-fire";

type Tier = keyof typeof manifest.tiers;
type Frame = { index: number; tier: Tier; bitmap: ImageBitmap };
type Request = Pick<Frame, "index" | "tier">;

const last = manifest.frameCount - 1;
const anchors = [0, 0.25, 0.5, 0.75, 1].map(p => Math.round(last * p));
const key = ({ index, tier }: Request) => tier + "/" + String(index).padStart(3, "0");
const clamp = (n: number) => Math.max(0, Math.min(1, n));

export function mountDaylight(art: HTMLElement, signal: AbortSignal, onProgress?: (progress: number) => void) {
  const stage = art.closest<HTMLElement>(".dl-stage");
  const pin = stage?.querySelector<HTMLElement>(".dl-pin");
  const canvas = art.querySelector<HTMLCanvasElement>(".dl-sequence");
  const context = canvas?.getContext("2d", { alpha: false });
  if (!stage || !pin || !canvas || !context || signal.aborted || typeof createImageBitmap !== "function") return null;

  const phases = Array.from(stage.querySelectorAll<HTMLElement>("[data-dl-phase]"));
  const rtl = stage.dir === "rtl";
  const backdrop = getComputedStyle(pin).backgroundColor;
  const fire = createVolcanoFire();
  const cache = new Map<string, Frame>();
  const pending = new Map<string, AbortController>();
  const failures = new Map<string, number>();
  let tier: Tier = "desktop";
  let currentDpr = 1;
  let active = false;
  let disposed = false;
  let raf = 0;
  let lastTick = 0;
  let target = 0;
  let direction = 1;
  let start = 0;
  let travel = 1;
  let progress = -1;
  let phase = -1;

  function paint(dt: number) {
    let best: Frame | undefined;
    for (const frame of cache.values()) {
      const distance = Math.abs(frame.index - target);
      const previous = best ? Math.abs(best.index - target) : Infinity;
      if (distance < previous || (distance === previous && frame.tier === tier)) best = frame;
    }
    if (!best || !context || !canvas) return;
    const id = key(best);
    cache.delete(id);
    cache.set(id, best);
    const { width: w, height: h } = canvas;
    const img = best.bitmap;
    const compact = art.clientWidth <= 900;
    const cover = Math.max(w / img.width, h / img.height);
    // As the source fades to black, settle the filmed wordmark alongside the copy.
    const t = clamp((best.index / last - 0.59) / 0.23);
    const reveal = t * t * (3 - 2 * t);
    const endScale = Math.min(w * (compact ? 0.94 : 0.54) / img.width, h * (compact ? 0.44 : 1) / img.height);
    const scale = cover + (endScale - cover) * reveal;
    const width = img.width * scale, height = img.height * scale;
    const coverX = (w - width) * (compact ? 0.68 : rtl ? 0.66 : 0.34);
    const endX = w * (compact ? 0.5 : rtl ? 0.27 : 0.73) - width / 2;
    const coverY = (h - height) * (compact ? 0.42 : 0.46);
    const endY = h * (compact ? 0.35 : 0.5) - height / 2;
    context.fillStyle = backdrop;
    context.fillRect(0, 0, w, h);
    const x = coverX + (endX - coverX) * reveal;
    const y = coverY + (endY - coverY) * reveal;
    context.drawImage(img, x, y, width, height);

    const frameRect = {
      x,
      y,
      width,
      height,
      reveal,
      progress: Math.max(0, progress),
      compact,
      dpr: currentDpr,
    };

    // Volumetric crater bloom, heat shimmer & smooth ballistic lava arcs
    fire.renderCraterLayer(context, dt, frameRect);

    if (reveal > 0) {
      // Feather the exposed film edges into the stage as the logo comes into view.
      context.globalAlpha = reveal;
      const horizontal = context.createLinearGradient(x, y, x + width, y);
      const vertical = context.createLinearGradient(x, y, x, y + height);
      for (const [gradient, feather] of [[horizontal, 0.055], [vertical, 0.16]] as const) {
        gradient.addColorStop(0, backdrop);
        gradient.addColorStop(feather, "transparent");
        gradient.addColorStop(1 - feather, "transparent");
        gradient.addColorStop(1, backdrop);
        context.fillStyle = gradient;
        context.fillRect(x, y, width, height);
      }
      context.globalAlpha = 1;
    }

    // Subtle breathing glow & delicate rising embers from the settled CodeLava logo volcano
    fire.renderIdentityLayer(context, frameRect);
    art.dataset.sequenceReady = "";
  }

  function wanted(): Request[] {
    const requests: Request[] = [{ index: target, tier }];
    // Small persistent anchors also provide useful frames during large scroll jumps.
    for (const index of anchors) requests.push({ index, tier: "mobile" });
    const radius = tier === "hidpi" ? 1 : 3;
    for (let d = 1; d <= radius; d++) {
      for (const sign of [direction, -direction]) {
        const index = target + sign * d;
        if (index >= 0 && index <= last) requests.push({ index, tier });
      }
    }
    return requests;
  }

  function trim() {
    const limit = tier === "hidpi" ? 3 : 7;
    const detail = [...cache].filter(([, f]) => f.tier !== "mobile" || !anchors.includes(f.index));
    for (const [id, frame] of detail.slice(0, Math.max(0, detail.length - limit))) {
      cache.delete(id);
      frame.bitmap.close();
    }
  }

  async function load(request: Request) {
    const id = key(request);
    const controller = new AbortController();
    pending.set(id, controller);
    try {
      const response = await fetch("/media/hero/seq/" + id + "." + manifest.format, { signal: controller.signal, cache: "force-cache" });
      if (!response.ok) throw new Error(String(response.status));
      const blob = await response.blob();
      if (controller.signal.aborted) return;
      const bitmap = await createImageBitmap(blob);
      if (disposed || controller.signal.aborted) { bitmap.close(); return; }
      cache.set(id, { ...request, bitmap });
      trim();
    } catch {
      if (!controller.signal.aborted) failures.set(id, (failures.get(id) ?? 0) + 1);
    } finally {
      pending.delete(id);
      schedule();
    }
  }

  function update(now: number) {
    raf = 0;
    if (!active || disposed) return;
    const dt = lastTick > 0 ? Math.min((now - lastTick) / 1000, 0.05) : 1 / 60;
    lastTick = now;

    const next = clamp((scrollY - start) / travel);
    if (progress !== next) {
      direction = next >= progress ? 1 : -1;
      progress = next;
      onProgress?.(next);
      target = Math.round(next * last);
      stage!.style.setProperty("--dl-progress", String(next));
      stage!.style.setProperty("--dl-copy-y", -24 * clamp((next - 0.55) / 0.45) + "px");
      const index = next < 0.18 ? 0 : next < 0.33 ? 1 : next < 0.45 ? 2 : next < 0.72 ? 3 : 4;
      if (index !== phase) {
        phases.forEach((node, i) => { node.hidden = i !== index; });
        phase = index;
      }
    }
    paint(dt);
    for (const frame of wanted()) {
      if (pending.size >= 2) break;
      const id = key(frame);
      if (!cache.has(id) && !pending.has(id) && (failures.get(id) ?? 0) < 2) void load(frame);
    }
    // Keep the single rAF loop running while visible so live fire, shimmer & embers stay fluid
    schedule();
  }

  function schedule() {
    if (active && !disposed && !raf) raf = requestAnimationFrame(update);
  }

  function measure() {
    if (!canvas || !pin || !stage) return;
    const w = art.clientWidth, h = art.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2, 3840 / Math.max(1, w, h));
    currentDpr = dpr;
    const width = Math.max(1, Math.round(w * dpr)), height = Math.max(1, Math.round(h * dpr));
    tier = w <= 900 ? "mobile" : width > 2100 ? "hidpi" : "desktop";
    if (width !== canvas.width || height !== canvas.height) {
      canvas.width = width;
      canvas.height = height;
    }
    const pinHeight = pin.offsetHeight;
    stage.style.setProperty("--dl-pin-height", pinHeight + "px");
    start = stage.getBoundingClientRect().top + scrollY + Math.max(0, pinHeight - innerHeight);
    travel = Math.max(1, stage.hasAttribute("data-daylight-stage") ? stage.offsetHeight - pinHeight : pinHeight);
    schedule();
  }

  const observer = new ResizeObserver(measure);
  observer.observe(art);
  window.addEventListener("resize", measure);
  window.addEventListener("scroll", schedule, { passive: true });

  function setVisible(value: boolean) {
    if (disposed || active === value) return;
    active = value;
    if (value) {
      lastTick = 0;
      if (stage!.hasAttribute("data-daylight-stage")) stage!.dataset.story = "";
      measure();
    } else {
      cancelAnimationFrame(raf);
      raf = 0;
      lastTick = 0;
      pending.forEach(controller => controller.abort());
    }
  }

  function dispose() {
    setVisible(false);
    disposed = true;
    fire.reset();
    observer.disconnect();
    window.removeEventListener("resize", measure);
    window.removeEventListener("scroll", schedule);
    signal.removeEventListener("abort", dispose);
    cache.forEach(frame => frame.bitmap.close());
    cache.clear();
    canvas!.width = canvas!.height = 1;
    delete art.dataset.sequenceReady;
    delete stage!.dataset.story;
    for (const prop of ["--dl-pin-height", "--dl-progress", "--dl-copy-y"]) stage!.style.removeProperty(prop);
    phases.forEach((node, i) => { node.hidden = i !== 0; });
  }

  signal.addEventListener("abort", dispose, { once: true });
  return { setVisible, dispose };
}
