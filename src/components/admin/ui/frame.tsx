import type { ReactNode } from "react";
import { paneClass } from "./styles";

export function PageHeading({ title, detail, actions }: { title: string; detail?: string; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
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
  return <span className="inline-flex rounded border border-line-strong bg-bg px-2 py-1 font-mono text-xs capitalize text-muted">{children}</span>;
}

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return <section className={paneClass}><h2 className="mb-4 font-display text-xl font-medium">{title}</h2>{children}</section>;
}
