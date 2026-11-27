import { ActionLink } from "@/components/ui/ActionLink";
import { BracketOrnament } from "./ArticleCover";

export interface BlogEmptyProps {
  title: string;
  lead?: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
}

/** Honest empty state: no placeholder posts, just a calm Daylight Magma invitation. */
export function BlogEmpty({ title, lead, primary, secondary }: BlogEmptyProps) {
  return (
    <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5 overflow-hidden rounded-[var(--radius-xl)] border border-line bg-surface px-6 py-14 text-center shadow-card sm:px-12 sm:py-20">
      <span aria-hidden="true" className="lava-seam-hairline pointer-events-none absolute inset-x-12 top-0 h-[1.5px] opacity-80" />
      <span className="grid size-20 place-items-center rounded-2xl border border-line-lava/70 bg-[color-mix(in_oklab,var(--lava-100)_45%,white)] shadow-[0_0_0_6px_var(--accent-soft)]">
        <BracketOrnament className="w-12" />
      </span>
      <h2 className="text-display-sm text-text">{title}</h2>
      {lead ? <p className="max-w-[44ch] text-body text-muted">{lead}</p> : null}
      {primary || secondary ? (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          {primary ? <ActionLink href={primary.href} variant="primary" size="md">{primary.label}</ActionLink> : null}
          {secondary ? (
            <ActionLink href={secondary.href} variant="secondary" size="md" arrow="none">
              {secondary.label}
            </ActionLink>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
