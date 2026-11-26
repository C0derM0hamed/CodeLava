export const contentEntities = [
  "services", "projects", "project_categories", "technologies", "testimonials", "client_logos",
  "achievements", "team_members", "process_steps", "faqs", "articles", "page_sections", "page_meta", "ui_translations",
] as const;
const entities = [...contentEntities, "media"] as const;
const verbs = ["read", "write", "publish", "delete"] as const;
export type Permission = `${typeof entities[number]}:${typeof verbs[number]}` |
  "users:manage" | "settings:manage" | "leads:read" | "leads:write" | "audit:read";

export const allPermissions: Permission[] = [
  ...entities.flatMap((entity) => verbs.map((verb): Permission => `${entity}:${verb}`)),
  "users:manage", "settings:manage", "leads:read", "leads:write", "audit:read",
];
const readers = entities.map((entity): Permission => `${entity}:read`);

export const systemRoles = [
  { key: "owner", name: "Owner", permissions: ["*"] },
  { key: "admin", name: "Admin", permissions: allPermissions },
  { key: "editor", name: "Editor", permissions: [
    ...readers, ...contentEntities.flatMap((entity) => [`${entity}:write`, `${entity}:publish`]), "media:write",
  ] },
  { key: "sales", name: "Sales", permissions: [...readers, "leads:read", "leads:write"] },
  { key: "viewer", name: "Viewer", permissions: readers },
];

export function permits(permissions: readonly string[], permission: Permission) {
  return permissions.includes("*") || permissions.includes(permission);
}

/** Draft Mode is site-wide. A preview session must be able to read every content type. */
export function canPreviewSite(permissions: readonly string[]) {
  return contentEntities.every((entity) => permits(permissions, `${entity}:read`));
}
