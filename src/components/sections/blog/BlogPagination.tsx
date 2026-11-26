import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/components/ui/cn";

export interface BlogPaginationProps {
  page: number;
  pageCount: number;
  label: string;
  status: string;
  previousLabel: string;
  nextLabel: string;
  hrefFor: (page: number) => string;
}

export function BlogPagination({ page, pageCount, label, status, previousLabel, nextLabel, hrefFor }: BlogPaginationProps) {
  if (pageCount <= 1) return null;
  const linkClass =
    "inline-flex h-11 items-center gap-2 rounded-pill border border-line bg-surface px-5 text-sm font-semibold text-text shadow-xs transition-[border-color,box-shadow] hover:border-line-lava-strong hover:shadow-card";
  return (
    <nav aria-label={label} className="mt-14 flex items-center justify-between gap-4">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" className={linkClass} data-cursor="pointer">
          <ArrowLeft aria-hidden="true" className="rtl-flip size-4" />
          {previousLabel}
        </Link>
      ) : (
        <span />
      )}
      <p className="text-sm text-faint" aria-current="page">
        {status}
      </p>
      {page < pageCount ? (
        <Link href={hrefFor(page + 1)} rel="next" className={cn(linkClass)} data-cursor="pointer">
          {nextLabel}
          <ArrowRight aria-hidden="true" className="rtl-flip size-4" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
