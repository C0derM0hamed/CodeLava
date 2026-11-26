// All geometry is a pure function of story position. Reversing scroll retraces each filament.
export const ease = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;
const lines = [
  ["const ", "signal", " = await ignite();"],
  ["def ", "stream", "(events):"],
  ["SELECT ", "vector", " FROM embeddings"],
  ["func ", "compile", "() async {"],
  ["return ", "tokens", ".map(encode)"],
  ["yield ", "model", "(inputs)"],
  ["type ", "Spark", " = { heat: number }"],
  ["await ", "flow", ".collect()"],
  ["// ", "البداية من هنا", ""],
  ["let ", "flux", " = encoder(input)"],
  ["async ", "function", " render() {"],
  ["// ", "تدفّق البيانات", ""],
];
export function makeInk(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  const theme = getComputedStyle(canvas);
  const token = (name: string) => theme.getPropertyValue("--" + name).trim();
  const colors = [
    "lava-300",
    "syntax-cyan",
    "syntax-blue",
    "syntax-green",
    "syntax-yellow",
  ].map(token);
  const neutral = token("ash-200");
  const molten = token("lava-500");
  const font = theme.getPropertyValue("--font-code").trim() || "monospace";
  let w = 0,
    h = 0,
    small = false,
    coarse = false;

  function resize(width: number, height: number, low: boolean) {
    w = width;
    h = height;
    small = w < 700;
    coarse = low;
    const dpr = Math.min(window.devicePixelRatio || 1, low ? 1.25 : 1.75);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.direction = "ltr";
      ctx.textAlign = "left";
    }
  }

  let hasInk = false;
  function paint(p: number) {
    if (!ctx) return;
    const alpha = ease(0.22, 0.37, p) * (1 - ease(0.78, 0.86, p));
    if (hasInk) ctx.clearRect(0, 0, w, h);
    hasInk = alpha > 0;
    if (!hasInk) return;
    const flow = ease(0.36, 0.65, p);
    const collapse = ease(0.69, 0.86, p);
    const span = ease(0.21, 0.42, p);
    const originY = h * 0.5 - Math.max(h, (w * 9) / 16) * 0.11;
    const reach = small ? 0.71 : 0.48;
    // A fan of ballistic paths morphs into a twisted strip, then curls into the central mark.
    function point(u: number, strand: number) {
      const phase = strand * TAU;
      const swell = Math.sin(u * Math.PI);
      const fanX = 0.5 + Math.cos(phase) * Math.pow(u, 1.32) * reach * span;
      const fanY =
        originY / h -
        (0.72 - 0.13 * Math.sin(phase)) * u * span +
        0.59 * u * u * span +
        Math.sin(phase) * 0.095 * u;
      const turn = u * TAU * 1.42 + p * 4.1;
      const bandX = -0.12 + u * 1.24;
      const bandY =
        0.48 -
        0.185 * Math.sin(u * TAU - 0.9) -
        0.16 * u +
        Math.sin(turn + phase) * (0.018 + 0.095 * swell);
      const curl = (u * 1.4 + collapse * 0.72) * TAU;
      return [
        mix(
          mix(fanX, bandX, flow),
          0.5 + 0.24 * (1 - collapse) * Math.cos(curl),
          collapse,
        ) * w,
        mix(
          mix(fanY, bandY, flow),
          0.38 + 0.16 * (1 - collapse) * Math.sin(curl),
          collapse,
        ) * h,
      ];
    }
    // Soft ribbons of light follow a handful of the fine wires. The luminous
    // sections travel along the strip, so it reads as a flowing surface.
    for (let i = 0; i < 4; i++) {
      const head = (i * 0.24 + p * 0.85) % 1;
      const color = i === 2 ? colors[1] : colors[0];
      ctx.strokeStyle = color;
      ctx.lineCap = "round";
      for (let k = 0; k < 12; k++) {
        const u = head + k * 0.007;
        if (u > 1) break;
        const [x, y] = point(u, i * 0.25);
        const [x2, y2] = point(u + 0.007, i * 0.25);
        ctx.globalAlpha = alpha * flow * Math.sin((Math.PI * k) / 12) * 0.72;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }
    const rails = coarse ? 12 : 20;
    for (let i = 0; i < rails; i++) {
      const strand = i / rails;
      ctx.beginPath();
      for (let j = 0; j <= 64; j++) {
        const [x, y] = point(j / 64, strand);
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = i % 5 === 0 ? colors[(i / 5 + 1) % 5] : molten;
      ctx.globalAlpha =
        alpha * (0.14 + 0.36 * (0.5 + 0.5 * Math.cos(strand * TAU)));
      ctx.lineWidth = i % 4 === 0 ? 1.5 : 0.75;
      ctx.stroke();
    }
    const count = small ? 9 : coarse ? 15 : 22;
    for (let i = 0; i < count; i++) {
      const strand = (i * 0.618034) % 1;
      const u = (i * 0.381966 + p * (0.7 + (i % 3) * 0.04)) % 1;
      const [x, y] = point(u, strand);
      const [nx, ny] = point(u + 0.001, strand);
      let slope = Math.atan2(ny - y, nx - x);
      if (slope > Math.PI / 2) slope -= Math.PI;
      if (slope < -Math.PI / 2) slope += Math.PI;
      const depth = 0.5 + 0.5 * Math.cos(strand * TAU + u * 5);
      const parts = lines[i % lines.length];
      const size = (small ? 10 : 11) + Math.round(depth * 3);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(slope * flow * 0.77);
      ctx.font = `500 ${size}px ${font}, monospace`;
      ctx.globalAlpha =
        alpha *
        (0.56 + 0.44 * depth) *
        ease(0.02, 0.18, u) *
        (1 - ease(0.88, 1, u)) *
        ease(0.24, 0.4, p);
      let offset = -ctx.measureText(parts.join("")).width * 0.5;
      for (let j = 0; j < parts.length; j++) {
        ctx.fillStyle = j === 2 ? neutral : colors[(i + j) % colors.length];
        ctx.fillText(parts[j], offset, 0);
        offset += ctx.measureText(parts[j]).width;
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
  return { resize, paint };
}
