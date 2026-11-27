import { z } from "zod";

// Public forms share this schema. Disable Zod's runtime code generation under the browser CSP.
if (typeof window !== "undefined") z.config({ jitless: true });

const optionalText = (max: number) => z.string().trim().max(max).optional();
const optionalCode = (pattern: RegExp) => z.string().trim().toUpperCase().regex(pattern).optional();
const optionalHttp = z.url({ protocol: /^https?$/ }).max(2048).optional();
const limitedRecord = <T extends z.ZodType>(value: T) => z.record(z.string().min(1).max(80), value)
  .refine((record) => Object.keys(record).length <= 40 && JSON.stringify(record).length <= 16_000, "Too many details.");

export const leadSchema = z.object({
  type: z.enum(["contact", "quote"]),
  name: z.string().trim().min(2).max(160),
  email: z.email().max(254).transform((email) => email.toLowerCase()),
  phone: optionalText(40),
  company: optionalText(160),
  country: optionalCode(/^[A-Z]{2}$/),
  serviceIds: z.array(z.uuid()).max(30).default([]).transform((ids) => [...new Set(ids)]),
  budget: optionalText(48),
  currency: optionalCode(/^[A-Z]{3}$/),
  timeline: optionalText(48),
  message: z.string().trim().min(10).max(10_000),
  details: limitedRecord(z.json()).default({}),
  locale: z.enum(["en", "ar"]).default("en"),
  sourcePath: z.string().max(512).regex(/^\/(?![/\\])[^\\\u0000-\u001f]*$/).optional(),
  utm: limitedRecord(z.string().max(512)).default({}),
  referrer: optionalHttp,
  consent: z.literal(true, { error: "Consent is required." }),
  website: z.string().max(0).default(""),
  startedAt: z.number().int().positive(),
});
export const leadAttachmentLimit = 15 * 1024 * 1024;
export const leadAttachmentCount = 5;
export const leadAttachmentAccept = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.zip,.txt";

export type LeadInput = z.input<typeof leadSchema>;
export type LeadResult = { ok: true; id: string } | { ok: false; errors: Record<string, string[]> };

/** Send fields individually. Append serviceIds and attachments once per item.
 * Encode details and utm as JSON, consent as true, and startedAt as epoch milliseconds.
 */
export function encodeLead(input: LeadInput, files: readonly File[] = []) {
  const data = new FormData();
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    if (key === "serviceIds") {
      for (const id of input.serviceIds ?? []) data.append(key, id);
    } else {
      data.set(key, typeof value === "object" ? JSON.stringify(value) : String(value));
    }
  }
  for (const file of files) data.append("attachments", file);
  return data;
}
