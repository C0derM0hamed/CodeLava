"use server";

import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { pageSections, siteSettings } from "@/db/schema";
import { permits } from "@/server/auth/permissions";
import { requireUser } from "@/server/auth/session";
import { invalidate, recordChange, type ActionResult } from "@/server/changes";
import {
  layoutDraftKey, layoutSchema, mergePublishedCopy, pageCopySchema, pageKeySchema, readPageBuilder, sectionKeySchema,
} from "./page-builder";

const versionSchema = z.string().regex(/^[a-f0-9]{64}$/);
const copySchema = z.object({ page: pageKeySchema, section: sectionKeySchema, version: versionSchema, copy: pageCopySchema });
const publishSchema = z.object({ page: pageKeySchema, version: versionSchema, layout: layoutSchema, publish: z.boolean() });
const fail = (error: string): ActionResult => ({ ok: false, error });
const changed = () => fail("This page changed while you were editing. Reload it and try again.");

function refresh(page: string) {
  invalidate("page-sections", `/admin/pages/${page}`);
  invalidate("page_sections", "/admin/content/page_sections");
}

export async function savePageCopy(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  if (!permits(user.permissions, "page_sections:read") || !permits(user.permissions, "page_sections:write")) {
    return fail("Page section write permission required.");
  }
  const parsed = copySchema.safeParse(input);
  if (!parsed.success) return fail("Check the section copy and try again.");
  const { page, section, version, copy } = parsed.data;
  try {
    const result = await db.transaction(async (tx): Promise<ActionResult> => {
      await tx.execute(sql`select pg_advisory_xact_lock(420233)`);
      const state = await readPageBuilder(page, tx);
      const item = state.sections.find(({ key }) => key === section);
      if (state.version !== version || !item) return changed();
      const draftContent = mergePublishedCopy(item.row?.draftContent ?? {}, copy);
      const [row] = item.row
        ? await tx.update(pageSections).set({ draftContent }).where(eq(pageSections.id, item.row.id)).returning()
        : await tx.insert(pageSections).values({ pageKey: page, sectionKey: section, draftContent, sortOrder: item.sortOrder }).returning();
      await recordChange(tx, { userId: user.id, entity: "page_sections", id: row.id, action: "save_draft",
        type: "content.draft_saved", meta: { page, section } });
      return { ok: true };
    });
    if (result.ok) refresh(page);
    return result;
  } catch (error) {
    console.error("Page draft write failed", error);
    return fail("The draft could not be saved. Try again.");
  }
}

export async function savePageLayout(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  if (!permits(user.permissions, "page_sections:read") || !permits(user.permissions, "page_sections:write")) {
    return fail("Page section write permission required.");
  }
  const parsed = publishSchema.safeParse(input);
  if (!parsed.success) return fail("Check the page layout and try again.");
  const { page, version, layout, publish } = parsed.data;
  if (publish && !permits(user.permissions, "page_sections:publish")) return fail("Page section publish permission required.");

  try {
    const result = await db.transaction(async (tx): Promise<ActionResult> => {
      await tx.execute(sql`select pg_advisory_xact_lock(420233)`);
      const state = await readPageBuilder(page, tx);
      const byKey = new Map(state.sections.map((item) => [item.key, item]));
      if (state.version !== version || layout.length !== byKey.size || layout.some(({ key }) => !byKey.has(key))) return changed();

      if (!publish) {
        await tx.insert(siteSettings).values({ key: layoutDraftKey(page), value: layout })
          .onConflictDoUpdate({ target: siteSettings.key, set: { value: layout } });
        await recordChange(tx, { userId: user.id, entity: "page_sections", id: page, action: "save_layout_draft",
          type: "content.layout_draft_saved", meta: { page, layout } });
        return { ok: true };
      }

      const layoutChanged = JSON.stringify(state.live) !== JSON.stringify(layout);
      for (const [sortOrder, { key, visible }] of layout.entries()) {
        const item = byKey.get(key)!;
        const order = layoutChanged ? sortOrder : item.sortOrder;
        const copyChanged = item.row?.draftContent != null;
        if (!copyChanged && visible === item.visible && order === item.sortOrder) continue;
        const values = {
          sortOrder: order, visible,
          content: copyChanged ? mergePublishedCopy(item.row?.content ?? {}, item.row!.draftContent!) : item.row?.content ?? {},
          draftContent: null,
        };
        const [row] = item.row
          ? await tx.update(pageSections).set(values).where(eq(pageSections.id, item.row.id)).returning()
          : await tx.insert(pageSections).values({ ...values, pageKey: page, sectionKey: key }).returning();
        if (copyChanged || visible !== item.visible) {
          await recordChange(tx, { userId: user.id, entity: "page_sections", id: row.id,
            action: copyChanged ? "publish" : "visibility_changed", type: copyChanged ? "content.published" : "content.visibility_changed",
            meta: { page, section: key, visible } });
        }
      }
      await tx.delete(siteSettings).where(eq(siteSettings.key, layoutDraftKey(page)));
      if (layoutChanged) {
        await recordChange(tx, { userId: user.id, entity: "page_sections", id: page, action: "publish_layout",
          type: "content.layout_published", meta: { page, layout } });
      }
      return { ok: true };
    });
    if (result.ok) refresh(page);
    return result;
  } catch (error) {
    console.error("Page layout write failed", error);
    return fail("The layout could not be saved. Try again.");
  }
}
