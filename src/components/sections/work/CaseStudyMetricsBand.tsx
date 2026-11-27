import { Counter } from "@/experience/fx/Counter";
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
      className="py-6 sm:py-10"
    >
      <div className="container-lava">
        <div className="surface-dark case-metrics-band px-6 pt-5 pb-6 sm:px-10 sm:pt-6 sm:pb-8">
          <div aria-hidden="true" className="work-heat-seam absolute inset-x-0 top-0" />

          <div className="relative mb-2 flex items-center justify-between border-b border-line pb-4">
            <p className="kicker-rule">
              {isRtl ? "نتائج قابلة للقياس" : "Measured outcomes"}
            </p>
            <span
              dir="ltr"
              className="hidden font-mono text-[11px] font-medium tracking-[0.12em] text-ink-300 uppercase sm:inline"
            >
              KPI · IMPACT
            </span>
          </div>

          <div
            className={`relative grid grid-cols-1 divide-y divide-line sm:divide-x sm:divide-y-0 rtl:sm:divide-x-reverse ${gridColsClass}`}
          >
            {metrics.map((metric, idx) => {
              const parsed = parseMetricValue(metric.value);
              return (
                <div
                  key={`${metric.label}-${idx}`}
                  className="flex flex-col justify-between gap-2.5 py-6 sm:px-8 sm:first:ps-0 sm:last:pe-0 sm:py-8"
                >
                  {/* Always isolate LTR around mathematical signs/units (+31%, 2.4x, 0.7s) so RTL bidi never scrambles them */}
                  <div className="font-display text-4xl font-bold text-lava-gradient sm:text-5xl lg:text-[3.5rem] lg:leading-none">
                    <span dir="ltr" className="inline-block tabular-nums">
                      {parsed.kind === "numeric" ? (
                        <Counter
                          value={parsed.value}
                          decimals={parsed.decimals}
                          prefix={parsed.prefix}
                          suffix={parsed.suffix}
                          locale={locale}
                          useLocaleDigits={false}
                        />
                      ) : (
                        parsed.text
                      )}
                    </span>
                  </div>
                  <p className="max-w-[26ch] text-sm font-medium leading-relaxed text-ink-200">
                    {metric.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
