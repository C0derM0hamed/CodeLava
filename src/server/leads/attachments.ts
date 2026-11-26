import "server-only";
import { randomUUID } from "node:crypto";
import { fileTypeFromBuffer } from "file-type";
import { storage } from "@/server/storage";

const allowed: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  png: "image/png", jpg: "image/jpeg", webp: "image/webp", zip: "application/zip", txt: "text/plain",
};
const legacy = {
  doc: { stream: "WordDocument", mime: "application/msword" },
  xls: { stream: "Workbook", mime: "application/vnd.ms-excel" },
  ppt: { stream: "PowerPoint Document", mime: "application/vnd.ms-powerpoint" },
} as const;

function hasOfficeStream(bytes: Buffer, name: string) {
  if (bytes.length < 512) return false;
  const shift = bytes.readUInt16LE(30);
  if (shift !== 9 && shift !== 12) return false;
  const sectorSize = 2 ** shift;
  const signature = Buffer.from(`${name}\0`, "utf16le");
  // Directory entries are 128-byte aligned inside Compound File sectors.
  for (let offset = sectorSize; offset + 128 <= bytes.length; offset += 128) {
    if (bytes[offset + 66] === 2 && bytes.readUInt16LE(offset + 64) === signature.length &&
      bytes.subarray(offset, offset + signature.length).equals(signature)) return true;
  }
  return false;
}

export async function storeAttachment(file: File) {
  const bytes = Buffer.from(await file.arrayBuffer());
  const detected = await fileTypeFromBuffer(bytes).catch(() => undefined);
  let ext = detected?.ext;
  let mime = ext && allowed[ext] === detected?.mime ? allowed[ext] : undefined;
  const extension = file.name.split(".").at(-1)?.toLowerCase();
  if (ext === "cfb" && extension && Object.hasOwn(legacy, extension)) {
    const format = legacy[extension as keyof typeof legacy];
    if (hasOfficeStream(bytes, format.stream) || (extension === "xls" && hasOfficeStream(bytes, "Book"))) {
      ext = extension;
      mime = format.mime;
    }
  }
  if (!detected && extension === "txt") {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    if (!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text)) {
      ext = "txt";
      mime = allowed.txt;
    }
  }
  if (!mime || !ext) throw new Error("Unverified attachment format");
  const storageKey = `${randomUUID()}.${ext}`;
  await storage.put("private", storageKey, bytes);
  return {
    originalName: file.name.replace(/[\u0000-\u001f\u007f/\\]/g, "").slice(0, 240).trim() || `attachment.${ext}`,
    storageKey, mime, size: file.size,
  };
}
