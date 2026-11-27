import Link from "next/link";
import { notFound } from "next/navigation";
import { PageBuilder } from "@/components/admin/page-builder";
import { PageHeading } from "@/components/admin/ui/frame";
import { buttonClass } from "@/components/admin/ui/styles";
import { sectionRegistry } from "@/content/sections";
import { canPreviewSite, permits } from "@/server/auth/permissions";
import { requirePermission } from "@/server/auth/session";
import { pageKeySchema, readPageBuilder } from "@/server/content/page-builder";
import { DraftLinks } from "../preview-links";

export default async function PageBuilderRoute({ params }: { params: Promise<{ page: string }> }) {
  const user = await requirePermission("page_sections:read");
  const page = pageKeySchema.safeParse((await params).page).data;
  if (!page) notFound();
  const { sections, layout, version, hasLayoutDraft } = await readPageBuilder(page);
  const canWrite = permits(user.permissions, "page_sections:write");

  return <>
    <PageHeading title={page === "home" ? "Homepage builder" : `${page[0].toUpperCase()}${page.slice(1)} page builder`}
      detail={page === "home" ? "Arrange sections, choose what visitors see, and review drafts before publishing."
        : "Edit bilingual copy and review drafts before publishing."} />
    <nav aria-label="Page builders" className="mb-4 flex flex-wrap gap-2">
      {Object.keys(sectionRegistry).map((key) => <Link key={key} href={`/admin/pages/${key}`} aria-current={page === key ? "page" : undefined}
        className={`${buttonClass} capitalize ${page === key ? "border-accent-text! bg-accent-soft! font-semibold text-accent-text!" : ""}`}>{key === "home" ? "Homepage" : key}</Link>)}
    </nav>
    <PageBuilder key={version} page={page} sections={sections.map(({ key, label, row, visible }) =>
      ({ key, label, draft: row?.draftContent != null, liveVisible: visible }))}
      initial={layout} version={version} hasLayoutDraft={hasLayoutDraft}
      canWrite={canWrite} canPublish={canWrite && permits(user.permissions, "page_sections:publish")}
      previews={canPreviewSite(user.permissions) && <DraftLinks page={page} userId={user.id} />} />
  </>;
}
