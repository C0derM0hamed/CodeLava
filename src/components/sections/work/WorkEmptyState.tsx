import { LogoMark } from "@/components/brand/LogoMark";
import { ActionLink } from "@/components/ui/ActionLink";
import { HeatEdge } from "@/experience/fx/LavaDivider";
import type { AppLocale } from "@/i18n/routing";

export interface WorkEmptyStateProps {
  mode: "empty" | "filtered";
  locale: AppLocale;
  message: string;
  clearFiltersLabel: string;
  discussProjectLabel: string;
  contactLabel: string;
}

export function WorkEmptyState({
  mode,
  locale,
  message,
  clearFiltersLabel,
  discussProjectLabel,
  contactLabel,
}: WorkEmptyStateProps) {
  const isRtl = locale === "ar";
  const kicker =
    mode === "filtered"
      ? isRtl
        ? "تصفية الفئات"
        : "CATEGORY FILTER"
      : isRtl
        ? "قيد التحديث"
        : "ARCHIVE IN PREPARATION";

  const subCopy =
    mode === "filtered"
      ? isRtl
        ? "يمكنك العودة لعرض جميع المشاريع المنشورة أو مناقشة تحدٍّ مشابه مع فريقنا."
        : "Clear the active filter to browse all published engagements, or tell us about your project."
      : isRtl
        ? "نُجهّز حاليًا نشر دراسات الحالة التفصيلية. إذا كان لديك مشروع قيد التخطيط، يسعدنا التحدّث معك مباشرة."
        : "Detailed engineering case studies are being curated for publication. Planning a build now? Let’s talk through your architecture and scope.";

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-line bg-bg-elevated px-6 py-16 text-center sm:px-12 sm:py-24">
      <HeatEdge position="bottom" intensity="subtle" />
      <div
        aria-hidden="true"
        className="heat-haze-radial pointer-events-none absolute inset-x-0 bottom-0 h-56 opacity-45"
      />

      <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center gap-6">
        <LogoMark size={44} animated={false} />
        <span className="text-kicker text-accent">{kicker}</span>
        <h2 className="text-display-sm text-text">{message}</h2>
        <p className="text-body text-muted">{subCopy}</p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-5">
          {mode === "filtered" ? (
            <ActionLink href="/work" variant="molten" size="md">
              {clearFiltersLabel}
            </ActionLink>
          ) : (
            <>
              <ActionLink href="/quote" variant="molten" size="md" magnetic>
                {discussProjectLabel}
              </ActionLink>
              <ActionLink href="/contact" variant="ghost" size="md">
                {contactLabel}
              </ActionLink>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
