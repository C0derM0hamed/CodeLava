"use server";

import type { AppLocale } from "@/i18n/routing";
import { localizedPath } from "@/lib/seo";
import { submitLead } from "@/server/leads/actions";
import { encodeLead } from "@/server/leads/schema";
import { readLead, validateStep, type FormErrors, type LeadState } from "./model";

export async function sendPublicLead(
  type: "quote" | "contact", locale: AppLocale, _previous: LeadState, data: FormData,
): Promise<LeadState> {
  const { input, choices } = readLead(data, type, locale, localizedPath(locale, `/${type}`));
  const steps = type === "quote" ? [0, 1, 2, 3, 4] : [1, 3, 4];
  const failed = (errors: FormErrors): LeadState => ({ status: "failure", errors });
  const errors = Object.assign({}, ...steps.map((step) => validateStep(step, input, choices))) as FormErrors;
  if (Object.keys(errors).length) return failed(errors);

  const files = type === "quote" ? data.getAll("attachments")
    .filter((entry): entry is File => entry instanceof File && Boolean(entry.name || entry.size)) : [];
  try {
    const result = await submitLead(encodeLead(input, files));
    if (result.ok) return { status: "success", id: result.id };

    const fields = Object.keys(result.errors);
    const translated: FormErrors = {};
    for (const field of fields) {
      if (field === "form") {
        const message = result.errors[field][0];
        const reason = message?.startsWith("Too many") ? "rateLimit"
          : message?.startsWith("Wait a moment") ? "retryWait" : "failure";
        translated.form = [reason];
      } else if (field === "website" || field === "startedAt") translated.form = ["failure"];
      else if (field === "attachments") translated.attachments = ["uploadFailed"];
      else if (field === "serviceIds") translated.serviceIds = ["serviceIds"];
      else translated[field] = ["invalidOption"];
    }
    return failed(translated);
  } catch (error) {
    console.error("Public lead action failed", error);
    return failed({ form: ["failure"] });
  }
}
