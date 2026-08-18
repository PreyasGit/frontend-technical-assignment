"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";

import { getUserById, getUsers } from "../services/user.service";
import type { UserListParams } from "../types/user.types";

/** Paginated user list. */
export function useUsers(params: UserListParams) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => getUsers(params),
    placeholderData: keepPreviousData,
  });
}

/** Single user, fetched on demand when the details drawer opens. */
export function useUser(id: number | null) {
  return useQuery({
    queryKey: queryKeys.users.detail(id ?? "none"),
    queryFn: () => getUserById(id as number),
    enabled: id !== null,
  });
}
