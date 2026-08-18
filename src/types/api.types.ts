/** Pagination metadata returned by every DummyJSON collection endpoint. */
export interface PaginationMeta {
  total: number;
  skip: number;
  limit: number;
}

export type ProductsEnvelope<T> = PaginationMeta & { products: T[] };
export type UsersEnvelope<T> = PaginationMeta & { users: T[] };
export type RecipesEnvelope<T> = PaginationMeta & { recipes: T[] };

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
