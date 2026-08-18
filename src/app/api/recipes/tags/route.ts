import { listRecipeTags } from "@/server/recipes/recipe.repository";
import { handleRoute, jsonOk } from "@/server/shared/api-response";

export async function GET() {
  return handleRoute(async () => jsonOk(await listRecipeTags()));
}
