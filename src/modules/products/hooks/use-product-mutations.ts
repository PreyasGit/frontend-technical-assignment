"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

import {
  createProduct,
  deleteProduct,
  updateProduct,
} from "../services/product.service";
import type { Product, ProductPayload } from "../types/product.types";

/** Creates a product and refreshes every cached product list. */
export function useCreateProduct(onSuccess?: (product: Product) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductPayload) => createProduct(payload),
    onSuccess: (product) => {
      toast.success(`"${product.title}" was created successfully.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      onSuccess?.(product);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

/** Updates a product and refreshes both its detail cache and the lists. */
export function useUpdateProduct(id: string | number, onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductPayload) => updateProduct(id, payload),
    onSuccess: (product) => {
      toast.success(`"${product.title}" was updated successfully.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      onSuccess?.();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

/** Deletes a product from the listing screen. */
export function useDeleteProduct(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: (product) => {
      toast.success(`"${product.title}" was deleted.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      onSuccess?.();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
