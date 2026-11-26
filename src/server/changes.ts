import "server-only";
import { createHash } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import type { DB } from "@/db";
import { auditLogs, domainEvents } from "@/db/schema";

export type Transaction = Parameters<Parameters<DB["transaction"]>[0]>[0];

export async function recordChange(tx: Transaction, change: {
  userId?: string; entity: string; id?: string; action: string; type?: string; meta?: Record<string, unknown>;
}) {
  const { userId, entity, id, action, type, meta } = change;
  const longId = id && id.length > 64;
  const reference = longId ? createHash("sha256").update(id).digest("hex") : id;
  const data = longId ? { ...meta, key: id } : meta;
  await tx.insert(auditLogs).values({ userId, entity, entityId: reference, action, meta: data });
  if (type) await tx.insert(domainEvents).values({ type, aggregate: entity, aggregateId: reference, payload: data ?? {} });
}

export function invalidate(entity: string, path?: string) {
  revalidateTag(entity, { expire: 0 });
  if (path) revalidatePath(path);
}

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };
