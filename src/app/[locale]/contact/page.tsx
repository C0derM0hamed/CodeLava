import { headers } from "next/headers";
import { ArrowUpRight, Clock, Globe, Mail, MapPin, MessageCircle, Phone, type LucideIcon } from "lucide-react";
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

type Method = { key: string; icon: LucideIcon; label: string; value: string; href?: string; ltr?: boolean };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  const hero = (await getPageSections("contact", locale)).find(({ sectionKey }) => sectionKey === "hero")?.content;
  return conversionMetadata(locale, "contact", t("title"), hero?.description);
}

function MethodCard({ icon, label, value, href, ltr }: Method) {
  const body = (
    <>
      <IconTile
        icon={icon}
        className={href ? "group-hover:border-transparent group-hover:bg-accent-soft-strong group-hover:scale-[1.03]" : undefined}
      />
      <span className="min-w-0 flex-1 text-start">
        <span className="block text-xs font-semibold text-faint">{label}</span>
        <span className="mt-0.5 block break-words font-display text-[1.03125rem] font-semibold leading-snug text-text transition-colors group-hover:text-accent-text">
          {ltr ? <bdi dir="ltr" className="inline-block tabular-nums">{value}</bdi> : value}
        </span>
      </span>
      {href ? (
        <span
          aria-hidden="true"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-line bg-bg/70 text-faint transition-[border-color,background-color,color,transform] duration-250 group-hover:border-line-lava group-hover:bg-accent-soft group-hover:text-accent-text"
        >
          <ArrowUpRight className="rtl-flip size-4 transition-transform duration-250 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:group-hover:-translate-x-0.5" />
        </span>
      ) : null}
    </>
  );
  const base = "group flex items-center gap-4 rounded-[var(--radius-md)] border border-line bg-surface p-4 shadow-card sm:px-5 sm:py-4";
  return href ? (
    <a href={href} data-cursor="pointer" {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`${base} transition-[transform,box-shadow,border-color] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:border-line-lava hover:shadow-[var(--shadow-lift)] motion-reduce:hover:translate-y-0`}>
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
    email ? { key: "email", icon: Mail, label: t("email"), value: email, href: `mailto:${email}`, ltr: true } : null,
    phone ? { key: "phone", icon: Phone, label: t("phone"), value: phone, href: `tel:${phone.replace(/[^+\d]/g, "")}`, ltr: true } : null,
    whatsappUrl ? {
      key: "whatsapp", icon: MessageCircle, label: t("whatsapp"), value: whatsappNumber ? whatsapp! : t("whatsapp"),
      href: whatsappUrl, ltr: Boolean(whatsappNumber),
    } : null,
    address ? { key: "address", icon: MapPin, label: t("address"), value: address, href: map } : null,
    !address && map ? { key: "map", icon: MapPin, label: t("map"), value: t("map"), href: map } : null,
    contact.hours?.trim() ? { key: "hours", icon: Clock, label: t("hours"), value: contact.hours.trim() } : null,
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
          <div className="flex flex-col gap-7 lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:col-span-5">
            <SectionHeading as="h1" size="lg" layout="intro" kicker={hero?.eyebrow} title={hero?.title || t("title")}
              lead={hero?.description} animated={false} />

            {methods.length ? (
              <section aria-label={formCopy(locale, "contactChannels")}>
                <ul className="grid gap-3.5">
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
              <ul className="flex flex-wrap gap-2" aria-label={formCopy(locale, "socials")}>
                {socials.map(({ key, label, href, network }) => (
                  <li key={key}>
                    <a href={href} target="_blank" rel="noopener noreferrer" data-cursor="pointer"
                      className="inline-flex h-10 items-center gap-2 rounded-pill border border-line-strong/80 bg-surface px-4 text-sm font-medium text-text shadow-xs transition-[border-color,color,transform,box-shadow] duration-200 hover:-translate-y-px hover:border-line-lava-strong hover:text-accent-text hover:shadow-card motion-reduce:hover:translate-y-0">
                      {network ? <SocialIcon network={network} size={15} /> : <Globe size={15} aria-hidden="true" />}
                      <span>{label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}

            {/* Dark-ink magma switcher card to the guided Quote wizard */}
            <div className="surface-dark relative overflow-hidden rounded-[var(--radius-lg)] border border-line-strong bg-[linear-gradient(145deg,color-mix(in_oklab,var(--lava-500)_14%,var(--ink-900))_0%,var(--ink-900)_62%)] p-6 shadow-lift">
              <span aria-hidden="true" className="lava-seam-hairline pointer-events-none absolute inset-x-6 top-0 h-[1.5px] opacity-85" />
              <div className="relative flex flex-col items-start gap-4">
                <div>
                  <p className="font-display text-lg font-semibold text-text">{t("quoteCardTitle")}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{t("quoteCardBody")}</p>
                </div>
                <ActionLink href="/quote" variant="primary" size="sm">{common("requestQuote")}</ActionLink>
              </div>
            </div>
          </div>

          <div className="min-w-0 space-y-6 lg:col-span-7">
            <Panel as="section" aria-labelledby="contact-form-title" className="overflow-hidden rounded-[var(--radius-xl)] sm:!p-[clamp(2rem,3vw,3rem)]">
              <span aria-hidden="true" className="lava-seam-hairline pointer-events-none absolute inset-x-10 top-0 h-[2px] opacity-85" />
              <div className="border-b border-line pb-6">
                <h2 id="contact-form-title" className="text-display-sm text-text">{intro?.title || t("formTitle")}</h2>
                {intro?.description ? <p className="mt-2 text-body text-muted">{intro.description}</p> : null}
              </div>
              <div className="mt-7">
                <ContactForm locale={locale} campaign={campaignQuery(query)} startedAt={formOpenedAt()}
                  initialReferrer={requestHeaders.get("referer") ?? ""} nativeResult={readNativeLead(query.result, "contact", locale)} />
              </div>
            </Panel>

            {methods.length ? (
              <Panel as="section" aria-labelledby="contact-reassurance" className="rounded-[var(--radius-lg)] !p-6 sm:!p-7">
                <h2 id="contact-reassurance" className="kicker-rule mb-5">{reassurance.title}</h2>
                <ReassuranceList copy={reassurance} columns={2} />
              </Panel>
            ) : null}
          </div>
        </div>
      </PageTop>
    </main>
  );
}
