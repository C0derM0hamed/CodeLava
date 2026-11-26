import { CalendarDays, Clock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/components/ui/cn";
import type { AppLocale } from "@/i18n/routing";
import { formatDate } from "@/lib/i18n-content";
import type { Article } from "@/server/queries/types";
import { ArticleCover } from "./ArticleCover";

export function ArticleMeta({ article, className }: { article: Pick<Article, "publishedAt" | "readingMinutes">; className?: string }) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("blog");
  return (
    <p className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-faint", className)}>
      {article.publishedAt ? (
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays aria-hidden="true" className="size-3.5" />
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt, locale)}</time>
        </span>
      ) : null}
      {article.readingMinutes ? (
        <span className="inline-flex items-center gap-1.5">
          <Clock aria-hidden="true" className="size-3.5" />
          {t("readingTime", { minutes: article.readingMinutes })}
        </span>
      ) : null}
    </p>
  );
}

/** Blog card from the reference: 16:10 image, orange category, two-line title, date + read time. */
export function ArticleCard({ article, className }: { article: Article; className?: string }) {
  const category = article.tags[0];
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[var(--radius-md)] border border-line bg-surface shadow-card transition-[transform,box-shadow] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:shadow-lift",
        className,
      )}
    >
      <div className="p-2.5 pb-0">
        <ArticleCover
          cover={article.cover}
          title={article.title}
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 380px"
          className="rounded-[calc(var(--radius-md)-4px)]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        {category ? <p className="text-sm font-semibold text-accent-text">{category}</p> : null}
        <h3 className="font-display text-xl leading-snug font-bold text-text">
          <Link
            href={`/blog/${article.slug}`}
            data-cursor="view"
            className="line-clamp-2 transition-colors group-hover:text-accent-text after:absolute after:inset-0 after:content-['']"
          >
            {article.title}
          </Link>
        </h3>
        {article.excerpt ? <p className="line-clamp-2 text-sm leading-relaxed text-muted">{article.excerpt}</p> : null}
        <ArticleMeta article={article} className="mt-auto border-t border-line pt-4" />
      </div>
    </article>
  );
}

/** Large lead card for the newest / featured article. */
export function FeaturedArticle({ article }: { article: Article }) {
  const t = useTranslations("blog");
  const category = article.tags[0];
  return (
    <article className="group relative grid gap-6 overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface p-3 shadow-card transition-shadow duration-300 hover:shadow-lift sm:p-4 lg:grid-cols-12 lg:items-center lg:gap-10">
      <div className="lg:col-span-7">
        <ArticleCover
          cover={article.cover}
          title={article.title}
          sizes="(max-width: 1024px) 92vw, 720px"
          priority
          className="rounded-[calc(var(--radius-lg)-6px)]"
        />
      </div>
      <div className="flex flex-col items-start gap-4 px-2 pb-4 sm:px-4 lg:col-span-5 lg:py-6 lg:pe-8">
        <p className="kicker-rule">{category ?? t("featured")}</p>
        <h2 className="text-display-md text-text">
          <Link
            href={`/blog/${article.slug}`}
            data-cursor="view"
            className="transition-colors group-hover:text-accent-text after:absolute after:inset-0 after:content-['']"
          >
            {article.title}
          </Link>
        </h2>
        {article.excerpt ? <p className="line-clamp-4 text-body text-muted">{article.excerpt}</p> : null}
        <ArticleMeta article={article} />
        <span className="mt-1 inline-flex items-center gap-2 text-[0.95rem] font-semibold text-accent-text transition-[gap] duration-300 group-hover:gap-3">
          {t("readArticle")}
          <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="rtl-flip size-4">
            <path d="M2.5 8h11m0 0L8.75 3.25M13.5 8l-4.75 4.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </article>
  );
}
