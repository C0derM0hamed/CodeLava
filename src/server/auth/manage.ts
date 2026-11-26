"use server";

import { and, count, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { roles, sessions, users } from "@/db/schema";
import { invalidate, recordChange, type ActionResult } from "@/server/changes";
import { allPermissions, permits } from "./permissions";
import { requireUser } from "./session";
import { hashPassword } from "./password";

const fail = (error: string): ActionResult => ({ ok: false, error });
const uuid = z.uuid();
const userSchema = z.object({
  id: uuid.nullable(), name: z.string().trim().min(1).max(120), email: z.email().max(254).toLowerCase(),
  password: z.union([z.literal(""), z.string().min(12).max(1024)]),
  roleId: uuid, active: z.boolean(), locale: z.enum(["en", "ar"]),
});
const roleSchema = z.object({
  id: uuid.nullable(), key: z.string().regex(/^[a-z][a-z0-9-]{1,47}$/),
  name: z.string().trim().min(1).max(96), permissions: z.array(z.enum(allPermissions)).max(allPermissions.length),
});
const refresh = () => invalidate("users", "/admin/access");

function canManage(actor: string[], target: string[]) {
  return actor.includes("*") || target.every((permission) => actor.includes(permission));
}

export async function saveUser(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  if (!permits(user.permissions, "users:manage")) return fail("User management permission required.");
  const parsed = userSchema.safeParse(input);
  if (!parsed.success) return fail("Enter a name, valid email, role and a password of at least 12 characters when setting a password.");
  const { id, password, ...values } = parsed.data;
  if (!id && !password) return fail("Enter an initial password.");
  try {
    const passwordHash = password ? await hashPassword(password) : undefined;
    const result = await db.transaction(async (tx): Promise<ActionResult> => {
      await tx.execute(sql`select pg_advisory_xact_lock(420234)`);
      const [actor] = await tx.select({ permissions: roles.permissions }).from(users).innerJoin(roles, eq(roles.id, users.roleId))
        .where(and(eq(users.id, user.id), eq(users.active, true)));
      const [role] = await tx.select().from(roles).where(eq(roles.id, values.roleId));
      if (!actor || !permits(actor.permissions, "users:manage") || !role || !canManage(actor.permissions, role.permissions)) return fail("You cannot assign this role.");
      const [existing] = id ? await tx.select({ user: users, role: roles }).from(users).innerJoin(roles, eq(roles.id, users.roleId))
        .where(eq(users.id, id)) : [];
      if (id && !existing) return fail("User not found.");
      if (existing && !canManage(actor.permissions, existing.role.permissions)) return fail("You cannot manage this user.");
      if (id === user.id && (!values.active || existing?.user.roleId !== values.roleId)) return fail("Keep your own account active and retain your role.");
      if (existing?.role.key === "owner" && existing.user.active && (!values.active || role.key !== "owner")) {
        const [row] = await tx.select({ total: count() }).from(users)
          .where(and(eq(users.active, true), eq(users.roleId, existing.role.id)));
        if (row.total <= 1) return fail("At least one owner must remain active.");
      }
      const [row] = id ? await tx.update(users).set({
        ...values, ...(passwordHash ? { passwordHash, failedLogins: 0, lockedUntil: null } : {}),
      }).where(eq(users.id, id)).returning({ id: users.id })
        : await tx.insert(users).values({ ...values, passwordHash: passwordHash! }).returning({ id: users.id });
      if (existing && (passwordHash || !values.active || values.roleId !== existing.user.roleId)) {
        await tx.delete(sessions).where(eq(sessions.userId, row.id));
      }
      await recordChange(tx, { userId: user.id, entity: "users", id: row.id, action: existing ? "update" : "create",
        meta: { role: role.key, active: values.active, passwordChanged: Boolean(passwordHash) } });
      return { ok: true, id: row.id };
    });
    if (result.ok) refresh();
    return result;
  } catch (error) {
    if (postgresCode(error) === "23505") return fail("Another user already has that email address.");
    console.error("User write failed", error);
    return fail("Could not save the user.");
  }
}

export async function saveRole(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  if (!permits(user.permissions, "users:manage")) return fail("Role management permission required.");
  const parsed = roleSchema.safeParse(input);
  if (!parsed.success) return fail("Enter a valid role name, key and permissions.");
  const { id, ...values } = parsed.data;
  try {
    const result = await db.transaction(async (tx): Promise<ActionResult> => {
      await tx.execute(sql`select pg_advisory_xact_lock(420234)`);
      const [actor] = await tx.select({ permissions: roles.permissions }).from(users).innerJoin(roles, eq(roles.id, users.roleId))
        .where(and(eq(users.id, user.id), eq(users.active, true)));
      if (!actor || !permits(actor.permissions, "users:manage") || !canManage(actor.permissions, values.permissions)) return fail("You cannot grant these permissions.");
      const [existing] = id ? await tx.select().from(roles).where(eq(roles.id, id)) : [];
      if (id && (!existing || existing.system || !canManage(actor.permissions, existing.permissions))) return fail("This role cannot be changed.");
      const [row] = id
        ? await tx.update(roles).set({ ...values, permissions: [...new Set(values.permissions)] }).where(eq(roles.id, id)).returning()
        : await tx.insert(roles).values({ ...values, permissions: [...new Set(values.permissions)] }).returning();
      await recordChange(tx, { userId: user.id, entity: "roles", id: row.id, action: id ? "update" : "create", meta: { permissions: row.permissions } });
      return { ok: true, id: row.id };
    });
    if (result.ok) refresh();
    return result;
  } catch (error) {
    if (postgresCode(error) === "23505") return fail("That role key is already in use.");
    console.error("Role write failed", error);
    return fail("Could not save the role.");
  }
}

export async function deleteRole(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  if (!permits(user.permissions, "users:manage")) return fail("Role management permission required.");
  const id = uuid.safeParse(input).data;
  if (!id) return fail("Invalid role.");
  try {
    const result = await db.transaction(async (tx): Promise<ActionResult> => {
      await tx.execute(sql`select pg_advisory_xact_lock(420234)`);
      const [actor] = await tx.select({ permissions: roles.permissions }).from(users).innerJoin(roles, eq(roles.id, users.roleId))
        .where(and(eq(users.id, user.id), eq(users.active, true)));
      const [role] = await tx.select().from(roles).where(eq(roles.id, id));
      if (!actor || !permits(actor.permissions, "users:manage") || !role || role.system || !canManage(actor.permissions, role.permissions)) return fail("This role cannot be deleted.");
      const [member] = await tx.select({ id: users.id }).from(users).where(eq(users.roleId, id)).limit(1);
      if (member) return fail("Reassign this role’s users before deleting it.");
      await tx.delete(roles).where(eq(roles.id, id));
      await recordChange(tx, { userId: user.id, entity: "roles", id, action: "delete" });
      return { ok: true };
    });
    if (result.ok) refresh();
    return result;
  } catch (error) {
    console.error("Role deletion failed", error);
    return fail("Could not delete the role.");
  }
}

function postgresCode(error: unknown): unknown {
  if (!error || typeof error !== "object") return undefined;
  if ("code" in error) return error.code;
  return "cause" in error ? postgresCode(error.cause) : undefined;
}
