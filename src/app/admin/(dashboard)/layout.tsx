import type { ReactNode } from "react";
import Link from "next/link";
import { draftMode } from "next/headers";
import { ExternalLink, Menu } from "lucide-react";
import { Logo } from "@/components/brand";
import { logout } from "@/server/auth/actions";
import { contentEntities, permits } from "@/server/auth/permissions";
import { requireUser } from "@/server/auth/session";
import { catalog } from "@/server/content/catalog";
import { AdminNavigation, SessionHeartbeat, type AdminNavGroup } from "@/components/admin/navigation";
import { buttonClass } from "@/components/admin/ui/styles";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const preview = (await draftMode()).isEnabled;
  const groups: AdminNavGroup[] = [
    { label: "Workspace", links: [
      { href: "/admin", label: "Overview" },
      ...(permits(user.permissions, "leads:read") ? [{ href: "/admin/leads", label: "Lead inbox" }] : []),
      ...(permits(user.permissions, "media:read") ? [{ href: "/admin/media", label: "Media library" }] : []),
    ] },
    { label: "Pages", links: [
      ...(permits(user.permissions, "page_sections:read") ? [
        { href: "/admin/pages/home", label: "Page builder" },
        { href: "/admin/content/page_sections", label: "Page section records" },
      ] : []),
      ...(permits(user.permissions, "page_meta:read") ? [{ href: "/admin/content/page_meta", label: "Page SEO" }] : []),
      ...(permits(user.permissions, "ui_translations:read") ? [{ href: "/admin/content/ui_translations", label: "UI translations" }] : []),
    ] },
    { label: "Website content", links: contentEntities
      .filter((entity) => !["page_sections", "page_meta", "ui_translations"].includes(entity) && permits(user.permissions, `${entity}:read`))
      .map((entity) => ({ href: `/admin/content/${entity}`, label: catalog[entity].label })) },
    { label: "Administration", links: [
      ...(permits(user.permissions, "settings:manage") ? [{ href: "/admin/settings", label: "Site settings" }] : []),
      ...(permits(user.permissions, "users:manage") ? [{ href: "/admin/access", label: "Users & roles" }] : []),
      ...(permits(user.permissions, "audit:read") ? [{ href: "/admin/audit", label: "Audit log" }] : []),
    ] },
  ];
  return <>
    <SessionHeartbeat />
    <a className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-surface focus:p-3" href="#admin-main">Skip to content</a>
    <header className="sticky top-0 z-30 border-b border-line bg-surface shadow-xs">
      <div className="flex min-h-16 flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 lg:px-7">
        <Link href="/admin" aria-label="CodeLava admin overview"><Logo size="sm" tone="light" /></Link>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {preview && <form method="post" action="/api/preview/disable"><button className={buttonClass}>Exit preview</button></form>}
          <a href="/en" target="_blank" rel="noreferrer" className={`${buttonClass} max-sm:hidden!`}>View site <ExternalLink size={14} aria-hidden /></a>
          <details className="relative">
            <summary className={`${buttonClass} max-w-36 cursor-pointer sm:max-w-52`}><span className="truncate">{user.name}</span></summary>
            <div className="absolute right-0 top-full mt-2 grid w-56 gap-2 rounded-lg border border-line bg-surface p-3 shadow-pop">
              <p className="truncate text-xs text-muted">{user.email}</p>
              <p className="capitalize text-muted">{user.role}</p>
              <form action={logout.bind(null, false)}><button className={buttonClass}>Sign out</button></form>
              <form action={logout.bind(null, true)}><button className={buttonClass}>Sign out everywhere</button></form>
            </div>
          </details>
        </div>
      </div>
      <details className="border-t border-line px-4 lg:hidden">
        <summary className="flex min-h-10 cursor-pointer items-center gap-2 text-sm"><Menu size={16} aria-hidden /> Menu</summary>
        <div className="max-h-[58dvh] overflow-y-auto py-3"><AdminNavigation groups={groups} /></div>
      </details>
    </header>
    <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] overflow-y-auto border-e border-line bg-surface px-3 py-5 lg:block">
        <AdminNavigation groups={groups} />
      </aside>
      <main id="admin-main" tabIndex={-1} className="min-w-0 px-4 py-6 sm:px-7 lg:px-10 lg:py-8">{children}</main>
    </div>
  </>;
}
