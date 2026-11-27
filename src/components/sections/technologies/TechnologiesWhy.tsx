import { Reveal } from "@/experience/fx/Reveal";
import { PillLink, SectionIntro } from "../process/kit";
import "./technologies.css";

export interface TechnologiesWhyProps {
  kicker?: string;
  title: string;
  description?: string;
  ctaLabel: string;
}

/** "Why this stack" — copy comes from the editable `technologies.intro` page section. */
export function TechnologiesWhy({ kicker, title, description, ctaLabel }: TechnologiesWhyProps) {
  return (
    <section className="pb-[var(--section-y)]">
      <div className="container-lava">
        <Reveal mode="block">
          <div className="tech-why-card px-6 py-12 sm:px-12 sm:py-16 lg:px-16">
            <span
              aria-hidden="true"
              dir="ltr"
              className="pointer-events-none absolute -bottom-6 end-8 hidden select-none font-mono text-[7.5rem] font-bold leading-none text-ink-900/[0.04] lg:block"
            >
              {"</>"}
            </span>
            <div className="relative grid items-center gap-[var(--space-split)] lg:grid-cols-12">
              <div className="lg:col-span-7">
                <SectionIntro kicker={kicker} title={title} lead={description} />
              </div>
              <div className="lg:col-span-5 lg:justify-self-end">
                <PillLink href="/quote" size="lg">
                  {ctaLabel}
                </PillLink>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
