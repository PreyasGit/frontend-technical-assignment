"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

import { createUser, deleteUser, updateUser } from "../services/user.service";
import type { UserPayload } from "../types/user.types";

/** Creates a user from the Add modal. */
export function useCreateUser(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UserPayload) => createUser(payload),
    onSuccess: (user) => {
      toast.success(`${user.firstName} ${user.lastName} was created successfully.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      onSuccess?.();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

/** Updates a user from the Edit modal. */
export function useUpdateUser(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UserPayload }) =>
      updateUser(id, payload),
    onSuccess: (user) => {
      toast.success(`${user.firstName} ${user.lastName} was updated successfully.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      onSuccess?.();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

/** Deletes a user from the listing. */
export function useDeleteUser(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: (user) => {
      toast.success(`${user.firstName} ${user.lastName} was deleted.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      onSuccess?.();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
