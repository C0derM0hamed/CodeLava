import { z } from "zod";
import { localField, seoFields, socialFields, textField, urlField, type Field } from "./fields";

export const settingFields: Record<"contact" | "socials" | "seo", Field[]> = {
  contact: [
    { ...textField("email", "Email"), schema: z.email().max(254).nullable() },
    textField("phone", "Phone", 40), textField("whatsapp", "WhatsApp", 72),
    localField("address", "Address", 700), localField("hours", "Working hours", 500), urlField("mapUrl", "Map URL"),
  ],
  socials: socialFields,
  seo: seoFields,
};
export const featureFlags = z.record(z.string().regex(/^[a-z][a-z0-9_.-]{0,63}$/), z.boolean())
  .refine((flags) => Object.keys(flags).length <= 100, "Use at most 100 feature flags.");
