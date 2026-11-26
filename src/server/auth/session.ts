import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/db";
import { roles, sessions, users } from "@/db/schema";
import { permits, type Permission } from "./permissions";

export const sessionCookie = "cl_session";
const idleSeconds = 14 * 24 * 60 * 60;
export const sessionHash = (token: string) => createHash("sha256").update(token).digest("hex");
export const newSession = () => randomBytes(32).toString("base64url");
export const newExpiry = () => new Date(Date.now() + idleSeconds * 1000);

export async function sessionToken() {
  const token = (await cookies()).get(sessionCookie)?.value;
  return token && /^[\w-]{43}$/.test(token) ? token : undefined;
}

export async function setSessionCookie(token: string, maxAge = idleSeconds) {
  (await cookies()).set(sessionCookie, token, {
    path: "/", httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge,
  });
}

const lookup = cache(async () => {
  const token = await sessionToken();
  if (!token) return null;
  const sessionId = sessionHash(token);
  const [row] = await db.select({
    id: users.id, email: users.email, name: users.name, role: roles.key, permissions: roles.permissions,
    expiresAt: sessions.expiresAt, sessionId: sessions.id,
  }).from(sessions).innerJoin(users, eq(users.id, sessions.userId)).innerJoin(roles, eq(roles.id, users.roleId))
    .where(and(eq(sessions.id, sessionId), eq(users.active, true), gt(sessions.expiresAt, new Date())));
  return row ?? null;
});

export const getCurrentUser = lookup;
export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function requirePermission(permission: Permission) {
  const user = await requireUser();
  if (!permits(user.permissions, permission)) notFound();
  return user;
}

export async function renewSession() {
  const token = await sessionToken();
  const user = await requireUser();
  if (!token || user.expiresAt.getTime() > Date.now() + (idleSeconds - 3600) * 1000) return;
  const now = new Date();
  const expiry = newExpiry();
  const [renewed] = await db.update(sessions).set({ expiresAt: expiry })
    .where(and(eq(sessions.id, user.sessionId), gt(sessions.expiresAt, now))).returning({ id: sessions.id });
  if (renewed) await setSessionCookie(token);
}
