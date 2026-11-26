"use client";

import { Check, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { Checkbox, TextInput } from "@/components/ui/Field";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { formCopy } from "./copy";
import { useFormError } from "./use-form-messages";
import type { FormErrors } from "./model";

export function LeadReceipt({ id, kind, locale }: { id: string; kind: "contact" | "quote"; locale: AppLocale }) {
  const t = useTranslations(kind);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);

  return (
    <section className="conversion-receipt" aria-labelledby="lead-receipt-title">
      <div className="conversion-seal" aria-hidden="true"><Check size={30} strokeWidth={2.2} /></div>
      <p className="kicker-rule">{formCopy(locale, "sealed")}</p>
      <h2 id="lead-receipt-title" tabIndex={-1} ref={heading} className="text-display-md">{t("successTitle")}</h2>
      <p className="text-muted text-pretty">{t("successDescription")}</p>
      <p className="mt-2 grid gap-1.5 rounded-[var(--radius-md)] border border-line bg-surface-2 px-4 py-3">
        <span className="text-xs font-semibold text-muted">{formCopy(locale, "reference")}</span>
        <bdi className="break-all font-mono text-xs text-text sm:text-sm">{id}</bdi>
      </p>
    </section>
  );
}

type IdentityProps = {
  locale: AppLocale;
  errors: FormErrors;
  values?: { name: string; email: string; phone: string; company: string };
  onField?: (key: "name" | "email" | "phone" | "company", value: string) => void;
  quote?: boolean;
  phoneRequired?: boolean;
};

export function IdentityFields({ locale, errors, values, onField, quote, phoneRequired }: IdentityProps) {
  const t = useTranslations("forms");
  const common = useTranslations("common");
  const error = useFormError(locale, quote ? "quote" : "contact");
  const optional = common("optional");
  return (
    <>
      <TextInput name="name" id="lead-name" label={t("name")} placeholder={t("namePlaceholder")}
        autoComplete="name" dir="auto" required maxLength={160} error={error(errors.name?.[0])}
        value={values?.name} onChange={onField && ((event) => onField("name", event.target.value))} />
      <TextInput name="email" id="lead-email" label={t("email")} placeholder={t("emailPlaceholder")}
        type="email" autoComplete="email" dir="ltr" className="text-start" required maxLength={254} error={error(errors.email?.[0])}
        value={values?.email} onChange={onField && ((event) => onField("email", event.target.value))} />
      {quote ? <>
        <TextInput name="phone" id="lead-phone" label={t("phone")} type="tel" autoComplete="tel" inputMode="tel"
          dir="ltr" className="text-start" required={phoneRequired} maxLength={40} hint={t("phoneHelp")}
          optionalLabel={optional} placeholder={t("phonePlaceholder")} error={error(errors.phone?.[0])}
          value={values?.phone} onChange={onField && ((event) => onField("phone", event.target.value))} />
        <TextInput name="company" id="lead-company" label={t("company")} placeholder={t("companyPlaceholder")}
          autoComplete="organization" dir="auto" maxLength={160} optionalLabel={optional} error={error(errors.company?.[0])}
          value={values?.company} onChange={onField && ((event) => onField("company", event.target.value))} />
      </> : null}
    </>
  );
}

export function LeadConsent({ locale, checked, onChange, error }: {
  locale: AppLocale; checked?: boolean; onChange?: (checked: boolean) => void; error?: string;
}) {
  const t = useTranslations("forms");
  return (
    <div className="grid gap-2">
      <Checkbox id="lead-consent" name="consent" required checked={checked}
        className="[&_label]:min-h-7" aria-invalid={error ? true : undefined}
        aria-describedby={error ? "lead-consent-error lead-privacy" : "lead-privacy"}
        label={t("consentLabel")} onChange={onChange && ((event) => onChange(event.target.checked))} />
      {error ? <p id="lead-consent-error" role="alert" className="ps-8 text-sm text-danger">{error}</p> : null}
      <Link id="lead-privacy" href="/privacy" target="_blank" rel="noopener"
        className="ms-8 inline-flex min-h-6 w-fit items-center gap-1 text-sm font-medium text-accent-text underline underline-offset-4">
        {formCopy(locale, "privacy")}<ChevronRight size={14} aria-hidden="true" className="rtl:rotate-180" />
      </Link>
    </div>
  );
}
