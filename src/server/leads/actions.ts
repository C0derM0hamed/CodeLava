"use server";

import { inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { leadAttachments, leads, services } from "@/db/schema";
import { invalidate, recordChange } from "@/server/changes";
import { consumeRateLimit, fingerprint, requestIp } from "@/server/security";
import { storage } from "@/server/storage";
import { storeAttachment } from "./attachments";
import { leadNotifier } from "./notifications";
import { leadAttachmentCount, leadAttachmentLimit, leadSchema, type LeadResult } from "./schema";

const fail = (field: string, error: string): LeadResult => ({ ok: false, errors: { [field]: [error] } });

export async function submitLead(form: FormData): Promise<LeadResult> {
  if (!(form instanceof FormData)) return fail("form", "Invalid form submission.");
  const ip = requestIp(await headers());
  if (!await consumeRateLimit("lead", ip, 10, 60 * 60_000)) return fail("form", "Too many submissions. Try again later.");
  const optional = (key: string) => form.get(key) || undefined;
  function json(key: string) {
    if (!form.has(key)) return undefined;
    const value = form.get(key);
    if (typeof value !== "string" || value.length > 16_000) return null;
    try { return JSON.parse(value) as unknown; } catch { return null; }
  }
  const parsed = leadSchema.safeParse({
    type: form.get("type"), name: form.get("name"), email: form.get("email"), message: form.get("message"),
    phone: optional("phone"), company: optional("company"), country: optional("country"),
    budget: optional("budget"), currency: optional("currency"), timeline: optional("timeline"),
    locale: optional("locale"), sourcePath: optional("sourcePath"), referrer: optional("referrer"),
    details: json("details"), utm: json("utm"), serviceIds: form.getAll("serviceIds"),
    consent: ["true", "on", "1"].includes(String(form.get("consent"))),
    website: optional("website"), startedAt: Number(form.get("startedAt")),
  });
  if (!parsed.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "form");
      (errors[field] ??= []).push(issue.message);
    }
    return { ok: false, errors };
  }
  const { startedAt, website, consent, ...input } = parsed.data;
  if (website || Date.now() - startedAt < 1_500 || Date.now() - startedAt > 86_400_000) {
    return fail("form", "Wait a moment or refresh the form before submitting.");
  }
  const attachments = form.getAll("attachments").filter((file) => !(file instanceof File && !file.name && !file.size));
  if (attachments.length > leadAttachmentCount || attachments.some((file) => !(file instanceof File) || file.size <= 0 || file.size > leadAttachmentLimit)) {
    return fail("attachments", "Choose up to five files, each 15 MB or smaller.");
  }
  if (input.serviceIds.length) {
    const matches = await db.select({ id: services.id, status: services.status }).from(services).where(inArray(services.id, input.serviceIds));
    if (matches.length !== input.serviceIds.length || matches.some((service) => service.status !== "published")) {
      return fail("serviceIds", "Choose services currently listed on the site.");
    }
  }

  const stored: Awaited<ReturnType<typeof storeAttachment>>[] = [];
  let id: string;
  try {
    for (const file of attachments) stored.push(await storeAttachment(file as File));
    id = await db.transaction(async (tx) => {
      const [row] = await tx.insert(leads).values({
        ...input, ipHash: fingerprint("lead-ip", ip), metadata: { consent, consentAt: new Date().toISOString() },
      }).returning({ id: leads.id });
      if (stored.length) await tx.insert(leadAttachments).values(stored.map((file) => ({ ...file, leadId: row.id })));
      await recordChange(tx, { entity: "leads", id: row.id, action: "create", type: "lead.created", meta: { type: input.type } });
      return row.id;
    });
  } catch (error) {
    await Promise.allSettled(stored.map((file) => storage.delete("private", file.storageKey)));
    if (stored.length < attachments.length) return fail("attachments", "Check that all files are supported and readable.");
    console.error("Lead submission failed", error);
    return fail("form", "Could not send your request. Try again.");
  }

  invalidate("leads", "/admin/leads");
  await leadNotifier.submitted({ id, type: input.type }).catch((error: unknown) => console.error("Lead notification failed", error));
  return { ok: true, id };
}
