"use client";

import { AlertCircle, Check, CircleHelp } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  startTransition, useActionState, useEffect, useRef, useState, useSyncExternalStore, useTransition,
  type FormEvent, type ReactNode,
} from "react";
import { ActionLink } from "@/components/ui/ActionLink";
import { ArrowLeftIcon } from "@/components/ui/Icons";
import { Select, Textarea, TextInput } from "@/components/ui/Field";
import { ServiceIcon } from "@/components/sections/services/service-icons";
import type { AppLocale } from "@/i18n/routing";
import { sendPublicLead } from "./action";
import { formCopy } from "./copy";
import { IdentityFields, LeadConsent, LeadReceipt } from "./lead-ui";
import {
  budgetThresholds, channels, currencyCodes, features, readLead, regionCurrency, stepFields, timelines, unsureValue, validateStep,
  type Currency, type Draft, type FormErrors, type LeadState,
} from "./model";
import { QuoteFiles } from "./QuoteFiles";
import { useFormError } from "./use-form-messages";
import { waitForFormTime } from "./timing";
import "./conversion.css";

type ServiceChoice = { id: string; title: string; tagline: string; icon?: string | null };
type Props = {
  locale: AppLocale; services: ServiceChoice[]; countries: { value: string; label: string }[];
  preselected?: string; campaign: string; startedAt: number; initialReferrer: string; nativeResult?: LeadState;
};
const initialState: LeadState = { status: "idle" };
const subscribe = () => () => {};
const client = () => true;
const server = () => false;
const reviewStep = stepFields.length;
const lastEditableStep = reviewStep - 1;

function initialDraft(locale: AppLocale, preselected?: string): Draft {
  return {
    serviceIds: preselected ? [preselected] : [], message: "", goals: "", existing: "", features: [], otherFeatures: "",
    currency: locale === "ar" ? "SAR" : "USD", currencyManual: false, budget: "", timeline: "",
    name: "", email: "", phone: "", company: "", country: "", preferredContact: "", consent: false,
  };
}

function restoreDraft(key: string, base: Draft, services: ServiceChoice[], preselected?: string) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(key) ?? "null");
    if (!saved?.draft) return null;
    const draft = { ...base, ...saved.draft } as Draft;
    const allowed = new Set([unsureValue, ...services.map(({ id }) => id)]);
    if (!currencyCodes.includes(draft.currency)) draft.currency = base.currency;
    if (!Array.isArray(draft.features)) draft.features = [];
    const available = (Array.isArray(draft.serviceIds) ? draft.serviceIds : []).filter((id) => allowed.has(id));
    const newPreselection = preselected && preselected !== saved.preselected;
    draft.serviceIds = newPreselection ? [...new Set([...available.filter((id) => id !== unsureValue), preselected])] : available;
    const step = newPreselection || !draft.serviceIds.length ? 0 : Math.min(lastEditableStep, Math.max(0, Number(saved.step) || 0));
    const startedAt = typeof saved.startedAt === "number" && Date.now() - saved.startedAt < 86_300_000 && saved.startedAt <= Date.now() ? saved.startedAt : undefined;
    return { draft, step, startedAt, hadFiles: Boolean(saved.hadFiles), campaign: typeof saved.campaign === "string" ? saved.campaign : "",
      referrer: typeof saved.referrer === "string" ? saved.referrer : "" };
  } catch {
    return null;
  }
}

function languageCurrency(languages: readonly string[]) {
  for (const language of languages) {
    try {
      const region = new Intl.Locale(language).region;
      if (region && regionCurrency[region]) return regionCurrency[region];
    } catch {
      continue;
    }
  }
}

