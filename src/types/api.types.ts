/**
 * Where a record came from. The API attaches this to every entity so the UI can
 * show which rows have been created or changed locally.
 */
export type RecordSource = "upstream" | "created" | "updated";

/** Sort direction shared by every listing screen. */
export type SortOrder = "asc" | "desc";

/** Query parameters accepted by the list services. */
export interface ListQueryParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  order?: SortOrder;
}

/** Normalised list result consumed by the UI layer. */
export interface ListResult<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}
