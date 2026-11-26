import "server-only";
import { eq, getTableColumns } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import english from "@/i18n/messages/en.json";
import arabic from "@/i18n/messages/ar.json";
import { db } from "@/db";
import { catalog, contentTitle, type Entity } from "./catalog";

export function keyColumn(entity: Entity) {
  return getTableColumns(catalog[entity].table)[catalog[entity].key ?? "id"] as PgColumn;
}

export function listContent(entity: Entity) {
  return db.select().from(catalog[entity].table) as Promise<Record<string, unknown>[]>;
}

export async function readContent(entity: Entity, key: string) {
  const [row] = await db.select().from(catalog[entity].table).where(eq(keyColumn(entity), key)) as Record<string, unknown>[];
  return row;
}

export function contentId(entity: Entity, row: Record<string, unknown>) {
  return String(row[catalog[entity].key ?? "id"]);
}

export function orderContent(a: Record<string, unknown>, b: Record<string, unknown>) {
  return Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0) || String(a.id).localeCompare(String(b.id));
}

export function groupContent(entity: Entity, row: Record<string, unknown>) {
  const group = catalog[entity].groupBy;
  return group ? String(row[group]) : "";
}

export async function contentOptions(entity: Entity) {
  return (await listContent(entity)).map((row) => ({
    value: contentId(entity, row), label: contentTitle(row[catalog[entity].title]) || contentId(entity, row),
  })).sort((a, b) => a.label.localeCompare(b.label));
}

export function defaultTranslations() {
  function flatten(value: unknown) {
    const output: Record<string, string> = {};
    function visit(item: unknown, prefix: string) {
      if (typeof item === "string") output[prefix] = item;
      else if (item && typeof item === "object" && !Array.isArray(item)) {
        for (const [key, child] of Object.entries(item)) visit(child, prefix ? `${prefix}.${key}` : key);
      }
    }
    visit(value, "");
    return output;
  }
  return { en: flatten(english), ar: flatten(arabic) };
}
