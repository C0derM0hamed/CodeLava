"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveSettings } from "@/server/content/settings-action";
import { ContentFields, initializeFields, objectValue, type FormField } from "./content-fields";
import type { MediaOption } from "./media-picker";
import { useToast } from "./ui/feedback";
import { Label, Panel } from "./ui/frame";
import { buttonClass, inputClass, primaryClass } from "./ui/styles";

type SettingsKey = "contact" | "socials" | "seo";

export function SettingsEditor({ fields, initial, assets }: {
  fields: Record<SettingsKey, FormField[]>; initial: Record<string, unknown>; assets: MediaOption[];
}) {
  const sections = [
    { key: "contact", title: "Contact details" },
    { key: "socials", title: "Social links" },
    { key: "seo", title: "Default search and sharing" },
  ] as const;
  const [values, setValues] = useState(() => ({
    contact: initializeFields(fields.contact, { ...objectValue(initial.contact),
      mapUrl: objectValue(initial.contact).mapUrl ?? objectValue(initial.contact).map }),
    socials: initializeFields(fields.socials, objectValue(initial.socials)),
    seo: initializeFields(fields.seo, objectValue(initial.seo)),
    features: objectValue(initial.features),
  }));
  const [pending, setPending] = useState(false);
  const [name, setName] = useState("");
  const toast = useToast();
  const router = useRouter();

  return <form onSubmit={async (event) => {
    event.preventDefault();
    setPending(true);
    try {
      const result = await saveSettings(values);
      toast(result.ok ? "Settings saved." : result.error, !result.ok);
      if (result.ok) router.refresh();
    } finally { setPending(false); }
  }} className="grid gap-4">
    <fieldset disabled={pending} className="grid min-w-0 gap-4">
      {sections.map(({ key, title }) => <Panel key={key} title={title}><ContentFields fields={fields[key]} assets={assets}
        values={values[key]} change={(field, value) => setValues({ ...values, [key]: { ...values[key], [field]: value } })} /></Panel>)}
      <Panel title="Feature flags">
        <div className="mb-3 grid gap-2">
          {Object.entries(values.features).map(([key, value]) => <div className="flex items-center gap-3" key={key}>
            <label className="flex flex-1 items-center gap-2 font-mono text-xs">
              <input type="checkbox" className="size-4 accent-accent" checked={Boolean(value)} onChange={(event) =>
                setValues({ ...values, features: { ...values.features, [key]: event.target.checked } })} />{key}
            </label>
            <button type="button" className={buttonClass} onClick={() => {
              const features = { ...values.features };
              delete features[key];
              setValues({ ...values, features });
            }}>Remove</button>
          </div>)}
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <Label title="Flag key"><input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} /></Label>
          <button type="button" className={buttonClass} disabled={!/^[a-z][a-z0-9_.-]{0,63}$/.test(name) || Object.hasOwn(values.features, name)} onClick={() => {
            setValues({ ...values, features: { ...values.features, [name]: false } });
            setName("");
          }}>Add flag</button>
        </div>
      </Panel>
    </fieldset>
    <button className={`${primaryClass} justify-self-start`} disabled={pending}>{pending ? "Saving…" : "Save settings"}</button>
  </form>;
}
