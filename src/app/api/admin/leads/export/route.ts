import { db } from "@/db";
import { permits } from "@/server/auth/permissions";
import { getCurrentUser } from "@/server/auth/session";
import { recordChange } from "@/server/changes";
import { listLeads, parseLeadFilters } from "@/server/leads/admin-data";

function cell(value: unknown) {
  const text = String(value ?? "");
  const formula = /^[\s\uFEFF]*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text);
  return `"${(formula ? "'" + text : text).replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response(null, { status: 401 });
  if (!permits(user.permissions, "leads:read")) return new Response(null, { status: 403 });
  const filters = parseLeadFilters(Object.fromEntries(new URL(request.url).searchParams));
  const rows = await listLeads(filters, 10001);
  if (rows.length > 10000) return new Response("Filter this export to 10,000 leads or fewer.", { status: 422 });
  await db.transaction((tx) => recordChange(tx, { userId: user.id, entity: "leads", action: "export",
    meta: { count: rows.length } }));
  const csv = [
    ["ID", "Received at", "Type", "Status", "Name", "Email", "Phone", "Company", "Country", "Budget", "Currency", "Timeline", "Message", "Services", "Assigned to"],
    ...rows.map((row) => [row.id, row.createdAt.toISOString(), row.type, row.status, row.name, row.email, row.phone, row.company, row.country,
      row.budget, row.currency, row.timeline, row.message, row.serviceIds.join(" "), row.assignedTo]),
  ].map((row) => row.map(cell).join(",")).join("\r\n");
  return new Response("\ufeff" + csv, { headers: {
    "Content-Type": "text/csv; charset=utf-8", "Cache-Control": "private, no-store",
    "Content-Disposition": 'attachment; filename="codelava-leads.csv"',
  } });
}
