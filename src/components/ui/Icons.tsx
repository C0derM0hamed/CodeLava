import type { SVGProps } from "react";
import { ArrowLeft, Clock, Link2, Mail, MapPin, Menu, Minus, Phone, Send, type LucideIcon } from "lucide-react";
import { cn } from "./cn";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

export function ArrowRightIcon({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0 rtl-flip", className)}
      {...props}
    >
      <path
        d="M2.5 8H13.5M13.5 8L8.75 3.25M13.5 8L8.75 12.75"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowUpRightIcon({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0 rtl-flip", className)}
      {...props}
    >
      <path
        d="M4.25 11.75L11.75 4.25M11.75 4.25H5.5M11.75 4.25V10.5"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronDownIcon({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path
        d="M3.75 6L8 10.25L12.25 6"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CloseIcon({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path
        d="M3.5 3.5L12.5 12.5M12.5 3.5L3.5 12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PlusIcon({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path
        d="M8 3V13M3 8H13"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CheckIcon({ size = 14, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path
        d="M3.25 8.5L6.5 11.75L12.75 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function UploadIcon({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path
        d="M10 13V4M10 4L6.5 7.5M10 4L13.5 7.5M3.5 13.5V15.25C3.5 16.08 4.17 16.75 5 16.75H15C15.83 16.75 16.5 16.08 16.5 15.25V13.5"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FileIcon({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path
        d="M4 2.25H9.5L12.5 5.25V13.75H4V2.25Z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <path d="M9.25 2.25V5.5H12.5" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" />
    </svg>
  );
}

export function GlobeIcon({ size = 15, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
      <ellipse cx="8" cy="8" rx="2.75" ry="6" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2.3 8H13.7" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function AlertCircleIcon({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 5V8.5M8 11H8.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function CheckCircleIcon({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M5.5 8.2L7.25 9.95L10.75 6.2"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function InfoCircleIcon({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 7.4V11M8 5.2H8.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* v2 additions — line icons (lucide, 1.6 stroke) + brand marks for socials   */
/* -------------------------------------------------------------------------- */

function lucideWrap(Icon: LucideIcon, displayName: string, defaultSize = 16, flip = false) {
  function Wrapped({ size = defaultSize, className, strokeWidth = 1.6 }: IconProps) {
    return (
      <Icon
        size={size}
        strokeWidth={Number(strokeWidth)}
        aria-hidden="true"
        focusable="false"
        className={cn("shrink-0", flip && "rtl-flip", className)}
      />
    );
  }
  Wrapped.displayName = displayName;
  return Wrapped;
}

export const MinusIcon = lucideWrap(Minus, "MinusIcon");
export const MenuIcon = lucideWrap(Menu, "MenuIcon", 20);
export const MailIcon = lucideWrap(Mail, "MailIcon");
export const PhoneIcon = lucideWrap(Phone, "PhoneIcon");
export const MapPinIcon = lucideWrap(MapPin, "MapPinIcon");
export const ClockIcon = lucideWrap(Clock, "ClockIcon");
export const SendIcon = lucideWrap(Send, "SendIcon", 16, true);
export const LinkIcon = lucideWrap(Link2, "LinkIcon");
export const ArrowLeftIcon = lucideWrap(ArrowLeft, "ArrowLeftIcon", 16, true);

/** Solid play glyph (optically centred) for the round "play" CTA. */
export function PlayIcon({ size = 14, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path
        d="M5.2 3.1C5.2 2.5 5.86 2.13 6.37 2.45L13.06 7.36C13.5 7.68 13.5 8.32 13.06 8.64L6.37 13.55C5.86 13.87 5.2 13.5 5.2 12.9V3.1Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* Brand marks — simplified single-colour glyphs (currentColor) for social links. */
type BrandGlyph = { viewBox: string; d: string; stroke?: boolean };

const BRAND_GLYPHS = {
  linkedin: {
    viewBox: "0 0 24 24",
    d: "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z",
  },
  x: {
    viewBox: "0 0 24 24",
    d: "M18.24 2.25h3.31l-7.23 8.26 8.5 11.24H16.17l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25H8.08l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z",
  },
  github: {
    viewBox: "0 0 24 24",
    d: "M12 .3a12 12 0 0 0-3.8 23.39c.6.11.82-.26.82-.58v-2.03c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.21.7.82.58A12 12 0 0 0 12 .3",
  },
  youtube: {
    viewBox: "0 0 24 24",
    d: "M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z",
  },
  instagram: {
    viewBox: "0 0 24 24",
    stroke: true,
    d: "M7 2.75h10A4.25 4.25 0 0 1 21.25 7v10A4.25 4.25 0 0 1 17 21.25H7A4.25 4.25 0 0 1 2.75 17V7A4.25 4.25 0 0 1 7 2.75zM12 8.1a3.9 3.9 0 1 0 0 7.8 3.9 3.9 0 0 0 0-7.8zM17.4 6.4h.01",
  },
  behance: {
    viewBox: "0 0 24 24",
    d: "M8.2 11.3c.9-.4 1.5-1.2 1.5-2.3 0-2-1.5-3-3.6-3H1v12h5.4c2.1 0 4-1 4-3.4 0-1.5-.8-2.8-2.2-3.3zM3.6 8h2.2c.9 0 1.6.3 1.6 1.2 0 .9-.6 1.3-1.5 1.3H3.6V8zm2.5 8H3.6v-3.2h2.5c1 0 1.8.4 1.8 1.6S7.1 16 6.1 16zM18.2 8.9c-2.6 0-4.4 1.9-4.4 4.6 0 2.8 1.7 4.6 4.4 4.6 2 0 3.4-.9 4-2.9h-2.1c-.2.7-1 1.1-1.8 1.1-1.3 0-2-.8-2.1-2.1h6.1c.2-2.9-1.4-5.3-4.1-5.3zm-2 3.7c.1-1.1.8-1.8 1.9-1.8 1.1 0 1.7.7 1.8 1.8h-3.7zM15.5 6.5h5.1v1.3h-5.1z",
  },
  dribbble: {
    viewBox: "0 0 24 24",
    stroke: true,
    d: "M12 2.75a9.25 9.25 0 1 0 0 18.5 9.25 9.25 0 0 0 0-18.5zM8.4 3.5c2.6 3.4 4.6 7.4 6 12.2.4 1.5.7 3 .9 4.6M3 10.4c4.6.2 9.1-.7 13.2-3.1 1.1-.7 2.1-1.4 3-2.3M4.6 17.7c2.6-3.4 6.4-5.1 10.6-4.6 2 .2 3.8.8 5.6 1.6",
  },
} satisfies Record<string, BrandGlyph>;

export type SocialNetwork = keyof typeof BRAND_GLYPHS;

/** Infers a known network from a URL or label (e.g. "https://www.linkedin.com/company/x" → "linkedin"). */
export function detectSocialNetwork(hrefOrLabel: string): SocialNetwork | null {
  const v = hrefOrLabel.toLowerCase();
  if (v.includes("linkedin")) return "linkedin";
  if (v.includes("github")) return "github";
  if (v.includes("x.com") || v.includes("twitter") || v === "x") return "x";
  if (v.includes("youtube") || v.includes("youtu.be")) return "youtube";
  if (v.includes("instagram")) return "instagram";
  if (v.includes("behance")) return "behance";
  if (v.includes("dribbble")) return "dribbble";
  return null;
}

export interface SocialIconProps extends IconProps {
  network: SocialNetwork;
}

/** Monochrome brand glyph (inherits currentColor). Decorative — label the parent link. */
export function SocialIcon({ network, size = 18, className, ...props }: SocialIconProps) {
  const glyph: BrandGlyph = BRAND_GLYPHS[network];
  return (
    <svg
      width={size}
      height={size}
      viewBox={glyph.viewBox}
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0", className)}
      {...props}
    >
      {glyph.stroke ? (
        <path
          d={glyph.d}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path d={glyph.d} fill="currentColor" />
      )}
    </svg>
  );
}
