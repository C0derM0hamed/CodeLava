export type Point = readonly [number, number];

// The ribbon lands on these exact ridges in the SVG's 200 × 108 viewBox.
export const seams: Point[][] = [
  [
    [63, 13],
    [13, 46],
    [47, 71],
  ],
  [
    [36, 91],
    [69, 72],
    [90, 51],
    [98, 39],
  ],
  [
    [98, 39],
    [93, 58],
    [102, 68],
    [100, 76],
    [116, 92],
  ],
  [
    [104, 40],
    [116, 56],
    [125, 62],
    [134, 72],
    [163, 87],
  ],
  [
    [150, 71],
    [187, 46],
    [137, 13],
  ],
];

export const pathData = (points: Point[]) =>
  points.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");

export const ease = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// A continuous loop with a pronounced front turn. The return leg passes
// behind the leading lip before the free end climbs out of the frame.
const curves: Point[][] = [
  [
    [-0.12, 0.74],
    [0.14, 0.78],
    [0.39, 0.28],
    [0.59, 0.28],
  ],
  [
    [0.59, 0.28],
    [0.8, 0.28],
    [0.58, 0.69],
    [0.44, 0.55],
  ],
  [
    [0.44, 0.55],
    [0.29, 0.4],
    [0.82, 0.48],
    [1.12, 0.23],
  ],
];
export function ribbon(u: number, p: number, w: number, h: number): Point {
  const s = Math.min(2.99999, Math.max(0, u) * 3),
    i = Math.floor(s),
    t = s - i,
    b = 1 - t;
  const [a, c, d, e] = curves[i];
  const bend = (p - 0.62) * Math.sin(u * Math.PI * 2) * 0.19;
  return [
    (b * b * b * a[0] +
      3 * b * b * t * c[0] +
      3 * b * t * t * d[0] +
      t * t * t * e[0]) *
      w,
    (b * b * b * a[1] +
      3 * b * b * t * c[1] +
      3 * b * t * t * d[1] +
      t * t * t * e[1] +
      bend) *
      h,
  ];
}
