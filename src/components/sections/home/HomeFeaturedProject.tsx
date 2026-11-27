import Image from "next/image";
import { ActionLink } from "@/components/ui/ActionLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { cn } from "@/components/ui/cn";
import { Reveal } from "@/experience/fx/Reveal";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { Achievement, Project, ProjectDetail } from "@/server/queries/types";
import { AchievementsCard } from "./HomeAchievements";

export interface HomeFeaturedProjectProps {
  locale: AppLocale;
  eyebrow?: string;
  title?: string;
  description?: string;
  /** Used when only achievements are available (no published project). */
  achievementsTitle: string;
  achievementsLabel: string;
  caseStudyLabel: string;
  technologiesLabel: string;
  allWorkLabel: string;
  project: Project | null;
  detail: ProjectDetail | null;
  achievements: Achievement[];
}

/**
 * Featured project (reference): text + tech tags + case-study link · cover "mockup" on a warm
 * glow · 2×2 achievements card. Each part hides when its data is missing; with no project but
 * real achievements, the card stands alone under a short heading.
 */
export function HomeFeaturedProject({
  locale,
  eyebrow,
  title,
  description,
  achievementsTitle,
  achievementsLabel,
  caseStudyLabel,
  technologiesLabel,
  allWorkLabel,
  project,
  detail,
  achievements,
}: HomeFeaturedProjectProps) {
  const hasStats = achievements.length > 0;
  if (!project && !hasStats) return null;

  if (!project) {
    return (
      <section aria-labelledby="home-work-title" className="section-y">
        <div className="container-lava grid items-center gap-[var(--space-split)] lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading layout="intro" size="md" kicker={eyebrow} title={title || achievementsTitle} lead={description} titleId="home-work-title" />
          </div>
          <Reveal mode="block" className="lg:col-span-8">
            <AchievementsCard achievements={achievements} locale={locale} layout="row" label={achievementsLabel} />
          </Reveal>
        </div>
      </section>
    );
  }

  const technologies = detail?.technologies ?? [];
  const href = `/work/${project.slug}`;

  return (
    <section aria-labelledby="home-work-title" className="section-y">
      <div className="container-lava grid items-center gap-[var(--space-grid-lg)] lg:grid-cols-12">
        <div className={cn("flex flex-col items-start gap-[var(--space-copy)]", hasStats ? "lg:col-span-4" : "lg:col-span-5")}>
          <SectionHeading
            layout="intro"
            size="md"
            kicker={eyebrow}
            title={title || project.title}
            lead={description || project.summary || undefined}
            titleId="home-work-title"
          />
          {title && title !== project.title && <p className="font-display text-lg font-semibold">{project.title}</p>}
          {technologies.length > 0 ? (
            <ul className="flex flex-wrap gap-2.5" aria-label={technologiesLabel}>
              {technologies.slice(0, 6).map((tech) => (
                <li key={tech.slug}>
                  <Tag tone="default" className="bg-surface shadow-[var(--shadow-xs)]" dir="ltr">
                    {tech.icon ? (
                      <Image src={tech.icon.url} alt="" width={14} height={14} className="-ms-0.5 me-1 inline size-3.5 object-contain align-[-2px]" />
                    ) : null}
                    {tech.name}
                  </Tag>
                </li>
              ))}
            </ul>
          ) : project.category ? (
            <Tag tone="lava">{project.category.name}</Tag>
          ) : null}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-[var(--space-cta)]">
            <ActionLink href={href} variant="text" size="sm">
              {caseStudyLabel}
            </ActionLink>
            <Link
              href="/work"
              data-cursor="pointer"
              className="text-sm font-semibold text-muted underline-offset-4 transition-colors hover:text-text hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
            >
              {allWorkLabel}
            </Link>
          </div>
        </div>

        <Reveal mode="block" delay={80} className={cn("home-project-stage", hasStats ? "lg:col-span-5" : "lg:col-span-7")}>
          <Link
            href={href}
            data-cursor="view"
            tabIndex={-1}
            aria-hidden="true"
            className="group block overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface p-2 shadow-[var(--shadow-lift)] transition-transform duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1"
          >
            <span className="relative block aspect-[16/10] overflow-hidden rounded-[calc(var(--radius-lg)-6px)]">
              {project.cover ? (
                <Image
                  src={project.cover.url}
                  alt=""
                  fill
                  sizes={hasStats ? "(max-width: 1023px) 92vw, 520px" : "(max-width: 1023px) 92vw, 720px"}
                  placeholder={project.cover.blurDataUrl ? "blur" : "empty"}
                  blurDataURL={project.cover.blurDataUrl ?? undefined}
                  className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
                />
              ) : (
                <span className="home-project-plate surface-dark flex size-full flex-col justify-end gap-1 p-7">
                  {project.clientName ? <span className="text-sm text-muted">{project.clientName}</span> : null}
                  <span className="font-display text-2xl font-bold text-text">{project.title}</span>
                </span>
              )}
            </span>
          </Link>
        </Reveal>

        {hasStats ? (
          <Reveal mode="block" delay={160} className="lg:col-span-3">
            <AchievementsCard achievements={achievements} locale={locale} label={achievementsLabel} />
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
