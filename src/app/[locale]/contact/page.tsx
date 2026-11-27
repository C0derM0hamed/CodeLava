import { headers } from "next/headers";
import { Clock, Globe, Mail, MapPin, MessageCircle, Phone, type LucideIcon } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ActionLink } from "@/components/ui/ActionLink";
import { SocialIcon, detectSocialNetwork } from "@/components/ui/Icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactForm } from "@/components/sections/forms/ContactForm";
import { formCopy } from "@/components/sections/forms/copy";
import { readNativeLead } from "@/components/sections/forms/native";
import { campaignQuery, conversionMetadata, formOpenedAt, publicHttpLink, type SearchParams } from "@/components/sections/forms/page-data";
import { IconTile, PageTop, Panel, ReassuranceList } from "@/components/sections/forms/page-kit";
import type { AppLocale } from "@/i18n/routing";
import { getPageSections, getSiteSettings } from "@/server/queries";
import "@/components/sections/forms/conversion.css";

type Props = { params: Promise<{ locale: AppLocale }>; searchParams: Promise<SearchParams> };
const socialLabels: Record<string, string> = {
  linkedin: "LinkedIn", github: "GitHub", x: "X", behance: "Behance", dribbble: "Dribbble", upwork: "Upwork",
};

type Method = { key: string; icon: LucideIcon; label: string; value: string; href?: string; dir: "ltr" | "auto" };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  const hero = (await getPageSections("contact", locale)).find(({ sectionKey }) => sectionKey === "hero")?.content;
  return conversionMetadata(locale, "contact", t("title"), hero?.description);
}

function MethodCard({ icon, label, value, href, dir }: Method) {
  const body = (
    <>
      <IconTile icon={icon} />
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold text-muted">{label}</span>
        <span dir={dir} className="mt-0.5 block break-words font-display text-[1.0625rem] font-semibold leading-snug text-text transition-colors group-hover:text-accent-text">
          {value}
        </span>
      </span>
    </>
  );
  const base = "group flex items-center gap-4 rounded-[var(--radius-md)] border border-line bg-surface p-4 shadow-card sm:p-5";
  return href ? (
    <a href={href} data-cursor="pointer" {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`${base} transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-line-lava hover:shadow-[var(--shadow-lift)] motion-reduce:hover:translate-y-0`}>
      {body}
    </a>
  ) : <div className={base}>{body}</div>;
}

export default async function ContactPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [query, settings, sections, t, common, aside, requestHeaders] = await Promise.all([
    searchParams, getSiteSettings(locale), getPageSections("contact", locale), getTranslations("contact"),
    getTranslations("common"), getTranslations("reassurance"), headers(),
  ]);
  const hero = sections.find(({ sectionKey }) => sectionKey === "hero")?.content;
  const intro = sections.find(({ sectionKey }) => sectionKey === "intro")?.content;
  const contact = settings.contact;
  const email = contact.email?.trim();
  const phone = contact.phone?.trim();
  const whatsapp = contact.whatsapp?.trim();
  const whatsappNumber = whatsapp && /^\+?[\d\s().-]+$/.test(whatsapp) ? whatsapp.replace(/\D/g, "") : "";
  const whatsappUrl = publicHttpLink(whatsapp) ?? (whatsappNumber ? `https://wa.me/${whatsappNumber}` : undefined);
  const map = publicHttpLink(contact.mapUrl) ?? publicHttpLink(contact.map);
  const address = contact.address?.trim();
  const methods = ([
    email ? { key: "email", icon: Mail, label: t("email"), value: email, href: `mailto:${email}`, dir: "ltr" as const } : null,
    phone ? { key: "phone", icon: Phone, label: t("phone"), value: phone, href: `tel:${phone.replace(/[^+\d]/g, "")}`, dir: "ltr" as const } : null,
    whatsappUrl ? { key: "whatsapp", icon: MessageCircle, label: t("whatsapp"), value: whatsappNumber ? whatsapp! : t("whatsapp"),
      href: whatsappUrl, dir: whatsappNumber ? "ltr" as const : "auto" as const } : null,
    address ? { key: "address", icon: MapPin, label: t("address"), value: address, href: map, dir: "auto" as const } : null,
    !address && map ? { key: "map", icon: MapPin, label: t("map"), value: t("map"), href: map, dir: "auto" as const } : null,
    contact.hours?.trim() ? { key: "hours", icon: Clock, label: t("hours"), value: contact.hours.trim(), dir: "auto" as const } : null,
  ] as (Method | null)[]).filter((method): method is Method => method !== null);
  const socials = Object.entries(settings.socials).flatMap(([key, value]) => {
    const href = publicHttpLink(value);
    const label = socialLabels[key] ?? (key === "mostaql" ? locale === "ar" ? "مستقل" : "Mostaql" : locale === "ar" ? "الموقع الإلكتروني" : "Website");
    return href ? [{ key, label, href, network: detectSocialNetwork(key) ?? detectSocialNetwork(href) }] : [];
  });
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
        <div className="grid items-start gap-[var(--space-split)] lg:grid-cols-12">
          <div className="flex flex-col gap-8 lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:col-span-5">
            <SectionHeading as="h1" size="md" layout="intro" kicker={hero?.eyebrow} title={hero?.title || t("title")}
              lead={hero?.description} animated={false} />

            {methods.length ? (
              <section aria-label={formCopy(locale, "contactChannels")}>
                <ul className="grid gap-4">
                  {methods.map((method) => <li key={method.key}><MethodCard {...method} /></li>)}
                </ul>
              </section>
            ) : (
              <section aria-labelledby="contact-expect">
                <h2 id="contact-expect" className="kicker-rule mb-5">{reassurance.title}</h2>
                <ReassuranceList copy={reassurance} limit={3} />
              </section>
            )}

            {socials.length ? (
              <ul className="flex flex-wrap gap-2.5" aria-label={formCopy(locale, "socials")}>
                {socials.map(({ key, label, href, network }) => (
                  <li key={key}>
                    <a href={href} target="_blank" rel="noopener noreferrer" data-cursor="pointer"
                      className="inline-flex h-10 items-center gap-2 rounded-pill border border-line-strong bg-surface px-4 text-sm font-medium text-text shadow-xs transition-[border-color,color] hover:border-line-lava-strong hover:text-accent-text">
                      {network ? <SocialIcon network={network} size={16} /> : <Globe size={16} aria-hidden="true" />}
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="flex flex-col items-start gap-4 rounded-[var(--radius-md)] border border-line-lava bg-accent-soft p-5 sm:p-6">
              <div>
                <p className="font-display text-lg font-semibold text-text">{t("quoteCardTitle")}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{t("quoteCardBody")}</p>
              </div>
              <ActionLink href="/quote" size="sm">{common("requestQuote")}</ActionLink>
            </div>
          </div>

          <Panel as="section" aria-labelledby="contact-form-title" className="min-w-0 lg:col-span-7 sm:!p-[clamp(2rem,3vw,3rem)]">
            <h2 id="contact-form-title" className="text-display-sm">{intro?.title || t("formTitle")}</h2>
            {intro?.description ? <p className="mt-2 text-muted">{intro.description}</p> : null}
            <div className="mt-7">
              <ContactForm locale={locale} campaign={campaignQuery(query)} startedAt={formOpenedAt()}
                initialReferrer={requestHeaders.get("referer") ?? ""} nativeResult={readNativeLead(query.result, "contact", locale)} />
            </div>
          </Panel>
        </div>
      </PageTop>
    </main>
  );
}
