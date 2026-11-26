import "server-only";

import { hasLocale } from "next-intl";
import { routing, type AppLocale } from "@/i18n/routing";
import { localizedPath } from "@/lib/seo";
import { equalSecret, fingerprint, sameOrigin } from "@/server/security";
import { sendPublicLead } from "./action";
import type { LeadState } from "./model";

const bodyLimit = 80 * 1024 * 1024;
const resultExpiry = 5 * 60_000;
type Kind = "quote" | "contact";

export async function nativeLead(request: Request, kind: Kind, locale: string) {
  if (!hasLocale(routing.locales, locale)) return new Response(null, { status: 404 });
  if (!sameOrigin(request)) return new Response(null, { status: 403 });

  let state: LeadState = { status: "failure", errors: { form: ["failure"] } };
  const length = Number(request.headers.get("content-length"));
  if (length > bodyLimit) {
    state = { status: "failure", errors: { attachments: ["uploadFailed"] } };
  } else if (request.body) {
    let received = 0;
    const boundedBody = request.body.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        received += chunk.byteLength;
        if (received > bodyLimit) controller.error(new RangeError("Form body is too large"));
        else controller.enqueue(chunk);
      },
    }));
    try {
      const contentType = request.headers.get("content-type") ?? "";
      const data = await new Response(boundedBody, { headers: { "content-type": contentType } }).formData();
      state = await sendPublicLead(kind, locale, { status: "idle" }, data);
    } catch {
      if (received > bodyLimit) state = { status: "failure", errors: { attachments: ["uploadFailed"] } };
    }
  }

  // Keep the receipt free of form contents. The signature scopes it to this locale, route and time window.
  const receipt = Buffer.from(JSON.stringify({ state, at: Date.now() })).toString("base64url");
  const signature = fingerprint("native-form-receipt", `${locale}:${kind}:${receipt}`);
  const location = `${localizedPath(locale, kind)}?${new URLSearchParams({ result: `${receipt}.${signature}` })}`;
  return new Response(null, { status: 303, headers: { location, "cache-control": "no-store" } });
}

export function readNativeLead(value: string | string[] | undefined, kind: Kind, locale: AppLocale): LeadState | undefined {
  if (typeof value !== "string" || !/^[\w-]{1,2048}\.[a-f0-9]{64}$/.test(value)) return;
  const [receipt, signature] = value.split(".");
  if (!equalSecret(signature, fingerprint("native-form-receipt", `${locale}:${kind}:${receipt}`))) return;
  try {
    const { at, state } = JSON.parse(Buffer.from(receipt, "base64url").toString("utf8")) as { at: number; state: LeadState };
    const age = Date.now() - at;
    if (age >= 0 && age <= resultExpiry) return state;
  } catch {
    return;
  }
}
