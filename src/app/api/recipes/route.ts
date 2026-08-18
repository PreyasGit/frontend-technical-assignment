import type { NextRequest } from "next/server";

import { listRecipes } from "@/server/recipes/recipe.repository";
import { handleRoute, jsonOk } from "@/server/shared/api-response";
import { parseCollectionQuery } from "@/server/shared/collection-query";

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    const query = parseCollectionQuery(request.nextUrl.searchParams);

    const result = await listRecipes({
      ...query,
      tag: request.nextUrl.searchParams.get("tag") || undefined,
    });

    return jsonOk(result);
  });
}
