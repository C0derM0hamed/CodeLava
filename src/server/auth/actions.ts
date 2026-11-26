"use server";

import { and, eq, lt, or } from "drizzle-orm";
import { draftMode, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { recordChange, type ActionResult } from "@/server/changes";
import { consumeRateLimit, fingerprint, requestIp } from "@/server/security";
import { hashPassword, verifyPassword } from "./password";
import { newExpiry, newSession, requireUser, sessionHash, sessionToken, setSessionCookie } from "./session";

const credentials = z.object({ email: z.email().max(254).transform((value) => value.toLowerCase()), password: z.string().min(1).max(1024) });
const failure = { ok: false, error: "Sign-in failed. Check your credentials or try again in a few minutes." } as const;
let dummyHash: Promise<string> | undefined;

export async function login(data: FormData): Promise<ActionResult> {
  const input = credentials.safeParse({ email: data.get("email"), password: data.get("password") });
  if (!input.success) return failure;
  const { email, password } = input.data;
  const requestHeaders = await headers();
  const ip = requestIp(requestHeaders);
  if (!await consumeRateLimit("login", ip, 30, 15 * 60_000)) return failure;
  const [candidate] = await db.select().from(users).where(eq(users.email, email));
  const now = new Date();
  const usable = candidate?.active && (!candidate.lockedUntil || candidate.lockedUntil <= now);
  const hash = usable ? candidate.passwordHash : await (dummyHash ??= hashPassword(newSession()));
  const valid = await verifyPassword(hash, password).catch(() => false);
  const oldToken = await sessionToken();
  const token = newSession();
  const accepted = await db.transaction(async (tx) => {
    const [current] = candidate ? await tx.select().from(users).where(eq(users.id, candidate.id)).for("update") : [];
    if (!usable || !current?.active || (current.lockedUntil && current.lockedUntil > now) || current.passwordHash !== candidate.passwordHash || !valid) {
      if (usable && current?.active && (!current.lockedUntil || current.lockedUntil <= now) && current.passwordHash === candidate.passwordHash) {
        const failedLogins = current.lockedUntil ? 1 : current.failedLogins + 1;
        await tx.update(users).set({
          failedLogins, lockedUntil: failedLogins >= 5 ? new Date(now.getTime() + 15 * 60_000) : null,
        }).where(eq(users.id, current.id));
      }
      await recordChange(tx, { userId: current?.id, entity: "auth", action: "login_failed", meta: { ip: fingerprint("audit-ip", ip) } });
      return false;
    }
    await tx.update(users).set({ failedLogins: 0, lockedUntil: null, lastLoginAt: now }).where(eq(users.id, current.id));
    await tx.delete(sessions).where(oldToken
      ? or(eq(sessions.id, sessionHash(oldToken)), and(eq(sessions.userId, current.id), lt(sessions.expiresAt, now)))
      : and(eq(sessions.userId, current.id), lt(sessions.expiresAt, now)));
    await tx.insert(sessions).values({
      id: sessionHash(token), userId: current.id, expiresAt: newExpiry(), ip: fingerprint("session-ip", ip),
      userAgent: requestHeaders.get("user-agent")?.slice(0, 512),
    });
    await recordChange(tx, { userId: current.id, entity: "auth", action: "login" });
    return true;
  });
  if (!accepted) return failure;
  await setSessionCookie(token);
  redirect("/admin");
}

export async function logout(everywhere = false): Promise<void> {
  const user = await requireUser();
  await db.transaction(async (tx) => {
    await tx.delete(sessions).where(everywhere === true ? eq(sessions.userId, user.id) : eq(sessions.id, user.sessionId));
    await recordChange(tx, { userId: user.id, entity: "auth", action: everywhere === true ? "logout_everywhere" : "logout" });
  });
  await setSessionCookie("", 0);
  (await draftMode()).disable();
  redirect("/admin/login");
}
