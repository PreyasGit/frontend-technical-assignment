"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";

import { getRecipeTags, getRecipes } from "../services/recipe.service";
import type { RecipeListParams } from "../types/recipe.types";

/** Paginated recipe list rendered as responsive cards. */
export function useRecipes(params: RecipeListParams) {
  return useQuery({
    queryKey: queryKeys.recipes.list(params),
    queryFn: () => getRecipes(params),
    placeholderData: keepPreviousData,
  });
}

/** Tag list used by the recipe filter. */
export function useRecipeTags() {
  return useQuery({
    queryKey: queryKeys.recipes.tags,
    queryFn: getRecipeTags,
    staleTime: 30 * 60 * 1000,
  });
}
