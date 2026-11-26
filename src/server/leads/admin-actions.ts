"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { leadNotes, leads, roles, users } from "@/db/schema";
import { permits } from "@/server/auth/permissions";
import { requireUser } from "@/server/auth/session";
import { invalidate, recordChange, type ActionResult } from "@/server/changes";
import { statuses, transitions } from "./pipeline";

const update = z.object({ id: z.uuid(), status: z.enum(statuses), assignedTo: z.uuid().nullable() });
const note = z.object({ id: z.uuid(), body: z.string().trim().min(1).max(5000) });
const fail = (error: string): ActionResult => ({ ok: false, error });
const refresh = (id: string) => invalidate("leads", `/admin/leads/${id}`);

export async function updateLead(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  if (!permits(user.permissions, "leads:write")) return fail("Lead write permission required.");
  const parsed = update.safeParse(input);
  if (!parsed.success) return fail("Select a valid stage and assignee.");
  const { id, status, assignedTo } = parsed.data;
  try {
    const result = await db.transaction(async (tx): Promise<ActionResult> => {
      const [lead] = await tx.select().from(leads).where(eq(leads.id, id)).for("update");
      if (!lead) return fail("Lead not found.");
      if (status !== lead.status && !transitions[lead.status].includes(status)) return fail("This stage change is unavailable. Reload the lead.");
      if (assignedTo && assignedTo !== lead.assignedTo) {
        const [assignee] = await tx.select({ permissions: roles.permissions }).from(users)
          .innerJoin(roles, eq(users.roleId, roles.id)).where(and(eq(users.id, assignedTo), eq(users.active, true)));
        if (!assignee || !permits(assignee.permissions, "leads:read")) return fail("Choose an active teammate with lead access.");
      }
      await tx.update(leads).set({ status, assignedTo }).where(eq(leads.id, id));
      if (status !== lead.status) {
        await recordChange(tx, { userId: user.id, entity: "leads", id, action: "status_changed", type: "lead.status_changed",
          meta: { from: lead.status, to: status } });
      }
      if (assignedTo !== lead.assignedTo) {
        await recordChange(tx, { userId: user.id, entity: "leads", id, action: "assigned", type: "lead.assigned",
          meta: { from: lead.assignedTo, to: assignedTo } });
      }
      return { ok: true, id };
    });
    if (result.ok) refresh(id);
    return result;
  } catch (error) {
    console.error("Lead update failed", error);
    return fail("Could not update the lead.");
  }
}

export async function addLeadNote(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  if (!permits(user.permissions, "leads:write")) return fail("Lead write permission required.");
  const parsed = note.safeParse(input);
  if (!parsed.success) return fail("Enter a note between 1 and 5,000 characters.");
  const { id, body } = parsed.data;
  try {
    await db.transaction(async (tx) => {
      const [row] = await tx.insert(leadNotes).values({ leadId: id, userId: user.id, body }).returning({ id: leadNotes.id });
      await recordChange(tx, { userId: user.id, entity: "leads", id, action: "note_added", type: "lead.note_added", meta: { noteId: row.id } });
    });
    refresh(id);
    return { ok: true, id };
  } catch (error) {
    console.error("Lead note failed", error);
    return fail("Could not add the note.");
  }
}
