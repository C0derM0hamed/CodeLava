"use client";

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Link as IntlLink } from "@/i18n/navigation";
import { MagneticLink } from "@/experience/fx/MagneticLink";
import { ArrowRightIcon, ArrowUpRightIcon, PlayIcon } from "./Icons";
import { cn } from "./cn";

/**
 * Visual variants (v2 "Daylight Magma"):
 * - `primary`   orange gradient pill, white label, trailing arrow, lava shadow. THE main CTA.
 * - `molten`    legacy alias → renders exactly like `primary` (kept so existing pages don't break).
 * - `secondary` white pill, hairline border, ink label (flips to ink-800 pill inside `.surface-dark`).
 * - `text`      inline text link: `--accent-text` label + arrow (end of split intros, "View case study →").
 * - `ghost`     same look as `text` but no arrow by default (e.g. "Back" buttons in forms).
 * - `play`      round play button + ink label ("Watch our work").
 * - `inverse`   for dark bands: solid white pill with ink label.
 * - `outline`   outlined pill using the current surface's text colour (white on dark bands, ink on light).
 */
export type ActionVariant =
  | "primary"
  | "molten"
  | "secondary"
  | "text"
  | "ghost"
  | "play"
  | "inverse"
  | "outline";
export type ActionSize = "sm" | "md" | "lg";
export type ActionArrow = "right" | "up-right" | "none";

interface SharedActionProps {
  children: ReactNode;
  variant?: ActionVariant;
  size?: ActionSize;
  /** Trailing arrow (mirrors in RTL). Default "right" for every variant except `ghost` and `play`. */
  arrow?: ActionArrow;
  /** Wraps the control in a subtle magnetic cursor pull (fine pointers only). */
  magnetic?: boolean;
  /** Shows a spinner and disables interaction (button mode). */
  loading?: boolean;
  /** Force a raw <a> (mailto:, tel:, #hash, https://, non-localized paths). Auto-detected for common schemes. */
  external?: boolean;
  /** Stretch to the container width (pill variants). */
  fullWidth?: boolean;
  className?: string;
}

