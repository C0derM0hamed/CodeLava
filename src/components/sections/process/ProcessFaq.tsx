import "@/components/sections/work/work-prose.css";
import { ChevronDown } from "lucide-react";
import { Reveal } from "@/experience/fx/Reveal";
import { SectionIntro, TextLink } from "./kit";

export interface ProcessFaqProps {
  kicker?: string;
  title: string;
  lead?: string;
  allLabel: string;
  items: { id: string; question: string; answerHtml: string }[];
}

/** FAQ teaser — native <details> so it works without JS and is keyboard/AT friendly. */
export function ProcessFaq({ kicker, title, lead, allLabel, items }: ProcessFaqProps) {
  if (items.length === 0) return null;
  return (
    <section className="py-20 sm:py-28">
      <div className="container-lava grid gap-12 lg:grid-cols-12 lg:gap-16">
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
          <div className="divide-y divide-line overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-card">
            {items.map((item) => (
              <details key={item.id} className="group">
                <summary
                  data-cursor="pointer"
                  className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 font-display text-lg font-semibold text-text marker:hidden sm:px-8 [&::-webkit-details-marker]:hidden"
                >
                  <span>{item.question}</span>
                  <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line-strong text-accent-text transition-transform duration-300 group-open:rotate-180">
                    <ChevronDown aria-hidden="true" className="size-4" />
                  </span>
                </summary>
                <div
                  className="work-prose px-6 pb-6 sm:px-8"
                  dangerouslySetInnerHTML={{ __html: item.answerHtml }}
                />
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
