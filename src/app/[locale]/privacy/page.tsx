import { setRequestLocale } from "next-intl/server";
import { ActionLink } from "@/components/ui/ActionLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { conversionMetadata } from "@/components/sections/forms/page-data";
import { PageTop, Panel } from "@/components/sections/forms/page-kit";
import type { AppLocale } from "@/i18n/routing";
import { renderMarkdown } from "@/lib/markdown";
import { getPageSections, getSiteSettings, type PageSection } from "@/server/queries";
import { privacy } from "./content";
import "@/components/sections/forms/conversion.css";

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
    <main id="main-content" className="relative bg-bg text-text">
      <PageTop className="!pb-20 sm:!pb-28">
        <div className="mx-auto grid max-w-[52rem] gap-10 sm:gap-12">
          <SectionHeading as="h1" size="lg" layout="intro" kicker={hero?.eyebrow} title={title}
            lead={hero?.description || fallback.intro} animated={false} />
          <Panel as="article" className="grid gap-9 sm:!p-12">
            {policy.length ? policy.map(({ content, sectionKey }) => <section key={sectionKey}>
              {content.title && content.title !== title ? <h2 className="text-display-sm">{content.title}</h2> : null}
              <div className="conversion-prose mt-3" dangerouslySetInnerHTML={{
                __html: renderMarkdown(content.body || content.markdown || content.description || "").html,
              }} />
            </section>) : fallback.sections.map(([heading, text]) => (
              <section key={heading}>
                <h2 className="text-display-sm">{heading}</h2>
                <p className="mt-3 leading-relaxed text-muted">{text}</p>
              </section>
            ))}
            <div className="border-t border-line pt-7">
              {email ? <ActionLink href={`mailto:${email}`} external variant="text" className="w-fit"><bdi>{email}</bdi></ActionLink> :
                <ActionLink href="/contact" variant="text" className="w-fit">{fallback.request}</ActionLink>}
            </div>
          </Panel>
        </div>
      </PageTop>
    </main>
  );
}
