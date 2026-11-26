import { Counter } from "@/experience/fx/Counter";
import { LavaDivider } from "@/experience/fx/LavaDivider";
import type { AppLocale } from "@/i18n/routing";
import type { WorkMetricItem } from "./types";

export interface CaseStudyMetricsBandProps {
  locale: AppLocale;
  metrics: WorkMetricItem[];
}

type ParsedMetric =
  | { kind: "numeric"; prefix: string; value: number; decimals: number; suffix: string }
  | { kind: "static"; text: string };

function parseMetricValue(raw: string): ParsedMetric {
  const trimmed = raw.trim();
  const match = /^([^\d.-]*)(-?\d+(?:\.\d+)?)(.*)$/.exec(trimmed);
  if (!match) return { kind: "static", text: trimmed };

  const [, prefix, numStr, suffix] = match;
  // Avoid mangling compound expressions like "24/7" or "3-5x"
  if (/\d/.test(suffix)) {
    return { kind: "static", text: trimmed };
  }

  const value = Number(numStr);
  if (!Number.isFinite(value)) return { kind: "static", text: trimmed };

  const decimalPart = numStr.split(".")[1];
  const decimals = decimalPart ? decimalPart.length : 0;

  return { kind: "numeric", prefix, value, decimals, suffix };
}

export function CaseStudyMetricsBand({ locale, metrics }: CaseStudyMetricsBandProps) {
  if (metrics.length === 0) return null;

  const isRtl = locale === "ar";
  const gridColsClass =
    metrics.length === 1
      ? "sm:grid-cols-1"
      : metrics.length === 2
        ? "sm:grid-cols-2"
        : metrics.length === 3
          ? "sm:grid-cols-3"
          : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <section
      aria-label={isRtl ? "نتائج قابلة للقياس" : "Measured outcomes"}
      className="py-10 sm:py-14"
    >
      <div className="container-lava">
        <LavaDivider variant="seam" />

        <div className={`grid grid-cols-1 divide-y divide-line border-b border-line sm:divide-x sm:divide-y-0 ${gridColsClass}`}>
          {metrics.map((metric, idx) => {
            const parsed = parseMetricValue(metric.value);
            return (
              <div
                key={`${metric.label}-${idx}`}
                className="flex flex-col justify-between gap-3 py-8 sm:px-6 sm:first:ps-0 sm:last:pe-0 sm:py-10"
              >
                <div className="font-display text-4xl font-medium text-lava-gradient sm:text-5xl lg:text-6xl">
                  {parsed.kind === "numeric" ? (
                    <Counter
                      value={parsed.value}
                      decimals={parsed.decimals}
                      prefix={parsed.prefix}
                      suffix={parsed.suffix}
                      locale={locale}
                      useLocaleDigits={isRtl}
                    />
                  ) : (
                    <span dir="ltr" className="tabular-nums">
                      {parsed.text}
                    </span>
                  )}
                </div>

                <p className="max-w-[28ch] text-sm leading-relaxed text-muted">{metric.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
