import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

export type TocEntry = { id: string; text: string; level: number };
export type RenderedMarkdown = { html: string; toc: TocEntry[] };

export function renderMarkdown(markdown: string): RenderedMarkdown {
  const toc: TocEntry[] = [];
  const ids = new Set<string>();
  const renderer = new marked.Renderer();

  renderer.heading = function ({ tokens, depth }) {
    const inline = this.parser.parseInline(tokens);
    const text = sanitizeHtml(inline, { allowedTags: [], allowedAttributes: {} })
      .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
    const slug = text.normalize("NFC").toLowerCase()
      .replace(/[^\p{L}\p{N}\p{M}]+/gu, "-").replace(/^-+|-+$/g, "");
    const base = `heading-${slug || "section"}`;
    let id = base;
    for (let suffix = 2; ids.has(id); suffix++) id = `${base}-${suffix}`;
    ids.add(id);
    toc.push({ id, text, level: depth });
    return `<h${depth} id="${id}">${inline}</h${depth}>\n`;
  };

  // Render raw HTML as plain text, keeping all generated heading IDs under our control.
  renderer.html = ({ text }) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const html = sanitizeHtml(marked.parse(markdown, { async: false, renderer }), {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img", "del"],
    allowedAttributes: {
      a: ["href", "title"],
      img: ["src", "alt", "title"],
      ...Object.fromEntries([1, 2, 3, 4, 5, 6].map((level) => [`h${level}`, ["id"]])),
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowProtocolRelative: false,
  });
  return { html, toc };
}
