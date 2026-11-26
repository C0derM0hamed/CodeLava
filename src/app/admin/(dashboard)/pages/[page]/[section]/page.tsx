import { notFound } from "next/navigation";
import { PageCopyEditor } from "@/components/admin/page-builder";
import { Badge, Empty, PageHeading } from "@/components/admin/ui/frame";
import { sectionRegistry } from "@/content/sections";
import { canPreviewSite, permits } from "@/server/auth/permissions";
import { requirePermission } from "@/server/auth/session";
import { editableCopy, pageKeySchema, readPageBuilder, sectionKeySchema } from "@/server/content/page-builder";
import { DraftLinks } from "../../preview-links";

export default async function SectionEditorRoute({ params }: { params: Promise<{ page: string; section: string }> }) {
  const user = await requirePermission("page_sections:read");
  const requested = await params;
  const page = pageKeySchema.safeParse(requested.page).data;
  const section = sectionKeySchema.safeParse(requested.section).data;
  if (!page || !section) notFound();
  const { sections, version } = await readPageBuilder(page);
  const item = sections.find(({ key }) => key === section);
  if (!item) notFound();
  const initial = editableCopy(item.defaults, item.row?.content, item.row?.draftContent ?? undefined);
  const registry = sectionRegistry[page] as Record<string, { fields: Record<string, { label: string }> }>;
  const labels = Object.hasOwn(registry, section) ? registry[section].fields : {};
  const fields = Object.keys(initial).map((key) => ({ key, label: labels[key]?.label ?? key, type: "localized" as const }));
  return <>
    <PageHeading title={item.label} detail="Edit the English and Arabic copy together. Publish saved drafts from the page builder."
      actions={item.row?.draftContent != null && <Badge>Copy draft</Badge>} />
    {fields.length ? <PageCopyEditor key={version} page={page} section={section} version={version} fields={fields} initial={initial}
      canWrite={permits(user.permissions, "page_sections:write")} previews={canPreviewSite(user.permissions) && <DraftLinks page={page} userId={user.id} />} />
      : <Empty>This section has no localized copy fields.</Empty>}
  </>;
}
