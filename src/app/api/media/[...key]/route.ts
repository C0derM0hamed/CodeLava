import { storage, validStorageKey } from "@/server/storage";
import { publicTypes } from "@/server/storage/media";

async function serve(request: Request, context: { params: Promise<{ key: string[] }> }) {
  const { key: segments } = await context.params;
  const key = segments[0];
  if (segments.length !== 1 || !validStorageKey(key)) return new Response(null, { status: 404 });
  const mime = publicTypes[key.split(".").at(-1) ?? ""];
  if (!mime) return new Response(null, { status: 404 });
  try {
    const size = await storage.size("public", key);
    const headers = new Headers({
      "Content-Type": mime, "Content-Length": String(size), "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff", "Accept-Ranges": "bytes",
    });
    if (mime === "application/pdf") headers.set("Content-Disposition", "attachment");
    if (request.method === "HEAD") return new Response(null, { headers });
    const bytes = request.headers.get("range");
    if (bytes) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(bytes);
      const start = match?.[1] ? Number(match[1]) : Math.max(0, size - Number(match?.[2]));
      const end = match?.[1] && match[2] ? Math.min(size - 1, Number(match[2])) : size - 1;
      if (!match || (!match[1] && !match[2]) || !Number.isSafeInteger(start) || start > end || start >= size) {
        return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
      }
      headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
      headers.set("Content-Length", String(end - start + 1));
      return new Response((await storage.get("public", key, { start, end })).body, { status: 206, headers });
    }
    return new Response((await storage.get("public", key)).body, { headers });
  } catch {
    return new Response(null, { status: 404 });
  }
}

export { serve as GET, serve as HEAD };
