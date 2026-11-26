import { icons, type LucideProps } from "lucide-react";

const ALIASES: Record<string, string> = {
  Code2: "CodeXml",
  Code: "CodeXml",
  CheckCircle: "CircleCheck",
  CheckCircle2: "CircleCheck",
  PlayCircle: "CirclePlay",
  AlertCircle: "CircleAlert",
  Edit: "SquarePen",
  Edit3: "PenLine",
  BarChart: "ChartColumn",
  BarChart3: "ChartColumn",
  LineChart: "ChartLine",
  Home: "House",
  Wand2: "WandSparkles",
};

function toPascal(value: string) {
  return value
    .trim()
    .split(/[\s_-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/**
 * Resolves a lucide icon from the free-text `icon` field stored in the DB
 * ("Compass", "pen-tool", legacy "Code2"). Unknown names fall back to a neutral glyph.
 * Server-only: the full icon map must never reach a client bundle.
 */
export function StepIcon({ icon, ...props }: { icon: string | null | undefined } & Omit<LucideProps, "name">) {
  const pascal = icon ? toPascal(icon) : "";
  const Icon = icons[(ALIASES[pascal] ?? pascal) as keyof typeof icons] ?? icons.Layers;
  return <Icon aria-hidden="true" strokeWidth={1.6} {...props} />;
}
