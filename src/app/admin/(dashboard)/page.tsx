import { count, desc, eq, getTableColumns } from "drizzle-orm";
import { ArrowUpRight, Inbox, Layers2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { Badge, PageHeading, Panel } from "@/components/admin/ui/frame";
import { linkClass } from "@/components/admin/ui/styles";
import { db } from "@/db";
import { leads, media } from "@/db/schema";
import { contentEntities, permits } from "@/server/auth/permissions";
import { requireUser } from "@/server/auth/session";
import { catalog, contentTitle } from "@/server/content/catalog";

export default async function Dashboard() {
  const user = await requireUser();
  const canReadLeads = permits(user.permissions, "leads:read");
  const canReadMedia = permits(user.permissions, "media:read");
  const draftTypes = contentEntities.filter((entity) => permits(user.permissions, `${entity}:read`) && getTableColumns(catalog[entity].table).status);
  const [groupedDrafts, recent, leadTotals, assetTotal] = await Promise.all([
    Promise.all(draftTypes.map(async (entity) => {
      const { table, title } = catalog[entity];
      const columns = getTableColumns(table);
      const filter = eq(columns.status, "draft");
      const [items, [total]] = await Promise.all([
        db.select({ id: columns.id, title: columns[title], updatedAt: columns.updatedAt }).from(table).where(filter).orderBy(desc(columns.updatedAt)).limit(5),
        db.select({ total: count() }).from(table).where(filter),
      ]);
      return { items: items.map((item) => ({ id: String(item.id), label: contentTitle(item.title), entity, updatedAt: Number(item.updatedAt) })), count: total.total };
    })),
    canReadLeads ? db.select({ id: leads.id, name: leads.name, status: leads.status, type: leads.type }).from(leads).orderBy(desc(leads.createdAt)).limit(5) : [],
    canReadLeads ? db.select({ total: count() }).from(leads).where(eq(leads.status, "new")) : [],
    canReadMedia ? db.select({ total: count() }).from(media) : [],
  ]);
  const drafts = groupedDrafts.flatMap(({ items }) => items).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 7);
  const counts = [
    ...(canReadLeads ? [{ label: "New leads", value: leadTotals[0]?.total ?? 0, icon: Inbox, href: "/admin/leads?status=new" }] : []),
    ...(draftTypes.length ? [{ label: "Content drafts", value: groupedDrafts.reduce((total, group) => total + group.count, 0), icon: Layers2, href: "#drafts" }] : []),
    ...(canReadMedia ? [{ label: "Media assets", value: assetTotal[0]?.total ?? 0, icon: ImageIcon, href: "/admin/media" }] : []),
  ];
  return <>
    <PageHeading title="Overview" detail={`Signed in as ${user.name}`} />
    {counts.length > 0 && <section aria-label="Workspace counts" className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {counts.map(({ label, value, icon: Icon, href }) => <Link key={label} href={href} className="flex items-start justify-between gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card hover:border-line-lava sm:p-5">
        <div><span className="block text-sm text-muted">{label}</span><span className="mt-1 block font-display text-4xl font-semibold tabular-nums">{value}</span></div>
        <span className="rounded-xl bg-accent-soft p-2.5 text-accent-text"><Icon size={20} aria-hidden /></span>
      </Link>)}
    </section>}
    <div className="grid items-start gap-4 xl:grid-cols-2">
      {canReadLeads && <Panel title="Recent leads">
        {recent.length ? <ul>{recent.map((lead) => <li className="flex items-center justify-between gap-2 border-b border-line py-2 last:border-0" key={lead.id}>
          <Link href={`/admin/leads/${lead.id}`} className={`${linkClass} break-words text-sm`}>{lead.name}</Link><Badge>{lead.status}</Badge>
        </li>)}</ul> : <p className="text-sm text-muted">New inquiries will appear here.</p>}
      </Panel>}
      {draftTypes.length > 0 && <div id="drafts"><Panel title="Content needing attention">
        {drafts.length ? <ul>{drafts.map((draft) => <li className="flex items-center justify-between gap-2 border-b border-line py-2 last:border-0" key={draft.id}>
          <Link href={`/admin/content/${draft.entity}/${draft.id}`} className={`${linkClass} break-words text-sm`}>{draft.label || "Untitled draft"}</Link>
          <Badge>{catalog[draft.entity].label}</Badge>
        </li>)}</ul> : <p className="text-sm text-muted">There are no open drafts.</p>}
      </Panel></div>}
    </div>
    <div className="mt-4"><Panel title="Quick links">
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {permits(user.permissions, "page_sections:read") && <Link href="/admin/pages/home" className={`${linkClass} inline-flex items-center gap-1 text-sm`}>Edit homepage <ArrowUpRight size={14} aria-hidden /></Link>}
        {permits(user.permissions, "services:write") && <Link href="/admin/content/services/new" className={`${linkClass} inline-flex items-center gap-1 text-sm`}>Add service <ArrowUpRight size={14} aria-hidden /></Link>}
        {permits(user.permissions, "projects:write") && <Link href="/admin/content/projects/new" className={`${linkClass} inline-flex items-center gap-1 text-sm`}>Add project <ArrowUpRight size={14} aria-hidden /></Link>}
        {permits(user.permissions, "services:read") && <Link href="/admin/content/services" className={`${linkClass} inline-flex items-center gap-1 text-sm`}>Browse services <ArrowUpRight size={14} aria-hidden /></Link>}
        <Link href="/en" className={`${linkClass} inline-flex items-center gap-1 text-sm`}>Public site <ArrowUpRight size={14} aria-hidden /></Link>
      </div>
    </Panel></div>
  </>;
}
