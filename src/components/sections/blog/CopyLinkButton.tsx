"use client";

import { Check, Link2 } from "lucide-react";
import { useState } from "react";

export function CopyLinkButton({
  url,
  copyLabel,
  copiedLabel,
  className,
}: {
  url: string;
  copyLabel: string;
  copiedLabel: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt(copyLabel, url);
    }
  }

  return (
    <button type="button" onClick={copy} data-cursor="pointer" className={`${className ?? ""} gap-2`}>
      {copied ? <Check aria-hidden="true" className="size-4 text-success" /> : <Link2 aria-hidden="true" className="size-4" />}
      <span aria-live="polite">{copied ? copiedLabel : copyLabel}</span>
    </button>
  );
}
