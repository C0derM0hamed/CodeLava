import { BookOpen, Layers } from "lucide-react";
import { LogoMark } from "@/components/brand/LogoMark";
import { Reveal } from "@/experience/fx/Reveal";
import { Kicker, PageHero } from "../process/kit";

function EditorialHeadline({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  if (words.length < 3) return <>{text}</>;
  const tailCount = Math.max(1, Math.round(words.length * 0.45));
  const lead = words.slice(0, words.length - tailCount).join(" ");
  const tail = words.slice(words.length - tailCount).join(" ");
  return (
    <>
      <span className="block">{lead} </span>
      <span className="text-lava-gradient block pb-[0.08em]">{tail}</span>
    </>
  );
}

export interface BlogHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  stats?: {
    articleCount: string;
    articleLabel: string;
    topicCount: string;
    topicLabel: string;
    topTopics?: string[];
  };
}

export function BlogHero({ eyebrow, title, description, stats }: BlogHeroProps) {
  return (
    <PageHero className="pb-10 sm:pb-14">
      <div aria-hidden="true" className="magma-grid-bg pointer-events-none absolute inset-0 opacity-75" />
      <div className="relative grid items-center gap-[var(--space-split)] lg:grid-cols-12">
        <div className="flex flex-col items-start gap-[var(--space-copy)] lg:col-span-7 xl:col-span-8">
          {eyebrow ? <Kicker>{eyebrow}</Kicker> : null}
          <h1 className="text-display-xl max-w-[18ch] text-text">
            <EditorialHeadline text={title} />
          </h1>
          {description ? <p className="text-lead max-w-[54ch]">{description}</p> : null}
        </div>

        <Reveal mode="block" className="hidden lg:col-span-5 lg:block xl:col-span-4">
          <div className="surface-dark relative overflow-hidden rounded-[var(--radius-xl)] border border-line-strong p-6 shadow-[var(--shadow-lift)]">
            <span aria-hidden="true" className="lava-seam-hairline pointer-events-none absolute inset-x-6 top-0 h-[1.5px] opacity-90" />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -end-12 -bottom-16 h-44 w-44 rounded-full opacity-45 blur-3xl"
              style={{ background: "radial-gradient(circle, var(--lava-500), transparent 70%)" }}
            />

            <div className="relative flex items-center justify-between gap-4 border-b border-line pb-4">
              <div className="flex items-center gap-3">
                <LogoMark size={32} animated glow tone="dark" aria-hidden />
                <div className="font-mono text-xs leading-tight text-muted" dir="ltr">
                  <span className="block font-semibold text-text">codelava://insights</span>
                  <span className="text-[11px] text-faint">field-notes · en / ar</span>
                </div>
              </div>
              <span aria-hidden="true" className="inline-flex items-center gap-1.5" dir="ltr">
                <span className="size-2 rounded-full bg-lava-400" />
                <span className="size-2 rounded-full bg-syntax-cyan/70" />
              </span>
            </div>

            {stats ? (
              <div className="relative mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-[var(--radius-md)] border border-line bg-white/[0.04] p-3.5">
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <BookOpen aria-hidden="true" className="size-3.5 text-lava-400" />
                    <span className="truncate">{stats.articleLabel}</span>
                  </div>
                  <p className="mt-2 font-display text-2xl font-bold text-text tabular-nums">
                    {stats.articleCount}
                  </p>
                </div>
                <div className="rounded-[var(--radius-md)] border border-line bg-white/[0.04] p-3.5">
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <Layers aria-hidden="true" className="size-3.5 text-syntax-cyan" />
                    <span className="truncate">{stats.topicLabel}</span>
                  </div>
                  <p className="mt-2 font-display text-2xl font-bold text-text tabular-nums">
                    {stats.topicCount}
                  </p>
                </div>
              </div>
            ) : null}

            {stats?.topTopics && stats.topTopics.length > 0 ? (
              <div className="relative mt-4 flex flex-wrap gap-1.5 border-t border-line pt-4">
                {stats.topTopics.slice(0, 4).map((topic) => (
                  <span
                    key={topic}
                    className="inline-flex items-center rounded-pill border border-line bg-white/[0.05] px-2.5 py-1 text-[11px] font-medium text-muted"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </Reveal>
      </div>
    </PageHero>
  );
}
