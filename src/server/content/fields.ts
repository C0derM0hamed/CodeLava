import { z } from "zod";

export type Option = { value: string; label: string };
export type Field = {
  key: string;
  label: string;
  type: "text" | "localized" | "markdown" | "boolean" | "number" | "select" | "multi" | "media" |
    "date" | "lines" | "localizedLines" | "group" | "repeat" | "section";
  schema: z.ZodType;
  fields?: Field[];
  choices?: Option[];
  relation?: "projects" | "services" | "technologies" | "project_categories" | "team_members";
  mediaKind?: "image" | "video";
};

const short = (max: number) => z.string().trim().max(max);
export const localized = (max = 500) => z.object({ en: short(max), ar: short(max) });
const requiredLocalized = (max: number) => localized(max).refine((value) => value.en || value.ar, "Enter copy in English or Arabic.");
const field = (key: string, label: string, type: Field["type"], schema: z.ZodType, options?: Partial<Field>): Field => ({
  key, label, type, schema, ...options,
});
export function shape(fields: Field[]) {
  return z.object(Object.fromEntries(fields.map(({ key, schema }) => [key, schema])));
}
export const textField = (key: string, label: string, max = 120, required = false) =>
  field(key, label, "text", required ? short(max).min(1) : short(max).nullable());
export const localField = (key: string, label: string, max = 500, required = false, markdown = false) =>
  field(key, label, markdown ? "markdown" : "localized", required ? requiredLocalized(max) : localized(max));
export const checkField = (key: string, label: string) => field(key, label, "boolean", z.boolean());
export const numberField = (key: string, label: string, min: number, max: number, integer = false) =>
  field(key, label, "number", (integer ? z.int() : z.number()).min(min).max(max).nullable());
export const selectField = (key: string, label: string, values: readonly [string, ...string[]]) =>
  field(key, label, "select", z.enum(values), { choices: values.map((value) => ({ value, label: value.replaceAll("_", " ") })) });
export function relationField(key: string, label: string, relation: NonNullable<Field["relation"]>, multiple = false) {
  return field(key, label, multiple ? "multi" : "select", multiple ? z.array(z.uuid()).max(100) : z.uuid().nullable(), { relation });
}
export const mediaField = (key: string, label: string, mediaKind: Field["mediaKind"] = "image", required = false) =>
  field(key, label, "media", required ? z.uuid() : z.uuid().nullable(), { mediaKind });
export const dateField = (key: string, label: string) =>
  field(key, label, "date", z.iso.date().transform((value) => new Date(value)).nullable());
const lineList = z.array(short(250).min(1)).max(100);
export const linesField = (key: string, label: string) => field(key, label, "lines", lineList);
export const localizedLines = (key: string, label: string) =>
  field(key, label, "localizedLines", z.object({ en: lineList, ar: lineList }));
export const groupField = (key: string, label: string, fields: Field[]) =>
  field(key, label, "group", shape(fields), { fields });
export const repeatField = (key: string, label: string, fields: Field[]) =>
  field(key, label, "repeat", z.array(shape(fields)).max(40), { fields });
export const urlField = (key: string, label: string) =>
  field(key, label, "text", z.url({ protocol: /^https?$/ }).max(2048).nullable());
export const slugify = (value: string) => value.normalize("NFC").toLowerCase().trim()
  .replace(/[^\p{L}\p{N}\p{M}]+/gu, "-").replace(/^-+|-+$/g, "");
export const slugField = (length = 120) => field("slug", "Slug", "text",
  short(length).transform(slugify).refine((value) => value.length > 0, "Enter a slug."));
export const keyField = (key: string, label: string, length: number) =>
  field(key, label, "text", short(length).regex(/^[\p{L}\p{N}][\p{L}\p{N}_.-]*$/u, "Use letters, numbers, dots, hyphens or underscores."));
export const countryField = (key = "country") =>
  field(key, "Country code", "text", short(2).toUpperCase().regex(/^[A-Z]{2}$/).nullable());
export const sectionField = (key: string, label: string, nullable = false) => {
  const schema = z.record(z.string().min(1).max(150), z.json())
    .refine((value) => Object.keys(value).length <= 100 && JSON.stringify(value).length <= 120_000, "Section content is too large.");
  return field(key, label, "section", nullable ? schema.nullable() : schema);
};
export const seoFields = [
  localField("title", "SEO title", 160), localField("description", "SEO description", 400),
  mediaField("ogImageId", "Social sharing image"), urlField("canonical", "Canonical URL"), checkField("noindex", "Hide from search engines"),
];
export const socialFields = ["linkedin", "github", "x", "behance", "dribbble", "website", "upwork", "mostaql"]
  .map((key) => urlField(key, key[0].toUpperCase() + key.slice(1)));
