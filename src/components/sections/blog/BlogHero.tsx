import { Reveal } from "@/experience/fx/Reveal";
import { HighlightTitle, Kicker, PageHero } from "../process/kit";
import { BracketOrnament } from "./ArticleCover";

export function BlogHero({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <PageHero className="pb-10 sm:pb-12">
      <div className="grid items-center gap-10 lg:grid-cols-12">
        <div className="flex flex-col items-start gap-6 lg:col-span-8">
          {eyebrow ? <Kicker>{eyebrow}</Kicker> : null}
          <h1 className="text-display-xl max-w-[18ch] text-text">
            <HighlightTitle text={title} />
          </h1>
          {description ? <p className="text-lead max-w-[56ch]">{description}</p> : null}
        </div>
        <Reveal mode="block" className="hidden lg:col-span-4 lg:block">
          <div className="mx-auto grid aspect-square w-full max-w-xs place-items-center rounded-[var(--radius-xl)] border border-line bg-surface/80 shadow-card">
            <BracketOrnament className="w-40" />
          </div>
        </Reveal>
      </div>
    </PageHero>
  );
}
