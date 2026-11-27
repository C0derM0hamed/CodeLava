import Image from "next/image";
import { ActionLink } from "@/components/ui/ActionLink";
import { ArrowRightIcon } from "@/components/ui/Icons";
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
    <section aria-labelledby="home-work-title" className="section-y home-band--tinted">
      <div className="container-lava grid items-center gap-[var(--space-grid-lg)] lg:grid-cols-12">
        <div
          className={cn(
            "flex flex-col items-start gap-[var(--space-copy)]",
            hasStats ? "lg:col-span-5 xl:col-span-4" : "lg:col-span-5",
          )}
        >
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
            <ul className="flex flex-wrap gap-2" aria-label={technologiesLabel}>
              {technologies.slice(0, 6).map((tech) => (
                <li key={tech.slug}>
                  <Tag tone="default" className="border-line-strong/70 bg-surface shadow-[var(--shadow-xs)]" dir="ltr">
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
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-[var(--space-cta)]">
            <ActionLink href={href} variant="primary" size="sm">
              {caseStudyLabel}
            </ActionLink>
            <ActionLink href="/work" variant="text" size="sm">
              {allWorkLabel}
            </ActionLink>
          </div>
        </div>

        <Reveal
          mode="block"
          delay={80}
          className={cn("home-project-stage", hasStats ? "lg:col-span-7 xl:col-span-5" : "lg:col-span-7")}
        >
          <Link
            href={href}
            data-cursor="view"
            tabIndex={-1}
            aria-hidden="true"
            className="home-project-frame group block"
          >
            <span className="relative block aspect-[16/10] overflow-hidden rounded-[calc(var(--radius-lg)-6px)] bg-ink-900">
              {project.cover ? (
                <Image
                  src={project.cover.url}
                  alt=""
                  fill
                  sizes={hasStats ? "(max-width: 1023px) 92vw, 560px" : "(max-width: 1023px) 92vw, 720px"}
                  placeholder={project.cover.blurDataUrl ? "blur" : "empty"}
                  blurDataURL={project.cover.blurDataUrl ?? undefined}
                  className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.035]"
                />
              ) : (
                <span className="home-project-plate surface-dark flex size-full flex-col justify-end gap-1 p-7">
                  {project.clientName ? <span className="text-sm text-muted">{project.clientName}</span> : null}
                  <span className="font-display text-2xl font-bold text-text">{project.title}</span>
                </span>
              )}
              <span className="home-project-badge pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-ink-950/78 px-3.5 py-2 text-xs font-semibold text-ash-50 backdrop-blur-md">
                <span className="truncate">{project.title}</span>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-lava-300">
                  <span>{caseStudyLabel}</span>
                  <ArrowRightIcon size={13} />
                </span>
              </span>
            </span>
          </Link>
        </Reveal>

        {hasStats ? (
          <Reveal mode="block" delay={160} className="lg:col-span-12 xl:col-span-3">
            <AchievementsCard
              achievements={achievements}
              locale={locale}
              responsiveRowOnLg
              label={achievementsLabel}
            />
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
