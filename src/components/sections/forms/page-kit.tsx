/**
 * Small server-safe building blocks shared by the conversion pages (services, FAQ, quote,
 * contact, privacy). Token-only styling: white panels, hairline borders, soft shadows, orange
 * line icons — the "Daylight Magma" card language.
 */
import type { ReactNode } from "react";
import { Languages, MessageCircleHeart, ShieldCheck, Handshake, type LucideIcon } from "lucide-react";
import { cn } from "@/components/ui/cn";

/** Page opener: pearl + atmospheric wash, offset for the fixed header. */
export function PageTop({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={cn(
        "page-wash relative pt-[calc(var(--header-h)+var(--hero-top))] pb-[var(--hero-bottom)]",
        className,
      )}
    >
      <div className="container-lava relative">{children}</div>
    </section>
  );
}

/** Plain content section below the opener (centralized fluid vertical rhythm). */
export function PageSection({
  children,
  className,
  labelledBy,
}: {
  children: ReactNode;
  className?: string;
  labelledBy?: string;
}) {
  return (
    <section aria-labelledby={labelledBy} className={cn("section-y", className)}>
      <div className="container-lava">{children}</div>
    </section>
  );
}

/** White rounded panel with a soft shadow — forms, prose, contact cards. */
export function Panel({
  children,
  className,
  as: Tag = "div",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "aside";
} & Omit<React.HTMLAttributes<HTMLElement>, "className" | "children">) {
  return (
    <Tag
      className={cn(
        "rounded-[var(--radius-lg)] border border-line bg-surface p-[var(--space-card)] shadow-card",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Rounded square that holds an orange line icon. */
export function IconTile({
  icon: Icon,
  size = "md",
  className,
}: {
  icon: LucideIcon;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const box = size === "lg" ? "size-14 rounded-[16px]" : size === "sm" ? "size-9 rounded-[10px]" : "size-11 rounded-[12px]";
  const glyph = size === "lg" ? 26 : size === "sm" ? 17 : 21;
  return (
    <span
      aria-hidden="true"
      className={cn("inline-grid shrink-0 place-items-center bg-accent-soft text-accent-text", box, className)}
    >
      <Icon size={glyph} strokeWidth={1.65} />
    </span>
  );
}

export interface ReassuranceCopy {
  title: string;
  reply: { title: string; body: string };
  nda: { title: string; body: string };
  bilingual: { title: string; body: string };
  free: { title: string; body: string };
}

/** The "what to expect" points (reply, NDA, bilingual team, no obligation). Copy only — no stats. */
export function ReassuranceList({
  copy,
  limit,
  className,
}: {
  copy: ReassuranceCopy;
  limit?: number;
  className?: string;
}) {
  const points: { icon: LucideIcon; title: string; body: string }[] = [
    { icon: MessageCircleHeart, ...copy.reply },
    { icon: ShieldCheck, ...copy.nda },
    { icon: Languages, ...copy.bilingual },
    { icon: Handshake, ...copy.free },
  ].slice(0, limit ?? 4);
  return (
    <ul className={cn("grid gap-5", className)}>
      {points.map(({ icon, title, body }) => (
        <li key={title} className="flex items-start gap-4">
          <IconTile icon={icon} size="sm" className="mt-0.5" />
          <div className="min-w-0">
            <p className="font-display text-[0.9375rem] font-semibold leading-snug text-text">{title}</p>
            <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted">{body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
