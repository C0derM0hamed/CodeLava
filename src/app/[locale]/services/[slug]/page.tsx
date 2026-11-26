import { ChevronRight, icons } from "lucide-react";
import { createElement } from "react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ActionLink } from "@/components/ui/ActionLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FaqGroups } from "@/components/sections/faq/FaqGroups";
import { ServiceImage } from "@/components/sections/services/ServiceImage";
import { serviceAccent } from "@/components/sections/services/ServiceRows";
import { LavaDivider } from "@/experience/fx/LavaDivider";
import { Link } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { JsonLd, breadcrumbListJsonLd, serviceJsonLd } from "@/lib/jsonld";
import { buildMetadata, localizedPath } from "@/lib/seo";
import { getAllSlugs, getFaqs, getProcessSteps, getServiceBySlug } from "@/server/queries";
import "@/components/sections/forms/conversion.css";
import "@/components/sections/services/services.css";

type Props = { params: Promise<{ locale: AppLocale; slug: string }> };

export async function generateStaticParams({ params }: { params: { locale?: string } }) {
  const locales = hasLocale(routing.locales, params.locale) ? [params.locale] : routing.locales;
  const { services } = await getAllSlugs();
  return locales.flatMap((locale) => services.map(({ slug }) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const service = await getServiceBySlug(slug, locale);
  if (!service) notFound();
  return buildMetadata({
    locale, path: `/services/${slug}`, title: service.seo.title || service.title,
    description: service.seo.description || service.summary || service.tagline,
    image: service.seo.image ?? service.cover, canonical: service.seo.canonical, noindex: service.seo.noindex,
  });
}

function serviceIcon(name: string | null | undefined, size: number, strokeWidth: number) {
  if (!name) return null;
  const pascal = name.replace(/(?:^|-)([a-z])/g, (_, letter: string) => letter.toUpperCase());
  return Object.hasOwn(icons, pascal) ? createElement(icons[pascal as keyof typeof icons], { size, strokeWidth }) : null;
}

export default async function ServicePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const service = await getServiceBySlug(slug, locale);
  if (!service) notFound();
  const [t, common, processCopy, faqCopy, nav, steps, faqs] = await Promise.all([
    getTranslations("services"), getTranslations("common"), getTranslations("process"), getTranslations("faq"), getTranslations("nav"),
    getProcessSteps(locale), getFaqs({ category: slug }, locale),
  ]);
  const quoteHref = `/quote?service=${encodeURIComponent(slug)}`;
  const url = localizedPath(locale, `/services/${slug}`);
  const heroIcon = serviceIcon(service.icon, 92, .65);
  const serviceQuestions = faqs.filter(({ question, answerHtml }) => question && answerHtml);
  const projects = service.relatedProjects;

  return (
    <main id="main-content" className="conversion-frame">
      <JsonLd data={serviceJsonLd({ title: service.title, serviceType: service.title, url, language: locale,
        description: service.summary || service.tagline, image: service.cover?.url })} />
      <JsonLd data={breadcrumbListJsonLd([
        { name: nav("home"), url: localizedPath(locale) }, { name: t("title"), url: localizedPath(locale, "/services") }, { name: service.title, url },
      ])} />
      <div className="conversion-container service-page service-detail"
        style={{ "--service-accent": serviceAccent(service.accent) } as React.CSSProperties}>
        <header className="service-detail-hero">
          <div className="service-detail-title">
            <ActionLink href="/services" size="sm" arrow="none"><span className="inline-flex items-center gap-2">
              <ChevronRight aria-hidden="true" size={15} className="rotate-180 rtl:rotate-0" />{t("allServices")}
            </span></ActionLink>
            <SectionHeading as="h1" size="lg" title={service.title} lead={service.tagline || service.summary} animated={false} />
            {service.tagline && service.summary ? <p className="max-w-xl text-muted">{service.summary}</p> : null}
            <ActionLink href={quoteHref} magnetic>{common("requestQuote")}</ActionLink>
          </div>
          {service.cover?.kind === "image" ? <ServiceImage media={service.cover} priority sizes="(max-width: 768px) 100vw, 42vw" /> :
            heroIcon ? <div className="service-detail-emblem" aria-hidden="true">{heroIcon}</div> : null}
        </header>
        {service.bodyHtml || service.deliverables.length ? <div className="service-detail-body">
          {service.bodyHtml ? <div className="conversion-prose service-description" dangerouslySetInnerHTML={{ __html: service.bodyHtml }} /> : null}
          {service.deliverables.length ? <section className="service-deliverables">
            <h2 className="text-display-sm">{t("deliverables")}</h2>
            <ul>{service.deliverables.map((value, index) =>
              <li key={index}><span className="service-index-number" dir="ltr" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{value}</li>,
            )}</ul>
          </section> : null}
        </div> : null}
        {service.features.length ? <section className="service-feature-band">
          <h2 className="text-display-md">{t("features")}</h2>
          <ul className="service-feature-grid">{service.features.map(({ title, description, icon }, index) => {
            const featureIcon = serviceIcon(icon, 24, 1.35);
            return <li key={index}>
              <span className="service-index-number" aria-hidden="true" dir="ltr">{featureIcon ?? `/${String(index + 1).padStart(2, "0")}`}</span>
              <h3 className="font-display text-xl">{title}</h3>
              {description ? <p className="text-muted">{description}</p> : null}
            </li>;
          })}</ul>
        </section> : null}
        {projects.length ? <section className="service-feature-band">
          <h2 className="text-display-md">{t("relatedProjects")}</h2>
          <ul className="service-projects">{projects.map(({ slug: projectSlug, title, cover, summary }) => (
            <li key={projectSlug}>
              {cover ? <ServiceImage media={cover} sizes="(max-width: 640px) 100vw, 40vw" /> : null}
              <h3 className="font-display text-2xl"><Link href={`/work/${projectSlug}`} className="hover:text-lava-300">{title}</Link></h3>
              {summary ? <p className="text-muted">{summary}</p> : null}
            </li>
          ))}</ul>
        </section> : null}
        {steps.length ? <section className="service-feature-band">
          <SectionHeading size="md" title={processCopy("title")} animated={false} action={<ActionLink href="/process">{nav("process")}</ActionLink>} />
          <ol className="service-process">{steps.slice(0, 4).map(({ id, title, description, duration }, index) =>
            <li key={id}>
              <span className="service-index-number" dir="ltr" aria-hidden="true">/{String(index + 1).padStart(2, "0")}</span>
              <h3 className="font-display text-xl">{title}</h3>
              {duration ? <p className="text-sm text-lava-300">{duration}</p> : null}
              {description ? <p className="text-muted">{description}</p> : null}
            </li>,
          )}</ol>
        </section> : null}
        {serviceQuestions.length ? <section className="service-feature-band">
          <SectionHeading size="md" title={faqCopy("title")} animated={false} action={<ActionLink href="/faq">{nav("faq")}</ActionLink>} />
          <FaqGroups groups={[{ id: slug, title: "", items: serviceQuestions }]} searchable={false} locale={locale} />
        </section> : null}
        <section className="service-cta">
          <LavaDivider variant="seam" />
          <SectionHeading as="h2" size="md" title={common("discussProject")} animated={false} layout="split"
            action={<ActionLink href={quoteHref} magnetic>{common("requestQuote")}</ActionLink>} />
        </section>
      </div>
    </main>
  );
}
