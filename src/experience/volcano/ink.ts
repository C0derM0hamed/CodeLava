import { ease, mix, ribbon, seams, type Point } from "./geometry";

const snippets = [
  ["const ", "signal", " = ignite();"],
  ["def ", "stream", "(events):"],
  ["SELECT ", "id", " FROM sparks"],
  ["func ", "compile", "() {"],
  ["await ", "model", ".encode()"],
  ["yield ", "token", ".id"],
  ["// ", "تدفّق البيانات", ""],
  ["let ", "heat", " = 0xff"],
  ["type ", "Flux", " = Stream<T>"],
  ["// ", "من هنا نبدأ", ""],
  ["return ", "mesh", ".vertices"],
  ["import ", "torch", " as pt"],
];
type MarkBox = { x: number; y: number; width: number; height: number };
type LabelBox = { x: number; y: number; half: number; size: number };

export function makeInk(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  const theme = getComputedStyle(canvas);
  const color = (s: string) => theme.getPropertyValue("--" + s).trim();
  const hot = color("ember"),
    lava = color("lava-500"),
    ash = color("ash-50");
  const palette = [
    "syntax-cyan",
    "syntax-blue",
    "syntax-yellow",
    "syntax-green",
    "lava-300",
  ].map(color);
  const font = theme.getPropertyValue("--font-code").trim() || "monospace";
  const sheet = document.createElement("canvas");
  const period = 1200;
  const depths = [1, 0.75, 0.96, 0.55, 0.82, 0.48];
  let labels: { image: HTMLCanvasElement; half: number; size: number }[] = [];
  function bakeLabels() {
    if (!ctx) return;
    labels = snippets.map((parts, i) => {
      const depth = depths[Math.floor(i / 2)];
      const size = (small ? 11 : 12) + depth * (small ? 2.4 : 5);
      const face = `${depth > 0.8 ? 600 : 400} ${size}px ${font}, monospace`;
      ctx.font = face;
      const half = ctx.measureText(parts.join("")).width * 0.5;
      const image = document.createElement("canvas");
      image.width = Math.ceil((2 * half + 10) * 2);
      image.height = Math.ceil((size * 2 + 8) * 2);
      const g = image.getContext("2d")!;
      g.scale(2, 2);
      g.font = face;
      g.direction = "ltr";
      if (depth < 0.6) g.filter = "blur(1px)";
      g.shadowColor = color("obsidian-950");
      g.shadowBlur = 2;
      let left = 5;
      parts.forEach((part, k) => {
        g.fillStyle = k === 2 ? ash : palette[(i + k) % palette.length];
        g.fillText(part, left, size + 4);
        left += g.measureText(part).width;
      });
      return { image, half, size };
    });
  }
  let w = 0,
    h = 0,
    dpr = 1,
    small = false,
    low = false,
    rows = 7,
    hasInk = false;
  let mark: MarkBox = { x: 0, y: 0, width: 1, height: 1 };
  const tau = Math.PI * 2;

  // A repeating strip of real typeset code. Render it once per resize. The
  // animated mesh samples narrow slices of the strip along its local tangent.
  function bake() {
    const rowH = 16,
      scale = 2;
    rows = small ? 5 : 7;
    sheet.width = period * 2 * scale;
    sheet.height = rows * rowH * scale;
    const g = sheet.getContext("2d");
    if (!g) return;
    g.scale(scale, scale);
    g.direction = "ltr";
    g.font = `500 13px ${font}, monospace`;
    const inks = small
      ? [palette[1], palette[0], hot, lava, color("lava-300")]
      : [
          palette[1],
          palette[0],
          color("lava-300"),
          hot,
          lava,
          color("lava-300"),
          palette[0],
        ];
    g.fillStyle = color("obsidian-900");
    g.globalAlpha = 0.82;
    g.fillRect(0, 0, period, rows * rowH);
    for (let row = 0; row < rows; row++) {
      const y = row * rowH;
      g.fillStyle = inks[row];
      g.globalAlpha = row === Math.floor(rows / 2) ? 0.17 : 0.065;
      g.fillRect(0, y, period, rowH);
      g.save();
      g.beginPath();
      g.rect(0, y, period, rowH);
      g.clip();
      let x = -14 * row,
        word = 0;
      while (x < period) {
        const parts = snippets[(row * 3 + word++) % snippets.length];
        for (let k = 0; k < 3; k++) {
          g.globalAlpha = k === 0 ? 0.96 : k === 1 ? 0.84 : 0.64;
          g.fillText(parts[k], x, y + 12);
          x += g.measureText(parts[k]).width;
        }
        x += 25;
      }
      g.restore();
    }
    g.globalAlpha = 1;
    g.drawImage(
      sheet,
      0,
      0,
      period * scale,
      sheet.height,
      period,
      0,
      period,
      rows * rowH,
    );
  }
  function resize(width: number, height: number, cheap: boolean, box: MarkBox) {
    w = width;
    h = height;
    small = w < 700;
    low = cheap;
    mark = box;
    dpr = Math.min(devicePixelRatio || 1, low ? 1.4 : 1.75);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    bake();
    bakeLabels();
    hasInk = false;
  }

  function eruption(g: CanvasRenderingContext2D, p: number) {
    const settle = ease(0.465, 0.566, p);
    const gain = 1 - ease(0.495, 0.57, p);
    if (p < 0.22 || gain <= 0) return;
    const ventX = w * 0.5 - 0.004 * Math.max(w, (h * 16) / 9);
    const ventY = h * 0.5 - 0.105 * Math.max(h, (w * 9) / 16);
    const occupied: LabelBox[] = [];
    const count = small ? 8 : 12;
    for (let i = 0; i < count; i++) {
      const side = i % 2 ? 1 : -1;
      const lane = Math.floor(i / 2);
      const depth = depths[lane];
      const start = 0.215 + ((i * 7) % 13) * 0.0065;
      const t = Math.max(0, (p - start) / 0.245);
      if (!t) continue;
      const range =
        (small ? 0.61 : 0.43) * (0.4 + ((lane * 3 + (i % 2)) % 7) * 0.093);
      const v = 0.38 + (lane % 3) * 0.075 + (i % 2) * 0.034;
      const gravity = 0.18 + (lane % 2) * 0.095;
      function arc(time: number): Point {
        return [
          ventX + side * w * range * time,
          ventY + h * (-v * time + gravity * time * time),
        ];
      }
      const [ax, ay] = arc(t);
      // Tracer beads describe only the recent flight of each fragment.
      for (let j = 1; j <= 8; j++) {
        const [x, y] = arc(Math.max(0, t - j * 0.012));
        g.globalAlpha = gain * (1 - settle) * (0.35 - j * 0.032);
        g.fillStyle = j < 3 ? hot : lava;
        g.beginPath();
        g.arc(x, y, 0.7 + depth * 0.5, 0, tau);
        g.fill();
      }
      const [tx, ty] = arc(Math.max(0, t - 0.07));
      g.globalAlpha = gain * (1 - settle) * 0.49;
      g.strokeStyle = i % 3 ? lava : hot;
      g.lineWidth = 0.95;
      g.beginPath();
      g.moveTo(tx, ty);
      g.lineTo(ax, ay);
      g.stroke();
      const [rx, ry] = ribbon((i + 0.6) / count, p, w, h);
      const { image, half, size } = labels[i];
      const x = Math.min(w - half - 9, Math.max(half + 9, mix(ax, rx, settle)));
      const y = mix(ay, ry, settle);
      // Boxes in the front plane fade before intersection. Priority is fixed
      // so the result at a given position is identical while scrolling back.
      let clarity = 1;
      for (const box of occupied) {
        const gapX = Math.abs(x - box.x) - half - box.half - 11;
        const gapY = Math.abs(y - box.y) - (size + box.size) * 0.54;
        clarity = Math.min(clarity, ease(1, 12, Math.max(gapX, gapY)));
      }
      const alpha = clarity * gain * ease(0.1, 0.39, t) * (0.62 + 0.38 * depth);
      if (alpha < 0.025) continue;
      occupied.push({ x, y, half, size });
      g.globalAlpha = alpha;
      g.drawImage(
        image,
        x - half - 5,
        y - size - 4,
        image.width / 2,
        image.height / 2,
      );
    }
  }

  function seamPoint(index: number, t: number): Point {
    const path = seams[index],
      end = path.length - 1,
      v = Math.max(0, Math.min(end - 0.00001, t * end)),
      j = Math.floor(v);
    return [
      mark.x + (mix(path[j][0], path[j + 1][0], v - j) * mark.width) / 200,
      mark.y + (mix(path[j][1], path[j + 1][1], v - j) * mark.height) / 108,
    ];
  }

  function band(g: CanvasRenderingContext2D, p: number) {
    const appear = ease(0.475, 0.56, p),
      morph = ease(0.698, 0.835, p),
      release = 1 - ease(0.837, 0.869, p);
    if (!appear || !release) return;
    const n = small ? 24 : low ? 32 : 48;
    let travelled = 0;
    for (let strip = 0; strip < seams.length; strip++) {
      function point(k: number): Point {
        const u = (strip + k) / seams.length;
        const a = ribbon(u, p, w, h);
        if (!morph) return a;
        const b = seamPoint(strip, k);
        return [mix(a[0], b[0], morph), mix(a[1], b[1], morph)];
      }
      let [x, y] = point(0);
      for (let i = 0; i < n; i++) {
        const k = (i + 0.5) / n,
          u = (strip + k) / seams.length;
        const [nx, ny] = point((i + 1) / n);
        const dx = nx - x,
          dy = ny - y,
          len = Math.max(0.001, Math.hypot(dx, dy));
        const face = Math.cos(u * tau * 1.08 + p * 2.35 - 0.45);
        const spread =
          (small ? 77 : 122) *
          (0.58 + 0.42 * Math.sin(Math.PI * u)) *
          (0.055 + 0.945 * Math.abs(face));
        const thick = mix(spread, 1.65, morph);
        const alpha = appear * release * (face < 0 ? 0.58 : 0.97);
        const textureScale = small ? 0.79 : 1;
        const sx =
          ((travelled / textureScale + period * 3 - p * 1040) % period) * 2;
        const sw = Math.min(period, len / textureScale) * 2;
        g.setTransform(
          dx * dpr,
          dy * dpr,
          (-dy / len) * thick * dpr,
          (dx / len) * thick * dpr,
          x * dpr,
          y * dpr,
        );
        // At an edge-on fold or a settling seam, the letters resolve into a
        // single line of light instead of stacking unreadably.
        const detail = ease(3, 18, thick) * (1 - ease(0.51, 0.94, morph));
        if (detail > 0.005) {
          g.globalAlpha = alpha * detail;
          g.drawImage(sheet, sx, 0, sw, sheet.height, 0, -0.5, 1.035, 1);
        }
        if (detail < 0.999) {
          g.globalAlpha = alpha * (1 - detail);
          g.fillStyle =
            morph > 0.6 && strip === 0 ? ash : strip === 2 ? hot : lava;
          g.fillRect(0, -0.4, 1.06, 0.8);
        }
        x = nx;
        y = ny;
        travelled += len;
      }
    }
  }
  function paint(p: number) {
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (hasInk) ctx.clearRect(0, 0, w, h);
    hasInk = p > 0.21 && p < 0.87;
    if (!hasInk) return;
    ctx.direction = "ltr";
    ctx.textAlign = "left";
    eruption(ctx, p);
    band(ctx, p);
    ctx.globalAlpha = 1;
  }
  return { resize, paint };
}
