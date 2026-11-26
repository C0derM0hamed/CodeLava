import { createElement } from "react";
import {
  BarChart3,
  Bot,
  Boxes,
  Brain,
  Cloud,
  Code2,
  Compass,
  Cpu,
  Database,
  Globe,
  Headphones,
  Layers,
  LayoutGrid,
  Lock,
  Palette,
  PanelsTopLeft,
  PenTool,
  Rocket,
  Server,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Terminal,
  Workflow,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Curated lucide set for service icons (admin stores the icon *name*). Kept explicit so the client
 * quote wizard does not ship the whole icon library. Unknown names fall back to `Code2`.
 */
const SERVICE_ICONS: Record<string, LucideIcon> = {
  BarChart3,
  Bot,
  Boxes,
  Brain,
  Cloud,
  Code2,
  Compass,
  Cpu,
  Database,
  Globe,
  Headphones,
  Layers,
  LayoutGrid,
  Lock,
  Palette,
  PanelsTopLeft,
  PenTool,
  Rocket,
  Server,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Terminal,
  Workflow,
  Wrench,
  Zap,
};

function toPascal(name: string) {
  return name.replace(/(?:^|[-_\s])([a-zA-Z])/g, (_, letter: string) => letter.toUpperCase());
}

export function resolveServiceIcon(name: string | null | undefined, fallback: LucideIcon = Code2): LucideIcon {
  if (!name) return fallback;
  return SERVICE_ICONS[name] ?? SERVICE_ICONS[toPascal(name)] ?? fallback;
}

export function ServiceIcon({
  name,
  size = 22,
  strokeWidth = 1.65,
  className,
}: {
  name: string | null | undefined;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return createElement(resolveServiceIcon(name), {
    size, strokeWidth, className, "aria-hidden": true, focusable: "false",
  });
}
