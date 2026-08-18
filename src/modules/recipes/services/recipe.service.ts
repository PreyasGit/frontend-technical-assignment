import { apiClient } from "@/lib/api-client";
import { buildQueryString } from "@/lib/utils";
import type { ListResult, RecipesEnvelope } from "@/types/api.types";

import type { Recipe, RecipeListParams } from "../types/recipe.types";

const RESOURCE = "/recipes";

/**
 * Fetches one page of recipes.
 *
 * Safe to call from both server and client components — it only depends on the
 * shared Axios instance.
 */
export async function getRecipes(
  params: RecipeListParams
): Promise<ListResult<Recipe>> {
  const { page, limit, search, tag, sortBy, order } = params;
  const skip = (page - 1) * limit;

  let path: string;
  if (search) {
    path = `${RESOURCE}/search?${buildQueryString({ q: search, limit, skip, sortBy, order })}`;
  } else if (tag) {
    path = `${RESOURCE}/tag/${encodeURIComponent(tag)}?${buildQueryString({ limit, skip, sortBy, order })}`;
  } else {
    path = `${RESOURCE}?${buildQueryString({ limit, skip, sortBy, order })}`;
  }

  const { data } = await apiClient.get<RecipesEnvelope<Recipe>>(path);

  return {
    items: data.recipes ?? [],
    total: data.total ?? 0,
    skip: data.skip ?? skip,
    limit: data.limit ?? limit,
  };
}

/** Fetches a single recipe. Used by the server-rendered details page. */
export async function getRecipeById(id: string | number): Promise<Recipe> {
  const { data } = await apiClient.get<Recipe>(`${RESOURCE}/${id}`);
  return data;
}

/** Fetches the tag list backing the recipe filter. */
export async function getRecipeTags(): Promise<string[]> {
  const { data } = await apiClient.get<string[]>(`${RESOURCE}/tags`);
  return data;
}
