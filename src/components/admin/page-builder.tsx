"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { savePageCopy, savePageLayout } from "@/server/content/page-builder-actions";
import type { PageLayout } from "@/server/content/page-builder";
import { ContentFields, type FormField, type FormValues } from "./content-fields";
import { useToast } from "./ui/feedback";
import { Badge } from "./ui/frame";
import { SortableList } from "./ui/sortable";
import { buttonClass, linkClass, paneClass, primaryClass } from "./ui/styles";

type Section = { key: string; label: string; draft: boolean; liveVisible: boolean };

export function PageBuilder({ page, sections, initial, version, canWrite, canPublish, hasLayoutDraft, previews }: {
  page: string; sections: Section[]; initial: PageLayout; version: string; canWrite: boolean;
  canPublish: boolean; hasLayoutDraft: boolean; previews: ReactNode;
}) {
  const [layout, setLayout] = useState(initial);
  const [pending, setPending] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const edited = JSON.stringify(layout) !== JSON.stringify(initial);
  const canEditLayout = canWrite && page === "home";
  const hasCopyDraft = sections.some(({ draft }) => draft);
  const byKey = new Map(sections.map((section) => [section.key, section]));
  const byLayoutKey = new Map(layout.map((item) => [item.key, item]));

  async function save(publish: boolean) {
    setPending(true);
    try {
      const result = await savePageLayout({ page, version, layout, publish });
      if (result.ok) {
        toast(publish ? "Page published." : "Layout draft saved.");
        router.refresh();
      } else {
        toast(result.error, true);
      }
    } catch {
      toast("The request could not be completed. Try again.", true);
    } finally {
      setPending(false);
    }
  }

  function renderItem(id: string) {
    const { label, draft, liveVisible } = byKey.get(id)!;
    const { visible } = byLayoutKey.get(id)!;
    return <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 px-1">
      <div className="min-w-0">
        <Link className="block wrap-anywhere text-sm font-semibold underline-offset-4 hover:underline"
          href={`/admin/pages/${page}/${encodeURIComponent(id)}`}>{label}</Link>
        <div className="mt-1 flex flex-wrap gap-1.5">
          <Badge>{liveVisible ? "Visible" : "Hidden"}</Badge>
          {draft && <Badge>Copy draft</Badge>}
          {visible !== liveVisible && <Badge>{visible ? "Show on publish" : "Hide on publish"}</Badge>}
        </div>
      </div>
      {canEditLayout && <label className="flex min-h-10 items-center gap-2 text-xs font-medium text-muted">
        <input type="checkbox" aria-label={`Show ${label}`} className="size-4 accent-accent" disabled={pending} checked={visible}
          onChange={(event) => setLayout((items) => items.map((item) => item.key === id ? { ...item, visible: event.target.checked } : item))} />
        Show
      </label>}
    </div>;
  }

  return <div className="grid gap-4">
    <section aria-label="Page layout" className={paneClass}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">{page === "home" ? "Section order" : "Page copy"}</h2>
        {hasLayoutDraft && <Badge>Layout draft</Badge>}
      </div>
      {canEditLayout
        ? <SortableList items={layout.map(({ key }) => ({ id: key, label: byKey.get(key)!.label }))} disabled={pending}
          onChange={(ids) => setLayout(ids.map((id) => byLayoutKey.get(id)!))}>
          {({ id }) => renderItem(id)}
        </SortableList>
        : <ol className="divide-y divide-line">{layout.map(({ key }) => <li className="py-2" key={key}>{renderItem(key)}</li>)}</ol>}
    </section>
    <div className="flex flex-wrap items-center gap-2" aria-busy={pending}>
      {canPublish && <button className={primaryClass} type="button" disabled={pending || (!edited && !hasLayoutDraft && !hasCopyDraft)}
        onClick={() => void save(true)}>Publish page</button>}
      {canEditLayout && <button className={buttonClass} type="button" disabled={pending || !edited}
        onClick={() => void save(false)}>Save layout draft</button>}
      {edited || pending ? <span className="text-sm text-muted" role="status">Save the layout draft to preview these changes.</span> : previews}
    </div>
  </div>;
}

export function PageCopyEditor({ page, section, version, fields, initial, canWrite, previews }: {
  page: string; section: string; version: string; fields: FormField[]; initial: FormValues; canWrite: boolean; previews: ReactNode;
}) {
  const [copy, setCopy] = useState(initial);
  const [pending, setPending] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const edited = JSON.stringify(copy) !== JSON.stringify(initial);

  async function save() {
    setPending(true);
    try {
      const result = await savePageCopy({ page, section, version, copy });
      if (result.ok) {
        toast("Copy draft saved.");
        router.refresh();
      } else {
        toast(result.error, true);
      }
    } catch {
      toast("The request could not be completed. Try again.", true);
    } finally {
      setPending(false);
    }
  }

  return <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); if (edited && !pending) void save(); }}>
    <fieldset disabled={!canWrite || pending} className={`${paneClass} min-w-0`}>
      <ContentFields fields={fields} values={copy} assets={[]} change={(key, value) => setCopy((current) => ({ ...current, [key]: value }))} />
    </fieldset>
    <div className="flex flex-wrap items-center gap-2">
      {canWrite && <button className={primaryClass} disabled={pending || !edited}>Save copy draft</button>}
      {!edited && !pending && previews}
      <Link href={`/admin/pages/${page}`} className={linkClass}>Back to page builder</Link>
    </div>
  </form>;
}
