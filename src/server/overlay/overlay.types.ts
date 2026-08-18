export type { RecordSource } from "@/types/api.types";

/** Resources that support a local write layer. */
export type ResourceName = "products" | "users" | "recipes";

export const RESOURCE_NAMES: ResourceName[] = ["products", "users", "recipes"];

/** Any record the write layer can hold. Every entity is keyed by a numeric id. */
export interface Identifiable {
  id: number;
}

/**
 * The set of local changes recorded against one upstream collection.
 *
 * The upstream API is read-only, so writes are stored here as a diff and
 * replayed over the upstream data on every read.
 */
export interface ResourceOverlay {
  /** Records created locally, keyed by id. Stored in full. */
  created: Record<string, Record<string, unknown>>;
  /** Partial patches applied to upstream (or created) records, keyed by id. */
  updated: Record<string, Record<string, unknown>>;
  /** Ids hidden from every read. */
  deleted: string[];
}

export interface OverlayDocument {
  version: 1;
  /** Next id handed out to a locally created record. */
  nextId: number;
  resources: Record<ResourceName, ResourceOverlay>;
}

/**
 * Locally created records start well above the upstream id range so the two
 * can never collide.
 */
export const LOCAL_ID_START = 900_001;

export function createEmptyResourceOverlay(): ResourceOverlay {
  return { created: {}, updated: {}, deleted: [] };
}

export function createEmptyOverlayDocument(): OverlayDocument {
  return {
    version: 1,
    nextId: LOCAL_ID_START,
    resources: {
      products: createEmptyResourceOverlay(),
      users: createEmptyResourceOverlay(),
      recipes: createEmptyResourceOverlay(),
    },
  };
}
