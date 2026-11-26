import { headers } from "next/headers";
import { readNativeLead } from "@/components/sections/forms/native";
import { ArrowUpRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ActionLink } from "@/components/ui/ActionLink";
import { ContactForm } from "@/components/sections/forms/ContactForm";
import { formCopy } from "@/components/sections/forms/copy";
import { campaignQuery, conversionMetadata, formOpenedAt, publicHttpLink, type SearchParams } from "@/components/sections/forms/page-data";
import { LavaDivider } from "@/experience/fx/LavaDivider";
import type { AppLocale } from "@/i18n/routing";
import { getPageSections, getSiteSettings } from "@/server/queries";

type Props = { params: Promise<{ locale: AppLocale }>; searchParams: Promise<SearchParams> };
const socialLabels: Record<string, string> = {
  linkedin: "LinkedIn", github: "GitHub", x: "X", behance: "Behance", dribbble: "Dribbble", upwork: "Upwork",
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  const hero = (await getPageSections("contact", locale)).find(({ sectionKey }) => sectionKey === "hero")?.content;
  return conversionMetadata(locale, "contact", t("title"), hero?.description);
}

export default async function ContactPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [query, settings, sections, t, requestHeaders] = await Promise.all([
    searchParams, getSiteSettings(locale), getPageSections("contact", locale), getTranslations("contact"), headers(),
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
  const direct = [
    { label: t("email"), value: email, href: email ? `mailto:${email}` : undefined, dir: "ltr" },
    { label: t("phone"), value: phone, href: phone ? `tel:${phone.replace(/[^+\d]/g, "")}` : undefined, dir: "ltr" },
    { label: t("whatsapp"), value: whatsappUrl ? whatsappNumber ? whatsapp : t("whatsapp") : undefined, href: whatsappUrl, dir: whatsappNumber ? "ltr" : "auto" },
    { label: t("address"), value: contact.address?.trim(), href: map, dir: "auto" },
    { label: t("hours"), value: contact.hours?.trim(), dir: "auto" },
  ].filter(({ value }) => Boolean(value));
  const socials = Object.entries(settings.socials).flatMap(([key, value]) => {
    const href = publicHttpLink(value);
    const label = socialLabels[key] ?? (key === "mostaql" ? locale === "ar" ? "مستقل" : "Mostaql" : locale === "ar" ? "الموقع الإلكتروني" : "Website");
    return href ? [{ key, label, href }] : [];
  });

  return (
    <main id="main-content" className="conversion-frame">
      <div className="conversion-container contact-page">
        <div className="contact-editorial">
          <SectionHeading as="h1" size="lg" kicker={hero?.eyebrow} title={hero?.title || t("title")} lead={hero?.description} animated={false} />
          <ActionLink href="/quote" magnetic>{formCopy(locale, "startQuote")}</ActionLink>
        </div>
        <section className="contact-side" aria-labelledby="contact-form-title">
          <h2 id="contact-form-title" className="text-display-sm">{intro?.title || t("formTitle")}</h2>
          {intro?.description ? <p className="mb-6 mt-2 text-muted">{intro.description}</p> : null}
          <ContactForm locale={locale} campaign={campaignQuery(query)} startedAt={formOpenedAt()}
            initialReferrer={requestHeaders.get("referer") ?? ""} nativeResult={readNativeLead(query.result, "contact", locale)} />
        </section>
        {direct.length || socials.length || map ? <section className="contact-channels" aria-label={formCopy(locale, "contactChannels")}>
          <LavaDivider variant="seam" />
          {direct.length ? <dl className="contact-channel-list">{direct.map(({ label, value, href, dir }) =>
            <div key={label}><dt>{label}</dt><dd dir={dir}>{href ? <a href={href}>{value}</a> : value}</dd></div>,
          )}</dl> : null}
          {map ? <ActionLink href={map} external size="sm" arrow="up-right">{t("map")}</ActionLink> : null}
          {socials.length ? <ul className="flex flex-wrap gap-x-5" aria-label={formCopy(locale, "socials")}>
            {socials.map(({ key, label, href }) => <li key={key}>
              <a href={href} className="inline-flex min-h-8 items-center gap-2 text-sm text-muted hover:text-text">
                {label}<ArrowUpRight size={14} aria-hidden="true" className="rtl:-scale-x-100" />
              </a>
            </li>)}
          </ul> : null}
        </section> : null}
      </div>
    </main>
  );
}
