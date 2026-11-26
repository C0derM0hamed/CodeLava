import { ease, mix } from "./geometry";

type Scene = { setVisible(value: boolean): void; dispose(): void };

export async function mountDaylight(art: HTMLElement, signal: AbortSignal): Promise<Scene | null> {
  if (!window.Worker || !HTMLCanvasElement.prototype.transferControlToOffscreen || signal.aborted) return null;
  const stage = art.closest<HTMLElement>("[data-daylight-stage]");
  const pin = stage?.querySelector<HTMLElement>(".dl-pin");
  const film = art.querySelector<HTMLElement>(".dl-film")!;
  const tokens = Array.from(art.querySelectorAll<HTMLElement>(".dl-token"));
  const canvas = document.createElement("canvas");
  const worker = new Worker(new URL("./daylight.worker.ts", import.meta.url), { type: "module", name: "CodeLava footage" });
  const small = matchMedia("(max-width:760px), (pointer:coarse)").matches;
  let active = false, disposed = false, raf = 0;
  let width = 1, height = 1, filmWidth = 1, filmHeight = 1;
  let lastFrame = -1, lastProgress = -1, pointerX = 0, pointerY = 0;
  let start = 0, travel = 1;
  const sparks: HTMLElement[] = [];
  const resize = new ResizeObserver(measure);

  function dispose() {
    if (disposed) return;
    disposed = true;
    worker.terminate();
    cancelAnimationFrame(raf);
    resize.disconnect();
    signal.removeEventListener("abort", dispose);
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", measure);
    window.removeEventListener("pointermove", point);
    document.removeEventListener("pointerleave", leave);
    delete stage?.dataset.story;
    stage?.style.removeProperty("--dl-pin-height");
    stage?.style.removeProperty("--dl-progress");
    delete art.dataset.enhanced;
    delete art.dataset.moving;
    for (const key of Object.keys(properties)) art.style.removeProperty("--dl-" + key);
    for (const token of tokens) { token.style.removeProperty("transform"); token.style.removeProperty("opacity"); }
    for (const spark of sparks) spark.remove();
    canvas.remove();
  }
  const properties: Record<string, string> = {};
  function style(key: string, value: string) {
    if (properties[key] !== value) {
      properties[key] = value;
      art.style.setProperty("--dl-" + key, value);
    }
  }
  function schedule() {
    if (active && !raf && !disposed) raf = requestAnimationFrame(paint);
  }
  function measure() {
    if (!active || disposed) return;
    const bounds = art.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    if (pin && stage) {
      const pinHeight = pin.offsetHeight;
      stage.style.setProperty("--dl-pin-height", pinHeight + "px");
      start = stage.getBoundingClientRect().top + window.scrollY + Math.max(0, pinHeight - innerHeight);
      travel = Math.max(1, stage.offsetHeight - pinHeight);
    } else {
      start = bounds.top + window.scrollY;
      travel = Math.max(1, height * .95);
    }
    const dpr = Math.min(devicePixelRatio, small ? 1.25 : 1.5);
    filmWidth = Math.max(1, Math.round(film.clientWidth * dpr));
    filmHeight = Math.max(1, Math.round(film.clientHeight * dpr));
    lastProgress = -1;
    lastFrame = -1;
    schedule();
  }
  function point(e: PointerEvent) {
    if (!active || e.pointerType !== "mouse") return;
    pointerX = (e.clientX / innerWidth - .5) * 2;
    pointerY = (e.clientY / innerHeight - .5) * 2;
    schedule();
  }
  function leave() { pointerX = 0; pointerY = 0; schedule(); }
  function paint() {
    raf = 0;
    if (!active || disposed) return;
    const p = Math.max(0, Math.min(1, (window.scrollY - start) / travel));
    const sceneP = stage ? p : .27 * p;
    const lift = ease(.06, .37, sceneP);
    const settle = ease(.44, .70, sceneP);
    const signature = ease(.68, .90, sceneP);
    style("ground-x", (pointerX * -1.8).toFixed(2) + "px");
    style("ground-y", (pointerY * -1.1 - 2 * lift).toFixed(2) + "px");
    style("air-x", (pointerX * 3.8).toFixed(2) + "px");
    style("air-y", (pointerY * 2.8 - 4 * lift).toFixed(2) + "px");
    style("brand-y", (pointerY * 4 - 6 * signature - 3 * lift).toFixed(2) + "px");
    if (p === lastProgress) return;
    lastProgress = p;
    if (stage) stage.style.setProperty("--dl-progress", (.07 + p * .93).toFixed(4));
    const footage = lift * (1 - ease(.46, .75, sceneP));
    const frame = Number(ease(.065, .59, sceneP).toFixed(4));
    style("film", (ease(.065, .19, sceneP) * (1 - ease(.45, .70, sceneP))).toFixed(3));
    if (lastFrame !== frame) {
      worker.postMessage({ type: "seek", frame, width: filmWidth, height: filmHeight });
      lastFrame = frame;
    }
    style("heat", (.13 + .53 * footage).toFixed(3));
    style("ring", (.62 - .56 * ease(.07, .24, sceneP) + .88 * settle).toFixed(3));
    style("scale", (1 + .07 * lift - .03 * signature).toFixed(3));
    style("angle", (-3 * lift + 1.4 * signature).toFixed(2) + "deg");
    style("offset", (-95 * lift - 510 * settle).toFixed(1));
    style("logo", stage ? (1 - ease(.055, .19, p) + signature).toFixed(3) : "1");
    style("split", stage ? (16 * (1 - signature) * lift).toFixed(1) + "px" : "0px");
    style("word", stage ? signature.toFixed(3) : "1");
    style("word-y", ((1 - signature) * (stage ? 7 : 0)).toFixed(1) + "px");
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const launch = .095 + ((i * 5) % 9) * .005;
      const flight = ease(launch, launch + .245, sceneP);
      const gather = ease(.39 + i * .002, .675 + i * .002, sceneP);
      const alpha = ease(launch, launch + .055, sceneP) * (1 - ease(.66, .785, sceneP));
      token.style.opacity = (alpha * (i % 3 === 0 ? .78 : 1)).toFixed(3);
      if (!alpha) continue;
      const lane = Math.floor(i / 2), side = i % 2 ? 1 : -1;
      // Two uneven jets fan out from the lip. Each label has a distinct landing slot.
      const range = [52, 125, 208, 283, 358, 434][lane];
      const altitude = [205, 278, 177, 229, 131, 173][lane] + 20 * side;
      const flightX = 599 + side * range * flight;
      const flightY = 347 - altitude * flight - 25 * Math.sin(flight * Math.PI);
      const angle = i * Math.PI * 2 / tokens.length + gather * 1.7 + settle;
      const orbitX = 600 + 295 * Math.cos(angle);
      const orbitY = 340 + 51 * Math.sin(angle) - .21 * (orbitX - 600);
      const x = mix(flightX, orbitX, gather) * width / 1200;
      const y = mix(flightY, orbitY, gather) * height / 800;
      token.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) translate(-50%,-50%) rotate(${mix(side * (lane-2) * 4, -13, gather).toFixed(1)}deg) scale(${(1-.50*gather).toFixed(3)})`;
    }
  }
  function setVisible(value: boolean) {
    if (disposed || value === active) return;
    active = value;
    art.toggleAttribute("data-moving", active);
    if (active) {
      if (stage) stage.dataset.story = "";
      measure();
    } else {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  const loaded = await new Promise<boolean>((resolve) => {
    const finish = (ok: boolean) => {
      signal.removeEventListener("abort", stop);
      resolve(ok);
    };
    const stop = () => finish(false);
    signal.addEventListener("abort", stop, { once: true });
    worker.onmessage = (event) => finish(event.data === "ready");
    worker.onerror = stop;
    worker.onmessageerror = stop;
    try {
      const offscreen = canvas.transferControlToOffscreen();
      worker.postMessage({ type: "start", canvas: offscreen, small }, [offscreen]);
    } catch { finish(false); }
  });
  if (!loaded || signal.aborted) { dispose(); return null; }
  worker.onmessage = (event) => { if (event.data === "fallback") dispose(); };
  worker.onerror = dispose;
  worker.onmessageerror = dispose;
  signal.addEventListener("abort", dispose, { once: true });
  film.append(canvas);
  art.dataset.enhanced = "";
  const ejecta = art.querySelector(".dl-ejecta")!;
  for (let i = 0; i < 8; i++) {
    const spark = document.createElement("i");
    spark.className = "dl-ember";
    spark.style.setProperty("--drift", ((i%2 ? -1 : 1) * (5+i*2.2)) + "px");
    spark.style.setProperty("--rise", (-14 - i*3.8) + "px");
    spark.style.setProperty("--delay", (-i*.73) + "s");
    spark.style.setProperty("--life", (2.5 + (i%3)*.48) + "s");
    ejecta.append(spark);
    sparks.push(spark);
  }
  resize.observe(art);
  if (pin) resize.observe(pin);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", measure);
  if (!small) {
    window.addEventListener("pointermove", point, { passive: true });
    document.addEventListener("pointerleave", leave);
  }
  return { setVisible, dispose };
}
