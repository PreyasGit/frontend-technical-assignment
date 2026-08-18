import type { NextRequest } from "next/server";

import { productSchema } from "@/modules/products/schemas/product.schema";
import type { ProductPayload } from "@/modules/products/types/product.types";
import {
  deleteProduct,
  getProduct,
  updateProduct,
} from "@/server/products/product.repository";
import {
  handleRoute,
  jsonError,
  jsonOk,
  parseJsonBody,
} from "@/server/shared/api-response";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  return handleRoute(async () => {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) return jsonError(`Product ${id} was not found.`, 404);
    return jsonOk(product);
  });
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  return handleRoute(async () => {
    const { id } = await params;
    const payload = await parseJsonBody<ProductPayload>(request, productSchema);
    const product = await updateProduct(id, payload);

    if (!product) return jsonError(`Product ${id} was not found.`, 404);
    return jsonOk(product);
  });
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  return handleRoute(async () => {
    const { id } = await params;
    const product = await deleteProduct(id);

    if (!product) return jsonError(`Product ${id} was not found.`, 404);
    return jsonOk(product);
  });
}
