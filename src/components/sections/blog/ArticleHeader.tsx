import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { ArticleDetail } from "@/server/queries/types";
import { Chip, PageHero } from "../process/kit";
import { ArticleCover } from "./ArticleCover";
import { ArticleMeta } from "./ArticleCard";

export interface ArticleHeaderProps {
  article: ArticleDetail;
  isDraft: boolean;
  labels: {
    home: string;
    blog: string;
    back: string;
    breadcrumbs: string;
    draft: string;
  };
}

export function ArticleHeader({ article, isDraft, labels }: ArticleHeaderProps) {
  return (
    <PageHero className="pb-8 sm:pb-12">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav aria-label={labels.breadcrumbs}>
            <ol className="flex flex-wrap items-center gap-2 text-sm text-faint">
              <li>
                <Link href="/" className="transition-colors hover:text-text">{labels.home}</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/blog" className="transition-colors hover:text-text">{labels.blog}</Link>
              </li>
            </ol>
          </nav>
          <Link
            href="/blog"
            data-cursor="pointer"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-accent-text"
          >
            <ArrowLeft aria-hidden="true" className="rtl-flip size-4 transition-transform group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5" />
            {labels.back}
          </Link>
        </div>

        {article.tags.length > 0 || isDraft ? (
          <ul className="flex flex-wrap gap-2">
            {isDraft ? (
              <li>
                <Chip tone="ink">{labels.draft}</Chip>
              </li>
            ) : null}
            {article.tags.map((tag) => (
              <li key={tag}>
                <Link href={`/blog?tag=${encodeURIComponent(tag)}`} data-cursor="pointer">
                  <Chip tone="accent">{tag}</Chip>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        <h1 className="text-display-lg text-text">{article.title}</h1>
        {article.excerpt ? <p className="text-lead max-w-[62ch]">{article.excerpt}</p> : null}

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-5">
          {article.author ? (
            <p className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="grid size-10 place-items-center rounded-full border border-line-lava bg-[color-mix(in_oklab,var(--lava-500)_9%,white)] font-display text-sm font-bold text-accent-text"
              >
                {article.author.name.trim().slice(0, 1).toUpperCase()}
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-semibold text-text">{article.author.name}</span>
                {article.author.role ? <span className="block text-xs text-faint">{article.author.role}</span> : null}
              </span>
            </p>
          ) : null}
          <ArticleMeta article={article} className="text-sm" />
        </div>
      </div>

      {article.cover ? (
        <div className="mx-auto mt-10 max-w-6xl">
          <div className="overflow-hidden rounded-[var(--radius-xl)] border border-line bg-surface p-2 shadow-card sm:p-3">
            <ArticleCover
              cover={article.cover}
              title={article.title}
              sizes="(max-width: 1280px) 94vw, 1152px"
              priority
              className="aspect-[16/8] rounded-[calc(var(--radius-xl)-10px)] max-sm:aspect-[16/10]"
            />
          </div>
        </div>
      ) : null}
    </PageHero>
  );
}
