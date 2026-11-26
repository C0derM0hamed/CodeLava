import "server-only";
import { and, desc, eq, gte, ilike, lt, or, sql, type SQL } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { leads, leadStatus, leadType } from "@/db/schema";

export const leadFilters = z.object({
  q: z.string().trim().max(160).optional(), status: z.enum(leadStatus.enumValues).optional(),
  type: z.enum(leadType.enumValues).optional(), service: z.uuid().optional(),
  from: z.iso.date().optional(), to: z.iso.date().optional(), page: z.coerce.number().int().min(1).max(10000).optional(),
});

export function parseLeadFilters(input: Record<string, unknown>) {
  const result = leadFilters.safeParse(Object.fromEntries(Object.entries(input).filter(([, value]) => value !== "")));
  return result.data ?? {};
}

export function leadConditions(filters: z.infer<typeof leadFilters>) {
  const conditions: SQL[] = [];
  if (filters.q) {
    const query = `%${filters.q.replace(/[\\%_]/g, "\\$&")}%`;
    const matches = or(ilike(leads.name, query), ilike(leads.email, query), ilike(leads.company, query), ilike(leads.message, query));
    if (matches) conditions.push(matches);
  }
  if (filters.status) conditions.push(eq(leads.status, filters.status));
  if (filters.type) conditions.push(eq(leads.type, filters.type));
  if (filters.service) conditions.push(sql`${leads.serviceIds} @> ${JSON.stringify([filters.service])}::jsonb`);
  if (filters.from) conditions.push(gte(leads.createdAt, new Date(filters.from)));
  if (filters.to) {
    const end = new Date(filters.to);
    end.setUTCDate(end.getUTCDate() + 1);
    conditions.push(lt(leads.createdAt, end));
  }
  return and(...conditions);
}

export function listLeads(filters: z.infer<typeof leadFilters>, size = 30, offset = 0) {
  return db.select().from(leads).where(leadConditions(filters)).orderBy(desc(leads.createdAt), desc(leads.id)).limit(size).offset(offset);
}
