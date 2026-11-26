import { asc, desc, eq } from "drizzle-orm";
import { ArrowLeft, ExternalLink, Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ContentEditor } from "@/components/admin/content-editor";
import { type FormField } from "@/components/admin/content-fields";
import { ContentOrder } from "@/components/admin/content-order";
import { Empty, Badge, Label, PageHeading } from "@/components/admin/ui/frame";
import { DeleteButton } from "@/components/admin/ui/mutation-form";
import { buttonClass, cellClass, inputClass, linkClass, paneClass, primaryClass, rowClass } from "@/components/admin/ui/styles";
import { sectionRegistry } from "@/content/sections";
import { db } from "@/db";
import { media, projectMedia, projectServices, projectTechnologies } from "@/db/schema";
import { canPreviewSite, permits } from "@/server/auth/permissions";
import { requirePermission, type CurrentUser } from "@/server/auth/session";
import { deleteContent } from "@/server/content/actions";
import { catalog, contentTitle, isEntity, type Entity } from "@/server/content/catalog";
import { contentId, contentOptions, defaultTranslations, groupContent, listContent, orderContent, readContent } from "@/server/content/data";
import { type Field } from "@/server/content/fields";
import { createPreviewLink, safePreviewPath } from "@/server/content/preview";

const basePath = (entity: Entity) => `/admin/content/${entity}`;
const href = (entity: Entity, id: string) => `${basePath(entity)}/${encodeURIComponent(id)}`;
const defaultStatus = (row: Record<string, unknown>) => String(row.status ?? (row.visible !== undefined ? row.visible ? "visible" : "hidden" : ""));

type Search = Record<string, string | string[] | undefined>;

export default async function ContentPage({ params, searchParams }: {
  params: Promise<{ entity: string; record?: string[] }>; searchParams: Promise<Search>;
}) {
  const { entity, record = [] } = await params;
  if (!isEntity(entity) || record.length > 1) notFound();
  const user = await requirePermission(`${entity}:read`);
  if (!record.length) return <ContentList entity={entity} user={user} search={await searchParams} />;
  const create = record[0] === "new";
  return <Edit entity={entity} user={user} id={create ? null : record[0]} />;
}

