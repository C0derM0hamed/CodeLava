"use client";

import { Check, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { ActionLink } from "@/components/ui/ActionLink";
import { Checkbox, TextInput } from "@/components/ui/Field";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { formCopy } from "./copy";
import { useFormError } from "./use-form-messages";
import type { FormErrors } from "./model";

export function LeadReceipt({ id, kind, locale }: { id: string; kind: "contact" | "quote"; locale: AppLocale }) {
  const t = useTranslations(kind);
  const tn = useTranslations("notFound");
  const th = useTranslations("home");
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);

  return (
    <section className="conversion-receipt" aria-labelledby="lead-receipt-title">
      <span aria-hidden="true" className="lava-seam-hairline pointer-events-none absolute inset-x-8 top-0 h-[2px] opacity-85" />
      <div className="conversion-seal" aria-hidden="true"><Check size={30} strokeWidth={2.2} /></div>
      <p className="kicker-rule">{formCopy(locale, "sealed")}</p>
      <h2 id="lead-receipt-title" tabIndex={-1} ref={heading} className="text-display-md">{t("successTitle")}</h2>
      <p className="text-body text-muted text-pretty">{t("successDescription")}</p>
      <p className="mt-1 grid gap-1.5 rounded-[var(--radius-md)] border border-line-strong/80 bg-surface-2 px-4 py-3 shadow-[var(--shadow-xs)]">
        <span className="text-xs font-semibold text-muted">{formCopy(locale, "reference")}</span>
        <bdi dir="ltr" className="break-all font-mono text-xs font-semibold text-text sm:text-sm">{id}</bdi>
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3 pt-2">
        <ActionLink href="/" variant="primary" size="sm">{tn("home")}</ActionLink>
        <ActionLink href="/work" variant="secondary" size="sm" arrow="none">{th("exploreWork")}</ActionLink>
      </div>
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
  const ltrAlign = locale === "ar" ? "text-right" : "text-left";
  return (
    <>
      <TextInput name="name" id="lead-name" label={t("name")} placeholder={t("namePlaceholder")}
        autoComplete="name" dir={values?.name ? "auto" : undefined} required maxLength={160} error={error(errors.name?.[0])}
        value={values?.name} onChange={onField && ((event) => onField("name", event.target.value))} />
      <TextInput name="email" id="lead-email" label={t("email")} placeholder={t("emailPlaceholder")}
        type="email" autoComplete="email" dir="ltr" className={ltrAlign} required maxLength={254} error={error(errors.email?.[0])}
        value={values?.email} onChange={onField && ((event) => onField("email", event.target.value))} />
      {quote ? <>
        <TextInput name="phone" id="lead-phone" label={t("phone")} type="tel" autoComplete="tel" inputMode="tel"
          dir="ltr" className={ltrAlign} required={phoneRequired} maxLength={40} hint={t("phoneHelp")}
          optionalLabel={optional} placeholder={t("phonePlaceholder")} error={error(errors.phone?.[0])}
          value={values?.phone} onChange={onField && ((event) => onField("phone", event.target.value))} />
        <TextInput name="company" id="lead-company" label={t("company")} placeholder={t("companyPlaceholder")}
          autoComplete="organization" dir={values?.company ? "auto" : undefined} maxLength={160} optionalLabel={optional} error={error(errors.company?.[0])}
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
    <div
      className={
        error
          ? "grid gap-2.5 rounded-[var(--radius-md)] border border-danger/40 bg-[color-mix(in_oklab,var(--danger)_4%,var(--surface))] p-4 transition-colors"
          : checked
            ? "grid gap-2.5 rounded-[var(--radius-md)] border border-line-lava bg-accent-soft/45 p-4 transition-colors"
            : "grid gap-2.5 rounded-[var(--radius-md)] border border-line bg-bg/60 p-4 transition-colors hover:border-line-strong"
      }
    >
      <Checkbox id="lead-consent" name="consent" required checked={checked}
        className="[&_label]:min-h-7" aria-invalid={error ? true : undefined}
        aria-describedby={error ? "lead-consent-error lead-privacy" : "lead-privacy"}
        label={t("consentLabel")} onChange={onChange && ((event) => onChange(event.target.checked))} />
      {error ? <p id="lead-consent-error" role="alert" className="ps-8 text-sm font-medium text-danger">{error}</p> : null}
      <Link id="lead-privacy" href="/privacy" target="_blank" rel="noopener"
        className="ms-8 inline-flex min-h-6 w-fit items-center gap-1 text-sm font-semibold text-accent-text underline decoration-line-lava underline-offset-4 transition-colors hover:decoration-accent">
        {formCopy(locale, "privacy")}<ChevronRight size={14} aria-hidden="true" className="rtl:rotate-180" />
      </Link>
    </div>
  );
}