type LinkActionProps = SharedActionProps & {
  href: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children">;

type ButtonActionProps = SharedActionProps & {
  href?: undefined;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

export type ActionLinkProps = LinkActionProps | ButtonActionProps;

const PILL_SIZES: Record<ActionSize, string> = {
  sm: "h-10 gap-2 px-[1.125rem] text-sm",
  md: "h-12 gap-2.5 px-6 text-[0.9375rem]",
  lg: "h-14 gap-3 px-7 text-base",
};

const TEXT_SIZES: Record<ActionSize, string> = {
  sm: "min-h-7 gap-1.5 text-sm",
  md: "min-h-8 gap-2 text-[0.9375rem]",
  lg: "min-h-9 gap-2.5 text-base",
};

const PLAY_SIZES: Record<ActionSize, { wrap: string; disc: string; icon: number }> = {
  sm: { wrap: "gap-2.5 text-sm", disc: "h-10 w-10", icon: 12 },
  md: { wrap: "gap-3 text-[0.9375rem]", disc: "h-12 w-12", icon: 14 },
  lg: { wrap: "gap-3.5 text-base", disc: "h-14 w-14", icon: 16 },
};

const ICON_SIZE: Record<ActionSize, number> = { sm: 15, md: 16, lg: 18 };

const PILL_BASE =
  "rounded-[var(--radius-pill)] font-semibold leading-none whitespace-nowrap " +
  "transition-[transform,box-shadow,background-color,border-color,color] duration-300 ease-[var(--ease-out-expo)] " +
  "hover:-translate-y-0.5 active:translate-y-0 active:duration-100 motion-reduce:hover:translate-y-0";

const VARIANT_CLASS: Record<Exclude<ActionVariant, "play">, string> = {
  primary: cn(
    PILL_BASE,
    "isolate overflow-hidden text-on-accent shadow-[var(--shadow-lava)] hover:shadow-[var(--shadow-lava-hover)]",
    "[background-image:var(--gradient-cta)]",
  ),
  molten: "",
  secondary: cn(
    PILL_BASE,
    "border border-line-strong bg-surface text-text shadow-[var(--shadow-xs)]",
    "hover:border-line-lava hover:shadow-[var(--shadow-card)]",
  ),
  inverse: cn(
    PILL_BASE,
    "bg-pearl-50 text-ink-900 shadow-[0_10px_30px_-12px_rgb(0_0_0/0.45)]",
    "hover:bg-pearl-100 hover:shadow-[0_16px_36px_-12px_rgb(0_0_0/0.55)]",
  ),
  outline: cn(
    PILL_BASE,
    "border border-line-input bg-transparent text-text",
    "hover:border-text hover:bg-[color-mix(in_oklab,var(--text)_7%,transparent)]",
  ),
  text: "font-semibold text-accent-text",
  ghost: "font-semibold text-accent-text",
};
VARIANT_CLASS.molten = VARIANT_CLASS.primary;

function Arrow({ arrow, size, className }: { arrow: ActionArrow; size: ActionSize; className?: string }) {
  if (arrow === "none") return null;
  const s = ICON_SIZE[size];
  return arrow === "up-right" ? (
    <ArrowUpRightIcon
      size={s}
      className={cn(
        "transition-[translate] duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:group-hover:-translate-x-0.5",
        className,
      )}
    />
  ) : (
    <ArrowRightIcon
      size={s}
      className={cn(
        "transition-[translate] duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1 rtl:group-hover:-translate-x-1",
        className,
      )}
    />
  );
}

/**
 * CodeLava CTA primitive — renders a localized <Link>, a raw <a>, or a <button>.
 * Every variant keeps a visible focus ring, ≥ 24px target size, and respects reduced motion.
 */
export function ActionLink(props: ActionLinkProps) {
  const {
    children,
    variant = "primary",
    size = "md",
    magnetic = false,
    loading = false,
    external = false,
    fullWidth = false,
    className,
  } = props;
  const arrow: ActionArrow =
    props.arrow ?? (variant === "ghost" || variant === "play" ? "none" : "right");

  const isDisabled = "disabled" in props ? Boolean(props.disabled || loading) : loading;
  const isPill = variant !== "text" && variant !== "ghost" && variant !== "play";

  let content: ReactNode;
  if (variant === "play") {
    const spec = PLAY_SIZES[size];
    content = (
      <>
        <span
          aria-hidden="true"
          className={cn(
            "relative inline-flex shrink-0 items-center justify-center rounded-full border border-line bg-surface text-text shadow-[var(--shadow-card)]",
            "transition-[transform,color,box-shadow] duration-300 ease-[var(--ease-out-expo)] group-hover:scale-[1.06] group-hover:text-accent-text group-hover:shadow-[var(--shadow-lift)] motion-reduce:group-hover:scale-100",
            spec.disc,
          )}
        >
          <PlayIcon size={spec.icon} className="translate-x-px" />
        </span>
        <span className="font-semibold text-text">{children}</span>
      </>
    );
  } else if (isPill) {
    content = (
      <>
        {variant === "primary" || variant === "molten" ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] [background-image:var(--gradient-cta-sheen)] opacity-70 transition-opacity duration-300 group-hover:opacity-100"
          />
        ) : null}
        {loading ? (
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        ) : null}
        <span>{children}</span>
        {!loading ? (
          <Arrow
            arrow={arrow}
            size={size}
            className={
              variant === "inverse" ? "text-lava-600" : variant === "secondary" ? "text-accent-text" : undefined
            }
          />
        ) : null}
      </>
    );
  } else {
    // text / ghost
    content = (
      <>
        {loading ? (
          <span
            aria-hidden="true"
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        ) : null}
        <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1.5px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-300 ease-[var(--ease-out-expo)] group-hover:bg-[length:100%_1.5px] rtl:bg-right-bottom">
          {children}
        </span>
        {!loading ? <Arrow arrow={arrow} size={size} /> : null}
      </>
    );
  }

  const classes = cn(
    "group relative inline-flex select-none items-center justify-center",
    "focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-focus",
    variant === "play"
      ? cn("rounded-full", PLAY_SIZES[size].wrap)
      : isPill
        ? cn(VARIANT_CLASS[variant], PILL_SIZES[size], "focus-visible:rounded-[var(--radius-pill)]")
        : cn(VARIANT_CLASS[variant], TEXT_SIZES[size]),
    fullWidth && isPill && "w-full",
    isDisabled && "pointer-events-none opacity-50 hover:translate-y-0",
    className,
  );

  let node: ReactNode;

  if (typeof props.href === "string") {
    const {
      href,
      variant: _v,
      size: _s,
      arrow: _a,
      magnetic: _m,
      loading: _l,
      external: _e,
      fullWidth: _f,
      className: _c,
      children: _ch,
      ...anchorRest
    } = props;
    void [_v, _s, _a, _m, _l, _e, _f, _c, _ch];

    const isRawHref =
      external ||
      href.startsWith("http://") ||
      href.startsWith("https://") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("#");

    node = isRawHref ? (
      <a
        href={href}
        className={classes}
        data-cursor="pointer"
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        {...anchorRest}
      >
        {content}
      </a>
    ) : (
      <IntlLink href={href} className={classes} data-cursor="pointer" {...anchorRest}>
        {content}
      </IntlLink>
    );
  } else {
    const {
      variant: _v,
      size: _s,
      arrow: _a,
      magnetic: _m,
      loading: _l,
      external: _e,
      fullWidth: _f,
      className: _c,
      children: _ch,
      type = "button",
      disabled,
      ...buttonRest
    } = props;
    void [_v, _s, _a, _m, _l, _e, _f, _c, _ch];

    node = (
      <button
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={classes}
        data-cursor="pointer"
        {...buttonRest}
      >
        {content}
      </button>
    );
  }

  return magnetic ? <MagneticLink>{node}</MagneticLink> : node;
}
