import { leadSchema, type LeadInput } from "@/server/leads/schema";

export const currencyCodes = ["USD", "SAR", "AED", "KWD", "QAR", "EGP"] as const;
export type Currency = (typeof currencyCodes)[number];
export const regionCurrency: Record<string, Currency> = { US: "USD", SA: "SAR", AE: "AED", KW: "KWD", QA: "QAR", EG: "EGP" };

// Round planning ranges in each market's currency, independent of daily exchange rates.
export const budgetThresholds: Record<Currency, readonly [number, number, number]> = {
  USD: [5_000, 15_000, 40_000],
  SAR: [20_000, 60_000, 150_000],
  AED: [20_000, 55_000, 150_000],
  KWD: [1_500, 5_000, 12_000],
  QAR: [20_000, 55_000, 150_000],
  EGP: [250_000, 750_000, 2_000_000],
};

export const timelines = ["asap", "oneToThreeMonths", "threeToSixMonths", "sixMonthsPlus", "flexible"] as const;

export const features = ["featureAccounts", "featurePayments", "featureIntegrations", "featureBilingual", "featureReporting"] as const;
export const channels = ["email", "phone", "whatsapp"] as const;
export const unsureValue = "unsure";

export type FormErrors = Record<string, string[]>;
export type Draft = {
  serviceIds: string[]; message: string; goals: string; existing: string; features: string[]; otherFeatures: string;
  currency: Currency; currencyManual: boolean; budget: string; timeline: string;
  name: string; email: string; phone: string; company: string; country: string; preferredContact: string;
  consent: boolean;
};
export type LeadState = { status: "idle" } | { status: "success"; id: string } |
  { status: "failure"; errors: FormErrors };

export const stepFields = [
  ["serviceIds"],
  ["message", "details"],
  ["currency", "budget", "timeline"],
  ["name", "email", "phone", "company", "country"],
  ["attachments", "consent"],
] as const;

const detailsSchema = leadSchema.pick({ message: true, details: true });
const budgetSchema = leadSchema.pick({ budget: true, currency: true, timeline: true });
const contactSchema = leadSchema.pick({ name: true, email: true, phone: true, company: true, country: true });
const consentSchema = leadSchema.pick({ consent: true });

export function readLead(data: FormData, type: LeadInput["type"], locale: LeadInput["locale"], path: string) {
  const read = (key: string) => String(data.get(key) ?? "").trim();
  const choices = data.getAll("serviceIds").map(String);
  const serviceIds = choices.filter((value) => value !== unsureValue);
  const input: LeadInput = {
    type,
    locale,
    name: read("name"),
    email: read("email"),
    phone: read("phone") || undefined,
    company: read("company") || undefined,
    country: read("country") || undefined,
    serviceIds,
    currency: read("currency") || undefined,
    budget: read("budget") || undefined,
    timeline: read("timeline") || undefined,
    message: read("message"),
    details: type === "quote" ? {
      ...(choices.includes(unsureValue) ? { unsure: true } : {}),
      ...(read("goals") ? { goals: read("goals") } : {}),
      ...(read("existing") ? { existing: read("existing") } : {}),
      ...(read("otherFeatures") ? { otherFeatures: read("otherFeatures") } : {}),
      ...(data.has("features") ? { features: data.getAll("features").map(String) } : {}),
      ...(read("preferredContact") ? { preferredContact: read("preferredContact") } : {}),
    } : {},
    sourcePath: path,
    utm: readUtm(new URLSearchParams(read("utm"))),
    referrer: safeReferrer(read("referrer")),
    consent: data.has("consent") as true,
    website: String(data.get("website") ?? ""),
    startedAt: Number(data.get("startedAt")),
  };
  return { input, choices };
}

export function readUtm(params: URLSearchParams) {
  return Object.fromEntries([...params.entries()].filter(([key, value]) =>
    /^utm_[a-z0-9_]{1,72}$/i.test(key) && value.trim(),
  ).slice(0, 12).map(([key, value]) => [key, value.slice(0, 512)]));
}

function safeReferrer(value: string) {
  if (!value || value.length > 2048) return undefined;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export function validateStep(step: number, input: LeadInput, choices: string[]): FormErrors {
  if (step === 0) {
    if (!choices.length) return { serviceIds: ["required"] };
    return leadSchema.shape.serviceIds.safeParse(input.serviceIds).success ? {} : { serviceIds: ["invalidOption"] };
  }
  const shape = [null, detailsSchema, budgetSchema, contactSchema, consentSchema][step];
  if (!shape) return {};
  const parsed = shape.safeParse(input);
  if (parsed.success) {
    if (step === 3 && input.details?.preferredContact && input.details.preferredContact !== "email" && !input.phone) {
      return { phone: ["required"] };
    }
    return {};
  }
  const errors: FormErrors = {};
  for (const issue of parsed.error.issues) {
    const field = String(issue.path[0]);
    let code: string = issue.code;
    if (field === "consent") code = "consent";
    else if (!input[field as keyof LeadInput] && ["email", "message", "name"].includes(field)) code = "required";
    else if (issue.code === "too_small") code = `tooShort:${issue.minimum}`;
    else if (issue.code === "too_big") code = `tooLong:${issue.maximum}`;
    else if (field === "email") code = "email";
    else code = "invalidOption";
    (errors[field] ??= []).push(code);
  }
  return errors;
}
