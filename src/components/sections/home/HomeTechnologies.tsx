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
          <ul className="grid grid-cols-3 gap-3 sm:gap-[var(--space-grid)] min-[460px]:grid-cols-4 lg:grid-cols-6">
            {shown.map((tech, index) => (
              <Reveal as="li" mode="block" delay={index * 35} key={tech.id} className="min-w-0">
                <span className="home-tech-tile group flex h-full flex-col items-center justify-center gap-2.5 px-2 py-4 text-center sm:gap-3 sm:px-3 sm:py-6">
                  <TechnologyLogo technology={tech} size="sm" bare className="home-tech-tile__logo size-10" />
                  <span dir="ltr" className="w-full break-words text-[0.75rem] font-medium leading-tight text-muted transition-colors duration-200 group-hover:text-text sm:text-[0.8125rem]">
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
                  className="home-tech-more group flex h-full min-h-[6.25rem] flex-col items-center justify-center gap-2 px-2 py-4 text-center text-xs font-semibold text-text focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-focus sm:px-3 sm:py-5 sm:text-sm"
                >
                  <span className="grid size-8 place-items-center rounded-full bg-accent-soft text-accent-text transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:scale-110 group-hover:bg-accent-soft-strong">
                    <PlusIcon size={15} />
                  </span>
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
