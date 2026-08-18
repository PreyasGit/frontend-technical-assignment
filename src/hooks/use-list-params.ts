"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { DEFAULT_PAGE_SIZE } from "@/config/site";
import type { SortOrder } from "@/types/api.types";

/** Query-string keys that every listing screen understands. */
export const LIST_PARAM_KEYS = {
  search: "search",
  page: "page",
  sortBy: "sortBy",
  order: "order",
} as const;

export interface UseListParamsOptions {
  defaultSortBy?: string;
  defaultOrder?: SortOrder;
  pageSize?: number;
}

export interface ListParamsState {
  search: string;
  page: number;
  sortBy: string;
  order: SortOrder;
  limit: number;
  skip: number;
  /** Serialised state of the current listing, used to restore it later. */
  queryString: string;
  /** Reads any additional, screen specific filter from the URL. */
  getFilter: (key: string) => string;
  /** Patches one or more params. Page resets to 1 unless explicitly given. */
  setParams: (patch: Record<string, string | number | undefined>) => void;
  /** Flips the direction when the same column is clicked twice. */
  toggleSort: (field: string) => void;
  /** Clears search, filters and sorting back to their defaults. */
  reset: () => void;
}

/**
 * Keeps search, sorting, pagination and ad-hoc filters in the URL.
 *
 * Because the whole listing state lives in the query string it can be shared,
 * bookmarked, restored after a refresh, and — via {@link ListParamsState.queryString} —
 * handed to a detail page so returning to the list rebuilds the exact same view.
 */
export function useListParams(
  options: UseListParamsOptions = {}
): ListParamsState {
  const {
    defaultSortBy = "",
    defaultOrder = "asc",
    pageSize = DEFAULT_PAGE_SIZE,
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get(LIST_PARAM_KEYS.search) ?? "";
  const sortBy = searchParams.get(LIST_PARAM_KEYS.sortBy) ?? defaultSortBy;
  const order = (searchParams.get(LIST_PARAM_KEYS.order) as SortOrder) || defaultOrder;

  const parsedPage = Number.parseInt(
    searchParams.get(LIST_PARAM_KEYS.page) ?? "1",
    10
  );
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const queryString = searchParams.toString();

  const setParams = useCallback(
    (patch: Record<string, string | number | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === "") next.delete(key);
        else next.set(key, String(value));
      }

      // Any change other than an explicit page change returns to page one.
      if (!("page" in patch)) next.delete(LIST_PARAM_KEYS.page);

      const nextQuery = next.toString();
      router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams]
  );

  const toggleSort = useCallback(
    (field: string) => {
      const nextOrder: SortOrder =
        sortBy === field && order === "asc" ? "desc" : "asc";
      setParams({ sortBy: field, order: nextOrder });
    },
    [order, setParams, sortBy]
  );

  const reset = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  const getFilter = useCallback(
    (key: string) => searchParams.get(key) ?? "",
    [searchParams]
  );

  return useMemo(
    () => ({
      search,
      page,
      sortBy,
      order,
      limit: pageSize,
      skip: (page - 1) * pageSize,
      queryString,
      getFilter,
      setParams,
      toggleSort,
      reset,
    }),
    [
      getFilter,
      order,
      page,
      pageSize,
      queryString,
      reset,
      search,
      setParams,
      sortBy,
      toggleSort,
    ]
  );
}

/** Query-string key carrying the listing state through to a detail screen. */
export const RETURN_PARAM_KEY = "from";

/** Builds a detail/edit href that remembers the listing state it came from. */
export function withReturnState(href: string, listQueryString: string): string {
  if (!listQueryString) return href;
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}${RETURN_PARAM_KEY}=${encodeURIComponent(listQueryString)}`;
}

/** Rebuilds the listing URL that a detail/edit screen was opened from. */
export function resolveReturnHref(
  listPath: string,
  returnValue: string | null | undefined
): string {
  if (!returnValue) return listPath;
  const decoded = decodeURIComponent(returnValue);
  return decoded ? `${listPath}?${decoded}` : listPath;
}
