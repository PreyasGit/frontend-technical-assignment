import "server-only";

import {
  applyOverlayToCollection,
  applyOverlayToRecord,
  type WithSource,
} from "@/server/overlay/apply-overlay";
import { mutateOverlay, readOverlay } from "@/server/overlay/overlay-store";
import {
  queryCollection,
  type CollectionQuery,
} from "@/server/shared/collection-query";
import { getUpstreamCollection } from "@/server/upstream/collection-cache";
import { upstreamGet, upstreamGetOrNull } from "@/server/upstream/upstream-client";
import type {
  Product,
  ProductCategory,
  ProductPayload,
} from "@/modules/products/types/product.types";
import type { ListResult } from "@/types/api.types";

const RESOURCE = "products";
const PLACEHOLDER_IMAGE =
  "https://cdn.dummyjson.com/product-images/groceries/apple/thumbnail.webp";

/** Full upstream catalogue, cached in memory. */
function getUpstreamProducts(): Promise<Product[]> {
  return getUpstreamCollection<Product>({
    key: RESOURCE,
    path: "/products?limit=0",
    envelopeKey: "products",
  });
}

/** The merged view: upstream records with every local change replayed on top. */
async function getMergedProducts(): Promise<WithSource<Product>[]> {
  const [upstream, overlay] = await Promise.all([
    getUpstreamProducts(),
    readOverlay(RESOURCE),
  ]);
  return applyOverlayToCollection(upstream, overlay);
}

export interface ProductQuery extends CollectionQuery {
  category?: string;
}

/** Search, sort and paginate the merged catalogue. */
export async function listProducts(
  query: ProductQuery
): Promise<ListResult<WithSource<Product>>> {
  const products = await getMergedProducts();

  return queryCollection(
    products,
    query,
    (product) => [
      product.title,
      product.description,
      product.brand,
      product.category,
      product.sku,
      ...(product.tags ?? []),
    ],
    query.category ? (product) => product.category === query.category : undefined
  );
}

/** Reads one product, honouring local updates and deletions. */
export async function getProduct(id: string): Promise<WithSource<Product> | null> {
  const overlay = await readOverlay(RESOURCE);

  // A locally created record never exists upstream, so skip the network call.
  if (overlay.created[id]) {
    return applyOverlayToRecord<Product>(id, null, overlay);
  }
  if (overlay.deleted.includes(id)) return null;

  const upstreamProduct = await upstreamGetOrNull<Product>(`/products/${id}`);
  return applyOverlayToRecord(id, upstreamProduct, overlay);
}

/** Builds a complete product from the subset of fields the form collects. */
function buildProduct(id: number, payload: ProductPayload): Product {
  return {
    id,
    title: payload.title,
    description: payload.description,
    category: payload.category,
    price: payload.price,
    stock: payload.stock,
    brand: payload.brand,
    discountPercentage: 0,
    rating: 0,
    tags: [payload.category],
    sku: `LOCAL-${id}`,
    weight: 0,
    dimensions: { width: 0, height: 0, depth: 0 },
    warrantyInformation: "No warranty information",
    shippingInformation: "Ships in 1 month",
    availabilityStatus: payload.stock > 0 ? "In Stock" : "Out of Stock",
    returnPolicy: "No return policy",
    minimumOrderQuantity: 1,
    reviews: [],
    images: [PLACEHOLDER_IMAGE],
    thumbnail: PLACEHOLDER_IMAGE,
  };
}

/** Creates a product in the local write layer. */
export async function createProduct(
  payload: ProductPayload
): Promise<WithSource<Product>> {
  return mutateOverlay(RESOURCE, (overlay, allocateId) => {
    const product = buildProduct(allocateId(), payload);
    overlay.created[String(product.id)] = product as unknown as Record<
      string,
      unknown
    >;
    return { ...product, source: "created" as const };
  });
}

/** Applies a partial update. Returns `null` when the product does not exist. */
export async function updateProduct(
  id: string,
  payload: Partial<ProductPayload>
): Promise<WithSource<Product> | null> {
  const existing = await getProduct(id);
  if (!existing) return null;

  const patch: Record<string, unknown> = { ...payload };
  if (payload.stock !== undefined) {
    patch.availabilityStatus = payload.stock > 0 ? "In Stock" : "Out of Stock";
  }

  return mutateOverlay(RESOURCE, (overlay) => {
    const created = overlay.created[id];

    if (created) {
      // Locally created records are edited in place, keeping the store compact.
      overlay.created[id] = { ...created, ...patch };
      return { ...(overlay.created[id] as unknown as Product), source: "created" };
    }

    overlay.updated[id] = { ...overlay.updated[id], ...patch };
    return { ...existing, ...patch, source: "updated" } as WithSource<Product>;
  });
}

/** Deletes a product. Returns the removed record, or `null` if it was absent. */
export async function deleteProduct(
  id: string
): Promise<WithSource<Product> | null> {
  const existing = await getProduct(id);
  if (!existing) return null;

  await mutateOverlay(RESOURCE, (overlay) => {
    const wasCreatedLocally = Boolean(overlay.created[id]);

    delete overlay.created[id];
    delete overlay.updated[id];

    // Upstream still serves the record, so it has to stay on the hidden list.
    if (!wasCreatedLocally && !overlay.deleted.includes(id)) {
      overlay.deleted.push(id);
    }
  });

  return existing;
}

/**
 * Category list, extended with any category introduced by a locally created
 * product so the filter and the form dropdown stay in sync with the data.
 */
export async function listProductCategories(): Promise<ProductCategory[]> {
  const [upstreamCategories, products] = await Promise.all([
    upstreamGet<ProductCategory[]>("/products/categories"),
    getMergedProducts(),
  ]);

  const bySlug = new Map(upstreamCategories.map((item) => [item.slug, item]));

  for (const product of products) {
    if (!product.category || bySlug.has(product.category)) continue;
    bySlug.set(product.category, {
      slug: product.category,
      name: product.category
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (character) => character.toUpperCase()),
      url: "",
    });
  }

  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name));
}
