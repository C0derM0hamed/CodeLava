import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";
import { lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { rateLimits } from "@/db/schema";

export function requestIp(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for")?.split(",").at(-1)?.trim();
  return [forwarded, headers.get("x-real-ip")].find((value) => value && isIP(value)) ?? "unknown";
}

export function fingerprint(namespace: string, value: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is required");
  return createHmac("sha256", secret).update(namespace).update("\0").update(value).digest("hex");
}

export function equalSecret(a: string, b: string) {
  const hash = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(hash(a), hash(b));
}

export async function consumeRateLimit(namespace: string, identity: string, max: number, windowMs: number) {
  const now = new Date();
  const key = fingerprint(namespace, identity);
  const expiresAt = new Date(now.getTime() + windowMs);
  const [row] = await db.insert(rateLimits).values({ key, count: 1, expiresAt })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`CASE WHEN ${rateLimits.expiresAt} <= ${now.toISOString()}::timestamptz THEN 1 ELSE least(${rateLimits.count} + 1, ${max + 1}) END`,
        expiresAt: sql`CASE WHEN ${rateLimits.expiresAt} <= ${now.toISOString()}::timestamptz THEN ${expiresAt.toISOString()}::timestamptz ELSE ${rateLimits.expiresAt} END`,
      },
    }).returning({ count: rateLimits.count });
  if (Math.random() < 0.02) await db.delete(rateLimits).where(lt(rateLimits.expiresAt, now));
  return row.count <= max;
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const url = new URL(request.url);
  // Match the effective host Next uses, behind deployments that normalize forwarded headers.
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? url.host;
  const protocol = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(/:$/, "");
  const configured = process.env.APP_URL;
  return origin === (process.env.NODE_ENV === "production" && configured
    ? new URL(configured).origin
    : `${protocol}://${host}`);
}
