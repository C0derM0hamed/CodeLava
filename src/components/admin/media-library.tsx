"use client";

import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { deleteMedia, updateMedia } from "@/server/storage/admin";
import { MediaThumbnail, type MediaOption } from "./media-picker";
import { useToast } from "./ui/feedback";
import { Empty, Label } from "./ui/frame";
import { DeleteButton, MutationForm } from "./ui/mutation-form";
import { buttonClass, inputClass, paneClass } from "./ui/styles";

type Asset = MediaOption & { alt: { en: string; ar: string }; width: number | null; height: number | null; size: number };
type UploadJob = { id: string; name: string; progress: number; error?: string };

function uploadFile(file: File, folder: string, onProgress: (progress: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", "/api/admin/media");
    request.responseType = "json";
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.min(99, Math.round(event.loaded / event.total * 100)));
    };
    request.onerror = () => reject(new Error("Connection interrupted."));
    request.onload = () => request.status === 201 ? resolve() : reject(new Error(request.response?.error ?? "Upload failed."));
    const data = new FormData();
    data.set("file", file);
    data.set("folder", folder);
    request.send(data);
  });
}

export function MediaLibrary({ assets, canWrite, canDelete }: { assets: Asset[]; canWrite: boolean; canDelete: boolean }) {
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("");
  const [target, setTarget] = useState("general");
  const [jobs, setJobs] = useState<UploadJob[]>([]);
  const [dragging, setDragging] = useState(false);
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const toast = useToast();
  const router = useRouter();
  const folders = [...new Set(assets.map((item) => item.folder))].sort();
  const matches = assets.filter((item) => (!folder || folder === item.folder) &&
    [item.name, item.alt.en, item.alt.ar].some((value) => value.toLowerCase().includes(query.trim().toLowerCase())));

  async function upload(files: FileList | File[]) {
    if (!canWrite || busy.current || !files.length) return;
    busy.current = true;
    setPending(true);
    const incoming = Array.from(files).map((file) => ({ file, id: crypto.randomUUID() }));
    setJobs(incoming.map(({ file, id }) => ({ id, name: file.name, progress: 0 })));
    let success = 0;
    try {
      for (const { file, id } of incoming) {
        try {
          await uploadFile(file, target, (progress) => setJobs((items) => items.map((item) => item.id === id ? { ...item, progress } : item)));
          setJobs((items) => items.map((item) => item.id === id ? { ...item, progress: 100 } : item));
          success++;
        } catch (error) {
          setJobs((items) => items.map((item) => item.id === id ? { ...item, error: error instanceof Error ? error.message : "Upload failed." } : item));
        }
      }
      if (success) { toast(`Uploaded ${success} ${success === 1 ? "file" : "files"}.`); router.refresh(); }
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  return <div className="grid gap-5">
    {canWrite && <section className={`${paneClass} grid gap-3`} aria-label="Upload media">
      <div className="grid gap-3 sm:grid-cols-[1fr_13rem]">
        <label className={`flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-3 text-center text-sm focus-within:outline-2 focus-within:outline-lava-300 ${dragging ? "border-accent bg-surface-2" : "border-line-strong"}`}
          onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          onDrop={(event) => { event.preventDefault(); setDragging(false); void upload(event.dataTransfer.files); }}>
          <Upload size={21} className="text-lava-300" aria-hidden />
          <span>Drop files here or choose files</span>
          <span className="text-xs text-muted">JPEG, PNG, WebP, AVIF and PDF up to 15 MB. MP4 and WebM up to 80 MB.</span>
          <input type="file" multiple disabled={pending} aria-label="Upload files" className="sr-only"
            accept=".jpg,.jpeg,.png,.webp,.avif,.pdf,.mp4,.webm" onChange={(event) => {
              if (event.target.files) void upload(event.target.files); event.target.value = "";
            }} />
        </label>
        <Label title="Upload folder"><input className={inputClass} list="media-folders" maxLength={96} value={target} disabled={pending} onChange={(event) => setTarget(event.target.value)} /></Label>
        <datalist id="media-folders">{folders.map((item) => <option key={item} value={item} />)}</datalist>
      </div>
      {jobs.length > 0 && <ul aria-label="Upload progress" className="grid gap-1 text-sm">{jobs.map((job) => <li key={job.id} className="flex flex-wrap items-center gap-2">
        <span className="max-w-[20rem] truncate">{job.name}</span>
        {job.error ? <span role="status" className="text-danger">{job.error}</span>
          : <><progress aria-label={`Upload progress for ${job.name}`} className="accent-accent" value={job.progress} max={100} />
            <span className="text-muted">{job.progress === 100 ? "Uploaded" : `${job.progress}%`}</span></>}
      </li>)}</ul>}
    </section>}
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_15rem]">
      <Label title="Search"><input className={inputClass} value={query} type="search" onChange={(event) => setQuery(event.target.value)} /></Label>
      <Label title="Folder"><select className={inputClass} value={folder} onChange={(event) => setFolder(event.target.value)}>
        <option value="">All folders</option>{folders.map((item) => <option key={item}>{item}</option>)}
      </select></Label>
    </div>
    {matches.length ? <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {matches.map((asset) => <article key={asset.id} className={`${paneClass} min-w-0 space-y-2`}>
        <MediaThumbnail asset={asset} className="aspect-[5/3] w-full" />
        <h2 className="break-all text-sm font-medium"><a href={asset.url} target="_blank" rel="noreferrer" className="hover:text-lava-300">{asset.name}</a></h2>
        <p className="font-mono text-xs text-muted">{asset.folder} · {Math.max(1, Math.round(asset.size / 1024))} KB{asset.width && asset.height ? ` · ${asset.width} × ${asset.height}` : ""}</p>
        {canWrite && <details>
          <summary className={`${buttonClass} cursor-pointer`}>Edit metadata</summary>
          <div className="mt-3"><MutationForm success="Media updated." action={(form) => updateMedia({ id: asset.id, alt: { en: form.get("en"), ar: form.get("ar") }, folder: form.get("folder") })}>
            <Label title="Alt text — English"><input name="en" defaultValue={asset.alt.en} className={inputClass} maxLength={500} /></Label>
            <Label title="Alt text — Arabic"><input name="ar" lang="ar" dir="rtl" defaultValue={asset.alt.ar} className={inputClass} maxLength={500} /></Label>
            <Label title="Folder name"><input name="folder" defaultValue={asset.folder} className={inputClass} maxLength={96} required /></Label>
          </MutationForm></div>
        </details>}
        {canDelete && <DeleteButton item="asset" action={() => deleteMedia(asset.id)} />}
      </article>)}
    </div> : <Empty>{query || folder ? "No matching assets." : "No assets in the library yet."}</Empty>}
  </div>;
}
