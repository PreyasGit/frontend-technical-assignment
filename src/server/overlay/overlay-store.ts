import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

import { serverEnv } from "@/config/env";

import {
  createEmptyOverlayDocument,
  createEmptyResourceOverlay,
  type OverlayDocument,
  type ResourceName,
  type ResourceOverlay,
} from "./overlay.types";

/**
 * Persistent store for the local write layer.
 *
 * The upstream API is read-only, so every create, update and delete is recorded
 * here instead and replayed over the upstream data on read. The document is
 * held in memory and mirrored to a JSON file so changes survive a page refresh
 * and a server restart. If the filesystem is not writable (for example on a
 * read-only serverless runtime) the store degrades to memory-only rather than
 * failing the request.
 */

// The directory is a static literal and the configurable part is reduced to a
// bare file name, which keeps build-time filesystem tracing scoped to `.data/`.
const directoryPath = join(process.cwd(), ".data");
const filePath = join(directoryPath, basename(serverEnv.dataFileName));

let documentPromise: Promise<OverlayDocument> | null = null;
let isPersistenceAvailable = true;
/** Serialises writes so two concurrent requests cannot interleave file writes. */
let writeQueue: Promise<void> = Promise.resolve();

function normalise(raw: unknown): OverlayDocument {
  const empty = createEmptyOverlayDocument();
  if (!raw || typeof raw !== "object") return empty;

  const candidate = raw as Partial<OverlayDocument>;
  if (candidate.version !== 1) return empty;

  const resources = candidate.resources ?? empty.resources;

  return {
    version: 1,
    nextId:
      typeof candidate.nextId === "number" && Number.isFinite(candidate.nextId)
        ? candidate.nextId
        : empty.nextId,
    resources: {
      products: normaliseResource(resources.products),
      users: normaliseResource(resources.users),
      recipes: normaliseResource(resources.recipes),
    },
  };
}

function normaliseResource(raw: unknown): ResourceOverlay {
  const empty = createEmptyResourceOverlay();
  if (!raw || typeof raw !== "object") return empty;

  const candidate = raw as Partial<ResourceOverlay>;
  return {
    created: candidate.created ?? {},
    updated: candidate.updated ?? {},
    deleted: Array.isArray(candidate.deleted) ? candidate.deleted : [],
  };
}

async function loadDocument(): Promise<OverlayDocument> {
  try {
    const contents = await readFile(filePath, "utf8");
    return normalise(JSON.parse(contents));
  } catch {
    // Missing or corrupt file simply means "no local changes yet".
    return createEmptyOverlayDocument();
  }
}

function getDocument(): Promise<OverlayDocument> {
  documentPromise ??= loadDocument();
  return documentPromise;
}

function persist(document: OverlayDocument): void {
  if (!isPersistenceAvailable) return;

  writeQueue = writeQueue
    .then(async () => {
      await mkdir(directoryPath, { recursive: true });
      await writeFile(filePath, JSON.stringify(document, null, 2), "utf8");
    })
    .catch((error) => {
      isPersistenceAvailable = false;
      console.warn(
        `[overlay-store] Falling back to in-memory storage: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    });
}

/** Reads the local changes recorded against one resource. */
export async function readOverlay(resource: ResourceName): Promise<ResourceOverlay> {
  const document = await getDocument();
  return document.resources[resource];
}

/**
 * Applies a mutation to the store and persists the result.
 *
 * The callback receives the live overlay for the resource plus an `allocateId`
 * helper, and returns whatever the caller needs back.
 */
export async function mutateOverlay<T>(
  resource: ResourceName,
  mutate: (overlay: ResourceOverlay, allocateId: () => number) => T
): Promise<T> {
  const document = await getDocument();
  const allocateId = () => document.nextId++;
  const result = mutate(document.resources[resource], allocateId);
  persist(document);
  return result;
}

/** Discards every local change. Exposed for the "reset demo data" endpoint. */
export async function resetOverlay(): Promise<void> {
  const document = await getDocument();
  const empty = createEmptyOverlayDocument();
  document.nextId = empty.nextId;
  document.resources = empty.resources;
  persist(document);
}

/** True when changes are being written to disk rather than kept in memory only. */
export function isOverlayPersisted(): boolean {
  return isPersistenceAvailable;
}
