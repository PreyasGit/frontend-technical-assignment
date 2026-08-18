import {
  isOverlayPersisted,
  readOverlay,
  resetOverlay,
} from "@/server/overlay/overlay-store";
import { RESOURCE_NAMES } from "@/server/overlay/overlay.types";
import { handleRoute, jsonOk } from "@/server/shared/api-response";

/** Reports how many local changes are currently layered over the upstream data. */
export async function GET() {
  return handleRoute(async () => {
    const resources = await Promise.all(
      RESOURCE_NAMES.map(async (name) => {
        const overlay = await readOverlay(name);
        return [
          name,
          {
            created: Object.keys(overlay.created).length,
            updated: Object.keys(overlay.updated).length,
            deleted: overlay.deleted.length,
          },
        ] as const;
      })
    );

    return jsonOk({
      persisted: isOverlayPersisted(),
      resources: Object.fromEntries(resources),
    });
  });
}

/** Discards every local change and restores the pristine upstream dataset. */
export async function DELETE() {
  return handleRoute(async () => {
    await resetOverlay();
    return jsonOk({ message: "Local changes have been reset." });
  });
}
