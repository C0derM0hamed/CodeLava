"use server";

import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { media, siteSettings } from "@/db/schema";
import { permits } from "@/server/auth/permissions";
import { requireUser } from "@/server/auth/session";
import { invalidate, recordChange, type ActionResult } from "@/server/changes";
import { shape } from "./fields";
import { featureFlags, settingFields } from "./settings";

const settings = z.object({
  contact: shape(settingFields.contact), socials: shape(settingFields.socials), seo: shape(settingFields.seo), features: featureFlags,
});

export async function saveSettings(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  if (!permits(user.permissions, "settings:manage")) return { ok: false, error: "Settings permission required." };
  const parsed = settings.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues.map((issue) => `${issue.path.join(" / ")} — ${issue.message}`).join(" ") };
  try {
    const result = await db.transaction(async (tx): Promise<ActionResult> => {
      await tx.execute(sql`select pg_advisory_xact_lock(420233)`);
      const og = parsed.data.seo.ogImageId;
      if (typeof og === "string") {
        const [asset] = await tx.select({ id: media.id }).from(media).where(and(eq(media.id, og), eq(media.kind, "image")));
        if (!asset) return { ok: false, error: "Choose an existing image for the default social card." };
      }
      for (const [key, values] of Object.entries(parsed.data)) {
        const value = Object.fromEntries(Object.entries(values).filter(([, value]) => value !== null));
        await tx.insert(siteSettings).values({ key, value }).onConflictDoUpdate({ target: siteSettings.key, set: { value } });
        await recordChange(tx, { userId: user.id, entity: "site_settings", id: key, action: "update", type: "content.updated" });
      }
      return { ok: true };
    });
    if (result.ok) { invalidate("site_settings", "/admin/settings"); invalidate("settings"); }
    return result;
  } catch (error) {
    console.error("Settings write failed", error);
    return { ok: false, error: "Could not save settings." };
  }
}
