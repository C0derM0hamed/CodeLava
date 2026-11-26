import { BracketOrnament } from "../blog/ArticleCover";
import { PillLink } from "../process/kit";
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
  const subCopy =
    mode === "filtered"
      ? isRtl
        ? "يمكنك العودة لعرض جميع المشاريع المنشورة أو مناقشة تحدٍّ مشابه مع فريقنا."
        : "Clear the active filter to browse all published projects, or tell us about yours."
      : isRtl
        ? "نُجهّز حاليًا نشر دراسات الحالة التفصيلية. إذا كان لديك مشروع قيد التخطيط، يسعدنا التحدّث معك مباشرة."
        : "We’re preparing our detailed case studies. Planning a build now? Let’s talk through your scope.";

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 rounded-[var(--radius-xl)] border border-line bg-surface px-6 py-14 text-center shadow-card sm:px-12 sm:py-20">
      <span className="grid size-20 place-items-center rounded-2xl border border-line bg-[color-mix(in_oklab,var(--lava-100)_45%,white)]">
        <BracketOrnament className="w-12" />
      </span>
      <h2 className="text-display-sm text-text">{message}</h2>
      <p className="max-w-[46ch] text-body text-muted">{subCopy}</p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        {mode === "filtered" ? (
          <PillLink href="/work">{clearFiltersLabel}</PillLink>
        ) : (
          <>
            <PillLink href="/quote">{discussProjectLabel}</PillLink>
            <PillLink href="/contact" variant="outline" arrow={false}>
              {contactLabel}
            </PillLink>
          </>
        )}
      </div>
    </div>
  );
}
