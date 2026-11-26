import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { leadAttachments } from "@/db/schema";
import { permits } from "@/server/auth/permissions";
import { getCurrentUser } from "@/server/auth/session";
import { recordChange } from "@/server/changes";
import { storage } from "@/server/storage";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response(null, { status: 401 });
  if (!permits(user.permissions, "leads:read")) return new Response(null, { status: 403 });
  const id = z.uuid().safeParse((await context.params).id).data;
  if (!id) return new Response(null, { status: 404 });
  const [file] = await db.select().from(leadAttachments).where(eq(leadAttachments.id, id));
  if (!file) return new Response(null, { status: 404 });
  try {
    await db.transaction((tx) => recordChange(tx, { userId: user.id, entity: "leads", id: file.leadId,
      action: "attachment_downloaded", meta: { attachmentId: id } }));
    const { body, size } = await storage.get("private", file.storageKey);
    const name = encodeURIComponent(file.originalName.toWellFormed()).replace(/['()*]/g, (char) => `%${char.charCodeAt(0).toString(16)}`);
    return new Response(body, { headers: {
      "Content-Type": file.mime, "Content-Length": String(size), "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff", "Content-Disposition": `attachment; filename*=UTF-8''${name}`,
    } });
  } catch {
    return new Response(null, { status: 404 });
  }
}
