import "server-only";

import {
  applyOverlayToCollection,
  applyOverlayToRecord,
  type WithSource,
} from "@/server/overlay/apply-overlay";
import { readOverlay } from "@/server/overlay/overlay-store";
import {
  queryCollection,
  type CollectionQuery,
} from "@/server/shared/collection-query";
import { getUpstreamCollection } from "@/server/upstream/collection-cache";
import { upstreamGetOrNull } from "@/server/upstream/upstream-client";
import type { Recipe } from "@/modules/recipes/types/recipe.types";
import type { ListResult } from "@/types/api.types";

const RESOURCE = "recipes";

function getUpstreamRecipes(): Promise<Recipe[]> {
  return getUpstreamCollection<Recipe>({
    key: RESOURCE,
    path: "/recipes?limit=0",
    envelopeKey: "recipes",
  });
}

async function getMergedRecipes(): Promise<WithSource<Recipe>[]> {
  const [upstream, overlay] = await Promise.all([
    getUpstreamRecipes(),
    readOverlay(RESOURCE),
  ]);
  return applyOverlayToCollection(upstream, overlay);
}

export interface RecipeQuery extends CollectionQuery {
  tag?: string;
}

/** Search, sort and paginate the recipe collection. */
export async function listRecipes(
  query: RecipeQuery
): Promise<ListResult<WithSource<Recipe>>> {
  const recipes = await getMergedRecipes();

  return queryCollection(
    recipes,
    query,
    (recipe) => [
      recipe.name,
      recipe.cuisine,
      recipe.difficulty,
      ...(recipe.ingredients ?? []),
      ...(recipe.tags ?? []),
      ...(recipe.mealType ?? []),
    ],
    query.tag ? (recipe) => recipe.tags?.includes(query.tag as string) : undefined
  );
}

/**
 * Reads one recipe. Called both by the recipes API route and directly by the
 * server-rendered recipe details page.
 */
export async function getRecipe(id: string): Promise<WithSource<Recipe> | null> {
  const overlay = await readOverlay(RESOURCE);

  if (overlay.created[id]) return applyOverlayToRecord<Recipe>(id, null, overlay);
  if (overlay.deleted.includes(id)) return null;

  const upstreamRecipe = await upstreamGetOrNull<Recipe>(`/recipes/${id}`);
  return applyOverlayToRecord(id, upstreamRecipe, overlay);
}

/** Distinct tags across the merged collection, used by the recipe filter. */
export async function listRecipeTags(): Promise<string[]> {
  const recipes = await getMergedRecipes();
  const tags = new Set<string>();

  for (const recipe of recipes) {
    for (const tag of recipe.tags ?? []) tags.add(tag);
  }

  return [...tags].sort((a, b) => a.localeCompare(b));
}
