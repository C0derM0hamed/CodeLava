import { ArrowDownToLine } from "lucide-react";
import Link from "next/link";
import { Badge, Empty, Label, PageHeading } from "@/components/admin/ui/frame";
import { buttonClass, cellClass, inputClass, linkClass, rowClass } from "@/components/admin/ui/styles";
import { requirePermission } from "@/server/auth/session";
import { contentOptions } from "@/server/content/data";
import { listLeads, parseLeadFilters } from "@/server/leads/admin-data";
import { statuses } from "@/server/leads/pipeline";

export default async function LeadsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePermission("leads:read");
  const filters = parseLeadFilters(await searchParams);
  const page = filters.page ?? 1;
  const size = 30;
  const [rows, services] = await Promise.all([listLeads(filters, size + 1, (page - 1) * size), contentOptions("services")]);
  const query = new URLSearchParams(Object.entries(filters).filter(([key]) => key !== "page") as [string, string][]);
  const paging = (next: number) => `?${new URLSearchParams([...query, ["page", String(next)]])}`;
  return <>
    <PageHeading title="Lead inbox" actions={<a href={`/api/admin/leads/export?${query}`} className={buttonClass}>
      <ArrowDownToLine size={16} aria-hidden /> Export CSV</a>} />
    <form className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(11rem,1fr)_auto_auto_minmax(10rem,1fr)_auto_auto_auto] xl:items-end">
      <Label title="Search"><input name="q" type="search" className={inputClass} defaultValue={filters.q} placeholder="Name, company or message" /></Label>
      <Label title="Status"><select className={inputClass} name="status" defaultValue={filters.status ?? ""}>
        <option value="">All statuses</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select></Label>
      <Label title="Type"><select className={inputClass} name="type" defaultValue={filters.type ?? ""}>
        <option value="">All types</option><option value="contact">Contact</option><option value="quote">Quote</option></select></Label>
      <Label title="Service"><select className={inputClass} name="service" defaultValue={filters.service ?? ""}>
        <option value="">All services</option>{services.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}</select></Label>
      <Label title="From (UTC)"><input className={inputClass} name="from" type="date" defaultValue={filters.from} /></Label>
      <Label title="Through (UTC)"><input className={inputClass} name="to" type="date" defaultValue={filters.to} /></Label>
      <button className={buttonClass}>Apply filters</button>
    </form>
    {rows.length ? <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-card"><table className="w-full text-sm">
      <thead className="bg-surface-2 text-muted"><tr>{["Lead", "Type", "Stage", "Received (UTC)"].map((label) =>
        <th scope="col" key={label} className={`${cellClass} whitespace-nowrap text-start`}>{label}</th>)}</tr></thead>
      <tbody>{rows.slice(0, size).map((lead) => <tr className={rowClass} key={lead.id}>
        <td className={cellClass}><Link href={`/admin/leads/${lead.id}`} className={linkClass}>{lead.name}</Link><p className="break-all text-xs text-muted">{lead.company || lead.email}</p></td>
        <td className={`${cellClass} capitalize`}>{lead.type}</td><td className={cellClass}><Badge>{lead.status}</Badge></td>
        <td className={`${cellClass} whitespace-nowrap text-muted`}>{lead.createdAt.toISOString().slice(0, 10)}</td>
      </tr>)}</tbody>
    </table></div> : <Empty>{query.size ? "No leads match these filters." : "New inquiries will appear here."}</Empty>}
    <nav aria-label="Lead inbox pages" className="mt-4 flex gap-2">
      {page > 1 && <Link href={paging(page - 1)} className={buttonClass}>Previous page</Link>}
      {rows.length > size && <Link href={paging(page + 1)} className={buttonClass}>Next page</Link>}
    </nav>
  </>;
}
