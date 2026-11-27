import { ArrowRight, CalendarDays, Clock } from "lucide-react";
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
          <CalendarDays aria-hidden="true" className="size-3.5 text-faint/80" />
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt, locale)}</time>
        </span>
      ) : null}
      {article.readingMinutes ? (
        <span className="inline-flex items-center gap-1.5">
          <Clock aria-hidden="true" className="size-3.5 text-faint/80" />
          {t("readingTime", { minutes: article.readingMinutes })}
        </span>
      ) : null}
    </p>
  );
}

/** Crafted Daylight Magma article card: 16:10 framed cover, category pill, crisp title, hover lava edge & gliding arrow. */
export function ArticleCard({ article, className }: { article: Article; className?: string }) {
  const category = article.tags[0];
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-card transition-[transform,box-shadow,border-color] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:border-line-lava hover:shadow-lift motion-reduce:hover:translate-y-0",
        className,
      )}
    >
      {/* Molten top micro-edge revealed on hover */}
      <span
        aria-hidden="true"
        className="lava-seam-hairline pointer-events-none absolute inset-x-5 top-0 z-10 h-[2px] origin-center scale-x-0 opacity-0 transition-[transform,opacity] duration-500 ease-[var(--ease-out-expo)] group-hover:scale-x-100 group-hover:opacity-100"
      />

      <div className="p-2.5 pb-0">
        <ArticleCover
          cover={article.cover}
          title={article.title}
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 380px"
          className="rounded-[calc(var(--radius-lg)-8px)]"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3.5 p-[var(--space-card)]">
        {category ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-pill border border-line-lava/70 bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent-text">
              {category}
            </span>
          </div>
        ) : null}

        <h3 className="font-display text-[1.2rem] leading-snug font-bold tracking-[-0.014em] text-text rtl:tracking-normal">
          <Link
            href={`/blog/${article.slug}`}
            data-cursor="view"
            className="transition-colors duration-200 group-hover:text-accent-text after:absolute after:inset-0 after:content-['']"
          >
            {article.title}
          </Link>
        </h3>

        {article.excerpt ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted">{article.excerpt}</p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
          <ArticleMeta article={article} />
          <span
            aria-hidden="true"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-line bg-bg/80 text-faint transition-[background-color,border-color,color,transform] duration-300 ease-[var(--ease-out-expo)] group-hover:border-line-lava group-hover:bg-accent-soft group-hover:text-accent-text"
          >
            <ArrowRight className="rtl-flip size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </span>
        </div>
      </div>
    </article>
  );
}

/** Flagship lead spread for the newest / featured article. */
export function FeaturedArticle({ article }: { article: Article }) {
  const t = useTranslations("blog");
  const category = article.tags[0];
  const extraTags = article.tags.slice(1, 3);
  return (
    <article className="group relative grid gap-[var(--space-grid-lg)] overflow-hidden rounded-[var(--radius-xl)] border border-line bg-surface p-3.5 shadow-card transition-[box-shadow,border-color,transform] duration-400 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:border-line-lava hover:shadow-lift motion-reduce:hover:translate-y-0 sm:p-5 lg:grid-cols-12 lg:items-center">
      <span
        aria-hidden="true"
        className="lava-seam-hairline pointer-events-none absolute inset-x-10 top-0 z-10 h-[2px] opacity-85"
      />

      <div className="relative lg:col-span-7">
        <ArticleCover
          cover={article.cover}
          title={article.title}
          sizes="(max-width: 1024px) 92vw, 840px"
          priority
          className="rounded-[calc(var(--radius-xl)-12px)]"
        />
        <span className="pointer-events-none absolute start-3.5 top-3.5 inline-flex items-center gap-1.5 rounded-pill border border-white/15 bg-ink-900/82 px-3 py-1 text-xs font-semibold text-pearl-50 shadow-[var(--shadow-xs)] backdrop-blur-md">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-lava-400" />
          {t("featured")}
        </span>
      </div>

      <div className="flex flex-col items-start gap-[var(--space-copy)] px-2 pb-3 sm:px-4 lg:col-span-5 lg:py-6 lg:pe-8">
        <div className="flex flex-wrap items-center gap-2">
          <p className="kicker-rule">{category ?? t("featured")}</p>
          {extraTags.map((tag) => (
            <span
              key={tag}
              className="rounded-pill border border-line bg-bg px-2.5 py-0.5 text-[11px] font-medium text-muted"
            >
              {tag}
            </span>
          ))}
        </div>

        <h2 className="text-display-md text-text">
          <Link
            href={`/blog/${article.slug}`}
            data-cursor="view"
            className="transition-colors duration-200 group-hover:text-accent-text after:absolute after:inset-0 after:content-['']"
          >
            {article.title}
          </Link>
        </h2>

        {article.excerpt ? <p className="text-body text-muted">{article.excerpt}</p> : null}

        <ArticleMeta article={article} />

        <span className="mt-1 inline-flex h-11 items-center gap-2.5 rounded-pill border border-line-lava bg-accent-soft px-5 text-sm font-semibold text-accent-text transition-[background-color,border-color,color,gap,box-shadow] duration-300 ease-[var(--ease-out-expo)] group-hover:gap-3.5 group-hover:border-transparent group-hover:text-on-accent group-hover:shadow-[var(--shadow-lava)] group-hover:[background-image:var(--gradient-cta)]">
          <span>{t("readArticle")}</span>
          <ArrowRight aria-hidden="true" className="rtl-flip size-4" />
        </span>
      </div>
    </article>
  );
}
