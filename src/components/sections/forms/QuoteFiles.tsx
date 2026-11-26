"use client";

import { FileText, Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { FieldWrapper } from "@/components/ui/Field";
import { leadAttachmentAccept, leadAttachmentCount, leadAttachmentLimit } from "@/server/leads/schema";

const extensions = new Set(leadAttachmentAccept.split(","));
const sizeMb = leadAttachmentLimit / 1024 ** 2;

export function QuoteFiles({ files, onChange, enhanced, error }: {
  files: File[]; onChange: (files: File[], errors?: string[]) => void; enhanced: boolean; error?: string;
}) {
  const t = useTranslations("forms.attachments");
  const quote = useTranslations("quote");
  const common = useTranslations("common");
  const [dragging, setDragging] = useState(false);
  const help = t("help", { count: leadAttachmentCount, size: sizeMb, formats: "PDF, DOC(X), XLS(X), PPT(X), PNG, JPEG, WebP, ZIP, TXT" });
  function add(incoming: FileList) {
    const rejected = new Set<string>();
    const next = [...files];
    for (const file of incoming) {
      if (file.size === 0) rejected.add("emptyFile");
      else if (file.size > leadAttachmentLimit) rejected.add(`fileSize:${sizeMb}`);
      else if (!extensions.has(`.${file.name.split(".").at(-1)?.toLowerCase()}`)) rejected.add("fileType");
      else if (next.some((entry) => entry.name === file.name && entry.size === file.size && entry.lastModified === file.lastModified)) continue;
      else if (next.length >= leadAttachmentCount) rejected.add(`fileCount:${leadAttachmentCount}`);
      else next.push(file);
    }
    onChange(next, [...rejected]);
  }

  return (
    <FieldWrapper id="quote-files" label={quote("attachments")} optionalLabel={common("optional")} error={error} hint={help}>
      <div className="quote-drop" data-dragging={dragging}
        onDragOver={enhanced ? (event) => { event.preventDefault(); setDragging(true); } : undefined}
        onDragLeave={() => setDragging(false)}
        onDrop={enhanced ? (event) => {
          event.preventDefault();
          setDragging(false);
          add(event.dataTransfer.files);
        } : undefined}>
        <input id="quote-files" name="attachments" type="file" multiple accept={leadAttachmentAccept}
          className={enhanced ? "sr-only" : "w-full text-sm"}
          aria-invalid={error ? true : undefined} aria-describedby={`quote-files-${error ? "error" : "hint"}`}
          onChange={(event) => {
            if (event.target.files) add(event.target.files);
            event.target.value = "";
          }} />
        {enhanced ? <label htmlFor="quote-files" className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 p-4 text-center text-sm">
          <Upload size={21} className="text-lava-300" aria-hidden="true" />
          {t("drop")}
        </label> : null}
      </div>
      {files.length > 0 ? <ul className="grid gap-1" aria-live="polite">
        {files.map((file, index) => (
          <li key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-center gap-3 border-b border-line py-1 text-sm">
            <FileText size={16} aria-hidden="true" className="shrink-0 text-lava-300" />
            <bdi className="min-w-0 flex-1 break-all">{file.name}</bdi>
            <span className="text-muted" dir="ltr">{file.size >= 1024 ** 2 ? `${(file.size / 1024 ** 2).toFixed(1)} MB` : `${Math.ceil(file.size / 1024)} KB`}</span>
            <button type="button" className="grid size-10 shrink-0 place-items-center text-muted hover:text-text"
              aria-label={t("remove", { name: file.name })} onClick={() => onChange(files.filter((_, item) => item !== index))}>
              <X size={17} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul> : null}
    </FieldWrapper>
  );
}
