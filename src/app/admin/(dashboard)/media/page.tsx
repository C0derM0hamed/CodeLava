import { desc } from "drizzle-orm";
import { MediaLibrary } from "@/components/admin/media-library";
import { PageHeading } from "@/components/admin/ui/frame";
import { db } from "@/db";
import { media } from "@/db/schema";
import { permits } from "@/server/auth/permissions";
import { requirePermission } from "@/server/auth/session";

export default async function MediaPage() {
  const user = await requirePermission("media:read");
  const assets = await db.select({
    id: media.id, kind: media.kind, name: media.originalName, alt: media.alt, folder: media.folder, url: media.url,
    width: media.width, height: media.height, size: media.size,
  }).from(media).orderBy(desc(media.createdAt));
  return <><PageHeading title="Media library" detail={`${assets.length} ${assets.length === 1 ? "asset" : "assets"}`} />
    <MediaLibrary assets={assets} canWrite={permits(user.permissions, "media:write")} canDelete={permits(user.permissions, "media:delete")} /></>;
}
