import { headers } from "next/headers";
import { readNativeLead } from "@/components/sections/forms/native";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageTop, Panel, ReassuranceList } from "@/components/sections/forms/page-kit";
import { QuoteForm } from "@/components/sections/forms/QuoteForm";
import { campaignQuery, conversionMetadata, formOpenedAt, type SearchParams } from "@/components/sections/forms/page-data";
import type { AppLocale } from "@/i18n/routing";
import { countryName } from "@/lib/i18n-content";
import { getPageSections, getServices } from "@/server/queries";

type Props = { params: Promise<{ locale: AppLocale }>; searchParams: Promise<SearchParams> };

// ISO 3166-1 alpha-2. Intl.DisplayNames localizes the entries but cannot enumerate them.
const countryCodes = ("AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ " +
  "CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR " +
  "GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP " +
  "KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ " +
  "NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ " +
  "TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW").split(" ");

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "quote" });
  const hero = (await getPageSections("quote", locale)).find(({ sectionKey }) => sectionKey === "hero")?.content;
  return conversionMetadata(locale, "quote", t("title"), hero?.description);
}

export default async function QuotePage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [query, sections, services, t, requestHeaders, aside] = await Promise.all([
    searchParams, getPageSections("quote", locale), getServices(locale), getTranslations("quote"), headers(),
    getTranslations("reassurance"),
  ]);
  const hero = sections.find(({ sectionKey }) => sectionKey === "hero")?.content;
  const intro = sections.find(({ sectionKey }) => sectionKey === "intro")?.content;
  const collator = new Intl.Collator(locale);
  const countries = countryCodes.map((value) => ({ value, label: countryName(value, locale) }))
    .sort((a, b) => collator.compare(a.label, b.label));
  const reassurance = {
    title: aside("title"),
    reply: { title: aside("reply.title"), body: aside("reply.body") },
    nda: { title: aside("nda.title"), body: aside("nda.body") },
    bilingual: { title: aside("bilingual.title"), body: aside("bilingual.body") },
    free: { title: aside("free.title"), body: aside("free.body") },
  };

  return (
    <main id="main-content" className="relative bg-bg text-text">
      <PageTop className="!pb-[var(--section-y)]">
        <SectionHeading as="h1" size="lg" layout="split" kicker={hero?.eyebrow}
          title={hero?.title || t("title")} lead={hero?.description || intro?.description} animated={false} />
        <div className="mt-[var(--space-heading)] grid items-start gap-[var(--space-grid-lg)] lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-8">
            <QuoteForm key={typeof query.service === "string" ? query.service : ""} locale={locale}
              preselected={services.find(({ slug }) => slug === query.service)?.id}
              services={services.map(({ id, title, tagline, icon }) => ({ id, title, tagline, icon }))}
              countries={countries} campaign={campaignQuery(query)} startedAt={formOpenedAt()}
              initialReferrer={requestHeaders.get("referer") ?? ""} nativeResult={readNativeLead(query.result, "quote", locale)} />
          </div>
          <aside aria-labelledby="quote-aside-title" className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:col-span-4">
            <Panel className="!p-6 sm:!p-7">
              <h2 id="quote-aside-title" className="kicker-rule">{reassurance.title}</h2>
              <ReassuranceList copy={reassurance} className="mt-6" />
            </Panel>
          </aside>
        </div>
      </PageTop>
    </main>
  );
}
