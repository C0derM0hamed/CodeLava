import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { ArticleBody, ArticleHeader, ReadingProgress, RelatedArticles } from "@/components/sections/blog";
import { routing } from "@/i18n/routing";
import { formatDate } from "@/lib/i18n-content";
import { blogPostingJsonLd, breadcrumbListJsonLd, JsonLd } from "@/lib/jsonld";
import { absoluteUrl, buildMetadata, localizedPath } from "@/lib/seo";
import { getAllSlugs, getArticleBySlug } from "@/server/queries";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  try {
    const { articles } = await getAllSlugs();
    return articles.map(({ slug }) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const article = await getArticleBySlug(slug, locale);
  if (!article) return {};
  const image = article.seo.image ?? article.cover;
  return buildMetadata({
    locale,
    path: `/blog/${article.slug}`,
    title: article.seo.title ?? article.title,
    description: article.seo.description ?? (article.excerpt || undefined),
    image: image ? { url: image.url, alt: image.alt || article.title, width: image.width, height: image.height } : null,
    noindex: article.seo.noindex,
    canonical: article.seo.canonical,
    type: "article",
  });
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const [article, t, tNav, tA11y, draft] = await Promise.all([
    getArticleBySlug(slug, locale),
    getTranslations({ locale, namespace: "blog" }),
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "a11y" }),
    draftMode(),
  ]);
  if (!article) notFound();

  const path = localizedPath(locale, `/blog/${article.slug}`);
  const image = article.seo.image ?? article.cover;
  const showUpdated =
    article.publishedAt && article.updatedAt.slice(0, 10) !== article.publishedAt.slice(0, 10);

  return (
    <main id="main-content" className="relative bg-bg text-text">
      <JsonLd
        data={blogPostingJsonLd({
          title: article.seo.title ?? article.title,
          description: article.seo.description ?? (article.excerpt || undefined),
          url: path,
          language: locale,
          image: image?.url,
          datePublished: article.publishedAt,
          dateModified: article.updatedAt,
          author: article.author?.name,
        })}
      />
      <JsonLd
        data={breadcrumbListJsonLd([
          { name: tNav("home"), url: localizedPath(locale, "/") },
          { name: tNav("blog"), url: localizedPath(locale, "/blog") },
          { name: article.title, url: path },
        ])}
      />

      <ReadingProgress targetId="article-body" />

      <article>
        <ArticleHeader
          article={article}
          isDraft={draft.isEnabled}
          labels={{
            home: tNav("home"),
            blog: tNav("blog"),
            back: t("backToBlog"),
            breadcrumbs: tA11y("breadcrumbs"),
            draft: t("draftPreview"),
          }}
        />
        <ArticleBody
          html={article.bodyHtml}
          toc={article.toc}
          tocLabel={t("tableOfContents")}
          updatedLabel={showUpdated ? t("updated", { date: formatDate(article.updatedAt, locale) }) : undefined}
          share={{
            url: absoluteUrl(path),
            title: article.title,
            labels: {
              share: t("share"),
              copy: t("copyLink"),
              copied: t("linkCopied"),
              openInNewTab: tA11y("openInNewTab"),
            },
          }}
        />
      </article>

      <RelatedArticles title={t("related")} kicker={tNav("blog")} articles={article.related} />
    </main>
  );
}
