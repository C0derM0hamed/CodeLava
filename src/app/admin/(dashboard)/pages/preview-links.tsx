import { ExternalLink } from "lucide-react";
import type { SectionPageKey } from "@/content/sections";
import { buttonClass } from "@/components/admin/ui/styles";
import { createPreviewLink } from "@/server/content/preview";

export function DraftLinks({ page, userId }: { page: SectionPageKey; userId: string }) {
  return (["en", "ar"] as const).map((locale) => <a key={locale} className={buttonClass} target="_blank" rel="noreferrer"
    href={createPreviewLink(userId, `/${locale}${page === "home" ? "" : `/${page}`}`)}>
    Preview draft {locale.toUpperCase()} <ExternalLink size={14} aria-hidden />
  </a>);
}
