import type {
  Identifiable,
  RecordSource,
  ResourceOverlay,
} from "./overlay.types";

/** An entity enriched with where it came from. */
export type WithSource<T> = T & { source: RecordSource };

/**
 * Replays the local write layer over a collection read from the upstream API.
 *
 * Deleted ids are removed, update patches are merged in, and locally created
 * records are appended so they take part in search, sorting and pagination
 * exactly like upstream records do.
 */
export function applyOverlayToCollection<T extends Identifiable>(
  upstreamItems: T[],
  overlay: ResourceOverlay
): WithSource<T>[] {
  const deletedIds = new Set(overlay.deleted);

  const merged: WithSource<T>[] = [];

  for (const item of upstreamItems) {
    const key = String(item.id);
    if (deletedIds.has(key)) continue;

    const patch = overlay.updated[key];
    merged.push(
      patch
        ? ({ ...item, ...patch, source: "updated" } as WithSource<T>)
        : ({ ...item, source: "upstream" } as WithSource<T>)
    );
  }

  for (const [key, record] of Object.entries(overlay.created)) {
    if (deletedIds.has(key)) continue;

    const patch = overlay.updated[key];
    merged.push({ ...record, ...patch, source: "created" } as WithSource<T>);
  }

  return merged;
}

/**
 * Resolves one record against the write layer.
 *
 * Returns `null` when the record has been deleted locally, so the caller can
 * answer with a 404 even though the upstream API still serves it.
 */
export function applyOverlayToRecord<T extends Identifiable>(
  id: string,
  upstreamItem: T | null,
  overlay: ResourceOverlay
): WithSource<T> | null {
  if (overlay.deleted.includes(id)) return null;

  const created = overlay.created[id];
  const patch = overlay.updated[id];

  if (created) {
    return { ...created, ...patch, source: "created" } as WithSource<T>;
  }

  if (!upstreamItem) return null;

  return patch
    ? ({ ...upstreamItem, ...patch, source: "updated" } as WithSource<T>)
    : ({ ...upstreamItem, source: "upstream" } as WithSource<T>);
}
