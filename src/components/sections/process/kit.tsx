/**
 * Small "daylight" kit shared by the Pages lane (process, technologies, blog, work).
 *
 * Why local: the shared `components/ui` primitives were still being restyled from the old dark
 * direction while these pages were built. These helpers only use design tokens from globals.css
 * (pill CTA, kicker rule, white cards) so they can be swapped for the shared ones later without
 * touching the pages' logic.
 */
import type { ReactNode } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/components/ui/cn";

/* ------------------------------------------------------------------ links */

export type PillVariant = "primary" | "outline" | "onDark";
type PillSize = "sm" | "md" | "lg";

const PILL_SIZE: Record<PillSize, string> = {
  sm: "h-10 px-5 text-sm",
  md: "h-12 px-6 text-[0.95rem]",
  lg: "h-14 px-8 text-base",
};

const PILL_VARIANT: Record<PillVariant, string> = {
  primary:
    "border border-transparent bg-[image:var(--gradient-cta)] text-white shadow-lava hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-10px_color-mix(in_oklab,var(--lava-600)_65%,transparent)]",
  outline:
    "border border-line-strong bg-surface text-text shadow-xs hover:-translate-y-0.5 hover:border-line-lava-strong hover:shadow-card",
  onDark:
    "border border-white/25 bg-transparent text-white hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/10",
};

export interface PillLinkProps {
  href: string;
  children: ReactNode;
  variant?: PillVariant;
  size?: PillSize;
  /** Trailing arrow. Mirrors automatically in RTL. */
  arrow?: boolean;
  className?: string;
  "aria-label"?: string;
}

function isExternal(href: string) {
  return /^(https?:|mailto:|tel:)/.test(href);
}

export function PillLink({
  href,
  children,
  variant = "primary",
  size = "md",
  arrow = true,
  className,
  ...rest
}: PillLinkProps) {
  const classes = cn(
    "group inline-flex shrink-0 items-center justify-center gap-2.5 rounded-pill font-semibold whitespace-nowrap",
    "transition-[transform,box-shadow,border-color,background-color] duration-300 ease-[var(--ease-out-expo)]",
    PILL_SIZE[size],
    PILL_VARIANT[variant],
    className,
  );
  const inner = (
    <>
      <span>{children}</span>
      {arrow ? (
        <ArrowRight
          aria-hidden="true"
          className="rtl-flip size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
        />
      ) : null}
    </>
  );
  return isExternal(href) ? (
    <a href={href} className={classes} target="_blank" rel="noopener noreferrer" data-cursor="pointer" {...rest}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={classes} data-cursor="pointer" {...rest}>
      {inner}
    </Link>
  );
}

export interface TextLinkProps {
  href: string;
  children: ReactNode;
  /** "up-right" for outbound / detail links. */
  icon?: "right" | "up-right";
  className?: string;
  "aria-label"?: string;
}

/** Orange text link with trailing arrow — the "Explore all →" end of a split intro. */
export function TextLink({ href, children, icon = "right", className, ...rest }: TextLinkProps) {
  const Icon = icon === "up-right" ? ArrowUpRight : ArrowRight;
  const classes = cn(
    "group inline-flex items-center gap-2 text-[0.95rem] font-semibold text-accent-text transition-[gap,color] duration-300",
    "hover:gap-3",
    className,
  );
  const inner = (
    <>
      <span>{children}</span>
      <Icon aria-hidden="true" className="rtl-flip size-4" />
    </>
  );
  return isExternal(href) ? (
    <a href={href} className={classes} target="_blank" rel="noopener noreferrer" data-cursor="pointer" {...rest}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={classes} data-cursor="pointer" {...rest}>
      {inner}
    </Link>
  );
}

/* ------------------------------------------------------------------ type */

/** `— Our process` kicker from the reference. */
export function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("kicker-rule", className)}>{children}</p>;
}

/**
 * Splits a headline into a plain first line and a highlighted second line, mirroring the
 * reference ("We Turn Ideas Into / Real Digital Products"). Word-based, so Arabic shaping is safe.
 */
export function HighlightTitle({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  if (words.length < 3) return <>{text}</>;
  const tailCount = Math.max(1, Math.round(words.length * 0.45));
  const lead = words.slice(0, words.length - tailCount).join(" ");
  const tail = words.slice(words.length - tailCount).join(" ");
  return (
    <>
      <span className="block">{lead}</span>{" "}
      <span className="text-lava-gradient block pb-[0.08em]">{tail}</span>
    </>
  );
}

export interface SectionIntroProps {
  kicker?: string;
  title: string;
  lead?: string;
  action?: ReactNode;
  as?: "h1" | "h2";
  className?: string;
  /** Class for the h tag, defaults to section size. */
  titleClassName?: string;
}

/** Left column of the signature "split intro": kicker, two-line H2, short intro, text action. */
export function SectionIntro({
  kicker,
  title,
  lead,
  action,
  as: Tag = "h2",
  className,
  titleClassName,
}: SectionIntroProps) {
  return (
    <div className={cn("flex flex-col items-start gap-[var(--space-copy)]", className)}>
      {kicker ? <Kicker>{kicker}</Kicker> : null}
      <Tag className={cn("text-display-md text-text", titleClassName)}>{title}</Tag>
      {lead ? <p className="text-body max-w-[46ch] text-muted">{lead}</p> : null}
      {action ? <div className="pt-[var(--space-cta)]">{action}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ chips */

export function Chip({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: "default" | "accent" | "ink";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill border px-3 py-1 text-xs leading-5 font-medium",
        tone === "default" && "border-line bg-surface text-muted",
        tone === "accent" && "border-line-lava bg-[color-mix(in_oklab,var(--lava-500)_8%,white)] text-accent-text",
        tone === "ink" && "border-transparent bg-text text-bg",
        className,
      )}
    >
      {children}
    </span>
  );
}

export interface FilterPillOption {
  value: string;
  label: string;
  count?: number | string;
  href: string;
}

/** URL-driven filter pills (server-rendered links, `aria-current` on the active one). */
export function FilterPills({
  options,
  value,
  ariaLabel,
  className,
}: {
  options: FilterPillOption[];
  value: string;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <nav aria-label={ariaLabel} className={className}>
      <ul className="flex flex-wrap items-center gap-2.5">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <li key={option.value || "all"}>
              <Link
                href={option.href}
                aria-current={active ? "true" : undefined}
                data-cursor="pointer"
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-pill border px-4 text-sm font-medium transition-[background-color,border-color,color,box-shadow] duration-200",
                  active
                    ? "border-transparent bg-text text-bg shadow-card"
                    : "border-line bg-surface text-muted hover:border-line-lava-strong hover:text-text",
                )}
              >
                <span>{option.label}</span>
                {option.count !== undefined ? (
                  <span dir="ltr" className={cn("text-xs tabular-nums", active ? "text-bg/70" : "text-faint")}>
                    {option.count}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Page hero wrapper: pearl + atmospheric wash, offset for the fixed header. */
export function PageHero({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={cn(
        "page-wash relative overflow-hidden pt-[calc(var(--header-h)+var(--hero-top))] pb-[var(--hero-bottom)]",
        className,
      )}
    >
      <div className="container-lava relative">{children}</div>
    </section>
  );
}
