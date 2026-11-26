import { setRequestLocale } from "next-intl/server";
import { ActionLink } from "@/components/ui/ActionLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { conversionMetadata } from "@/components/sections/forms/page-data";
import { LavaDivider } from "@/experience/fx/LavaDivider";
import type { AppLocale } from "@/i18n/routing";
import { renderMarkdown } from "@/lib/markdown";
import { getPageSections, getSiteSettings, type PageSection } from "@/server/queries";
import { privacy } from "./content";
import "@/components/sections/forms/conversion.css";
import "@/components/sections/services/services.css";

type Props = { params: Promise<{ locale: AppLocale }> };

function policyRows(sections: PageSection[]) {
  return sections.filter(({ content, sectionKey }) =>
    (content.body ?? content.markdown ?? (sectionKey !== "hero" ? content.description : undefined))?.trim());
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const sections = await getPageSections("privacy", locale);
  const hero = sections.find(({ sectionKey }) => sectionKey === "hero")?.content;
  const policy = policyRows(sections)[0]?.content;
  return conversionMetadata(locale, "privacy", hero?.title || policy?.title || privacy[locale].title, hero?.description || privacy[locale].intro);
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [settings, sections] = await Promise.all([getSiteSettings(locale), getPageSections("privacy", locale)]);
  const fallback = privacy[locale];
  const hero = sections.find(({ sectionKey }) => sectionKey === "hero")?.content;
  const policy = policyRows(sections);
  const title = hero?.title || policy[0]?.content.title || fallback.title;
  const email = settings.contact.email?.trim();

  return (
    <main id="main-content" className="conversion-frame">
      <div className="conversion-container">
        <article className="privacy-policy">
          <SectionHeading as="h1" title={title} lead={hero?.description || fallback.intro} size="lg" animated={false} />
          <LavaDivider variant="seam" />
          {policy.length ? policy.map(({ content, sectionKey }) => <section key={sectionKey}>
            {content.title && content.title !== title ? <h2 className="text-display-sm">{content.title}</h2> : null}
            <div className="conversion-prose" dangerouslySetInnerHTML={{
              __html: renderMarkdown(content.body || content.markdown || content.description || "").html,
            }} />
          </section>) : fallback.sections.map(([heading, text]) => (
            <section key={heading}>
              <h2 className="text-display-sm">{heading}</h2>
              <p className="mt-2 text-muted">{text}</p>
            </section>
          ))}
          {email ? <ActionLink href={`mailto:${email}`} external className="w-fit"><bdi>{email}</bdi></ActionLink> :
            <ActionLink href="/contact" className="w-fit">{fallback.request}</ActionLink>}
        </article>
      </div>
    </main>
  );
}
