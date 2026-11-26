import { appUrl, absoluteUrl } from "./seo";

const organizationId = new URL("/#organization", appUrl).toString();
const websiteId = new URL("/#website", appUrl).toString();

export function organizationJsonLd({ logo, sameAs = [], email, telephone }: {
  logo?: string; sameAs?: string[]; email?: string; telephone?: string;
} = {}) {
  return {
    "@context": "https://schema.org", "@type": "Organization", "@id": organizationId,
    name: "CodeLava", url: absoluteUrl("/"), logo: logo ? absoluteUrl(logo) : undefined,
    sameAs: sameAs.length ? sameAs : undefined, email, telephone,
  };
}

export function websiteJsonLd({ url = "/", language = ["en", "ar"] }: { url?: string; language?: string | string[] } = {}) {
  return {
    "@context": "https://schema.org", "@type": "WebSite", "@id": websiteId,
    name: "CodeLava", url: absoluteUrl(url), inLanguage: language, publisher: { "@id": organizationId },
  };
}

type PageData = { title: string; description?: string; url: string; language: string; image?: string };
function pageJsonLd({ title, description, url, language, image }: PageData) {
  return {
    name: title, description, url: absoluteUrl(url), inLanguage: language,
    image: image ? absoluteUrl(image) : undefined,
  };
}

export function serviceJsonLd(data: PageData & { serviceType?: string }) {
  return {
    "@context": "https://schema.org", "@type": "Service", ...pageJsonLd(data),
    serviceType: data.serviceType, provider: { "@id": organizationId },
  };
}

export function caseStudyJsonLd(data: PageData) {
  return {
    "@context": "https://schema.org", "@type": "CreativeWork", ...pageJsonLd(data),
    genre: "Case study", creator: { "@id": organizationId },
  };
}

export function blogPostingJsonLd(data: PageData & { datePublished?: string | null; dateModified?: string | null; author?: string }) {
  return {
    "@context": "https://schema.org", "@type": "BlogPosting", ...pageJsonLd(data), headline: data.title,
    datePublished: data.datePublished ?? undefined, dateModified: data.dateModified ?? undefined,
    author: data.author ? { "@type": "Person", name: data.author } : { "@id": organizationId },
    publisher: { "@id": organizationId }, mainEntityOfPage: absoluteUrl(data.url),
  };
}

export function faqPageJsonLd(faqs: { question: string; answerHtml: string }[]) {
  return {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faqs.map(({ question, answerHtml }) => ({
      "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answerHtml },
    })),
  };
}

export function breadcrumbListJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: items.map(({ name, url }, index) => ({
      "@type": "ListItem", position: index + 1, name, item: absoluteUrl(url),
    })),
  };
}

export { JsonLd } from "./jsonld-script";
