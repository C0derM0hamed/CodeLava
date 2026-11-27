import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/experience/fx/Reveal";

/** Story + mission/vision: intro heading start, a short story and two statement cards end. */
export function AboutStory({
  eyebrow,
  title,
  lead,
  story,
  statements,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  story: string;
  statements: { label: string; body: string }[];
}) {
  return (
    <section aria-labelledby="about-story-title" className="section-y">
      <div className="container-lava grid gap-[var(--space-split)] lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading layout="intro" size="md" kicker={eyebrow} title={title} lead={lead} titleId="about-story-title" />
        </div>
        <div className="grid gap-[var(--space-grid-lg)] lg:col-span-7 lg:pt-10">
          <Reveal as="p" mode="block" className="text-lead max-w-[60ch] text-text">
            {story}
          </Reveal>
          <div className="grid gap-[var(--space-grid)] sm:grid-cols-2">
            {statements.map((item, index) => (
              <Reveal
                mode="block"
                delay={index * 90}
                key={item.label}
                className="rounded-[var(--radius-md)] border border-line bg-surface p-[var(--space-card)] shadow-card"
              >
                <p className="kicker-rule">{item.label}</p>
                <p className="mt-4 font-display text-lg font-semibold leading-snug text-text">{item.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
