import { and, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { Badge, Empty, Label, PageHeading } from "@/components/admin/ui/frame";
import { buttonClass, cellClass, inputClass, rowClass } from "@/components/admin/ui/styles";
import { db } from "@/db";
import { auditLogs, users } from "@/db/schema";
import { requirePermission } from "@/server/auth/session";

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ page?: string; entity?: string; action?: string }> }) {
  await requirePermission("audit:read");
  const filters = await searchParams;
  const entity = typeof filters.entity === "string" ? filters.entity.slice(0, 64).trim() : "";
  const action = typeof filters.action === "string" ? filters.action.slice(0, 64).trim() : "";
  const page = /^\d{1,4}$/.test(filters.page ?? "") ? Math.max(1, Number(filters.page)) : 1;
  const size = 40;
  const events = await db.select({ log: auditLogs, actor: users.email }).from(auditLogs).leftJoin(users, eq(auditLogs.userId, users.id))
    .where(and(entity ? eq(auditLogs.entity, entity) : undefined, action ? eq(auditLogs.action, action) : undefined))
    .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id)).limit(size + 1).offset((page - 1) * size);
  const more = (page: number) => `?${new URLSearchParams({ page: String(page), entity, action })}`;
  return <>
    <PageHeading title="Audit log" />
    <form className="mb-4 flex flex-wrap items-end gap-2">
      <Label title="Entity"><input className={inputClass} name="entity" defaultValue={entity} /></Label>
      <Label title="Action"><input className={inputClass} name="action" defaultValue={action} /></Label>
      <button className={buttonClass}>Filter log</button>
    </form>
    {events.length ? <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-card"><table className="w-full text-sm">
      <thead className="bg-surface-2 text-muted"><tr>{["Time (UTC)", "Actor", "Action", "Entity", "Details"].map((label) =>
        <th key={label} scope="col" className={`${cellClass} text-start`}>{label}</th>)}</tr></thead>
      <tbody>{events.slice(0, size).map(({ log, actor }) => <tr key={log.id} className={rowClass}>
        <td className={`${cellClass} whitespace-nowrap text-muted`}>{log.createdAt.toISOString().slice(0, 19).replace("T", " ")}</td>
        <td className={cellClass}>{actor ?? "System / public"}</td>
        <td className={cellClass}><Badge>{log.action.replaceAll("_", " ")}</Badge></td>
        <td className={cellClass}>{log.entity}{log.entityId && <p className="break-all font-mono text-xs text-muted">{log.entityId}</p>}</td>
        <td className={cellClass}>{log.meta ? <details><summary className="cursor-pointer text-accent-text">View</summary>
          <pre className="max-w-64 overflow-auto text-xs">{JSON.stringify(log.meta, null, 2)}</pre></details> : "—"}</td>
      </tr>)}</tbody>
    </table></div> : <Empty>No matching activity.</Empty>}
    <nav className="mt-4 flex gap-2" aria-label="Audit log pages">
      {page > 1 && <Link className={buttonClass} href={more(page - 1)}>Previous page</Link>}
      {events.length > size && <Link className={buttonClass} href={more(page + 1)}>Next page</Link>}
    </nav>
  </>;
}
