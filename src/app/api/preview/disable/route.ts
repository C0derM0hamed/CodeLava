import { draftMode } from "next/headers";
import { getCurrentUser } from "@/server/auth/session";
import { sameOrigin } from "@/server/security";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  if (!await getCurrentUser()) return new Response(null, { status: 401 });
  (await draftMode()).disable();
  return new Response(null, { status: 303, headers: { Location: "/admin", "Cache-Control": "no-store" } });
}
