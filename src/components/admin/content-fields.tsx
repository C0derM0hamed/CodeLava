"use client";

import { useId, useState } from "react";
import { renderMarkdown } from "@/lib/markdown";
import type { Field, Option } from "@/server/content/fields";
import { MediaPicker, type MediaOption } from "./media-picker";
import { Label } from "./ui/frame";
import { buttonClass, inputClass } from "./ui/styles";

export type FormField = Omit<Field, "schema" | "fields"> & { fields?: FormField[]; choices?: Option[] };
export type FormValues = Record<string, unknown>;
export const objectValue = (value: unknown): FormValues =>
  value && typeof value === "object" && !Array.isArray(value) ? value as FormValues : {};
export const textValue = (value: unknown) => typeof value === "string" ? value : "";
export const arrayValue = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const lines = (value: unknown) => arrayValue(value).map(String).join("\n");
const splitLines = (value: string) => value.split("\n").map((line) => line.trim()).filter(Boolean);

export function defaultValue(field: FormField): unknown {
  switch (field.type) {
    case "localized": case "markdown": return { en: "", ar: "" };
    case "localizedLines": return { en: [], ar: [] };
    case "boolean": return field.key === "visible";
    case "select": return field.relation ? null : field.choices?.[0]?.value ?? "";
    case "lines": case "multi": case "repeat": return [];
    case "group": return initializeFields(field.fields ?? [], {});
    case "section": return field.key === "draftContent" ? null : {};
    default: return field.key === "category" ? "general" : null;
  }
}

export function initializeFields(fields: FormField[], record: FormValues): FormValues {
  return Object.fromEntries(fields.map((field) => {
    const value = record[field.key];
    if (field.type === "date" && value instanceof Date) return [field.key, value.toISOString().slice(0, 10)];
    if (field.type === "group") return [field.key, initializeFields(field.fields ?? [], objectValue(value))];
    if (field.type === "repeat") return [field.key, arrayValue(value).map((item) => initializeFields(field.fields ?? [], objectValue(item)))];
    if (field.type === "localized" || field.type === "markdown") {
      const copy = objectValue(value);
      return [field.key, { en: typeof value === "string" ? value : textValue(copy.en), ar: textValue(copy.ar) }];
    }
    if (field.type === "localizedLines") {
      const copy = objectValue(value);
      return [field.key, { en: arrayValue(copy.en), ar: arrayValue(copy.ar) }];
    }
    return [field.key, value === "" && field.type === "text" ? defaultValue(field) : value ?? defaultValue(field)];
  }));
}

export function ContentFields({ fields, values, assets, change, placeholder, sectionLabels }: {
  fields: FormField[]; values: FormValues; assets: MediaOption[]; change: (key: string, value: unknown) => void;
  placeholder?: string; sectionLabels?: Record<string, string>;
}) {
  return <div className="grid gap-x-4 gap-y-5 md:grid-cols-2">
    {fields.map((field) => <div key={field.key} className={`min-w-0 ${["localized", "markdown", "localizedLines", "group", "repeat", "section"].includes(field.type) ? "md:col-span-2" : ""}`}>
      <FieldControl field={field} value={values[field.key]} change={(value) => change(field.key, value)} assets={assets}
        placeholder={field.key === "slug" ? placeholder : undefined} sectionLabels={sectionLabels} />
    </div>)}
  </div>;
}

