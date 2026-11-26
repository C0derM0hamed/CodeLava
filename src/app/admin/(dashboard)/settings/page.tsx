import { desc } from "drizzle-orm";
import { SettingsEditor } from "@/components/admin/settings-editor";
import { PageHeading } from "@/components/admin/ui/frame";
import { db } from "@/db";
import { media, siteSettings } from "@/db/schema";
import { permits } from "@/server/auth/permissions";
import { requirePermission } from "@/server/auth/session";
import { settingFields } from "@/server/content/settings";

export default async function SettingsPage() {
  const user = await requirePermission("settings:manage");
  const [settings, assets] = await Promise.all([
    db.select().from(siteSettings),
    permits(user.permissions, "media:read") ? db.select({ id: media.id, url: media.url, name: media.originalName, kind: media.kind, folder: media.folder }).from(media).orderBy(desc(media.createdAt)) : [],
  ]);
  const fields = {
    contact: settingFields.contact.map(({ schema, fields, ...field }) => { void schema; void fields; return field; }),
    socials: settingFields.socials.map(({ schema, fields, ...field }) => { void schema; void fields; return field; }),
    seo: settingFields.seo.map(({ schema, fields, ...field }) => { void schema; void fields; return field; }),
  };
  return <><PageHeading title="Site settings" /><SettingsEditor fields={fields} assets={assets}
    initial={Object.fromEntries(settings.map(({ key, value }) => [key, value]))} /></>;
}
