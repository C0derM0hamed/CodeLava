import { SplitIntro } from "@/components/ui/SplitIntro";
import { Reveal } from "@/experience/fx/Reveal";
import { ArticleCard } from "@/components/sections/blog/ArticleCard";
import type { Article } from "@/server/queries/types";

/** Insights split intro + the three latest articles (blog card from the Blog lane). */
export function HomeInsights({
  eyebrow,
  title,
  description,
  exploreLabel,
  articles,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  exploreLabel: string;
  articles: Article[];
}) {
  const latest = articles.slice(0, 3);
  if (latest.length === 0) return null;

  return (
    <section aria-labelledby="home-insights-title" className="section-y">
      <div className="container-lava">
        <SplitIntro kicker={eyebrow} title={title} lead={description} link={{ href: "/blog", label: exploreLabel }} titleId="home-insights-title">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((article, index) => (
              <Reveal as="li" mode="block" delay={index * 80} key={article.id} className="flex min-w-0">
                <ArticleCard article={article} className="w-full" />
              </Reveal>
            ))}
          </ul>
        </SplitIntro>
      </div>
    </section>
  );
}
