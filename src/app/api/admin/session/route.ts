import { getCurrentUser, renewSession } from "@/server/auth/session";
import { sameOrigin } from "@/server/security";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  if (!await getCurrentUser()) return new Response(null, { status: 401 });
  await renewSession();
  return new Response(null, { status: 204 });
}
