import "server-only";
import { draftMode } from "next/headers";
import { canPreviewSite } from "@/server/auth/permissions";
import { getCurrentUser } from "@/server/auth/session";
import { equalSecret, fingerprint } from "@/server/security";

const maxAge = 15 * 60_000;
export function safePreviewPath(value: string | null) {
  if (!value || value.length > 512 || !/^\/(en|ar)(?:\/(?:services|work|about|process|technologies|blog|faq|contact|quote|privacy)(?:\/[\p{L}\p{M}\p{N}-]+)?)?\/?$/u.test(value)) return null;
  return value;
}
export function createPreviewLink(userId: string, path: string) {
  const now = Date.now();
  const secret = `${now}.${fingerprint("preview", `${userId}:${now}:${path}`)}`;
  return `/api/preview?${new URLSearchParams({ path, secret })}`;
}
export function validPreviewSecret(userId: string, path: string, secret: string) {
  if (!/^\d{13}\.[a-f0-9]{64}$/.test(secret)) return false;
  const [timestamp, digest] = secret.split(".");
  const age = Date.now() - Number(timestamp);
  return age >= 0 && age <= maxAge && equalSecret(digest, fingerprint("preview", `${userId}:${timestamp}:${path}`));
}

export async function hasDraftPreview() {
  if (!(await draftMode()).isEnabled) return false;
  const user = await getCurrentUser();
  return Boolean(user && canPreviewSite(user.permissions));
}
