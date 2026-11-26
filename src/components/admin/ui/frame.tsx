import type { ReactNode } from "react";
import { paneClass } from "./styles";

export function PageHeading({ title, detail, actions }: { title: string; detail?: string; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {detail && <p className="mt-2 max-w-2xl text-sm text-muted">{detail}</p>}
      </div>
      {actions}
    </header>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className={`${paneClass} text-sm text-muted`}>{children}</p>;
}

export function Label({ title, children }: { title: string; children: ReactNode }) {
  return <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">{title}{children}</label>;
}

export function Badge({ children }: { children: ReactNode }) {
  const status = typeof children === "string" ? children.toLowerCase() : "";
  const tone = status === "published" || status === "visible" ? "bg-success/10 text-text"
    : status === "draft" || status.includes("draft") ? "bg-accent-soft text-accent-text"
      : "bg-surface-2 text-muted";
  return <span className={`inline-flex rounded-full border border-line px-2.5 py-0.5 text-xs font-medium capitalize ${tone}`}>{children}</span>;
}

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return <section className={paneClass}><h2 className="mb-4 font-display text-xl font-medium">{title}</h2>{children}</section>;
}
