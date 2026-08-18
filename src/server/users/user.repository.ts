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
import { upstreamGetOrNull } from "@/server/upstream/upstream-client";
import type { User, UserPayload } from "@/modules/users/types/user.types";
import type { ListResult } from "@/types/api.types";

const RESOURCE = "users";
const PLACEHOLDER_AVATAR = "https://dummyjson.com/icon/placeholder/128";

function getUpstreamUsers(): Promise<User[]> {
  return getUpstreamCollection<User>({
    key: RESOURCE,
    path: "/users?limit=0",
    envelopeKey: "users",
  });
}

async function getMergedUsers(): Promise<WithSource<User>[]> {
  const [upstream, overlay] = await Promise.all([
    getUpstreamUsers(),
    readOverlay(RESOURCE),
  ]);
  return applyOverlayToCollection(upstream, overlay);
}

export interface UserQuery extends CollectionQuery {
  gender?: string;
}

/** Search, sort and paginate the merged user list. */
export async function listUsers(
  query: UserQuery
): Promise<ListResult<WithSource<User>>> {
  const users = await getMergedUsers();

  return queryCollection(
    users,
    query,
    (user) => [
      user.firstName,
      user.lastName,
      `${user.firstName} ${user.lastName}`,
      user.email,
      user.username,
      user.phone,
    ],
    query.gender ? (user) => user.gender === query.gender : undefined
  );
}

/** Reads one user, honouring local updates and deletions. */
export async function getUser(id: string): Promise<WithSource<User> | null> {
  const overlay = await readOverlay(RESOURCE);

  if (overlay.created[id]) return applyOverlayToRecord<User>(id, null, overlay);
  if (overlay.deleted.includes(id)) return null;

  const upstreamUser = await upstreamGetOrNull<User>(`/users/${id}`);
  return applyOverlayToRecord(id, upstreamUser, overlay);
}

/** Builds a complete user from the subset of fields the form collects. */
function buildUser(id: number, payload: UserPayload): User {
  return {
    id,
    firstName: payload.firstName,
    lastName: payload.lastName,
    username: payload.username,
    email: payload.email,
    phone: payload.phone,
    age: payload.age,
    gender: payload.gender,
    birthDate: "—",
    image: PLACEHOLDER_AVATAR,
    role: "user",
  };
}

export async function createUser(payload: UserPayload): Promise<WithSource<User>> {
  return mutateOverlay(RESOURCE, (overlay, allocateId) => {
    const user = buildUser(allocateId(), payload);
    overlay.created[String(user.id)] = user as unknown as Record<string, unknown>;
    return { ...user, source: "created" as const };
  });
}

export async function updateUser(
  id: string,
  payload: Partial<UserPayload>
): Promise<WithSource<User> | null> {
  const existing = await getUser(id);
  if (!existing) return null;

  return mutateOverlay(RESOURCE, (overlay) => {
    const created = overlay.created[id];

    if (created) {
      overlay.created[id] = { ...created, ...payload };
      return { ...(overlay.created[id] as unknown as User), source: "created" };
    }

    overlay.updated[id] = { ...overlay.updated[id], ...payload };
    return { ...existing, ...payload, source: "updated" } as WithSource<User>;
  });
}

export async function deleteUser(id: string): Promise<WithSource<User> | null> {
  const existing = await getUser(id);
  if (!existing) return null;

  await mutateOverlay(RESOURCE, (overlay) => {
    const wasCreatedLocally = Boolean(overlay.created[id]);

    delete overlay.created[id];
    delete overlay.updated[id];

    if (!wasCreatedLocally && !overlay.deleted.includes(id)) {
      overlay.deleted.push(id);
    }
  });

  return existing;
}
