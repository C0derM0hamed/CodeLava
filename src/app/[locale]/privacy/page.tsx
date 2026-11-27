import { ShieldCheck } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ActionLink } from "@/components/ui/ActionLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { conversionMetadata } from "@/components/sections/forms/page-data";
import { IconTile, PageTop, Panel } from "@/components/sections/forms/page-kit";
import type { AppLocale } from "@/i18n/routing";
import { formatNumber } from "@/lib/i18n-content";
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
  const [settings, sections, tFooter] = await Promise.all([
    getSiteSettings(locale),
    getPageSections("privacy", locale),
    getTranslations({ locale, namespace: "footer" }),
  ]);
  const fallback = privacy[locale];
  const hero = sections.find(({ sectionKey }) => sectionKey === "hero")?.content;
  const policy = policyRows(sections);
  const title = hero?.title || policy[0]?.content.title || fallback.title;
  const email = settings.contact.email?.trim();

  const entries = policy.length
    ? policy.map(({ content, sectionKey }, index) => ({
        id: `policy-${sectionKey}-${index + 1}`,
        number: formatNumber(index + 1, locale, { minimumIntegerDigits: 2, useGrouping: false }),
        heading: content.title && content.title !== title ? content.title : undefined,
        html: renderMarkdown(content.body || content.markdown || content.description || "").html,
        text: undefined as string | undefined,
      }))
    : fallback.sections.map(([heading, text], index) => ({
        id: `policy-section-${index + 1}`,
        number: formatNumber(index + 1, locale, { minimumIntegerDigits: 2, useGrouping: false }),
        heading,
        html: undefined as string | undefined,
        text,
      }));

  const tocEntries = entries.filter((entry) => Boolean(entry.heading));

  return (
    <main id="main-content" className="relative bg-bg text-text">
      <PageTop className="!pb-[var(--section-y)]">
        <div className="space-y-[var(--space-heading)]">
          <SectionHeading
            as="h1"
            size="lg"
            layout="split"
            kicker={hero?.eyebrow || tFooter("legalLabel")}
            title={title}
            lead={hero?.description || fallback.intro}
            animated={false}
          />

          <div className="grid items-start gap-[var(--space-grid-lg)] lg:grid-cols-12">
            {/* Sticky editorial outline & direct privacy contact */}
            <aside className="space-y-5 lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:col-span-4">
              {tocEntries.length > 0 ? (
                <Panel className="rounded-[var(--radius-lg)] !p-6">
                  <p className="mb-4 flex items-center gap-2.5 font-display text-sm font-semibold text-text">
                    <IconTile icon={ShieldCheck} size="sm" />
                    <span>{title}</span>
                  </p>
                  <nav aria-label={title}>
                    <ol className="space-y-1 border-s border-line">
                      {tocEntries.map((entry) => (
                        <li key={entry.id}>
                          <a
                            href={`#${entry.id}`}
                            data-cursor="pointer"
                            className="-ms-px flex items-baseline gap-2.5 rounded-e-[8px] border-s-2 border-transparent py-1.5 ps-4 pe-2 text-sm text-muted transition-[color,border-color,background-color] duration-200 hover:border-accent hover:bg-accent-soft/60 hover:text-text"
                          >
                            <span dir="ltr" className="font-mono text-xs font-semibold text-accent-text tabular-nums">
                              {entry.number}
                            </span>
                            <span className="leading-snug">{entry.heading}</span>
                          </a>
                        </li>
                      ))}
                    </ol>
                  </nav>
                </Panel>
              ) : null}

              <div className="surface-dark relative hidden overflow-hidden rounded-[var(--radius-lg)] border border-line-strong bg-[linear-gradient(150deg,color-mix(in_oklab,var(--lava-500)_12%,var(--ink-900))_0%,var(--ink-900)_65%)] p-6 shadow-card lg:block">
                <span aria-hidden="true" className="lava-seam-hairline pointer-events-none absolute inset-x-6 top-0 h-[1.5px] opacity-80" />
                <p className="kicker-rule">{tFooter("contactHeading")}</p>
                <p className="mt-3 font-display text-base font-semibold text-text">{fallback.sections[4][0]}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{fallback.sections[4][1]}</p>
                <div className="mt-5">
                  {email ? (
                    <ActionLink href={`mailto:${email}`} external variant="inverse" size="sm">
                      <bdi dir="ltr">{email}</bdi>
                    </ActionLink>
                  ) : (
                    <ActionLink href="/contact" variant="inverse" size="sm">
                      {fallback.request}
                    </ActionLink>
                  )}
                </div>
              </div>
            </aside>

            {/* Policy document */}
            <Panel as="article" className="overflow-hidden rounded-[var(--radius-xl)] lg:col-span-8 sm:!p-10 lg:!p-12">
              <span aria-hidden="true" className="lava-seam-hairline pointer-events-none absolute inset-x-10 top-0 h-[2px] opacity-85" />
              <div className="divide-y divide-line">
                {entries.map((entry) => (
                  <section
                    key={entry.id}
                    id={entry.id}
                    className="scroll-mt-[calc(var(--header-h)+2rem)] py-8 first:pt-0 last:pb-0"
                  >
                    {entry.heading ? (
                      <div className="flex items-baseline gap-3.5">
                        <span
                          aria-hidden="true"
                          dir="ltr"
                          className="inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full border border-line-lava/60 bg-accent-soft px-2 font-mono text-xs font-semibold text-accent-text tabular-nums"
                        >
                          {entry.number}
                        </span>
                        <h2 className="text-display-sm text-text">{entry.heading}</h2>
                      </div>
                    ) : null}
                    {entry.html ? (
                      <div className="conversion-prose mt-4 max-w-[66ch]" dangerouslySetInnerHTML={{ __html: entry.html }} />
                    ) : (
                      <p className="mt-4 max-w-[66ch] text-body text-muted">{entry.text}</p>
                    )}
                  </section>
                ))}
              </div>

              <div className="mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-7">
                {email ? (
                  <ActionLink href={`mailto:${email}`} external variant="text" className="w-fit">
                    <bdi dir="ltr">{email}</bdi>
                  </ActionLink>
                ) : (
                  <ActionLink href="/contact" variant="text" className="w-fit">
                    {fallback.request}
                  </ActionLink>
                )}
                <ActionLink href="/contact" variant="secondary" size="sm" arrow="none">
                  {fallback.request}
                </ActionLink>
              </div>
            </Panel>
          </div>
        </div>
      </PageTop>
    </main>
  );
}
