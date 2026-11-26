import { Accordion } from "@/components/ui/Accordion";
import { SplitIntro } from "@/components/ui/SplitIntro";
import { Reveal } from "@/experience/fx/Reveal";
import type { Faq } from "@/server/queries/types";
import "@/components/sections/work/work-prose.css";

/** FAQ teaser: split intro + the first questions as white accordion cards. */
export function HomeFaqTeaser({
  eyebrow,
  title,
  description,
  exploreLabel,
  faqs,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  exploreLabel: string;
  faqs: Faq[];
}) {
  const items = faqs.filter((faq) => faq.question.trim() && faq.answerHtml.trim()).slice(0, 4);
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="home-faq-title" className="section-y">
      <div className="container-lava">
        <SplitIntro kicker={eyebrow} title={title} lead={description} link={{ href: "/faq", label: exploreLabel }} titleId="home-faq-title">
          <Reveal mode="block">
            <Accordion
              variant="cards"
              numbered={false}
              defaultOpenIds={[items[0].id]}
              items={items.map((faq) => ({
                id: faq.id,
                question: faq.question,
                answer: <div className="work-prose" dangerouslySetInnerHTML={{ __html: faq.answerHtml }} />,
              }))}
            />
          </Reveal>
        </SplitIntro>
      </div>
    </section>
  );
}
