import "server-only";
import { randomUUID } from "node:crypto";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import type { MediaVariant } from "@/db/schema";
import { storage } from "./index";

export const publicTypes: Record<string, string> = {
  webp: "image/webp", avif: "image/avif", mp4: "video/mp4", webm: "video/webm", pdf: "application/pdf",
};
const imageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const megabyte = 1024 * 1024;
export const maxUploadSize = 80 * megabyte;

export async function removePublicFiles(keys: string[]) {
  const result = await Promise.allSettled(keys.map((key) => storage.delete("public", key)));
  for (const failure of result) if (failure.status === "rejected") console.error("Media file cleanup failed", failure.reason);
}

export class UploadError extends Error {}

export async function processMedia(file: File) {
  if (!file.size || file.size > maxUploadSize) throw new UploadError("Choose a file under 80 MB.");
  const bytes = Buffer.from(await file.arrayBuffer());
  const detected = await fileTypeFromBuffer(bytes).catch(() => undefined);
  if (!detected) throw new UploadError("The file type could not be verified.");
  const isImage = imageTypes.has(detected.mime);
  if (!isImage && publicTypes[detected.ext] !== detected.mime) {
    throw new UploadError("Use JPEG, PNG, WebP, AVIF, PDF, MP4 or WebM.");
  }
  if (!detected.mime.startsWith("video/") && file.size > 15 * megabyte) {
    throw new UploadError("Images and PDFs must be 15 MB or smaller.");
  }
  const originalName = file.name.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 255) || "upload";
  const base = randomUUID();
  if (!isImage) {
    const storageKey = `${base}.${detected.ext}`;
    await storage.put("public", storageKey, bytes);
    return {
      kind: detected.mime === "application/pdf" ? "document" as const : "video" as const, storageKey,
      url: storage.url("public", storageKey), mime: detected.mime, size: bytes.length, originalName,
    };
  }

  const image = sharp(bytes, { limitInputPixels: 40_000_000 }).rotate();
  const main = await image.clone().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 }).toBuffer({ resolveWithObject: true })
    .catch(() => { throw new UploadError("The image is damaged or exceeds 40 megapixels."); });
  const storageKey = `${base}.webp`;
  const variants: MediaVariant[] = [];
  const written: string[] = [];
  try {
    await storage.put("public", storageKey, main.data);
    written.push(storageKey);
    const widths = [...new Set([480, 960, 1600, 2400].map((width) => Math.min(width, main.info.width)))];
    for (const width of widths) {
      for (const format of ["avif", "webp"] as const) {
        if (format === "webp" && width === main.info.width) {
          variants.push({ width, height: main.info.height, key: storageKey, url: storage.url("public", storageKey), format });
          continue;
        }
        const key = `${base}-${width}.${format}`;
        const result = await image.clone().resize({ width, withoutEnlargement: true })
          .toFormat(format, { quality: format === "avif" ? 55 : 82 }).toBuffer({ resolveWithObject: true });
        await storage.put("public", key, result.data);
        written.push(key);
        variants.push({ width: result.info.width, height: result.info.height, key, url: storage.url("public", key), format });
      }
    }
    const blur = await image.clone().resize({ width: 16, height: 16, fit: "inside", withoutEnlargement: true }).webp().toBuffer();
    return {
      kind: "image" as const, storageKey, url: storage.url("public", storageKey), originalName,
      mime: "image/webp", size: main.data.length, width: main.info.width, height: main.info.height,
      blurDataUrl: `data:image/webp;base64,${blur.toString("base64")}`, variants,
    };
  } catch (error) {
    await removePublicFiles(written);
    throw error;
  }
}
