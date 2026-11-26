import { db } from "@/db";
import { media } from "@/db/schema";
import { permits } from "@/server/auth/permissions";
import { getCurrentUser } from "@/server/auth/session";
import { invalidate, recordChange } from "@/server/changes";
import { sameOrigin } from "@/server/security";
import { mediaFolder } from "@/server/storage/schema";
import { maxUploadSize, processMedia, removePublicFiles, UploadError } from "@/server/storage/media";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Sign in to upload." }, { status: 401 });
  if (!permits(user.permissions, "media:write")) return Response.json({ error: "Upload permission required." }, { status: 403 });
  const requestLimit = maxUploadSize + 65_536;
  if (Number(request.headers.get("content-length")) > requestLimit) {
    return Response.json({ error: "Upload exceeds 80 MB." }, { status: 413 });
  }
  const contentType = request.headers.get("content-type");
  if (!request.body || !contentType?.startsWith("multipart/form-data;")) {
    return Response.json({ error: "Choose a file to upload." }, { status: 400 });
  }
  let keys: string[] = [];
  let received = 0;
  try {
    const bounded = request.body.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        received += chunk.length;
        if (received > requestLimit) throw new UploadError("Upload exceeds 80 MB.");
        controller.enqueue(chunk);
      },
    }));
    const form = await new Response(bounded, { headers: { "Content-Type": contentType } }).formData();
    const asset = form.get("file");
    const folder = mediaFolder.safeParse(form.get("folder") || "general");
    if (!(asset instanceof File) || !folder.success) {
      return Response.json({ error: "Choose a file and enter a valid folder name." }, { status: 400 });
    }
    const value = await processMedia(asset);
    keys = [...new Set([value.storageKey, ...(value.variants ?? []).map((variant) => variant.key)])];
    const id = await db.transaction(async (tx) => {
      const [row] = await tx.insert(media).values({ ...value, folder: folder.data, createdBy: user.id }).returning({ id: media.id });
      await recordChange(tx, { userId: user.id, entity: "media", id: row.id, action: "create", type: "content.created" });
      return row.id;
    });
    keys = [];
    invalidate("media", "/admin/media");
    return Response.json({ ok: true, id }, { status: 201 });
  } catch (error) {
    await removePublicFiles(keys);
    if (received > requestLimit) return Response.json({ error: "Upload exceeds 80 MB." }, { status: 413 });
    if (error instanceof UploadError) return Response.json({ error: error.message }, { status: 400 });
    console.error("Media upload failed", error);
    return Response.json({ error: "Upload failed. Try again." }, { status: 500 });
  }
}
