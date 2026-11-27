import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/experience/fx/Reveal";
import type { AppLocale } from "@/i18n/routing";
import { formatNumber } from "@/lib/i18n-content";

/** Story + mission/vision: balanced editorial split with contrasting daylight + obsidian-magma statements. */
export function AboutStory({
  locale = "en",
  eyebrow,
  title,
  lead,
  story,
  statements,
}: {
  locale?: AppLocale;
  eyebrow?: string;
  title: string;
  lead?: string;
  story: string;
  statements: { label: string; body: string }[];
}) {
  return (
    <section aria-labelledby="about-story-title" className="py-16 sm:py-24">
      <div className="container-lava grid items-start gap-[var(--space-split)] lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading
            layout="intro"
            size="md"
            kicker={eyebrow}
            title={title}
            lead={lead}
            titleId="about-story-title"
          />
        </div>

        <div className="grid gap-7 lg:col-span-7">
          <Reveal
            as="p"
            mode="block"
            className="border-s-2 border-accent ps-5 text-lg leading-relaxed font-normal text-text sm:text-xl sm:leading-relaxed"
          >
            {story}
          </Reveal>

          <div className="grid gap-[var(--space-grid)] sm:grid-cols-2">
            {statements.map((item, index) => {
              const isObsidian = index === 1;
              const num = formatNumber(index + 1, locale, { minimumIntegerDigits: 2 });
              return (
                <Reveal
                  mode="block"
                  delay={index * 90}
                  key={item.label}
                  className={
                    isObsidian
                      ? "surface-dark about-statement-card about-statement-card--obsidian flex flex-col justify-between gap-5"
                      : "about-statement-card flex flex-col justify-between gap-5"
                  }
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="kicker-rule">{item.label}</p>
                    <span
                      dir="ltr"
                      className={
                        isObsidian
                          ? "font-mono text-xs font-semibold text-lava-300 tabular-nums"
                          : "font-mono text-xs font-semibold text-faint tabular-nums"
                      }
                    >
                      {num}
                    </span>
                  </div>
                  <p
                    className={
                      isObsidian
                        ? "font-display text-lg font-semibold leading-snug text-ash-50"
                        : "font-display text-lg font-semibold leading-snug text-text"
                    }
                  >
                    {item.body}
                  </p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
