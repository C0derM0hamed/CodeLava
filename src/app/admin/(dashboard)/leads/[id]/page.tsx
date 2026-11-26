import { desc, eq } from "drizzle-orm";
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { Badge, Label, PageHeading, Panel } from "@/components/admin/ui/frame";
import { MutationForm } from "@/components/admin/ui/mutation-form";
import { inputClass, linkClass } from "@/components/admin/ui/styles";
import { db } from "@/db";
import { leadAttachments, leadNotes, leads, roles, users } from "@/db/schema";
import { permits } from "@/server/auth/permissions";
import { requirePermission } from "@/server/auth/session";
import { contentOptions } from "@/server/content/data";
import { addLeadNote, updateLead } from "@/server/leads/admin-actions";
import { transitions } from "@/server/leads/pipeline";

export default async function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requirePermission("leads:read");
  const id = z.uuid().safeParse((await params).id).data;
  if (!id) notFound();
  const [lead] = await db.select().from(leads).where(eq(leads.id, id));
  if (!lead) notFound();
  const [notes, attachments, assignees, serviceList] = await Promise.all([
    db.select({ text: leadNotes.body, createdAt: leadNotes.createdAt, author: users.name, id: leadNotes.id }).from(leadNotes)
      .leftJoin(users, eq(leadNotes.userId, users.id)).where(eq(leadNotes.leadId, id)).orderBy(desc(leadNotes.createdAt)),
    db.select({ id: leadAttachments.id, name: leadAttachments.originalName, size: leadAttachments.size })
      .from(leadAttachments).where(eq(leadAttachments.leadId, id)).orderBy(desc(leadAttachments.createdAt)),
    db.select({ id: users.id, name: users.name, active: users.active, permissions: roles.permissions }).from(users).innerJoin(roles, eq(users.roleId, roles.id)),
    contentOptions("services"),
  ]);
  const canWrite = permits(actor.permissions, "leads:write");
  const currentAssignee = assignees.find(({ id }) => id === lead.assignedTo);
  const assigneeOptions = assignees.filter(({ id, active, permissions }) => id === lead.assignedTo || (active && permits(permissions, "leads:read")));
  const serviceNames = new Map(serviceList.map(({ value, label }) => [value, label]));
  const fields = [
    ["Email", lead.email], ["Phone", lead.phone], ["Company", lead.company], ["Country", lead.country], ["Locale", lead.locale],
    ["Services", lead.serviceIds.map((id) => serviceNames.get(id) ?? id).join(", ")], ["Budget", [lead.budget, lead.currency].filter(Boolean).join(" ")],
    ["Timeline", lead.timeline], ["Source page", lead.sourcePath], ["Referrer", lead.referrer],
    ["Consent", lead.metadata.consent === true ? String(lead.metadata.consentAt ?? "Given") : null],
    ...Object.entries(lead.utm).map(([key, value]) => [key, value]),
  ].filter(([, value]) => value);
  return <>
    <Link className={`${linkClass} mb-4 inline-flex items-center gap-2 text-sm`} href="/admin/leads"><ArrowLeft size={16} aria-hidden /> Lead inbox</Link>
    <PageHeading title={lead.name} detail={`${lead.type === "quote" ? "Quote request" : "Contact inquiry"} · ${lead.createdAt.toISOString().slice(0, 16).replace("T", " ")} UTC`}
      actions={<Badge>{lead.status}</Badge>} />
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(16rem,27rem)]">
      <div className="grid gap-4">
        <Panel title="Message"><p className="whitespace-pre-wrap break-words text-sm leading-7" dir="auto">{lead.message}</p></Panel>
        <Panel title="Request details">
          <dl className="grid gap-3 sm:grid-cols-2">
            {fields.map(([label, value], index) => <div className="text-sm break-all" key={`${label}-${index}`}><dt className="text-xs text-muted">{label}</dt><dd>{value}</dd></div>)}
          </dl>
          {!!Object.keys(lead.details).length && <dl className="mt-4 grid gap-2 border-t border-line pt-4">
            {Object.entries(lead.details).map(([key, value]) => <div key={key} className="min-w-0 break-words text-sm">
              <dt className="text-xs text-muted">{key}</dt><dd dir="auto">{typeof value === "string" ? value : JSON.stringify(value)}</dd>
            </div>)}
          </dl>}
        </Panel>
        <Panel title="Attachments">
          {attachments.length ? <ul className="grid gap-2">{attachments.map((file) => <li key={file.id} className="flex flex-wrap items-center gap-2 text-sm">
            <a download href={`/api/admin/leads/attachments/${file.id}`} className={`${linkClass} flex min-w-0 items-center gap-2 break-all`}>
              <Download size={16} className="shrink-0" aria-hidden />{file.name}</a>
            <span className="text-xs text-muted">{Math.max(1, Math.round(file.size / 1024))} KB</span>
          </li>)}</ul> : <p className="text-sm text-muted">No attachments.</p>}
        </Panel>
      </div>
      <div className="grid gap-4">
        <Panel title="Pipeline">
          {canWrite ? <MutationForm key={`${lead.status}-${lead.assignedTo}`} success="Lead updated." label="Update lead" action={async (form) => {
            "use server";
            return updateLead({ id, status: form.get("status"), assignedTo: form.get("assignedTo") || null });
          }}>
            <Label title="Stage"><select name="status" className={inputClass} defaultValue={lead.status}>
              {[lead.status, ...transitions[lead.status]].map((status) => <option key={status} value={status}>{status}</option>)}</select></Label>
            <Label title="Assigned to"><select name="assignedTo" className={inputClass} defaultValue={lead.assignedTo ?? ""}>
              <option value="">Unassigned</option>{assigneeOptions.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></Label>
          </MutationForm> : <p className="text-sm text-muted">Assigned to {currentAssignee?.name ?? "no one"}.</p>}
        </Panel>
        <Panel title="Notes">
          {canWrite && <MutationForm resetOnSuccess success="Note added." label="Add note" action={async (form) => {
            "use server";
            return addLeadNote({ id, body: form.get("body") });
          }}>
            <Label title="Internal note"><textarea className={inputClass} name="body" rows={3} maxLength={5000} required /></Label>
          </MutationForm>}
          {notes.length ? <ol className="mt-4 grid gap-3">{notes.map((note) => <li key={note.id} className="border-s-2 border-line-strong ps-3">
            <p className="text-xs text-muted">{note.author ?? "Former teammate"} · {note.createdAt.toISOString().slice(0, 16).replace("T", " ")} UTC</p>
            <p className="mt-1 whitespace-pre-wrap break-words text-sm" dir="auto">{note.text}</p>
          </li>)}</ol> : <p className="mt-3 text-sm text-muted">No notes yet.</p>}
        </Panel>
      </div>
    </div>
  </>;
}
