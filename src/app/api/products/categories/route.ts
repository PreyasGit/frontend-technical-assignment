import { listProductCategories } from "@/server/products/product.repository";
import { handleRoute, jsonOk } from "@/server/shared/api-response";

export async function GET() {
  return handleRoute(async () => jsonOk(await listProductCategories()));
}
