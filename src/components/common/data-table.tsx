"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { SortOrder } from "@/types/api.types";

export interface DataTableColumn<T> {
  /** Stable identifier, also used as the sort field when `sortable` is set. */
  key: string;
  header: React.ReactNode;
  /** Renders the cell for one row. */
  cell: (row: T) => React.ReactNode;
  /** Enables the clickable sort affordance in the header. */
  sortable?: boolean;
  /** Extra classes applied to both the header and body cells. */
  className?: string;
  /** Hides the column below the `sm` breakpoint to keep mobile readable. */
  hideOnMobile?: boolean;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  /** Unique key extractor, required for stable React reconciliation. */
  getRowId: (row: T) => string | number;
  isLoading?: boolean;
  skeletonRows?: number;
  emptyState?: React.ReactNode;
  /** Current sort column id, matched against `column.key`. */
  sortBy?: string;
  order?: SortOrder;
  onSortChange?: (field: string) => void;
  caption?: string;
  className?: string;
}

/**
 * Presentation-only, generic table.
 *
 * It owns the loading skeleton, the empty state and the sorting affordances so
 * that every listing screen renders a consistent table without duplicating markup.
 */
export function DataTable<T>({
  columns,
  rows,
  getRowId,
  isLoading = false,
  skeletonRows = 6,
  emptyState,
  sortBy,
  order = "asc",
  onSortChange,
  caption,
  className,
}: DataTableProps<T>) {
  const showSkeleton = isLoading;
  const showEmpty = !isLoading && rows.length === 0;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-card shadow-sm",
        className
      )}
    >
      <Table>
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            {columns.map((column) => {
              const isSorted = sortBy === column.key;
              const isSortable = Boolean(column.sortable && onSortChange);

              return (
                <TableHead
                  key={column.key}
                  scope="col"
                  aria-sort={
                    isSorted
                      ? order === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                  className={cn(
                    "px-4 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase",
                    column.hideOnMobile && "hidden sm:table-cell",
                    column.className
                  )}
                >
                  {isSortable ? (
                    <button
                      type="button"
                      onClick={() => onSortChange?.(column.key)}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm transition-colors outline-none hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      {column.header}
                      {isSorted ? (
                        order === "asc" ? (
                          <ArrowUp className="size-3.5 text-primary" />
                        ) : (
                          <ArrowDown className="size-3.5 text-primary" />
                        )
                      ) : (
                        <ArrowUpDown className="size-3.5 opacity-50" />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>

        <TableBody>
          {showSkeleton
            ? Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={cn(
                        "px-4 py-3",
                        column.hideOnMobile && "hidden sm:table-cell",
                        column.className
                      )}
                    >
                      <Skeleton className="h-5 w-full max-w-32" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : null}

          {showEmpty ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="h-40 p-0">
                {emptyState ?? (
                  <p className="py-12 text-center text-sm text-muted-foreground">
                    No records found.
                  </p>
                )}
              </TableCell>
            </TableRow>
          ) : null}

          {!showSkeleton && !showEmpty
            ? rows.map((row) => (
                <TableRow key={getRowId(row)}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={cn(
                        "px-4 py-3",
                        column.hideOnMobile && "hidden sm:table-cell",
                        column.className
                      )}
                    >
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : null}
        </TableBody>
      </Table>
    </div>
  );
}
