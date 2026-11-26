"use client";

import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import { SortableList } from "./ui/sortable";
import { buttonClass, inputClass, primaryClass } from "./ui/styles";

export type MediaOption = { id: string; url: string; name: string; kind: string; folder: string };

export function MediaThumbnail({ asset, className = "h-12 w-16" }: { asset: MediaOption; className?: string }) {
  return <div className={`relative grid shrink-0 place-items-center overflow-hidden rounded bg-surface-2 ${className}`}>
    {asset.kind === "image" ? <Image src={asset.url} alt="" fill unoptimized className="object-cover" />
      : <span className="font-mono text-xs uppercase text-muted">{asset.kind}</span>}
  </div>;
}

export function MediaPicker({ label, assets, selected, onChange, multiple = false, reorderable = true, kind }: {
  label: string; assets: MediaOption[]; selected: string[]; onChange: (ids: string[]) => void;
  multiple?: boolean; reorderable?: boolean; kind?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [query, search] = useState("");
  const [folder, setFolder] = useState("");
  const available = assets.filter((asset) => !kind || asset.kind === kind);
  const folders = [...new Set(available.map((asset) => asset.folder))].sort();
  const matches = available.filter((asset) => (!folder || asset.folder === folder) && asset.name.toLowerCase().includes(query.toLowerCase().trim()));
  const byId = new Map(assets.map((asset) => [asset.id, asset]));
  const selectedItems = selected.map((id) => ({ id, label: byId.get(id)?.name ?? id }));

  function renderItem(id: string) {
    const asset = byId.get(id);
    return <div className="flex min-w-0 items-center gap-2 text-sm">
      {asset && <MediaThumbnail asset={asset} />}
      <span className="min-w-0 flex-1 truncate">{asset?.name ?? "Unavailable asset"}</span>
      <button className={buttonClass} type="button" onClick={() => onChange(selected.filter((item) => item !== id))}
        aria-label={`Remove ${asset?.name ?? "asset"}`}><X size={15} /></button>
    </div>;
  }

  return <div className="grid gap-2">
    {selected.length > 0 && (multiple && reorderable
      ? <SortableList items={selectedItems} onChange={onChange}>{(item) => renderItem(item.id)}</SortableList>
      : selected.map((id) => <div key={id}>{renderItem(id)}</div>))}
    <button type="button" className={`${buttonClass} justify-self-start`}
      onClick={() => { search(""); setFolder(""); ref.current?.showModal(); }}><ImagePlus size={16} aria-hidden /> Choose {label}</button>
    <dialog ref={ref} aria-labelledby={titleId}
      className="fixed inset-0 m-auto max-h-[85dvh] w-[min(46rem,calc(100%-2rem))] overflow-y-auto rounded-lg border border-line-strong bg-surface p-4 text-text shadow-2xl backdrop:bg-bg/80 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 id={titleId} className="font-display text-xl font-semibold">Choose {label}</h2>
        <button className={buttonClass} type="button" onClick={() => ref.current?.close()} aria-label="Close media picker"><X size={16} /></button>
      </div>
      <div className="my-4 grid gap-2 sm:grid-cols-[1fr_12rem]">
        <input className={inputClass} type="search" aria-label="Search assets" value={query} onChange={(event) => search(event.target.value)} />
        <select className={inputClass} aria-label="Asset folder" value={folder} onChange={(event) => setFolder(event.target.value)}>
          <option value="">All folders</option>{folders.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      {matches.length ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {matches.map((asset) => {
          const isSelected = selected.includes(asset.id);
          return <button key={asset.id} type="button" aria-pressed={isSelected} onClick={() => {
            onChange(multiple ? isSelected ? selected.filter((id) => id !== asset.id) : [...selected, asset.id] : [asset.id]);
            if (!multiple) ref.current?.close();
          }} className={`min-w-0 rounded-md border p-2 text-left text-sm ${isSelected ? "border-accent bg-surface-2" : "border-line hover:border-accent/60"}`}>
            <MediaThumbnail asset={asset} className="aspect-video w-full" /><span className="mt-1 block truncate">{asset.name}</span>
          </button>;
        })}
      </div> : <p className="text-sm text-muted">No matching assets. Add files in the media library.</p>}
      {multiple && <button type="button" className={`${primaryClass} mt-4`} onClick={() => ref.current?.close()}>Done ({selected.length})</button>}
    </dialog>
  </div>;
}
