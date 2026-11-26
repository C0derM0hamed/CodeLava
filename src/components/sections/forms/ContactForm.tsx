"use client";

import { useTranslations } from "next-intl";
import { startTransition, useActionState, useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { ActionLink } from "@/components/ui/ActionLink";
import { Textarea } from "@/components/ui/Field";
import type { AppLocale } from "@/i18n/routing";
import { sendPublicLead } from "./action";
import { IdentityFields, LeadConsent, LeadReceipt } from "./lead-ui";
import { readLead, validateStep, type FormErrors, type LeadState } from "./model";
import { useFormError } from "./use-form-messages";
import { waitForFormTime } from "./timing";
import "./conversion.css";

const initialState: LeadState = { status: "idle" };

export function ContactForm({ locale, campaign, startedAt, initialReferrer, nativeResult }: {
  locale: AppLocale; campaign: string; startedAt: number; initialReferrer: string; nativeResult?: LeadState;
}) {
  const t = useTranslations("contact");
  const f = useTranslations("forms");
  const validation = useTranslations("forms.validation");
  const c = useTranslations("common");
  const error = useFormError(locale, "contact");
  const [state, dispatch, submitting] = useActionState(sendPublicLead.bind(null, "contact", locale), nativeResult ?? initialState);
  const [waiting, deferSubmit] = useTransition();
  const pending = waiting || submitting;
  const [identity, setIdentity] = useState({ name: "", email: "", phone: "", company: "" });
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [clientErrors, setClientErrors] = useState<FormErrors>();
  const originTime = useRef(startedAt);
  const errors = clientErrors ?? (state.status === "failure" ? state.errors : {});
  const summary = useRef<HTMLDivElement>(null);
  const showErrors = Object.keys(errors).length > 0;

  useEffect(() => {
    if (showErrors && !pending) summary.current?.focus();
  }, [clientErrors, pending, showErrors, state]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    data.set("referrer", document.referrer);
    if (Date.now() - originTime.current > 86_300_000) originTime.current = Date.now();
    data.set("startedAt", String(originTime.current));
    const { input, choices } = readLead(data, "contact", locale, `/${locale}/contact`);
    const invalid = { ...validateStep(1, input, choices), ...validateStep(3, input, choices), ...validateStep(4, input, choices) };
    if (Object.keys(invalid).length) {
      setClientErrors(invalid);
      return;
    }
    setClientErrors(undefined);
    deferSubmit(async () => {
      await waitForFormTime(data);
      startTransition(() => dispatch(data));
    });
  }

  if (state.status === "success") return <LeadReceipt id={state.id} kind="contact" locale={locale} />;

  return (
    <form method="post" encType="multipart/form-data" action={`/${locale}/contact/submit`} onSubmit={submit} noValidate className="contact-form" aria-busy={pending || undefined}>
      <input type="hidden" name="startedAt" value={startedAt} />
      <input type="hidden" name="utm" value={campaign} />
      <input type="hidden" name="referrer" value={initialReferrer} />
      <div hidden aria-hidden="true"><label htmlFor="contact-website">Website</label>
        <input name="website" id="contact-website" tabIndex={-1} autoComplete="off" /></div>
      {showErrors ? <div tabIndex={-1} ref={summary} role="alert" className="conversion-error">
        {error(errors.form?.[0]) ?? validation("reviewFields")}
      </div> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <IdentityFields locale={locale} values={identity} errors={errors} onField={(key, value) =>
          setIdentity((current) => ({ ...current, [key]: value }))} />
      </div>
      <Textarea id="lead-message" name="message" label={t("message")} placeholder={t("messagePlaceholder")}
        required maxLength={10000} dir="auto" rows={5} value={message} error={error(errors.message?.[0])}
        onChange={(event) => setMessage(event.target.value)} />
      <LeadConsent locale={locale} checked={consent} onChange={setConsent} error={error(errors.consent?.[0])} />
      <div className="conversion-form-actions">
        <ActionLink type="submit" variant="primary" loading={pending} arrow="right">
          {pending ? f("submitting") : errors.form ? c("tryAgain") : t("submit")}
        </ActionLink>
      </div>
    </form>
  );
}
