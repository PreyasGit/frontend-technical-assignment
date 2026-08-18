import type { NextRequest } from "next/server";

import { getRecipe } from "@/server/recipes/recipe.repository";
import { handleRoute, jsonError, jsonOk } from "@/server/shared/api-response";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  return handleRoute(async () => {
    const { id } = await params;
    const recipe = await getRecipe(id);

    if (!recipe) return jsonError(`Recipe ${id} was not found.`, 404);
    return jsonOk(recipe);
  });
}
