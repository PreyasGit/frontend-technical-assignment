import { apiClient } from "@/lib/api-client";
import { buildQueryString } from "@/lib/utils";
import type { ListResult } from "@/types/api.types";

import type {
  Product,
  ProductCategory,
  ProductListParams,
  ProductPayload,
} from "../types/product.types";

const RESOURCE = "/products";

/**
 * Fetches one page of products.
 *
 * Search, sorting and pagination are all resolved server-side by the API route,
 * which merges the read-only upstream catalogue with the local write layer
 * before applying them. The client only forwards parameters.
 */
export async function getProducts(
  params: ProductListParams
): Promise<ListResult<Product>> {
  const query = buildQueryString({
    page: params.page,
    limit: params.limit,
    search: params.search,
    sortBy: params.sortBy,
    order: params.order,
    category: params.category,
  });

  const { data } = await apiClient.get<ListResult<Product>>(`${RESOURCE}?${query}`);
  return data;
}

/** Fetches a single product by id. */
export async function getProductById(id: string | number): Promise<Product> {
  const { data } = await apiClient.get<Product>(`${RESOURCE}/${id}`);
  return data;
}

/** Fetches the category list used by the filter and the form dropdown. */
export async function getProductCategories(): Promise<ProductCategory[]> {
  const { data } = await apiClient.get<ProductCategory[]>(`${RESOURCE}/categories`);
  return data;
}

/** Creates a product. The change is persisted by the API route. */
export async function createProduct(payload: ProductPayload): Promise<Product> {
  const { data } = await apiClient.post<Product>(RESOURCE, payload);
  return data;
}

/** Updates a product. */
export async function updateProduct(
  id: string | number,
  payload: ProductPayload
): Promise<Product> {
  const { data } = await apiClient.put<Product>(`${RESOURCE}/${id}`, payload);
  return data;
}

/** Deletes a product and returns the deleted record. */
export async function deleteProduct(id: string | number): Promise<Product> {
  const { data } = await apiClient.delete<Product>(`${RESOURCE}/${id}`);
  return data;
}
