import type { ListQueryParams } from "@/types/api.types";

/**
 * Central registry of React Query cache keys. Keeping them together prevents
 * mismatched keys between a `useQuery` and the mutation that invalidates it.
 */
export const queryKeys = {
  products: {
    all: ["products"] as const,
    list: (params: ListQueryParams & { category?: string }) =>
      ["products", "list", params] as const,
    detail: (id: string | number) => ["products", "detail", String(id)] as const,
    categories: ["products", "categories"] as const,
  },
  users: {
    all: ["users"] as const,
    list: (params: ListQueryParams) => ["users", "list", params] as const,
    detail: (id: string | number) => ["users", "detail", String(id)] as const,
  },
  recipes: {
    all: ["recipes"] as const,
    list: (params: ListQueryParams & { tag?: string }) =>
      ["recipes", "list", params] as const,
    detail: (id: string | number) => ["recipes", "detail", String(id)] as const,
    tags: ["recipes", "tags"] as const,
  },
} as const;
