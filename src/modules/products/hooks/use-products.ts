"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";

import {
  getProductById,
  getProductCategories,
  getProducts,
} from "../services/product.service";
import type { ProductListParams } from "../types/product.types";

/** Paginated product list. Previous data is kept so pages swap without flicker. */
export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => getProducts(params),
    placeholderData: keepPreviousData,
  });
}

/** Single product, used by the details and edit screens. */
export function useProduct(id: string | number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => getProductById(id),
    enabled: enabled && Boolean(id),
  });
}

/** Category list for the listing filter and the product form dropdown. */
export function useProductCategories() {
  return useQuery({
    queryKey: queryKeys.products.categories,
    queryFn: getProductCategories,
    staleTime: 30 * 60 * 1000,
  });
}
