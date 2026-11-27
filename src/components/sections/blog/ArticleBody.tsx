import { ChevronDown, List } from "lucide-react";
import "@/components/sections/work/work-prose.css";
import "./blog-prose.css";
import { ArticleToc, type TocItem } from "./ArticleToc";
import { ShareLinks, type ShareLinksProps } from "./ShareLinks";

export interface ArticleBodyProps {
  html: string;
  toc: TocItem[];
  tocLabel: string;
  share: ShareLinksProps;
  updatedLabel?: string;
}

export function ArticleBody({ html, toc, tocLabel, share, updatedLabel }: ArticleBodyProps) {
  const outline = toc.filter((item) => item.level >= 2 && item.level <= 3);
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="container-lava">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12 xl:gap-16">
          <aside className="order-last min-w-0 lg:order-none lg:col-span-4 xl:col-span-3">
            <div className="space-y-6 lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
              {outline.length >= 2 ? (
                <div className="hidden rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-card lg:block">
                  <ArticleToc items={outline} label={tocLabel} />
                </div>
              ) : null}
              <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-card">
                <ShareLinks {...share} />
              </div>
            </div>
          </aside>

          <div className="min-w-0 lg:col-span-8 xl:col-span-8 xl:col-start-5">
            {outline.length >= 2 ? (
              <details className="group mb-8 rounded-[var(--radius-lg)] border border-line bg-surface shadow-card lg:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-semibold text-text [&::-webkit-details-marker]:hidden">
                  <span className="inline-flex items-center gap-2.5">
                    <List aria-hidden="true" className="size-4 text-accent-text" />
                    <span>{tocLabel}</span>
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className="size-4 text-muted transition-transform duration-200 group-open:rotate-180"
                  />
                </summary>
                <div className="border-t border-line px-5 py-4">
                  <ArticleToc items={outline} label={tocLabel} hideHeading />
                </div>
              </details>
            ) : null}

            {/* HTML comes from renderMarkdown() (sanitize-html allow-list) */}
            <div id="article-body" className="work-prose article-prose" dangerouslySetInnerHTML={{ __html: html }} />

            {updatedLabel ? (
              <p className="mt-12 inline-flex items-center gap-2 rounded-pill border border-line bg-surface px-4 py-2 text-xs font-medium text-faint shadow-[var(--shadow-xs)]">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-lava-400" />
                <span>{updatedLabel}</span>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
