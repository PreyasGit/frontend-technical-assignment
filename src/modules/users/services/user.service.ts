import { apiClient } from "@/lib/api-client";
import { buildQueryString } from "@/lib/utils";
import type { ListResult } from "@/types/api.types";

import type { User, UserListParams, UserPayload } from "../types/user.types";

const RESOURCE = "/users";

/** Fetches one page of users with server-side search, sorting and pagination. */
export async function getUsers(params: UserListParams): Promise<ListResult<User>> {
  const query = buildQueryString({
    page: params.page,
    limit: params.limit,
    search: params.search,
    sortBy: params.sortBy,
    order: params.order,
    gender: params.gender,
  });

  const { data } = await apiClient.get<ListResult<User>>(`${RESOURCE}?${query}`);
  return data;
}

/** Fetches a single user, used by the details drawer. */
export async function getUserById(id: string | number): Promise<User> {
  const { data } = await apiClient.get<User>(`${RESOURCE}/${id}`);
  return data;
}

/** Creates a user. */
export async function createUser(payload: UserPayload): Promise<User> {
  const { data } = await apiClient.post<User>(RESOURCE, payload);
  return data;
}

/** Updates a user. */
export async function updateUser(
  id: string | number,
  payload: UserPayload
): Promise<User> {
  const { data } = await apiClient.put<User>(`${RESOURCE}/${id}`, payload);
  return data;
}

/** Deletes a user and returns the deleted record. */
export async function deleteUser(id: string | number): Promise<User> {
  const { data } = await apiClient.delete<User>(`${RESOURCE}/${id}`);
  return data;
}