function FieldControl({ field, value, change, assets, placeholder, sectionLabels }: {
  field: FormField; value: unknown; change: (value: unknown) => void; assets: MediaOption[];
  placeholder?: string; sectionLabels?: Record<string, string>;
}) {
  switch (field.type) {
    case "localized": case "markdown": case "localizedLines":
      return <Bilingual field={field} value={objectValue(value)} change={change} />;
    case "boolean":
      return <label className="flex min-h-10 items-center gap-2 text-sm font-medium">
        <input type="checkbox" className="size-4 accent-accent" checked={Boolean(value)} onChange={(event) => change(event.target.checked)} />{field.label}
      </label>;
    case "media":
      return <MediaPicker label={field.label.toLowerCase()} assets={assets} kind={field.mediaKind}
        selected={typeof value === "string" ? [value] : []} onChange={(ids) => change(ids[0] ?? null)} />;
    case "select":
      return <Label title={field.label}><select className={inputClass} value={textValue(value)} onChange={(event) => change(event.target.value || null)}>
        {field.relation && <option value="">None</option>}
        {(field.choices ?? []).map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
      </select></Label>;
    case "multi":
      return <fieldset className="min-w-0 rounded-md border border-line p-2">
        <legend className="px-1 text-sm font-medium">{field.label}</legend>
        <div className="max-h-40 overflow-y-auto">
          {(field.choices ?? []).map(({ value: id, label }) => <label key={id} className="flex items-center gap-2 p-1 text-sm">
            <input type="checkbox" checked={arrayValue(value).includes(id)} className="size-4 accent-accent"
              onChange={(event) => change(event.target.checked ? [...arrayValue(value), id] : arrayValue(value).filter((item) => item !== id))} />{label}
          </label>)}
          {!field.choices?.length && <p className="text-sm text-muted">No records available.</p>}
        </div>
      </fieldset>;
    case "group":
      return <fieldset className="rounded-lg border border-line p-3 sm:p-4">
        <legend className="px-2 font-display text-lg">{field.label}</legend>
        <ContentFields fields={field.fields ?? []} assets={assets} values={objectValue(value)} change={(key, item) => change({ ...objectValue(value), [key]: item })} />
      </fieldset>;
    case "repeat":
      return <RepeatFields field={field} value={arrayValue(value)} assets={assets} change={change} />;
    case "section":
      return <SectionFields field={field} value={value} change={change} labels={sectionLabels} />;
    case "lines":
      return <Label title={field.label}><Lines value={value} change={change} /></Label>;
    default:
      return <Label title={field.label}><input className={inputClass} placeholder={placeholder}
        dir={field.key === "ar" ? "rtl" : undefined} lang={field.key === "ar" ? "ar" : undefined}
        type={field.type === "number" || field.type === "date" ? field.type : "text"}
        step={field.type === "number" ? "any" : undefined} value={field.type === "number" ? Number.isFinite(value) ? String(value) : "" : textValue(value)}
        onChange={(event) => { const next = event.target.value; change(next ? field.type === "number" ? Number(next) : next : null); }} /></Label>;
  }
}

function Lines({ value, change, dir }: { value: unknown; change: (value: string[]) => void; dir?: "rtl" }) {
  const [text, setText] = useState(lines(value));
  return <textarea className={inputClass} dir={dir} value={text} rows={4} placeholder="One item per line"
    onChange={(event) => { setText(event.target.value); change(splitLines(event.target.value)); }} />;
}

function Bilingual({ field, value, change }: { field: FormField; value: FormValues; change: (next: FormValues) => void }) {
  const id = useId();
  return <fieldset className="min-w-0">
    <legend className="mb-1 text-sm font-medium">{field.label}</legend>
    <div className="grid gap-3 sm:grid-cols-2">
      {(["en", "ar"] as const).map((locale) => {
        const language = locale === "en" ? "English" : "Arabic";
        const axes = { lang: locale, dir: locale === "ar" ? "rtl" as const : "ltr" as const };
        const label = `${field.label} — ${language}`;
        const content = textValue(value[locale]);
        const onChange = (next: string | string[]) => change({ ...value, [locale]: next });
        const fieldId = `${id}-${locale}`;
        return <div key={locale} className="grid min-w-0 content-start gap-1.5">
          <label htmlFor={field.type === "localizedLines" ? undefined : fieldId} className="text-xs font-medium text-muted">{language}
            {field.type === "localizedLines" && <Lines value={value[locale]} dir={locale === "ar" ? "rtl" : undefined} change={onChange} />}
          </label>
          {field.type === "localized" && <textarea id={fieldId} aria-label={label} className={inputClass} rows={2} {...axes}
            value={content} onChange={(event) => onChange(event.target.value)} />}
          {field.type === "markdown" && <MarkdownInput id={fieldId} label={label} value={content} change={onChange} {...axes} />}
        </div>;
      })}
    </div>
  </fieldset>;
}

function MarkdownInput({ id, label, value, change, lang, dir }: {
  id: string; label: string; value: string; change: (value: string) => void; lang: string; dir: "ltr" | "rtl";
}) {
  const [preview, setPreview] = useState(false);
  return <div className="grid gap-2">
    <textarea id={id} aria-label={label} className={`${inputClass} font-mono`} lang={lang} dir={dir} rows={7}
      value={value} onChange={(event) => change(event.target.value)} />
    <button type="button" className={`${buttonClass} justify-self-start`} aria-expanded={preview} onClick={() => setPreview(!preview)}>
      {preview ? "Hide" : "Show"} Markdown preview
    </button>
    {preview && <div lang={lang} dir={dir} className="min-h-12 overflow-auto rounded border border-line bg-bg p-3 text-sm [&_a]:text-accent-text [&_h1]:text-xl [&_h2]:text-lg [&_li]:ms-5 [&_li]:list-disc [&_p]:mb-2"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(value).html }} />}
  </div>;
}

