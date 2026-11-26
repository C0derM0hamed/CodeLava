"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveContent } from "@/server/content/actions";
import { slugify } from "@/server/content/fields";
import { ContentFields, initializeFields, objectValue, textValue, type FormField, type FormValues } from "./content-fields";
import { MediaPicker, type MediaOption } from "./media-picker";
import { useToast } from "./ui/feedback";
import { Label, Panel } from "./ui/frame";
import { buttonClass, inputClass, paneClass, primaryClass } from "./ui/styles";

export type GalleryItem = { mediaId: string; role: string; caption: { en: string; ar: string } | null };

export function ContentEditor({ entity, id, titleKey, fields, record, assets, initialGallery, sectionLabels, canWrite, canPublish, fixedKey }: {
  entity: string; id: string | null; titleKey: string; fields: FormField[]; record: FormValues; assets: MediaOption[];
  initialGallery?: GalleryItem[]; sectionLabels?: Record<string, string>; canWrite: boolean; canPublish: boolean; fixedKey?: string;
}) {
  const [values, setValues] = useState(() => initializeFields(fields, record));
  const [gallery, setGallery] = useState(initialGallery ?? []);
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const title = values[titleKey];
  const slug = slugify(textValue(title) || textValue(objectValue(title).en) || textValue(objectValue(title).ar));
  const ready = canWrite && !pending;
  const hasDraft = entity === "page_sections" && values.draftContent !== null;
  const canQuickPublish = canPublish && (entity === "page_sections" ? hasDraft : values.status && record.status !== "published");

  async function submit(publish: boolean) {
    if (!ready) return;
    const update = { ...values, gallery };
    if (publish) Object.assign(update, entity === "page_sections"
      ? { content: { ...objectValue(values.content), ...objectValue(values.draftContent) }, draftContent: null }
      : { status: "published" });
    setPending(true);
    try {
      const result = await saveContent(entity, id, update);
      toast(result.ok ? publish ? "Published." : "Saved." : result.error, !result.ok);
      if (result.ok) {
        setValues({ ...update, slug: values.slug || slug });
        if (result.id && result.id !== id) router.push(`/admin/content/${entity}/${encodeURIComponent(result.id)}`);
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  return <form className="grid gap-5" onSubmit={(event) => { event.preventDefault(); void submit(false); }}>
    <fieldset disabled={!ready} className={`${paneClass} min-w-0`}>
      <ContentFields fields={fields.filter((field) => !fixedKey || field.key !== fixedKey)} values={values} assets={assets}
        change={(key, value) => setValues({ ...values, [key]: value })} placeholder={slug} sectionLabels={sectionLabels} />
    </fieldset>
    {entity === "projects" && <Panel title="Gallery and mockups">
      <fieldset className="grid gap-3" disabled={!ready}>
        <MediaPicker label="gallery images" assets={assets} kind="image" multiple selected={gallery.map((item) => item.mediaId)}
          onChange={(ids) => setGallery(ids.map((mediaId) => gallery.find((item) => item.mediaId === mediaId) ?? { mediaId, caption: { en: "", ar: "" }, role: "gallery" }))} />
        {gallery.map((item) => <div key={item.mediaId} className="grid gap-3 rounded-md border border-line p-3 sm:grid-cols-3">
          <Label title={`Role for ${assets.find((asset) => asset.id === item.mediaId)?.name ?? "image"}`}>
            <select className={inputClass} value={item.role} onChange={(event) => setGallery(gallery.map((asset) =>
              asset.mediaId === item.mediaId ? { ...item, role: event.target.value } : asset))}>
              <option value="gallery">Gallery</option><option value="mockup">Mockup</option><option value="screenshot">Screenshot</option>
            </select>
          </Label>
          {(["en", "ar"] as const).map((locale) => <Label key={locale} title={`Caption — ${locale === "en" ? "English" : "Arabic"}`}>
            <input className={inputClass} lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} value={item.caption?.[locale] ?? ""}
              onChange={(event) => setGallery(gallery.map((asset) => asset.mediaId === item.mediaId
                ? { ...item, caption: { en: "", ar: "", ...item.caption, [locale]: event.target.value } } : asset))} />
          </Label>)}
        </div>)}
      </fieldset>
    </Panel>}
    {canWrite && <div className="sticky bottom-0 z-10 flex gap-2 border-t border-line bg-bg/95 py-3">
      <button className={primaryClass} disabled={!ready}>{pending ? "Saving…" : "Save changes"}</button>
      {Boolean(canQuickPublish) && <button className={buttonClass} type="button" disabled={!ready} onClick={() => void submit(true)}>
        {entity === "page_sections" ? "Publish draft" : "Publish"}
      </button>}
    </div>}
  </form>;
}
