import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";
import { ease, makeInk } from "./ink";
import { makeEmbers } from "./embers";

export function mount(section: HTMLElement, complete: () => void) {
  gsap.registerPlugin(ScrollTrigger);
  const stage = section.querySelector<HTMLElement>("[data-stage]")!;
  const video = section.querySelector("video")!;
  const ink = makeInk(section.querySelector<HTMLCanvasElement>("[data-ink]")!);
  const sparkCanvas =
    section.querySelector<HTMLCanvasElement>("[data-embers]")!;
  const phases = Array.from(
    section.querySelectorAll<HTMLElement>("[data-phase]"),
  );
  const ticks = Array.from(
    section.querySelectorAll<HTMLElement>("[data-tick]"),
  );
  const shared = window as Window & { __lenis?: Lenis };
  let lenis: Lenis | undefined;
  let sparks: ReturnType<typeof makeEmbers>;
  let sparkAttempted = false;
  const mobile = matchMedia("(max-width: 700px), (pointer: coarse)").matches;
  let low = mobile;
  let active = true,
    inView = false,
    raf = 0,
    p = 0,
    frame = -1,
    phase = -1;
  let width = 0,
    height = 0,
    slowFrames = 0,
    previousTime = 0;
  const style = section.style;
  let wasDrawingSparks = false;
  const updateLenis = () => ScrollTrigger.update();
  function resize() {
    width = stage.clientWidth;
    height = stage.clientHeight;
    ink.resize(width, height, low);
    sparks?.resize(width, height, low);
    frame = -1;
    queue();
  }
  function seek() {
    if (
      !active ||
      !inView ||
      document.hidden ||
      video.readyState < 1 ||
      video.seeking
    )
      return;
    const target = Math.min(
      video.duration - 1 / 24,
      ease(0, 0.43, p) * (video.duration - 1 / 24),
    );
    if (
      Number.isFinite(target) &&
      Math.abs(video.currentTime - target) >= 1 / 48
    )
      video.currentTime = target;
  }
  function ready() {
    section.dataset.ready = "";
    seek();
  }
  function failed() {
    delete section.dataset.ready;
  }
  function queue() {
    if (active && !raf && inView && !document.hidden)
      raf = requestAnimationFrame(draw);
  }
  function draw(now: number) {
    raf = 0;
    if (!active || !inView || document.hidden) return;
    if (shared.__lenis !== lenis) {
      lenis?.off("scroll", updateLenis);
      lenis = shared.__lenis;
      lenis?.on("scroll", updateLenis);
    }
    if (frame === p) return;
    if (p >= 0.999) complete();
    const dt = now - previousTime;
    previousTime = now;
    if (!low && dt > 23 && dt < 75 && ++slowFrames >= 12) {
      low = true;
      resize();
    }
    frame = p;
    const intro = ease(0.055, 0.215, p),
      logo = ease(0.748, 0.875, p),
      exit = ease(0.936, 1, p);
    style.setProperty(
      "--plate",
      String(1 - 0.78 * ease(0.3, 0.65, p) - 0.22 * exit),
    );
    style.setProperty("--film", String(1 - ease(0.37, 0.59, p)));
    style.setProperty("--intro", String(1 - intro));
    style.setProperty("--lift", `${-28 * intro}px`);
    style.setProperty("--logo", String(logo * (1 - exit * 0.65)));
    style.setProperty("--rise", `${(1 - logo) * 20 - exit * 42}px`);
    style.setProperty("--bleed", String(ease(0.82, 0.99, p)));
    style.setProperty("--foot", String(1 - exit));
    const next = p < 0.12 ? 0 : p < 0.29 ? 1 : p < 0.5 ? 2 : p < 0.76 ? 3 : 4;
    if (next !== phase) {
      phases.forEach((el, i) => {
        el.hidden = i !== next;
      });
      ticks.forEach((el, i) => {
        el.toggleAttribute("data-lit", i <= next);
      });
      phase = next;
    }
    if (!sparkAttempted && p > 0.09 && p < 0.77) {
      sparkAttempted = true;
      sparks = makeEmbers(sparkCanvas);
      sparks?.resize(width, height, low);
    }
    ink.paint(p);
    const drawingSparks = p > 0.09 && p < 0.77;
    if (drawingSparks || wasDrawingSparks) sparks?.paint(p);
    wasDrawingSparks = drawingSparks;
    seek();
  }
  video.addEventListener("loadeddata", ready);
  video.addEventListener("error", failed);
  video.addEventListener("seeked", seek);
  section.dataset.active = "";
  const trigger = ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
      p = self.progress;
      if (p >= 0.999 && self.direction > 0) complete();
      queue();
    },
    onRefresh: (self) => {
      p = self.progress;
      frame = -1;
      queue();
    },
  });
  p = trigger.progress;
  const ro = new ResizeObserver(resize);
  ro.observe(stage);
  const io = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (inView && !video.hasAttribute("src") && !document.hidden) {
      video.preload = "auto";
      video.src = `/media/hero/ignition-${mobile ? "480" : "720"}.mp4`;
    }
    queue();
  });
  io.observe(stage);
  function visibility() {
    if (!document.hidden) {
      if (inView && !video.hasAttribute("src"))
        video.src = `/media/hero/ignition-${mobile ? "480" : "720"}.mp4`;
      frame = -1;
      queue();
    }
  }
  document.addEventListener("visibilitychange", visibility);
  resize();
  return () => {
    active = false;
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    trigger.kill();
    lenis?.off("scroll", updateLenis);
    sparks?.dispose();
    document.removeEventListener("visibilitychange", visibility);
    video.removeEventListener("loadeddata", ready);
    video.removeEventListener("error", failed);
    video.removeEventListener("seeked", seek);
    video.removeAttribute("src");
    video.load();
    delete section.dataset.active;
    delete section.dataset.ready;
    for (const prop of [
      "--intro",
      "--plate",
      "--film",
      "--lift",
      "--logo",
      "--rise",
      "--bleed",
      "--foot",
    ])
      style.removeProperty(prop);
  };
}
