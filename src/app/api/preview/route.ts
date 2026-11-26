import { draftMode } from "next/headers";
import { canPreviewSite } from "@/server/auth/permissions";
import { getCurrentUser } from "@/server/auth/session";
import { safePreviewPath, validPreviewSecret } from "@/server/content/preview";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Sign in to preview this content.", { status: 401 });
  if (!canPreviewSite(user.permissions)) return new Response("Preview permission required.", { status: 403 });
  const { searchParams } = new URL(request.url);
  const path = safePreviewPath(searchParams.get("path"));
  if (!path || !validPreviewSecret(user.id, path, searchParams.get("secret") ?? "")) {
    return new Response("This preview link is invalid or has expired.", { status: 403 });
  }
  (await draftMode()).enable();
  return new Response(null, { status: 303, headers: { Location: encodeURI(path), "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
}
