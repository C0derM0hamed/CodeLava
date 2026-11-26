"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export type AdminNavGroup = { label: string; links: { label: string; href: string }[] };

export function SessionHeartbeat() {
  const path = usePathname();
  const lastRefresh = useRef(0);
  useEffect(() => {
    function refreshSession() {
      if (Date.now() - lastRefresh.current < 300_000) return;
      lastRefresh.current = Date.now();
      void fetch("/api/admin/session", { method: "POST", credentials: "same-origin" }).catch(() => {
        lastRefresh.current = 0;
      });
    }
    refreshSession();
    window.addEventListener("focus", refreshSession);
    window.addEventListener("pointerdown", refreshSession, { passive: true });
    window.addEventListener("keydown", refreshSession);
    return () => {
      window.removeEventListener("focus", refreshSession);
      window.removeEventListener("pointerdown", refreshSession);
      window.removeEventListener("keydown", refreshSession);
    };
  }, [path]);
  return null;
}

export function AdminNavigation({ groups }: { groups: AdminNavGroup[] }) {
  const path = usePathname();
  return <nav aria-label="Admin navigation" className="grid gap-5">
    {groups.filter(({ links }) => links.length).map((group) => <section key={group.label}>
      <h2 className="mb-1 px-3 font-mono text-[11px] font-medium uppercase tracking-wider text-muted">{group.label}</h2>
      {group.links.map(({ href, label }) => {
        const selected = href === "/admin" ? path === href : path === href || path.startsWith(href + "/");
        return <Link key={href} href={href} aria-current={selected ? "page" : undefined}
          onClick={(event) => event.currentTarget.closest("details")?.removeAttribute("open")}
          className={`block rounded-r border-s-2 px-3 py-2 text-sm ${selected ? "border-accent bg-surface-2 font-medium text-lava-300" : "border-transparent text-muted hover:bg-surface-2 hover:text-text"}`}>{label}</Link>;
      })}
    </section>)}
  </nav>;
}
