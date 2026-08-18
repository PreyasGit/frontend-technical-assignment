import "server-only";

import { serverEnv } from "@/config/env";

import { upstreamGet } from "./upstream-client";

interface CacheEntry<T> {
  value: T[];
  expiresAt: number;
}

/**
 * In-memory cache of full upstream collections.
 *
 * Search, sorting and pagination all run against the merged (upstream + local)
 * collection, which means the whole collection is needed on every listing
 * request. The datasets are small — a few hundred records — so they are fetched
 * once and reused for the cache lifetime instead of hitting the upstream API on
 * every keystroke.
 */
const cache = new Map<string, CacheEntry<unknown>>();
/** De-duplicates concurrent misses so a burst of requests triggers one fetch. */
const inFlight = new Map<string, Promise<unknown[]>>();

export interface CollectionCacheOptions<T> {
  /** Cache key, normally the resource name. */
  key: string;
  /** Upstream path returning the full collection. */
  path: string;
  /** Envelope property holding the array, e.g. `"products"`. */
  envelopeKey: string;
  /** Optional post-processing applied once, before caching. */
  transform?: (items: T[]) => T[];
}

export async function getUpstreamCollection<T>({
  key,
  path,
  envelopeKey,
  transform,
}: CollectionCacheOptions<T>): Promise<T[]> {
  const cached = cache.get(key) as CacheEntry<T> | undefined;
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const pending = inFlight.get(key);
  if (pending) return pending as Promise<T[]>;

  const request = (async () => {
    const envelope = await upstreamGet<Record<string, unknown>>(path);
    const raw = envelope[envelopeKey];
    const items = (Array.isArray(raw) ? raw : []) as T[];
    const value = transform ? transform(items) : items;

    cache.set(key, {
      value,
      expiresAt: Date.now() + serverEnv.upstreamCacheTtlMs,
    });
    return value;
  })().finally(() => inFlight.delete(key));

  inFlight.set(key, request as Promise<unknown[]>);
  return request;
}

/** Drops a cached collection, forcing the next read to refetch. */
export function invalidateUpstreamCollection(key: string): void {
  cache.delete(key);
}
