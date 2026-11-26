import { ArrowUpRight, Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ActionLink } from "@/components/ui/ActionLink";
import { Tag } from "@/components/ui/Tag";
import type { AppLocale } from "@/i18n/routing";
import type { Service, ServiceDetail, Technology } from "@/server/queries/types";

const accentTokens: Record<string, string> = {
  lava: "var(--lava-400)", blue: "var(--syntax-blue)", cyan: "var(--syntax-cyan)",
  green: "var(--syntax-green)", yellow: "var(--syntax-yellow)",
};

export function serviceAccent(accent: string | null) {
  return accentTokens[accent ?? ""] ?? accentTokens.lava;
}

// The technology catalog currently relates to projects. These categories are examples for the seeded disciplines.
const disciplines: Record<string, string[]> = {
  "custom-web-platforms": ["frontend", "backend", "database"],
  "mobile-apps": ["mobile"],
  "ai-solutions-automation": ["ai"],
  "product-design": ["design"],
  "ecommerce": ["frontend", "database"],
  "cloud-devops": ["cloud"],
};

export async function ServiceRows({ services, technologies, locale }: {
  services: { summary: Service; detail: ServiceDetail | null }[]; technologies: Technology[]; locale: AppLocale;
}) {
  const t = await getTranslations({ locale, namespace: "services" });
  return <ol className="service-index">
    {services.map(({ summary, detail }, index) => {
      const related = technologies.filter(({ category }) => disciplines[summary.slug]?.includes(category)).slice(0, 5);
      return (
        <li key={summary.id} className="service-index-item" style={{ "--service-accent": serviceAccent(summary.accent) } as React.CSSProperties}>
          <details>
            <summary>
              <span dir="ltr" aria-hidden="true" className="service-index-number">/{String(index + 1).padStart(2, "0")}</span>
              <span className="service-index-heading">
                <span className="service-index-title">{summary.title}</span>
                <span className="service-index-tagline">{summary.tagline || summary.summary}</span>
              </span>
              <span className="service-index-toggle" aria-hidden="true"><Plus size={20} strokeWidth={1.4} /></span>
            </summary>
            <div className="service-index-detail">
              {summary.summary && summary.tagline ? <p className="max-w-prose text-muted">{summary.summary}</p> : null}
              {detail?.deliverables.length ? <div>
                <h3 className="mb-2 font-display text-lg">{t("deliverables")}</h3>
                <ul className="list-disc ps-5 text-muted">{detail.deliverables.map((value, i) => <li key={i}>{value}</li>)}</ul>
              </div> : null}
              {related.length ? <ul className="flex flex-wrap gap-2" aria-label={locale === "en" ? "Relevant technologies" : "تقنيات ذات صلة"}>
                {related.map(({ name, slug }) => <li key={slug}><Tag tone="outline">{name}</Tag></li>)}
              </ul> : null}
              <ActionLink href={`/services/${summary.slug}`} size="sm" className="w-fit">{t("viewService")}</ActionLink>
            </div>
          </details>
          <ActionLink className="service-index-link" href={`/services/${summary.slug}`} size="sm" arrow="none"
            aria-label={`${t("viewService")} · ${summary.title}`}><ArrowUpRight size={22} aria-hidden="true" className="rtl:-scale-x-100" /></ActionLink>
        </li>
      );
    })}
  </ol>;
}
