import { PlusIcon } from "@/components/ui/Icons";
import { SplitIntro } from "@/components/ui/SplitIntro";
import { Reveal } from "@/experience/fx/Reveal";
import { Link } from "@/i18n/navigation";
import { TechnologyLogo } from "@/components/sections/technologies/TechnologyLogo";
import type { Technology } from "@/server/queries/types";

const MAX_LOGOS = 11;

export interface HomeTechnologiesProps {
  eyebrow?: string;
  title: string;
  description?: string;
  exploreLabel: string;
  /** e.g. "+ {count} more" — already formatted. */
  moreLabel: (count: number) => string;
  technologies: Technology[];
}

/** Technologies split intro + white logo tiles (uploaded icon or brand-tinted monogram) + "+ more". */
export function HomeTechnologies({ eyebrow, title, description, exploreLabel, moreLabel, technologies }: HomeTechnologiesProps) {
  if (technologies.length === 0) return null;
  const shown = technologies.slice(0, MAX_LOGOS);
  const rest = technologies.length - shown.length;

  return (
    <section aria-labelledby="home-tech-title" className="section-y">
      <div className="container-lava">
        <SplitIntro
          kicker={eyebrow}
          title={title}
          lead={description}
          link={{ href: "/technologies", label: exploreLabel }}
          titleId="home-tech-title"
          alignIntro="center"
        >
          <ul className="grid grid-cols-3 gap-[var(--space-grid)] min-[460px]:grid-cols-4 lg:grid-cols-6">
            {shown.map((tech, index) => (
              <Reveal as="li" mode="block" delay={index * 35} key={tech.id} className="min-w-0">
                <span className="flex h-full flex-col items-center gap-3 rounded-[var(--radius-md)] border border-line bg-surface px-3 py-5 text-center shadow-card transition-[transform,box-shadow] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:shadow-lift sm:py-6">
                  <TechnologyLogo technology={tech} size="sm" bare className="size-10" />
                  <span dir="ltr" className="w-full truncate text-[0.8125rem] font-medium text-muted">
                    {tech.name}
                  </span>
                </span>
              </Reveal>
            ))}
            {rest > 0 ? (
              <Reveal as="li" mode="block" delay={shown.length * 35} className="min-w-0">
                <Link
                  href="/technologies"
                  data-cursor="pointer"
                  className="group flex h-full min-h-[6.5rem] flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-line-strong bg-surface/60 px-3 py-5 text-center text-sm font-semibold text-text transition-[border-color,color,background-color] duration-300 hover:border-line-lava-strong hover:bg-surface hover:text-accent-text focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-focus"
                >
                  <PlusIcon size={16} className="text-accent-text" />
                  <span>{moreLabel(rest)}</span>
                </Link>
              </Reveal>
            ) : null}
          </ul>
        </SplitIntro>
      </div>
    </section>
  );
}
