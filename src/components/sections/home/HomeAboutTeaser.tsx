import Image from "next/image";
import { ActionLink } from "@/components/ui/ActionLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/experience/fx/Reveal";
import { StepIcon } from "@/components/sections/process/step-icon";

export interface ValueProp {
  icon: string;
  title: string;
  body: string;
}

export interface HomeAboutTeaserProps {
  eyebrow?: string;
  title: string;
  description?: string;
  ctaLabel: string;
  imageAlt: string;
  values: ValueProp[];
}

/**
 * About teaser (reference): brand key art · split text with an outlined pill to /about ·
 * three value props with orange line icons behind a hairline divider. Brand copy only.
 */
export function HomeAboutTeaser({ eyebrow, title, description, ctaLabel, imageAlt, values }: HomeAboutTeaserProps) {
  return (
    <section aria-labelledby="home-about-title" className="section-y">
      <div className="container-lava grid items-center gap-[var(--space-split)] lg:grid-cols-12">
        <Reveal mode="block" className="home-key-art-stage lg:col-span-5">
          <div className="home-key-art group aspect-[4/3]">
            <Image
              src="/brand/logo-key-art.png"
              alt={imageAlt}
              fill
              sizes="(max-width: 1023px) 92vw, 620px"
              className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
            />
          </div>
        </Reveal>

        <div className="grid gap-[var(--space-grid-lg)] lg:col-span-7 xl:grid-cols-7">
          <div className="xl:col-span-4">
            <SectionHeading
              layout="intro"
              size="md"
              kicker={eyebrow}
              title={title}
              lead={description}
              titleId="home-about-title"
              action={
                <ActionLink href="/about" variant="secondary" size="sm">
                  {ctaLabel}
                </ActionLink>
              }
            />
          </div>
          {values.length > 0 ? (
            <ul className="grid gap-3 sm:grid-cols-3 xl:col-span-3 xl:grid-cols-1 xl:gap-4 xl:border-s xl:border-line xl:ps-10">
              {values.map((value, index) => (
                <Reveal as="li" mode="block" delay={index * 90} key={value.title} className="home-value-item flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="grid size-11 shrink-0 place-items-center rounded-xl border border-lava-500/15 bg-accent-soft text-accent-text"
                  >
                    <StepIcon icon={value.icon} className="size-[1.375rem]" />
                  </span>
                  <span className="grid gap-1">
                    <span className="font-display text-base font-semibold text-text">{value.title}</span>
                    <span className="text-sm leading-relaxed text-muted">{value.body}</span>
                  </span>
                </Reveal>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
