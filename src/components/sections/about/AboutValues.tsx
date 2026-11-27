import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/experience/fx/Reveal";
import { StepIcon } from "@/components/sections/process/step-icon";
import type { AppLocale } from "@/i18n/routing";
import { formatNumber } from "@/lib/i18n-content";

/** Principles / approach: heading + four numbered architectural cards with lava icon wells & hover filament. */
export function AboutValues({
  locale = "en",
  eyebrow,
  title,
  lead,
  values,
}: {
  locale?: AppLocale;
  eyebrow?: string;
  title: string;
  lead?: string;
  values: { icon: string; title: string; body: string }[];
}) {
  return (
    <section aria-labelledby="about-values-title" className="pt-4 pb-16 sm:pt-6 sm:pb-24">
      <div className="container-lava grid gap-[var(--space-heading)]">
        <SectionHeading
          layout="split"
          size="md"
          kicker={eyebrow}
          title={title}
          lead={lead}
          titleId="about-values-title"
        />
        <ul className="grid gap-[var(--space-grid)] sm:grid-cols-2 xl:grid-cols-4">
          {values.map((value, index) => {
            const num = formatNumber(index + 1, locale, { minimumIntegerDigits: 2 });
            return (
              <Reveal
                as="li"
                mode="block"
                delay={index * 75}
                key={value.title}
                className="about-value-card group flex flex-col gap-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    aria-hidden="true"
                    className="grid size-12 place-items-center rounded-[14px] border border-line-lava bg-accent-soft text-accent-text transition-colors duration-300 group-hover:bg-accent-soft-strong"
                  >
                    <StepIcon icon={value.icon} className="size-5" />
                  </span>
                  <span
                    dir="ltr"
                    className="font-mono text-xs font-semibold text-faint tabular-nums transition-colors duration-300 group-hover:text-accent-text"
                  >
                    {num}
                  </span>
                </div>

                <div className="grid gap-2.5">
                  <h3 className="font-display text-lg font-bold leading-snug text-text">
                    {value.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted">{value.body}</p>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