async function ContentList({ entity, user, search }: { entity: Entity; user: CurrentUser; search: Search }) {
  const config = catalog[entity];
  const stored = await listContent(entity);
  const rows = [...stored];
  const translations = entity === "ui_translations" ? defaultTranslations() : undefined;
  if (translations) {
    const keys = new Set(stored.map((row) => row.key));
    for (const key of Object.keys(translations.en)) if (!keys.has(key)) rows.push({ key });
  }
  const single = (key: string) => typeof search[key] === "string" ? search[key] : "";
  const query = single("q").trim().toLowerCase();
  const group = single("group");
  const filter = single("status");
  const sort = single("sort");
  const byFacet = single("facet");
  const facets: Partial<Record<Entity, { key: string; label: string }>> = {
    projects: { key: "categoryId", label: "Category" }, faqs: { key: "category", label: "Category" },
    technologies: { key: "category", label: "Category" }, testimonials: { key: "source", label: "Source" },
    articles: { key: "tags", label: "Tag" },
  };
  const facet = facets[entity];
  function facetValues(row: Record<string, unknown>) {
    const value = facet && row[facet.key];
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string")
      : typeof value === "string" && value ? [value] : [];
  }
  const facetOptions = entity === "projects" && permits(user.permissions, "project_categories:read") ? await contentOptions("project_categories")
    : [...new Set(rows.flatMap(facetValues))].sort().map((value) => ({ value, label: value }));
  const rawPage = z.coerce.number().int().positive().max(10000).safeParse(single("page"));
  const page = rawPage.data ?? 1;
  const title = (row: Record<string, unknown>) => contentTitle(row[config.title]);
  const groups = [...new Set(rows.map((row) => groupContent(entity, row)).filter(Boolean))].sort();
  const statuses = [...new Set(rows.map(defaultStatus).filter(Boolean))].sort();
  const matched = rows.filter((row) => {
    const key = contentId(entity, row);
    const copy = translations ? [row.en, row.ar, translations.en[key], translations.ar[key]] : [];
    const localized = row[config.title];
    const name = typeof localized === "object" && localized && "en" in localized && "ar" in localized ? [localized.en, localized.ar] : [title(row)];
    return (!group || groupContent(entity, row) === group) && (!filter || defaultStatus(row) === filter) &&
      (!byFacet || facetValues(row).includes(byFacet)) && (!query || [key, ...name, row.slug, ...copy].some((value) => String(value ?? "").toLowerCase().includes(query)));
  }).sort((a, b) => sort === "name" || (!config.ordered && sort !== "updated") ? title(a).localeCompare(title(b))
    : sort === "updated" ? Number(b.updatedAt ?? 0) - Number(a.updatedAt ?? 0) : groupContent(entity, a).localeCompare(groupContent(entity, b)) || orderContent(a, b));
  const pageSize = 35;
  const shown = matched.slice((page - 1) * pageSize, page * pageSize);
  const canWrite = permits(user.permissions, `${entity}:write`);
  const canReorder = config.ordered && canWrite && permits(user.permissions, `${entity}:publish`);
  const partitions = config.groupBy ? (group ? [group] : groups) : [""];
  const more = (value: number) => `?${new URLSearchParams({ q: single("q"), sort, status: filter, group, facet: byFacet, page: String(value) })}`;

  return <>
    <PageHeading title={config.label} detail={`${matched.length} ${matched.length === 1 ? "record" : "records"}`}
      actions={canWrite && <Link href={href(entity, "new")} className={primaryClass}><Plus size={16} aria-hidden /> New record</Link>} />
    <form className="mb-4 flex flex-wrap items-end gap-2">
      <Label title="Search"><input className={inputClass} name="q" type="search" defaultValue={single("q")} placeholder={`Search ${config.label.toLowerCase()}`} /></Label>
      {statuses.length > 0 && <Label title="Status"><select className={inputClass} name="status" defaultValue={filter}>
        <option value="">All statuses</option>{statuses.map((status) => <option key={status}>{status}</option>)}
      </select></Label>}
      {groups.length > 0 && <Label title="Page"><select className={inputClass} name="group" defaultValue={group}>
        <option value="">All pages</option>{groups.map((item) => <option key={item}>{item}</option>)}
      </select></Label>}
      {facet && facetOptions.length > 0 && <Label title={facet.label}><select className={inputClass} name="facet" defaultValue={byFacet}>
        <option value="">All</option>{facetOptions.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
      </select></Label>}
      <Label title="Sort by"><select className={inputClass} name="sort" defaultValue={sort}>
        {config.ordered && <option value="">Display order</option>}<option value="name">Name</option><option value="updated">Last updated</option>
      </select></Label>
      <button className={buttonClass}>Apply filters</button>
    </form>
    {shown.length ? <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-card">
      <table className="w-full text-start text-sm">
        <thead className="bg-surface-2 text-start text-xs text-muted"><tr>
          <th scope="col" className={`${cellClass} text-start`}>{translations ? "Key" : "Name"}</th>
          {translations ? <><th scope="col" className={`${cellClass} text-start`}>English</th><th scope="col" className={`${cellClass} text-start`}>Arabic</th></>
            : <><th scope="col" className={`${cellClass} text-start`}>{config.groupBy ? "Page" : "Status"}</th>
              <th scope="col" className={`${cellClass} text-start whitespace-nowrap`}>Updated</th></>}
        </tr></thead>
        <tbody>{shown.map((row) => {
          const id = contentId(entity, row);
          return <tr className={rowClass} key={id}>
            <td className={cellClass}><Link className={linkClass} href={href(entity, id)}>{title(row) || id}</Link></td>
            {translations ? <>
              <td className={`${cellClass} max-w-56 truncate`}>{String(row.en ?? translations.en[id] ?? "—")}</td>
              <td dir="rtl" lang="ar" className={`${cellClass} max-w-56 truncate`}>{String(row.ar ?? translations.ar[id] ?? "—")}</td>
            </> : <>
              <td className={cellClass}>{(groupContent(entity, row) || defaultStatus(row)) ? <Badge>{groupContent(entity, row) || defaultStatus(row)}</Badge> : "—"}</td>
              <td className={`${cellClass} whitespace-nowrap text-muted`}>{row.updatedAt instanceof Date ? row.updatedAt.toISOString().slice(0, 10) : "—"}</td>
            </>}
          </tr>;
        })}</tbody>
      </table>
    </div> : <Empty>{query || filter || group || byFacet ? "No records match these filters." : "No records yet."}</Empty>}
    {(page > 1 || matched.length > page * pageSize) && <div className="mt-4 flex gap-2 text-sm">
      {page > 1 && <Link className={buttonClass} href={more(page - 1)}>Previous page</Link>}
      {matched.length > page * pageSize && <Link className={buttonClass} href={more(page + 1)}>Next page</Link>}
    </div>}
    {canReorder && !query && !filter && !sort && !byFacet && <div className="mt-5 grid gap-4">
      {partitions.map((partition) => {
        const items = rows.filter((row) => groupContent(entity, row) === partition).sort(orderContent).map((row) => {
          const id = contentId(entity, row);
          return { id, label: title(row) || id, href: href(entity, id) };
        });
        return items.length > 1 && <div className={paneClass} key={partition}><ContentOrder entity={entity} group={partition} items={items} /></div>;
      })}
    </div>}
  </>;
}

async function Edit({ entity, user, id }: { entity: Entity; user: CurrentUser; id: string | null }) {
  const config = catalog[entity];
  const canWrite = permits(user.permissions, `${entity}:write`);
  const canPublish = permits(user.permissions, `${entity}:publish`);
  if (id === null && !canWrite) notFound();
  if (id && !config.key && !z.uuid().safeParse(id).success) notFound();
  const stored = id ? await readContent(entity, id) : undefined;
  const translationDefaults = id && entity === "ui_translations" ? defaultTranslations() : null;
  const defaultStrings = translationDefaults && id ? [translationDefaults.en[id], translationDefaults.ar[id]] : null;
  if (id && !stored && !defaultStrings?.some((copy) => copy !== undefined)) notFound();
  const record = stored ?? (id && config.key ? { [config.key]: id } : {});
  async function clientFields(fields: Field[]): Promise<FormField[]> {
    return Promise.all(fields.map(async ({ schema: _schema, fields, relation, ...field }) => {
      void _schema;
      return { ...field, relation, fields: fields ? await clientFields(fields) : undefined,
        choices: relation ? permits(user.permissions, `${relation}:read`) ? await contentOptions(relation) : [] : field.choices };
    }));
  }
  const [fields, assets, gallery, linkedTechnologies, linkedServices] = await Promise.all([
    clientFields(config.fields),
    permits(user.permissions, "media:read") ? db.select({ id: media.id, url: media.url, name: media.originalName, kind: media.kind, folder: media.folder }).from(media).orderBy(desc(media.createdAt)) : [],
    id && entity === "projects" ? db.select().from(projectMedia).where(eq(projectMedia.projectId, id)).orderBy(asc(projectMedia.sortOrder)) : [],
    id && entity === "projects" ? db.select().from(projectTechnologies).where(eq(projectTechnologies.projectId, id)) : [],
    id && entity === "projects" ? db.select().from(projectServices).where(eq(projectServices.projectId, id)) : [],
  ]);
  if (entity === "projects") {
    record.technologyIds = linkedTechnologies.map((row) => row.technologyId);
    record.serviceIds = linkedServices.map((row) => row.serviceId);
  }
  if (defaultStrings) {
    const en = fields.find((field) => field.key === "en");
    const ar = fields.find((field) => field.key === "ar");
    if (en) en.label = "English override";
    if (ar) ar.label = "Arabic override";
  }
  let sectionLabels: Record<string, string> | undefined;
  if (entity === "page_sections") {
    const pages = sectionRegistry[String(record.pageKey) as keyof typeof sectionRegistry];
    const found = pages?.[String(record.sectionKey) as keyof typeof pages];
    if (found) sectionLabels = Object.fromEntries(Object.entries((found as { fields: Record<string, { label: string }> }).fields).map(([key, field]) => [key, field.label]));
  }
  let publicPath = config.publicPath;
  if (entity === "page_sections" || entity === "page_meta") publicPath = String(record.pageKey ?? "");
  publicPath = publicPath?.replace("{slug}", String(record.slug ?? "{slug}"));
  if (publicPath === "home") publicPath = "";
  if (publicPath === "portfolio") publicPath = "work";
  const paths = stored && canPreviewSite(user.permissions) && publicPath !== undefined ? ["en", "ar"].map((locale) => safePreviewPath(`/${locale}${publicPath ? "/" + publicPath : ""}`)) : [];
  return <>
    <Link href={basePath(entity)} className={`${linkClass} mb-4 inline-flex items-center gap-2 text-sm`}><ArrowLeft size={16} aria-hidden /> {config.label}</Link>
    <PageHeading title={id ? contentTitle(record[config.title]) || id : `New record · ${config.label}`}
      actions={<div className="flex flex-wrap gap-2">
        {paths.map((path, index) => path && <a key={path} href={createPreviewLink(user.id, path)} target="_blank" rel="noreferrer" className={buttonClass}>
          Preview {index === 0 ? "EN" : "AR"} <ExternalLink size={14} aria-hidden />
        </a>)}
        {stored && id && permits(user.permissions, `${entity}:delete`) && <DeleteButton item="record" action={deleteContent.bind(null, entity, id)} onDeleted={basePath(entity)} />}
      </div>} />
    {defaultStrings && <div className={`${paneClass} mb-5 grid gap-3 text-sm sm:grid-cols-2`}>
      <div><h2 className="text-muted">English default</h2><p>{defaultStrings[0] ?? "—"}</p></div>
      <div><h2 className="text-muted">Arabic default</h2><p lang="ar" dir="rtl">{defaultStrings[1] ?? "—"}</p></div>
    </div>}
    <ContentEditor entity={entity} id={stored ? id : null} titleKey={config.title} fields={fields} record={record}
      assets={assets} initialGallery={gallery} sectionLabels={sectionLabels} canWrite={canWrite} canPublish={canPublish}
      fixedKey={id ? config.key : undefined} />
  </>;
}