export function QuoteForm({ locale, services, countries, preselected, campaign, startedAt, initialReferrer, nativeResult }: Props) {
  const t = useTranslations("quote");
  const f = useTranslations("forms");
  const c = useTranslations("common");
  const contact = useTranslations("contact");
  const validation = useTranslations("forms.validation");
  const error = useFormError(locale, "quote");
  const enhanced = useSyncExternalStore(subscribe, client, server);
  const [result, dispatch, submitting] = useActionState(sendPublicLead.bind(null, "quote", locale), nativeResult ?? initialState);
  const [waiting, deferSubmit] = useTransition();
  const pending = waiting || submitting;
  const [draft, setDraft] = useState(() => initialDraft(locale, preselected));
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<FormErrors>(() => result.status === "failure" ? result.errors : {});
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [restored, setRestored] = useState(false);
  const [hadFiles, setHadFiles] = useState(false);
  const [attribution, setAttribution] = useState({ campaign, referrer: initialReferrer });
  const [originTime, setOriginTime] = useState(startedAt);
  const [handled, setHandled] = useState(result);
  const [failure, setFailure] = useState(result.status === "failure");
  const [focusRequest, setFocusRequest] = useState(0);
  const currentHeading = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  const key = `codelava:project-draft:v1:${locale}`;
  const stepTitles = [
    formCopy(locale, "servicesStep"), formCopy(locale, "detailsStep"), t("scopeStep"),
    t("contactStep"), formCopy(locale, "filesStep"), t("reviewStep"),
  ];
  const stepHeadings = [t("services"), ...stepTitles.slice(1, 5), t("review")];

  if (result !== handled) {
    setHandled(result);
    if (result.status === "failure") {
      const invalidStep = stepFields.findIndex((fields) => fields.some((field) => result.errors[field]));
      if (invalidStep >= 0) setStep(invalidStep);
      setErrors(result.errors);
      setFailure(true);
      setFocusRequest((request) => request + 1);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = restoreDraft(key, initialDraft(locale, preselected), services, preselected);
      if (saved) {
        setDraft(saved.draft);
        setStep(saved.step);
        setHadFiles(saved.hadFiles);
        if (saved.startedAt) setOriginTime(saved.startedAt);
      } else {
        const preferred = languageCurrency(navigator.languages);
        if (preferred) setDraft((current) => ({ ...current, currency: preferred }));
      }
      setAttribution({ campaign: campaign || saved?.campaign || "", referrer: saved?.referrer || document.referrer });
      if (!saved?.startedAt && Date.now() - startedAt > 86_300_000) setOriginTime(Date.now());
      setRestored(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [campaign, key, locale, preselected, services, startedAt]);

  useEffect(() => {
    if (!restored) return;
    try {
      if (result.status === "success") sessionStorage.removeItem(key);
      else sessionStorage.setItem(key, JSON.stringify({ draft, step, preselected, startedAt: originTime, hadFiles: hadFiles || files.length > 0, ...attribution }));
    } catch {
      // A blocked storage API must not prevent submission.
    }
  }, [attribution, draft, files.length, hadFiles, key, originTime, preselected, restored, result.status, step]);

  useEffect(() => {
    if (!focusRequest) return;
    (failure ? errorSummary.current : currentHeading.current)?.focus();
  }, [failure, focusRequest]);

  function field<K extends keyof Draft>(name: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [name]: value }));
  }

  function clearError(name: string) {
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function selectService(id: string, checked: boolean) {
    if (checked && id === unsureValue) field("serviceIds", [id]);
    else if (checked) field("serviceIds", [...draft.serviceIds.filter((value) => value !== unsureValue), id]);
    else field("serviceIds", draft.serviceIds.filter((value) => value !== id));
    clearError("serviceIds");
  }

  function move(destination: number) {
    setStep(destination);
    setErrors({});
    setFailure(false);
    setFocusRequest((request) => request + 1);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    const { input, choices } = readLead(data, "quote", locale, `/${locale}/quote`);
    const steps = step === reviewStep ? [0, 1, 2, 3, 4] : [step];
    const failed = steps.map((index) => ({ index, errors: validateStep(index, input, choices) }))
      .find((entry) => Object.keys(entry.errors).length);
    if (failed) {
      setStep(failed.index);
      setErrors(failed.errors);
      setFailure(true);
      setFocusRequest((request) => request + 1);
      return;
    }
    if (step < reviewStep) {
      move(step + 1);
      return;
    }
    data.delete("attachments");
    files.forEach((file) => data.append("attachments", file));
    if (!data.get("referrer")) data.set("referrer", document.referrer);
    setErrors({});
    setFailure(false);
    deferSubmit(async () => {
      await waitForFormTime(data);
      startTransition(() => dispatch(data));
    });
  }

  if (result.status === "success") return <LeadReceipt id={result.id} kind="quote" locale={locale} />;

  const optional = c("optional");
  const formError = error(errors.form?.[0]);
  const invalidDetails = error(errors.details?.[0]);
  const serviceError = errors.serviceIds?.[0] === "required" ? formCopy(locale, "serviceRequired") : error(errors.serviceIds?.[0]);
  const [low, mid, high] = budgetThresholds[draft.currency];
  const amount = (value: number) => new Intl.NumberFormat(locale).format(value);
  const budgets = [
    { value: `<${low}`, label: t("budgets.under", { max: amount(low) }) },
    { value: `${low}-${mid - 1}`, label: t("budgets.range", { min: amount(low), max: amount(mid - 1) }) },
    { value: `${mid}-${high - 1}`, label: t("budgets.range", { min: amount(mid), max: amount(high - 1) }) },
    { value: `${high}+`, label: t("budgets.over", { min: amount(high) }) },
    { value: "unsure", label: t("budgets.unsure") },
  ];

  function panel(index: number, body: ReactNode) {
    return <section key={index} className="quote-panel" aria-labelledby={`quote-step-${index}`}
      data-inactive={step !== index} hidden={enhanced && step !== index}>
      <h2 className="text-display-sm" tabIndex={-1} ref={step === index ? currentHeading : undefined}
        id={`quote-step-${index}`}>{stepHeadings[index]}</h2>
      {body}
    </section>;
  }

  const progressText = `${t("stepCount", { step: step + 1, total: stepTitles.length })} · ${stepTitles[step]}`;
  const serviceList = [...services, { id: unsureValue, title: t("unsure"), tagline: "" }];
  const reviewGroups: [number, ReactNode][] = [
    [0, serviceList.filter(({ id }) => draft.serviceIds.includes(id)).map(({ title }) => title).join(locale === "ar" ? "، " : ", ")],
    [1, <dl key="details" className="quote-review-values">
      <ReviewValue label={t("projectDescription")} value={draft.message} />
      <ReviewValue label={formCopy(locale, "goals")} value={draft.goals} />
      <ReviewValue label={formCopy(locale, "existing")} value={draft.existing} />
      <ReviewValue label={formCopy(locale, "features")} value={[
        ...features.filter((feature) => draft.features.includes(feature)).map((feature) => formCopy(locale, feature)), draft.otherFeatures,
      ].filter(Boolean).join(locale === "ar" ? "، " : ", ")} />
    </dl>],
    [2, <dl key="scope" className="quote-review-values">
      <ReviewValue label={t("budget")} value={draft.budget ? `${budgets.find(({ value }) => value === draft.budget)?.label ?? draft.budget} · ${t(`currencies.${draft.currency}`)}` : ""} />
      <ReviewValue label={t("timeline")} value={timelines.find((value) => value === draft.timeline) ? t(`timelines.${draft.timeline as (typeof timelines)[number]}`) : ""} />
    </dl>],
    [3, <dl key="identity" className="quote-review-values">
      <ReviewValue label={f("name")} value={draft.name} /><ReviewValue label={f("email")} value={draft.email} />
      <ReviewValue label={f("phone")} value={draft.phone} /><ReviewValue label={f("company")} value={draft.company} />
      <ReviewValue label={f("country")} value={countries.find(({ value }) => value === draft.country)?.label ?? ""} />
      <ReviewValue label={formCopy(locale, "preferredContact")} value={channels.find((value) => value === draft.preferredContact) ?
        contact(draft.preferredContact as (typeof channels)[number]) : ""} />
    </dl>],
    [4, <div key="files" className="grid gap-2">
      {files.length ? <ul>{files.map((file) => <li key={`${file.name}-${file.size}-${file.lastModified}`}><bdi>{file.name}</bdi></li>)}</ul> :
        <p>{formCopy(locale, "reviewEmpty")}</p>}
      <p className="flex items-start gap-2"><Check size={16} aria-hidden="true" className="mt-1 shrink-0 text-accent-text" />{f("consentLabel")}</p>
    </div>],
  ];

  const progressPercent = Math.round(((step + 1) / stepTitles.length) * 100);

  return (
    <form className="quote-form relative overflow-hidden rounded-[var(--radius-xl)] border border-line bg-surface p-5 shadow-card sm:p-8 lg:p-10" data-ready={enhanced && restored} method="post" encType="multipart/form-data" action={`/${locale}/quote/submit`} onSubmit={enhanced ? submit : undefined} noValidate={enhanced}
      aria-busy={pending || undefined}>
      <span aria-hidden="true" className="lava-seam-hairline pointer-events-none absolute inset-x-10 top-0 h-[2px] opacity-85" />
      <input type="hidden" name="startedAt" value={originTime} />
      <input type="hidden" name="utm" value={attribution.campaign} />
      <input type="hidden" name="referrer" value={attribution.referrer} />
      <div hidden aria-hidden="true"><label htmlFor="quote-website">Website</label>
        <input id="quote-website" name="website" tabIndex={-1} autoComplete="off" /></div>

      <nav className="quote-progress mb-8 border-b border-line pb-7 sm:mb-10 sm:pb-9" aria-label={t("progressLabel")}>
        <p className="sr-only" role="status" aria-live="polite">{progressText}</p>
        <div aria-hidden="true" className="mb-4 space-y-2.5 md:hidden">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold text-accent-text">{progressText}</span>
            <span dir="ltr" className="font-mono text-xs font-semibold text-faint tabular-nums">{progressPercent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-bg">
            <div
              className="h-full rounded-full transition-[width] duration-400 ease-[var(--ease-out-expo)]"
              style={{ width: `${progressPercent}%`, background: "var(--gradient-cta)" }}
            />
          </div>
        </div>
        <ol className="quote-steps">
          {stepTitles.map((title, index) => {
            const state = index < step ? "done" : index === step ? "current" : "todo";
            const dot = (
              <span className="quote-step-dot" aria-hidden="true">
                {state === "done" ? <Check size={15} strokeWidth={2.5} /> : new Intl.NumberFormat(locale).format(index + 1)}
              </span>
            );
            const label = (
              <span className="quote-step-label">
                {title}
                {state === "done" ? <span className="sr-only"> · {t("stepDone")}</span> : null}
              </span>
            );
            return (
              <li key={index} data-state={state} aria-current={index === step ? "step" : undefined}>
                {state === "done" && enhanced ? (
                  <button
                    type="button"
                    onClick={() => move(index)}
                    disabled={pending}
                    data-cursor="pointer"
                    aria-label={t("editStep", { step: title })}
                    className="quote-step-trigger"
                  >
                    {dot}
                    {label}
                  </button>
                ) : (
                  <>
                    {dot}
                    {label}
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="quote-workspace">
        {errors.form || failure || Object.keys(errors).length ? <div className="conversion-error" role="alert" tabIndex={-1} ref={errorSummary}>
          <AlertCircle size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-danger" />
          <div className="min-w-0 space-y-1">
            <p>{formError ?? validation("reviewFields")}</p>
            {!enhanced && Object.keys(errors).filter((fieldName) => !stepFields.some((fields) =>
              (fields as readonly string[]).includes(fieldName)) && fieldName !== "form").map((fieldName) =>
              <p key={fieldName}>{error(errors[fieldName]?.[0])}</p>)}
          </div>
        </div> : null}
        {panel(0, <>
          <p id="quote-service-help" className="text-sm text-muted">{t("servicesHelp")}</p>
          <fieldset aria-labelledby="quote-step-0" aria-describedby={serviceError ? "quote-service-error quote-service-help" : "quote-service-help"} className="quote-service-grid">
            {serviceList.map(({ id, title, tagline, icon }) => (
              <label key={id} className={id === unsureValue ? "quote-service quote-service--unsure" : "quote-service"}>
                <input type="checkbox" name="serviceIds" value={id} checked={draft.serviceIds.includes(id)}
                  onChange={(event) => selectService(id, event.target.checked)} className="peer sr-only" />
                <span className="quote-service-icon" aria-hidden="true">
                  {id === unsureValue ? <CircleHelp size={22} strokeWidth={1.65} /> : <ServiceIcon name={icon} size={22} />}
                </span>
                <span className="quote-service-tick" aria-hidden="true"><Check size={13} strokeWidth={2.6} /></span>
                <span className="quote-service-title">{title}</span>
                {tagline ? <span className="quote-service-tagline">{tagline}</span> : null}
              </label>
            ))}
          </fieldset>
          {serviceError ? <p id="quote-service-error" role="alert" className="text-sm font-medium text-danger">{serviceError}</p> : null}
        </>)}

        {panel(1, <div className="grid gap-5">
          <Textarea name="message" id="lead-message" label={t("projectDescription")} placeholder={t("projectPlaceholder")}
            hint={t("projectHelp")} required minLength={10} maxLength={10000} dir={draft.message ? "auto" : undefined} value={draft.message}
            onChange={(event) => field("message", event.target.value)} error={error(errors.message?.[0])} />
          <Textarea name="goals" label={formCopy(locale, "goals")} rows={2} maxLength={3000} dir={draft.goals ? "auto" : undefined} optionalLabel={optional}
            value={draft.goals} onChange={(event) => field("goals", event.target.value)} />
          <TextInput name="existing" label={formCopy(locale, "existing")} maxLength={2000} dir={draft.existing ? "auto" : undefined} optionalLabel={optional}
            value={draft.existing} onChange={(event) => field("existing", event.target.value)} />
          <fieldset className="quote-chips">
            <legend className="text-sm font-semibold text-text">{formCopy(locale, "features")}</legend>
            <div className="flex flex-wrap gap-2">
              {features.map((feature) => <label key={feature} className="quote-chip">
                <Check size={14} strokeWidth={2.4} aria-hidden="true" />
                <input type="checkbox" name="features" value={feature} checked={draft.features.includes(feature)} className="sr-only"
                  onChange={(event) => field("features", event.target.checked ? [...draft.features, feature] : draft.features.filter((value) => value !== feature))} />
                <span>{formCopy(locale, feature)}</span>
              </label>)}
            </div>
          </fieldset>
          <TextInput name="otherFeatures" label={formCopy(locale, "otherFeatures")} maxLength={3000} dir={draft.otherFeatures ? "auto" : undefined} optionalLabel={optional}
            value={draft.otherFeatures} onChange={(event) => field("otherFeatures", event.target.value)} error={invalidDetails} />
        </div>)}

        {panel(2, <div className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Select id="quote-currency" name="currency" label={t("currency")} value={draft.currency}
              options={currencyCodes.map((value) => ({ value, label: t(`currencies.${value}`) }))}
              onChange={(event) => setDraft((current) => ({ ...current, currency: event.target.value as Currency, currencyManual: true, budget: "" }))}
              error={error(errors.currency?.[0])} />
            {enhanced ? <Select name="budget" label={t("budget")} value={draft.budget} options={budgets} placeholder={f("selectOption")}
              onChange={(event) => field("budget", event.target.value)} error={error(errors.budget?.[0])} optionalLabel={optional} hint={t("budgetHelp")} /> :
              <TextInput name="budget" label={t("budget")} value={draft.budget} maxLength={48}
                onChange={(event) => field("budget", event.target.value)} error={error(errors.budget?.[0])} optionalLabel={optional} />}
          </div>
          <Select name="timeline" label={t("timeline")} value={draft.timeline} placeholder={f("selectOption")} optionalLabel={optional}
            options={timelines.map((value) => ({ value, label: t(`timelines.${value}`) }))}
            onChange={(event) => field("timeline", event.target.value)} error={error(errors.timeline?.[0])} hint={t("timelineHelp")} />
        </div>)}

        {panel(3, <div className="grid gap-5 sm:grid-cols-2">
          <IdentityFields locale={locale} errors={errors} values={draft} onField={field} quote
            phoneRequired={draft.preferredContact === "phone" || draft.preferredContact === "whatsapp"} />
          <Select name="country" autoComplete="country" label={f("country")} placeholder={f("countryPlaceholder")}
            value={draft.country} options={countries} error={error(errors.country?.[0])} optionalLabel={optional} onChange={(event) => {
              const country = event.target.value;
              setDraft((current) => {
                const currency = current.currencyManual || current.budget ? current.currency : regionCurrency[country] ?? current.currency;
                return { ...current, country, currency, budget: currency === current.currency ? current.budget : "" };
              });
            }} />
          <Select name="preferredContact" label={formCopy(locale, "preferredContact")} value={draft.preferredContact}
            options={channels.map((value) => ({ value, label: contact(value) }))} optionalLabel={optional} placeholder={f("selectOption")}
            onChange={(event) => field("preferredContact", event.target.value)} />
        </div>)}

        {panel(4, <div className="grid gap-6">
          {hadFiles ? <p className="text-sm text-accent-text">{formCopy(locale, "draftFiles")}</p> : null}
          <QuoteFiles files={files} enhanced={enhanced} error={error(errors.attachments?.[0] ?? fileErrors[0])} onChange={(next, rejected) => {
            setFiles(next);
            setFileErrors(rejected ?? []);
            setHadFiles(false);
            clearError("attachments");
          }} />
          <LeadConsent locale={locale} checked={draft.consent} onChange={(value) => field("consent", value)} error={error(errors.consent?.[0])} />
        </div>)}

        {enhanced && step === reviewStep ? panel(reviewStep, <div className="quote-review">
          {reviewGroups.map(([index, content]) => (
            <div key={index} className="quote-review-row">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <h3 className="flex items-center gap-2.5 font-display text-base font-semibold text-text">
                  <span
                    aria-hidden="true"
                    dir="ltr"
                    className="grid size-6 place-items-center rounded-full bg-accent-soft font-mono text-[11px] font-semibold text-accent-text tabular-nums"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{stepTitles[index]}</span>
                </h3>
                <ActionLink type="button" variant="text" size="sm" arrow="none" disabled={pending} onClick={() => move(index)}>
                  {t("editStep", { step: stepTitles[index] })}
                </ActionLink>
              </div>
              <div className="min-w-0 text-sm text-muted">{content || formCopy(locale, "reviewEmpty")}</div>
            </div>
          ))}
        </div>) : null}

        <div className="conversion-form-actions mt-8">
          {enhanced && step > 0 ? <ActionLink type="button" variant="secondary" arrow="none" onClick={() => move(step - 1)} disabled={pending}>
            <span className="inline-flex items-center gap-2"><ArrowLeftIcon size={16} />{c("back")}</span>
          </ActionLink> : null}
          {enhanced ? <ActionLink type="submit" variant="primary" arrow={step < reviewStep ? "right" : "none"}
            loading={pending} className="ms-auto" disabled={!restored}>
            {pending ? f("submitting") : step === reviewStep ? formError ? c("tryAgain") : t("submit")
              : step === lastEditableStep ? formCopy(locale, "reviewAction") : c("next")}
          </ActionLink> : <>
            <ActionLink type="button" variant="primary" arrow="right" disabled className="quote-prehydrate ms-auto">
              {c("next")}
            </ActionLink>
            <ActionLink type="submit" variant="primary" className="quote-native-action ms-auto">
              {formError ? c("tryAgain") : t("submit")}
            </ActionLink>
          </>}
        </div>
      </div>
    </form>
  );
}

function ReviewValue({ label, value }: { label: string; value: string }) {
  return value ? <div><dt>{label}</dt><dd dir="auto">{value}</dd></div> : null;
}
