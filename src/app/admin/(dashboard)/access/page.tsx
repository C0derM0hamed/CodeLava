import { asc, eq } from "drizzle-orm";
import { Label, PageHeading, Panel } from "@/components/admin/ui/frame";
import { DeleteButton, MutationForm } from "@/components/admin/ui/mutation-form";
import { buttonClass, inputClass } from "@/components/admin/ui/styles";
import { db } from "@/db";
import { roles, users } from "@/db/schema";
import { deleteRole, saveRole, saveUser } from "@/server/auth/manage";
import { allPermissions } from "@/server/auth/permissions";
import { requirePermission } from "@/server/auth/session";

type Role = typeof roles.$inferSelect;
type Member = { id: string; name: string; active: boolean; email: string; locale: string; roleId: string; roleName: string };

export default async function AccessPage() {
  const actor = await requirePermission("users:manage");
  const [rolesList, members] = await Promise.all([
    db.select().from(roles).orderBy(asc(roles.name)),
    db.select({ id: users.id, name: users.name, email: users.email, active: users.active, locale: users.locale,
      roleId: users.roleId, roleName: roles.name }).from(users).innerJoin(roles, eq(roles.id, users.roleId)).orderBy(asc(users.email)),
  ]);
  const manageable = rolesList.filter((role) => role.permissions.every((permission) => actor.permissions.includes("*") || actor.permissions.includes(permission)));
  const allowed = allPermissions.filter((permission) => actor.permissions.includes("*") || actor.permissions.includes(permission));
  return <>
    <PageHeading title="Users & roles" />
    <div className="grid items-start gap-4 xl:grid-cols-2">
      <Panel title="Users">
        <div className="grid gap-2">
          <details><summary className={`${buttonClass} cursor-pointer`}>Add user</summary><div className="mt-3"><UserForm roles={manageable} /></div></details>
          {members.map((member) => <details key={member.id} className="rounded border border-line p-3">
            <summary className="cursor-pointer break-all text-sm font-medium">{member.name} <span className="ml-2 text-muted">{member.roleName}{member.active ? "" : " · inactive"}</span></summary>
            <p className="mt-2 break-all text-sm text-muted">{member.email}</p>
            {manageable.some((role) => role.id === member.roleId) && <div className="mt-3"><UserForm member={member} roles={manageable} /></div>}
          </details>)}
        </div>
      </Panel>
      <Panel title="Roles">
        <div className="grid gap-2">
          <details><summary className={`${buttonClass} cursor-pointer`}>Add custom role</summary><div className="mt-3"><RoleForm permissions={allowed} /></div></details>
          {rolesList.map((role) => <details key={role.id} className="rounded border border-line p-3">
            <summary className="cursor-pointer text-sm font-medium">{role.name} <span className="ml-2 text-muted">{role.system ? "System role" : role.key}</span></summary>
            <div className="mt-3 grid gap-3">
              {role.system || !manageable.some((item) => item.id === role.id)
                ? <p className="break-words font-mono text-xs leading-relaxed text-muted">{role.permissions.includes("*") ? "All permissions" : role.permissions.join(", ") || "No permissions"}</p>
                : <><RoleForm role={role} permissions={allowed} /><div><DeleteButton item="role" action={deleteRole.bind(null, role.id)} /></div></>}
            </div>
          </details>)}
        </div>
      </Panel>
    </div>
  </>;
}

function UserForm({ member, roles }: { member?: Member; roles: Role[] }) {
  const id = member?.id ?? null;
  return <MutationForm success={id ? "User updated." : "User created."} label={id ? "Save user" : "Create user"} action={async (form) => {
    "use server";
    return saveUser({ id, name: form.get("name"), email: form.get("email"), password: form.get("password"),
      roleId: form.get("roleId"), locale: form.get("locale"), active: form.get("active") === "on" });
  }}>
    <Label title="Name"><input className={inputClass} name="name" defaultValue={member?.name} maxLength={120} required /></Label>
    <Label title="Email address"><input className={inputClass} name="email" type="email" defaultValue={member?.email} required /></Label>
    <Label title={member ? "New password (optional)" : "Initial password"}><input name="password" type="password" autoComplete="new-password" className={inputClass} minLength={12} required={!member} /></Label>
    <div className="grid grid-cols-2 gap-2">
      <Label title="Role"><select className={inputClass} name="roleId" defaultValue={member?.roleId ?? roles.find((role) => role.key === "viewer")?.id} required>
        {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
      </select></Label>
      <Label title="Locale"><select className={inputClass} name="locale" defaultValue={member?.locale ?? "en"}><option value="en">English</option><option value="ar">Arabic</option></select></Label>
    </div>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={member?.active ?? true} className="size-4 accent-accent" /> Active account</label>
  </MutationForm>;
}

function RoleForm({ role, permissions }: { role?: Role; permissions: string[] }) {
  const id = role?.id ?? null;
  return <MutationForm success={id ? "Role updated." : "Role created."} label={id ? "Save role" : "Create role"} action={async (form) => {
    "use server";
    return saveRole({ id, name: form.get("name"), key: form.get("key"), permissions: form.getAll("permission") });
  }}>
    <Label title="Role name"><input className={inputClass} name="name" defaultValue={role?.name} maxLength={96} required /></Label>
    <Label title="Role key"><input className={inputClass} name="key" defaultValue={role?.key} pattern="[a-z][a-z0-9\-]{1,47}" required /></Label>
    <fieldset className="grid max-h-48 gap-1 overflow-y-auto rounded border border-line p-2">
      <legend className="px-1 text-sm">Permissions</legend>
      {permissions.map((permission) => <label key={permission} className="flex items-center gap-2 font-mono text-xs">
        <input type="checkbox" className="size-4 accent-accent" name="permission" value={permission} defaultChecked={role?.permissions.includes(permission)} />{permission}
      </label>)}
    </fieldset>
  </MutationForm>;
}
