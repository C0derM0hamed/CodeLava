import type { Article } from "@/server/queries/types";
import { Kicker } from "../process/kit";
import { ArticleCard } from "./ArticleCard";

export function RelatedArticles({ title, kicker, articles }: { title: string; kicker?: string; articles: Article[] }) {
  if (articles.length === 0) return null;
  return (
    <section className="page-wash border-t border-line py-16 sm:py-24">
      <div className="container-lava space-y-10">
        <div className="flex flex-col items-start gap-4">
          {kicker ? <Kicker>{kicker}</Kicker> : null}
          <h2 className="text-display-md text-text">{title}</h2>
        </div>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {articles.map((article) => (
            <li key={article.id} className="flex">
              <ArticleCard article={article} className="w-full" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