function RepeatFields({ field, value, assets, change }: { field: FormField; value: unknown[]; assets: MediaOption[]; change: (value: unknown) => void }) {
  return <fieldset className="grid gap-3 rounded-lg border border-line p-3">
    <legend className="px-2 font-display text-lg">{field.label}</legend>
    {value.map((item, index) => {
      const record = objectValue(item);
      return <div key={index} className="grid gap-2 rounded border border-line p-3">
        <ContentFields fields={field.fields ?? []} values={record} assets={assets} change={(key, next) =>
          change(value.map((current, at) => at === index ? { ...record, [key]: next } : current))} />
        <button className={`${buttonClass} justify-self-start`} type="button" onClick={() => change(value.filter((_, at) => at !== index))}>Remove item {index + 1}</button>
      </div>;
    })}
    <button className={`${buttonClass} justify-self-start`} type="button" onClick={() => change([...value, initializeFields(field.fields ?? [], {})])}>Add item to {field.label.toLowerCase()}</button>
  </fieldset>;
}

function SectionFields({ field, value, change, labels = {} }: {
  field: FormField; value: unknown; change: (next: unknown) => void; labels?: Record<string, string>;
}) {
  const [newKey, setNewKey] = useState("");
  const record = objectValue(value);
  const keys = [...new Set([...Object.keys(labels), ...Object.keys(record)])];
  if (value === null) return <button className={buttonClass} type="button" onClick={() => change({})}>Start draft</button>;
  return <fieldset className="grid gap-3 rounded-lg border border-line p-3">
    <legend className="px-2 font-display text-lg">{field.label}</legend>
    {keys.map((key) => {
      const current = record[key];
      const copy = objectValue(current);
      const isCopy = current === undefined || "en" in copy || "ar" in copy;
      const label = labels[key] || key;
      return <div className="grid gap-2 border-b border-line pb-3" key={key}>
        {isCopy ? <Bilingual field={{ key, label, type: "localized" }} value={copy} change={(next) => change({ ...record, [key]: { en: "", ar: "", ...next } })} />
          : <JsonValue label={label} value={current} change={(next) => change({ ...record, [key]: next })} />}
        {Object.hasOwn(record, key) && <button className={`${buttonClass} justify-self-start`} type="button" onClick={() => {
          const next = { ...record };
          delete next[key];
          change(next);
        }}>Remove {label}</button>}
      </div>;
    })}
    {!Object.keys(labels).length && <div className="flex flex-wrap items-end gap-2">
      <Label title="New field key"><input className={inputClass} value={newKey} onChange={(event) => setNewKey(event.target.value)} /></Label>
      <button className={buttonClass} type="button" disabled={!/^[\w.-]{1,150}$/.test(newKey) || Object.hasOwn(record, newKey)} onClick={() => {
        change({ ...record, [newKey]: { en: "", ar: "" } });
        setNewKey("");
      }}>Add localized field</button>
    </div>}
    {field.key === "draftContent" && <button type="button" className={`${buttonClass} justify-self-start`} onClick={() => change(null)}>Discard draft</button>}
  </fieldset>;
}

function JsonValue({ label, value, change }: { label: string; value: unknown; change: (next: unknown) => void }) {
  const [input, setInput] = useState(JSON.stringify(value));
  const [invalid, setInvalid] = useState(false);
  return <Label title={label}><input className={inputClass} value={input} aria-invalid={invalid} onChange={(event) => {
    const text = event.target.value;
    setInput(text);
    try {
      change(JSON.parse(text) as unknown);
      setInvalid(false);
    } catch {
      setInvalid(true);
    }
  }} />{invalid && <span className="text-danger">Enter valid JSON. The last valid value is retained.</span>}</Label>;
}
