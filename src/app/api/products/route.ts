import type { NextRequest } from "next/server";

import { productSchema } from "@/modules/products/schemas/product.schema";
import type { ProductPayload } from "@/modules/products/types/product.types";
import { createProduct, listProducts } from "@/server/products/product.repository";
import {
  handleRoute,
  jsonOk,
  parseJsonBody,
} from "@/server/shared/api-response";
import { parseCollectionQuery } from "@/server/shared/collection-query";

/** Listing endpoint: server-side search, sorting and pagination. */
export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    const query = parseCollectionQuery(request.nextUrl.searchParams, {
      sortBy: "title",
    });

    const result = await listProducts({
      ...query,
      category: request.nextUrl.searchParams.get("category") || undefined,
    });

    return jsonOk(result);
  });
}

/** Creates a product in the local write layer. */
export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    const payload = await parseJsonBody<ProductPayload>(request, productSchema);
    const product = await createProduct(payload);
    return jsonOk(product, 201);
  });
}
