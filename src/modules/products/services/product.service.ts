import { apiClient } from "@/lib/api-client";
import { buildQueryString } from "@/lib/utils";
import type { ListResult, ProductsEnvelope } from "@/types/api.types";

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
 * Search, sorting and pagination are all resolved by the API — the client only
 * forwards the parameters and renders whatever the server returns.
 */
export async function getProducts(
  params: ProductListParams
): Promise<ListResult<Product>> {
  const { page, limit, search, sortBy, order, category } = params;
  const skip = (page - 1) * limit;

  const query = buildQueryString({ limit, skip, sortBy, order });

  let path: string;
  if (search) {
    path = `${RESOURCE}/search?${buildQueryString({ q: search, limit, skip, sortBy, order })}`;
  } else if (category) {
    path = `${RESOURCE}/category/${encodeURIComponent(category)}?${query}`;
  } else {
    path = `${RESOURCE}?${query}`;
  }

  const { data } = await apiClient.get<ProductsEnvelope<Product>>(path);

  return {
    items: data.products ?? [],
    total: data.total ?? 0,
    skip: data.skip ?? skip,
    limit: data.limit ?? limit,
  };
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

/** Creates a product. The demo API echoes the created record back. */
export async function createProduct(payload: ProductPayload): Promise<Product> {
  const { data } = await apiClient.post<Product>(`${RESOURCE}/add`, payload);
  return data;
}

/** Updates a product. */
export async function updateProduct(
  id: string | number,
  payload: Partial<ProductPayload>
): Promise<Product> {
  const { data } = await apiClient.put<Product>(`${RESOURCE}/${id}`, payload);
  return data;
}

/** Deletes a product and returns the deleted record. */
export async function deleteProduct(id: string | number): Promise<Product> {
  const { data } = await apiClient.delete<Product>(`${RESOURCE}/${id}`);
  return data;
}
