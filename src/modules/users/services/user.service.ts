import { apiClient } from "@/lib/api-client";
import { buildQueryString } from "@/lib/utils";
import type { ListResult, UsersEnvelope } from "@/types/api.types";

import type { User, UserListParams, UserPayload } from "../types/user.types";

const RESOURCE = "/users";

/** Fetches one page of users with server-side search, sorting and pagination. */
export async function getUsers(params: UserListParams): Promise<ListResult<User>> {
  const { page, limit, search, sortBy, order, gender } = params;
  const skip = (page - 1) * limit;

  let path: string;
  if (search) {
    path = `${RESOURCE}/search?${buildQueryString({ q: search, limit, skip, sortBy, order })}`;
  } else if (gender) {
    path = `${RESOURCE}/filter?${buildQueryString({
      key: "gender",
      value: gender,
      limit,
      skip,
      sortBy,
      order,
    })}`;
  } else {
    path = `${RESOURCE}?${buildQueryString({ limit, skip, sortBy, order })}`;
  }

  const { data } = await apiClient.get<UsersEnvelope<User>>(path);

  return {
    items: data.users ?? [],
    total: data.total ?? 0,
    skip: data.skip ?? skip,
    limit: data.limit ?? limit,
  };
}

/** Fetches a single user, used by the details drawer. */
export async function getUserById(id: string | number): Promise<User> {
  const { data } = await apiClient.get<User>(`${RESOURCE}/${id}`);
  return data;
}

/** Creates a user. */
export async function createUser(payload: UserPayload): Promise<User> {
  const { data } = await apiClient.post<User>(`${RESOURCE}/add`, payload);
  return data;
}

/** Updates a user. */
export async function updateUser(
  id: string | number,
  payload: Partial<UserPayload>
): Promise<User> {
  const { data } = await apiClient.put<User>(`${RESOURCE}/${id}`, payload);
  return data;
}

/** Deletes a user and returns the deleted record. */
export async function deleteUser(id: string | number): Promise<User> {
  const { data } = await apiClient.delete<User>(`${RESOURCE}/${id}`);
  return data;
}
