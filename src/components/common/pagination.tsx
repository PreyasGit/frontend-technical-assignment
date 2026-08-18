"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  /** Noun used in the "Showing 1–10 of 42 products" summary. */
  itemLabel?: string;
  isLoading?: boolean;
  className?: string;
}

/** Builds a compact page list such as `1 … 4 5 6 … 20`. */
function buildPageList(current: number, totalPages: number): (number | "gap")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, current]);
  if (current - 1 > 1) pages.add(current - 1);
  if (current + 1 < totalPages) pages.add(current + 1);

  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | "gap")[] = [];

  sorted.forEach((pageNumber, index) => {
    if (index > 0 && pageNumber - sorted[index - 1] > 1) result.push("gap");
    result.push(pageNumber);
  });

  return result;
}

/** Server-side pagination control shared by every listing screen. */
export function Pagination({
  page,
  limit,
  total,
  onPageChange,
  itemLabel = "records",
  isLoading = false,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const firstItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const lastItem = Math.min(page * limit, total);
  const pageList = buildPageList(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "flex flex-col items-center justify-between gap-3 sm:flex-row",
        className
      )}
    >
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Showing <span className="font-medium text-foreground">{firstItem}</span>–
        <span className="font-medium text-foreground">{lastItem}</span> of{" "}
        <span className="font-medium text-foreground">{total}</span> {itemLabel}
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          aria-label="Previous page"
          disabled={page <= 1 || isLoading}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <div className="hidden items-center gap-1 md:flex">
          {pageList.map((entry, index) =>
            entry === "gap" ? (
              <span
                key={`gap-${index}`}
                aria-hidden
                className="px-1.5 text-sm text-muted-foreground"
              >
                …
              </span>
            ) : (
              <Button
                key={entry}
                size="icon-sm"
                variant={entry === page ? "default" : "ghost"}
                aria-label={`Page ${entry}`}
                aria-current={entry === page ? "page" : undefined}
                disabled={isLoading}
                onClick={() => onPageChange(entry)}
              >
                {entry}
              </Button>
            )
          )}
        </div>

        <span className="text-sm text-muted-foreground md:hidden">
          {page} / {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          aria-label="Next page"
          disabled={page >= totalPages || isLoading}
          onClick={() => onPageChange(page + 1)}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight />
        </Button>
      </div>
    </nav>
  );
}
