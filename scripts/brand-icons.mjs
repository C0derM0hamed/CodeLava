#!/usr/bin/env node
/**
 * Generates CodeLava favicon & app icon assets (SVG + PNG 32/180/192/512 + maskable)
 * into public/brand/icons/ using sharp.
 *
 * Usage: node scripts/brand-icons.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const outDir = path.join(rootDir, "public", "brand", "icons");

const C = {
  obsidian950: "#07060a",
  obsidian900: "#0c0b10",
  obsidian850: "#121117",
  obsidian800: "#18161e",
  obsidian700: "#24212b",
  ash50: "#fbf7f2",
  ash200: "#e6ddd3",
  ash400: "#b3a99f",
  lava100: "#ffe2c7",
  lava300: "#ffb066",
  lava400: "#ff8a2a",
  lava500: "#ff6a00",
  lava600: "#e94e06",
  lava700: "#b8360a",
  lava900: "#4a1405",
  ember: "#ffcf4a",
};

function buildIconSvg({ padding = 48, cornerRadius = 112 } = {}) {
  const innerW = 512 - padding * 2;
  const scale = innerW / 120;
  const innerH = 84 * scale;
  const tx = padding;
  const ty = (512 - innerH) / 2 + 6;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" fill="none">
  <defs>
    <radialGradient id="bgGlow" cx="256" cy="224" r="245" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${C.lava500}" stop-opacity="0.26" />
      <stop offset="32%" stop-color="${C.lava700}" stop-opacity="0.14" />
      <stop offset="68%" stop-color="${C.lava900}" stop-opacity="0.04" />
      <stop offset="100%" stop-color="${C.obsidian950}" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="tileBase" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${C.obsidian850}" />
      <stop offset="100%" stop-color="${C.obsidian950}" />
    </linearGradient>
    <linearGradient id="tileBorder" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${C.ash50}" stop-opacity="0.16" />
      <stop offset="50%" stop-color="${C.lava500}" stop-opacity="0.24" />
      <stop offset="100%" stop-color="${C.ash50}" stop-opacity="0.06" />
    </linearGradient>
    <linearGradient id="leftFace" x1="10" y1="15" x2="46" y2="66" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${C.ash50}" />
      <stop offset="70%" stop-color="${C.ash200}" />
      <stop offset="100%" stop-color="${C.ash400}" />
    </linearGradient>
    <linearGradient id="rightFace" x1="72" y1="14" x2="111" y2="66" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${C.ember}" />
      <stop offset="28%" stop-color="${C.lava400}" />
      <stop offset="66%" stop-color="${C.lava500}" />
      <stop offset="100%" stop-color="${C.lava600}" />
    </linearGradient>
    <linearGradient id="rockLeft" x1="19" y1="76" x2="57" y2="33" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${C.obsidian850}" />
      <stop offset="52%" stop-color="${C.obsidian700}" />
      <stop offset="100%" stop-color="${C.obsidian800}" />
    </linearGradient>
    <linearGradient id="rockRight" x1="64" y1="34" x2="101" y2="76" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${C.obsidian800}" />
      <stop offset="56%" stop-color="${C.obsidian900}" />
      <stop offset="100%" stop-color="${C.obsidian950}" />
    </linearGradient>
    <radialGradient id="caldera" cx="60" cy="31" r="34" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${C.ember}" stop-opacity="0.72" />
      <stop offset="22%" stop-color="${C.lava400}" stop-opacity="0.34" />
      <stop offset="52%" stop-color="${C.lava600}" stop-opacity="0.08" />
      <stop offset="82%" stop-color="${C.lava700}" stop-opacity="0.01" />
      <stop offset="100%" stop-color="${C.lava900}" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="magmaOuter" x1="60" y1="32" x2="60" y2="77" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${C.lava300}" />
      <stop offset="30%" stop-color="${C.lava500}" />
      <stop offset="76%" stop-color="${C.lava600}" />
      <stop offset="100%" stop-color="${C.lava700}" />
    </linearGradient>
    <linearGradient id="magmaCore" x1="60" y1="33" x2="60" y2="70" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${C.lava100}" />
      <stop offset="30%" stop-color="${C.ember}" />
      <stop offset="80%" stop-color="${C.lava400}" />
      <stop offset="100%" stop-color="${C.lava500}" stop-opacity="0.35" />
    </linearGradient>
  </defs>

  <rect x="0" y="0" width="512" height="512" rx="${cornerRadius}" fill="url(#tileBase)" />
  <rect x="0" y="0" width="512" height="512" rx="${cornerRadius}" fill="url(#bgGlow)" />
  ${
    cornerRadius > 0
      ? `<rect x="4" y="4" width="504" height="504" rx="${Math.max(0, cornerRadius - 4)}" stroke="url(#tileBorder)" stroke-width="5" />`
      : ""
  }

  <g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${scale.toFixed(4)})">
    <circle cx="60" cy="31" r="34" fill="url(#caldera)" />
    <path d="M47.5 14.5C48.8 13.6 50.5 14.5 50.5 16.1V22.4C50.5 23.6 49.9 24.7 48.9 25.4L23.2 42.3L42.8 55.1L38.4 63.2L10.9 45.6C8.5 44.1 8.5 40.5 10.9 39L47.5 14.5Z" fill="url(#leftFace)" />
    <path d="M72.5 14.5C71.2 13.6 69.5 14.5 69.5 16.1V22.4C69.5 23.6 70.1 24.7 71.1 25.4L96.8 42.3L77.2 55.1L81.6 63.2L109.1 45.6C111.5 44.1 111.5 40.5 109.1 39L72.5 14.5Z" fill="url(#rightFace)" />
    <path d="M52.2 34.4L60 36.2L67.8 34.4L79.2 52.8L92.4 64.4L103.5 75.8L76.4 73.6L60 79.4L43.6 73.6L16.5 75.8L27.6 64.4L40.8 52.8L52.2 34.4Z" fill="${C.obsidian850}" />
    <path d="M52.2 34.4L56.2 51.8L45.8 62.6L16.5 75.8L27.6 64.4L40.8 52.8L52.2 34.4Z" fill="url(#rockLeft)" />
    <path d="M67.8 34.4L79.2 52.8L92.4 64.4L103.5 75.8L76.4 69.6L65.2 54.8L67.8 34.4Z" fill="url(#rockRight)" />
    <path d="M17.4 75.2L40.8 52.8L52.2 34.4M102.6 75.2L79.2 52.8L67.8 34.4" stroke="${C.ash50}" stroke-opacity="0.2" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M52.2 34.4C56.2 35.8 63.8 35.8 67.8 34.4L66.8 36.8C63.2 38.2 56.8 38.2 53.2 36.8L52.2 34.4Z" fill="url(#magmaOuter)" />
    <path d="M55.2 36.2L58.2 36.6L55.2 50.8L60.2 57.6L69.4 72.2L68.2 73.1L56.9 58.6L53.4 53.2L44.2 61.8L29.5 72.6L28.8 71.9L42.2 59.4L51.9 49.4L55.2 36.2Z" fill="url(#magmaOuter)" />
    <path d="M62.4 36.3L65.1 35.9L70.8 48.2L80.6 58.6L91.6 69.8L90.8 70.4L78.4 59.8L68.3 49.1L62.4 36.3Z" fill="url(#magmaOuter)" />
    <path d="M53.4 35.1C57 36.5 63 36.5 66.6 35.1L65.9 36.3C62.7 37.3 57.3 37.3 54.1 36.3L53.4 35.1Z" fill="${C.ember}" />
    <path d="M56.2 36.4L57.3 36.5L54.3 50.6L58.4 56.8L65.8 68.2L57.1 57.3L53.5 52.1L44 60.5L34.2 68.4L43 59.6L52.8 49.9L56.2 36.4Z" fill="url(#magmaCore)" />
    <path d="M63.4 36.2L64.4 36.1L69.8 48.3L79 58.3L86.4 65.4L77.9 58.6L68.9 48.7L63.4 36.2Z" fill="url(#magmaCore)" />
  </g>
</svg>
`;
}

async function main() {
  await mkdir(outDir, { recursive: true });

  const roundedSvg = buildIconSvg({ padding: 48, cornerRadius: 112 });
  const appleSvg = buildIconSvg({ padding: 54, cornerRadius: 0 });
  const maskableSvg = buildIconSvg({ padding: 92, cornerRadius: 0 });

  await writeFile(path.join(outDir, "favicon.svg"), roundedSvg, "utf8");

  const roundedBuf = Buffer.from(roundedSvg);
  const appleBuf = Buffer.from(appleSvg);
  const maskableBuf = Buffer.from(maskableSvg);

  const outputs = [
    { name: "icon-32.png", buf: roundedBuf, size: 32 },
    { name: "apple-touch-icon.png", buf: appleBuf, size: 180 },
    { name: "icon-192.png", buf: roundedBuf, size: 192 },
    { name: "icon-512.png", buf: roundedBuf, size: 512 },
    { name: "icon-512-maskable.png", buf: maskableBuf, size: 512 },
  ];

  await Promise.all(
    outputs.map(({ name, buf, size }) =>
      sharp(buf, { density: 300 })
        .resize(size, size, { fit: "contain" })
        .png({ compressionLevel: 9, palette: false })
        .toFile(path.join(outDir, name)),
    ),
  );

  console.log(`Regenerated ${outputs.length + 1} CodeLava icon assets in ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
