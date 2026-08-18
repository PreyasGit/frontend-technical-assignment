import type { ListResult, SortOrder } from "@/types/api.types";

export interface CollectionQuery {
  search?: string;
  sortBy?: string;
  order?: SortOrder;
  page: number;
  limit: number;
}

/** Extracts the searchable text of one record for a free-text query. */
export type SearchFieldsResolver<T> = (item: T) => Array<string | undefined>;

/** Reads a possibly nested sort value, e.g. `"company.name"`. */
function readSortValue(item: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (value, key) =>
        value && typeof value === "object"
          ? (value as Record<string, unknown>)[key]
          : undefined,
      item
    );
}

function compareValues(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === undefined || a === null) return 1;
  if (b === undefined || b === null) return -1;

  if (typeof a === "number" && typeof b === "number") return a - b;

  return String(a).localeCompare(String(b), "en", { sensitivity: "base" });
}

/** Case-insensitive free-text filter across the fields the resolver exposes. */
export function searchCollection<T>(
  items: T[],
  search: string | undefined,
  getSearchFields: SearchFieldsResolver<T>
): T[] {
  const term = search?.trim().toLowerCase();
  if (!term) return items;

  return items.filter((item) =>
    getSearchFields(item).some((field) => field?.toLowerCase().includes(term))
  );
}

/** Stable sort by an arbitrary (optionally nested) field. */
export function sortCollection<T>(
  items: T[],
  sortBy: string | undefined,
  order: SortOrder = "asc"
): T[] {
  if (!sortBy) return items;

  const direction = order === "desc" ? -1 : 1;

  return [...items].sort(
    (a, b) =>
      compareValues(readSortValue(a, sortBy), readSortValue(b, sortBy)) * direction
  );
}

/** Slices one page out of the collection and reports the unpaginated total. */
export function paginateCollection<T>(
  items: T[],
  page: number,
  limit: number
): ListResult<T> {
  const safeLimit = limit > 0 ? limit : items.length;
  const skip = Math.max(0, (page - 1) * safeLimit);

  return {
    items: items.slice(skip, skip + safeLimit),
    total: items.length,
    skip,
    limit: safeLimit,
  };
}

/**
 * Runs the full search → sort → paginate pipeline.
 *
 * Every listing endpoint uses this so the three operations behave identically
 * across modules, including for locally created records.
 */
export function queryCollection<T>(
  items: T[],
  query: CollectionQuery,
  getSearchFields: SearchFieldsResolver<T>,
  extraFilter?: (item: T) => boolean
): ListResult<T> {
  let result = extraFilter ? items.filter(extraFilter) : items;
  result = searchCollection(result, query.search, getSearchFields);
  result = sortCollection(result, query.sortBy, query.order);
  return paginateCollection(result, query.page, query.limit);
}

/** Parses the listing parameters shared by every collection endpoint. */
export function parseCollectionQuery(
  searchParams: URLSearchParams,
  defaults: { sortBy?: string; limit?: number } = {}
): CollectionQuery {
  const parsedPage = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const parsedLimit = Number.parseInt(
    searchParams.get("limit") ?? String(defaults.limit ?? 10),
    10
  );

  return {
    search: searchParams.get("search")?.trim() || undefined,
    sortBy: searchParams.get("sortBy") || defaults.sortBy,
    order: searchParams.get("order") === "desc" ? "desc" : "asc",
    page: Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1,
    // `limit=0` is a deliberate "give me everything" escape hatch.
    limit: Number.isFinite(parsedLimit) && parsedLimit >= 0 ? parsedLimit : 10,
  };
}
