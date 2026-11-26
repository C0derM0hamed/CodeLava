import { PillLink } from "../process/kit";
import { BracketOrnament } from "./ArticleCover";

export interface BlogEmptyProps {
  title: string;
  lead?: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
}

/** Honest empty state: no placeholder posts, just a calm invitation. */
export function BlogEmpty({ title, lead, primary, secondary }: BlogEmptyProps) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 rounded-[var(--radius-xl)] border border-line bg-surface px-6 py-14 text-center shadow-card sm:px-12 sm:py-20">
      <span className="grid size-20 place-items-center rounded-2xl border border-line bg-[color-mix(in_oklab,var(--lava-100)_45%,white)]">
        <BracketOrnament className="w-12" />
      </span>
      <h2 className="text-display-sm text-text">{title}</h2>
      {lead ? <p className="max-w-[44ch] text-body text-muted">{lead}</p> : null}
      {primary || secondary ? (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          {primary ? <PillLink href={primary.href}>{primary.label}</PillLink> : null}
          {secondary ? (
            <PillLink href={secondary.href} variant="outline" arrow={false}>
              {secondary.label}
            </PillLink>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
