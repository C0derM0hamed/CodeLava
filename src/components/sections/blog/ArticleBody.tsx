import "@/components/sections/work/work-prose.css";
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
    <section className="py-12 sm:py-16">
      <div className="container-lava">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <aside className="order-last lg:order-none lg:col-span-3">
            <div className="space-y-8 lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
              {outline.length >= 2 ? <div className="hidden lg:block"><ArticleToc items={outline} label={tocLabel} /></div> : null}
              <div className="rounded-[var(--radius-md)] border border-line bg-surface p-5 shadow-card">
                <ShareLinks {...share} />
              </div>
            </div>
          </aside>

          <div className="lg:col-span-8 xl:col-span-7">
            {outline.length >= 2 ? (
              <details className="mb-8 rounded-[var(--radius-md)] border border-line bg-surface p-4 shadow-card lg:hidden">
                <summary className="cursor-pointer text-sm font-semibold text-text">{tocLabel}</summary>
                <div className="mt-4"><ArticleToc items={outline} label={tocLabel} /></div>
              </details>
            ) : null}
            {/* HTML comes from renderMarkdown() (sanitize-html allow-list) */}
            <div id="article-body" className="work-prose article-prose" dangerouslySetInnerHTML={{ __html: html }} />
            {updatedLabel ? <p className="mt-10 border-t border-line pt-5 text-sm text-faint">{updatedLabel}</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
