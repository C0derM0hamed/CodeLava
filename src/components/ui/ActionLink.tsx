"use client";

import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import { Link as IntlLink } from "@/i18n/navigation";
import { MagneticLink } from "@/experience/fx/MagneticLink";
import { ArrowRightIcon, ArrowUpRightIcon } from "./Icons";
import { cn } from "./cn";

export type ActionVariant = "molten" | "primary" | "ghost";
export type ActionSize = "sm" | "md" | "lg";

interface SharedActionProps {
  children: ReactNode;
  /**
   * "molten" (signature default): editorial text link with a lava-filling hairline underline
   * and directional RTL-aware arrow — avoids conventional pill-button clichés.
   * "primary": architectural high-contrast obsidian-forge action for forms & key commits.
   * "ghost": understated hairline-framed secondary control.
   */
  variant?: ActionVariant;
  size?: ActionSize;
  /** Shows directional arrow ("right" | "up-right" | "none"). Defaults to "right" on molten. */
  arrow?: "right" | "up-right" | "none";
  /** Wraps control in subtle magnetic cursor pull. */
  magnetic?: boolean;
  /** Displays subtle loading spinner & disables interaction (button mode). */
  loading?: boolean;
  /** Optional raw anchor (e.g. mailto:, https://, #hash, or non-localized lab links). */
  external?: boolean;
  className?: string;
}

type LinkActionProps = SharedActionProps & {
  href: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children">;

type ButtonActionProps = SharedActionProps & {
  href?: undefined;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

export type ActionLinkProps = LinkActionProps | ButtonActionProps;

const MOLTEN_SIZES: Record<ActionSize, string> = {
  sm: "text-sm pb-1.5 gap-2.5",
  md: "text-[0.98rem] pb-2 gap-3",
  lg: "text-lg md:text-xl pb-2.5 gap-3.5",
};

const BOX_SIZES: Record<ActionSize, string> = {
  sm: "h-9 px-4 text-xs gap-2",
  md: "h-11 px-5.5 text-sm gap-2.5",
  lg: "h-13 px-7 text-[0.98rem] gap-3",
};

function renderArrow(arrow: "right" | "up-right" | "none", size: ActionSize) {
  if (arrow === "none") return null;
  const iconSize = size === "lg" ? 18 : size === "sm" ? 14 : 16;
  return arrow === "up-right" ? (
    <ArrowUpRightIcon
      size={iconSize}
      className="transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:group-hover:-translate-x-0.5"
    />
  ) : (
    <ArrowRightIcon
      size={iconSize}
      className="transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
    />
  );
}

/**
 * Signature CodeLava CTA primitive.
 * Default "molten" variant renders an editorial underlined link whose warm hairline
 * fills with incandescent lava on hover/focus, paired with an RTL-mirrored arrow.
 * "primary" variant delivers a crisp, WCAG AAA machined action for forms and submissions.
 */
export function ActionLink(props: ActionLinkProps) {
  const {
    children,
    variant = "molten",
    size = "md",
    arrow = variant === "molten" ? "right" : "none",
    magnetic = false,
    loading = false,
    external = false,
    className,
  } = props;

  const isDisabled = "disabled" in props ? Boolean(props.disabled || loading) : loading;

  const content =
    variant === "molten" ? (
      <>
        <span className="relative z-10 font-medium text-text transition-colors duration-300 group-hover:text-lava-100">
          {children}
        </span>

        {arrow !== "none" ? (
          <span
            aria-hidden="true"
            className="relative z-10 inline-flex h-6 w-6 items-center justify-center rounded-full border border-line-strong text-accent transition-all duration-300 ease-[var(--ease-out-expo)] group-hover:border-line-lava-strong group-hover:bg-accent/12 group-hover:text-ember"
          >
            {renderArrow(arrow, size)}
          </span>
        ) : null}

        {/* Base subtle ash hairline */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-line-strong"
        />
        {/* Molten fill bar scaling from inline-start → inline-end */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[1.5px] origin-left rtl:origin-right scale-x-0 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
          style={{ background: "var(--gradient-lava)" }}
        />
        {/* Faint heat sheen under underline on hover */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -bottom-1 h-2 origin-left rtl:origin-right scale-x-0 opacity-0 blur-sm transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:scale-x-100 group-hover:opacity-60"
          style={{ background: "var(--gradient-lava)" }}
        />
      </>
    ) : (
      <>
        {loading ? (
          <span
            aria-hidden="true"
            className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent"
          />
        ) : null}
        <span className="relative z-10">{children}</span>
        {!loading ? renderArrow(arrow, size) : null}
      </>
    );

  const classes = cn(
    "group relative inline-flex items-center justify-center select-none transition-all duration-300 ease-[var(--ease-out-expo)]",
    variant === "molten" && cn("bg-transparent", MOLTEN_SIZES[size]),
    variant === "primary" &&
      cn(
        "overflow-hidden rounded-[var(--radius-sm)] bg-accent font-semibold text-obsidian-950",
        "shadow-[inset_0_1px_0_var(--lava-300),0_0_0_1px_var(--lava-600)]",
        "hover:bg-accent-hot hover:shadow-[inset_0_1px_0_var(--ember),var(--lava-glow-sm)]",
        "active:translate-y-px disabled:pointer-events-none disabled:opacity-45",
        BOX_SIZES[size],
      ),
    variant === "ghost" &&
      cn(
        "rounded-[var(--radius-sm)] border border-line-strong bg-transparent font-medium text-text",
        "hover:border-line-lava-strong hover:bg-surface hover:text-lava-100",
        "active:translate-y-px disabled:pointer-events-none disabled:opacity-45",
        BOX_SIZES[size],
      ),
    isDisabled && "pointer-events-none opacity-45",
    className,
  );

  let node: ReactNode;

  if (typeof props.href === "string") {
    const {
      href,
      // strip custom props
      variant: _v,
      size: _s,
      arrow: _a,
      magnetic: _m,
      loading: _l,
      external: _e,
      className: _c,
      children: _ch,
      ...anchorRest
    } = props;
    void _v;
    void _s;
    void _a;
    void _m;
    void _l;
    void _e;
    void _c;
    void _ch;

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
      className: _c,
      children: _ch,
      type = "button",
      disabled,
      ...buttonRest
    } = props;
    void _v;
    void _s;
    void _a;
    void _m;
    void _l;
    void _e;
    void _c;
    void _ch;

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
