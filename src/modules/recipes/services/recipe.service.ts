import { apiClient } from "@/lib/api-client";
import { buildQueryString } from "@/lib/utils";
import type { ListResult } from "@/types/api.types";

import type { Recipe, RecipeListParams } from "../types/recipe.types";

const RESOURCE = "/recipes";

/** Fetches one page of recipes with server-side search and pagination. */
export async function getRecipes(
  params: RecipeListParams
): Promise<ListResult<Recipe>> {
  const query = buildQueryString({
    page: params.page,
    limit: params.limit,
    search: params.search,
    sortBy: params.sortBy,
    order: params.order,
    tag: params.tag,
  });

  const { data } = await apiClient.get<ListResult<Recipe>>(`${RESOURCE}?${query}`);
  return data;
}

/** Fetches a single recipe. */
export async function getRecipeById(id: string | number): Promise<Recipe> {
  const { data } = await apiClient.get<Recipe>(`${RESOURCE}/${id}`);
  return data;
}

/** Fetches the tag list backing the recipe filter. */
export async function getRecipeTags(): Promise<string[]> {
  const { data } = await apiClient.get<string[]>(`${RESOURCE}/tags`);
  return data;
}
