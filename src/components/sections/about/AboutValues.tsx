import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/experience/fx/Reveal";
import { StepIcon } from "@/components/sections/process/step-icon";

/** Principles / approach: heading + four white cards with orange line icons. */
export function AboutValues({
  eyebrow,
  title,
  lead,
  values,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  values: { icon: string; title: string; body: string }[];
}) {
  return (
    <section aria-labelledby="about-values-title" className="section-y pt-0">
      <div className="container-lava grid gap-[var(--space-heading)]">
        <SectionHeading layout="split" size="md" kicker={eyebrow} title={title} lead={lead} titleId="about-values-title" />
        <ul className="grid gap-[var(--space-grid)] sm:grid-cols-2 xl:grid-cols-4">
          {values.map((value, index) => (
            <Reveal
              as="li"
              mode="block"
              delay={index * 80}
              key={value.title}
              className="flex flex-col gap-5 rounded-[var(--radius-md)] border border-line bg-surface p-[var(--space-card)] shadow-card transition-[transform,box-shadow] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:shadow-lift"
            >
              <span aria-hidden="true" className="grid size-12 place-items-center rounded-[14px] bg-accent-soft text-accent-text">
                <StepIcon icon={value.icon} className="size-6" />
              </span>
              <span className="grid gap-2">
                <span className="font-display text-lg font-semibold leading-snug text-text">{value.title}</span>
                <span className="text-sm leading-relaxed text-muted">{value.body}</span>
              </span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
