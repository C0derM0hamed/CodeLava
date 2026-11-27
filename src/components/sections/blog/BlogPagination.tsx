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
    "group inline-flex h-11 items-center gap-2 rounded-pill border border-line-strong bg-surface px-5 text-sm font-semibold text-text shadow-xs transition-[border-color,box-shadow,color,transform] duration-200 hover:-translate-y-px hover:border-line-lava-strong hover:text-accent-text hover:shadow-card motion-reduce:hover:translate-y-0";
  return (
    <nav
      aria-label={label}
      className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8"
    >
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" className={linkClass} data-cursor="pointer">
          <ArrowLeft aria-hidden="true" className="rtl-flip size-4 transition-transform group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5" />
          <span>{previousLabel}</span>
        </Link>
      ) : (
        <span aria-hidden="true" className="hidden sm:block sm:w-28" />
      )}
      <p
        className="rounded-pill border border-line bg-surface px-4 py-1.5 text-sm font-medium text-muted shadow-[var(--shadow-xs)]"
        aria-current="page"
      >
        {status}
      </p>
      {page < pageCount ? (
        <Link href={hrefFor(page + 1)} rel="next" className={cn(linkClass)} data-cursor="pointer">
          <span>{nextLabel}</span>
          <ArrowRight aria-hidden="true" className="rtl-flip size-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
        </Link>
      ) : (
        <span aria-hidden="true" className="hidden sm:block sm:w-28" />
      )}
    </nav>
  );
}
