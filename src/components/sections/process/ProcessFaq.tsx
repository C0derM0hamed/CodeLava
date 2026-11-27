import "@/components/sections/work/work-prose.css";
import { Accordion } from "@/components/ui/Accordion";
import { Reveal } from "@/experience/fx/Reveal";
import { SectionIntro, TextLink } from "./kit";

export interface ProcessFaqProps {
  kicker?: string;
  title: string;
  lead?: string;
  allLabel: string;
  items: { id: string; question: string; answerHtml: string }[];
}

/** FAQ teaser — unified Daylight Magma card Accordion matching `/faq` and `/services/[slug]`. */
export function ProcessFaq({ kicker, title, lead, allLabel, items }: ProcessFaqProps) {
  if (items.length === 0) return null;
  return (
    <section className="section-y">
      <div className="container-lava grid gap-[var(--space-split)] lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Reveal mode="block">
            <SectionIntro
              kicker={kicker}
              title={title}
              lead={lead}
              action={<TextLink href="/faq">{allLabel}</TextLink>}
            />
          </Reveal>
        </div>
        <Reveal mode="block" className="lg:col-span-8">
          <Accordion
            variant="cards"
            numbered={false}
            items={items.map((item) => ({
              id: item.id,
              question: item.question,
              answer: (
                <div
                  className="work-prose"
                  dangerouslySetInnerHTML={{ __html: item.answerHtml }}
                />
              ),
            }))}
          />
        </Reveal>
      </div>
    </section>
  );
}
