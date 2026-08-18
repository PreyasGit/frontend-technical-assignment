"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, Pencil, Plus, Trash2, UsersRound } from "lucide-react";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PageHeader } from "@/components/common/page-header";
import { Pagination } from "@/components/common/pagination";
import { SearchInput } from "@/components/common/search-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useListParams } from "@/hooks/use-list-params";
import { toTitleCase } from "@/lib/utils";

import {
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
} from "../hooks/use-user-mutations";
import { useUsers } from "../hooks/use-users";
import type { UserFormValues } from "../schemas/user.schema";
import { USER_GENDER_OPTIONS, type User } from "../types/user.types";
import { UserDetailsDrawer } from "./user-details-drawer";
import { UserFormDialog } from "./user-form-dialog";

/**
 * Single-page user CRUD.
 *
 * Create and update happen in a modal, viewing happens in a side drawer, and
 * deleting is confirmed inline — so the user never leaves this route.
 */
export function UserListView() {
  const listParams = useListParams({ defaultSortBy: "firstName", defaultOrder: "asc" });
  const gender = listParams.getFilter("gender");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [userBeingEdited, setUserBeingEdited] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [viewedUserId, setViewedUserId] = useState<number | null>(null);

  const { data, isLoading, isFetching, isError, error, refetch } = useUsers({
    page: listParams.page,
    limit: listParams.limit,
    search: listParams.search,
    sortBy: listParams.sortBy,
    order: listParams.order,
    gender,
  });

  const closeForm = () => {
    setIsFormOpen(false);
    setUserBeingEdited(null);
  };

  const createMutation = useCreateUser(closeForm);
  const updateMutation = useUpdateUser(closeForm);
  const deleteMutation = useDeleteUser(() => setUserToDelete(null));

  const users = data?.items ?? [];
  const total = data?.total ?? 0;
  const hasFilters = Boolean(listParams.search || gender);

  const openCreate = () => {
    setUserBeingEdited(null);
    setIsFormOpen(true);
  };

  const openEdit = (user: User) => {
    setUserBeingEdited(user);
    setIsFormOpen(true);
  };

  const handleSubmit = (values: UserFormValues) => {
    if (userBeingEdited) {
      updateMutation.mutate({ id: userBeingEdited.id, payload: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const columns: DataTableColumn<User>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      cell: (user) => (
        <div className="flex items-center gap-3">
          <div className="relative size-9 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
            <Image src={user.image} alt="" fill sizes="36px" className="object-cover" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">
              {user.firstName} {user.lastName}
            </p>
            <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
      hideOnMobile: true,
      cell: (user) => (
        <a
          href={`mailto:${user.email}`}
          className="text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          {user.email}
        </a>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      hideOnMobile: true,
      cell: (user) => (
        <span className="text-sm text-muted-foreground">{user.phone}</span>
      ),
    },
    {
      key: "age",
      header: "Age",
      sortable: true,
      hideOnMobile: true,
      className: "text-right",
      cell: (user) => <span className="tabular-nums">{user.age}</span>,
    },
    {
      key: "gender",
      header: "Gender",
      hideOnMobile: true,
      cell: (user) => <Badge variant="secondary">{toTitleCase(user.gender)}</Badge>,
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "text-right",
      cell: (user) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={`View ${user.firstName} ${user.lastName}`}
            onClick={() => setViewedUserId(user.id)}
          >
            <Eye />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={`Edit ${user.firstName} ${user.lastName}`}
            onClick={() => openEdit(user)}
          >
            <Pencil />
          </Button>
          <Button
            size="icon-sm"
            variant="destructive"
            aria-label={`Delete ${user.firstName} ${user.lastName}`}
            onClick={() => setUserToDelete(user)}
          >
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Users"
        description="Create, view, update and delete users without ever leaving this page."
        actions={
          <Button onClick={openCreate}>
            <Plus />
            Add User
          </Button>
        }
      />

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
        <SearchInput
          value={listParams.search}
          placeholder="Search users by name, email or username…"
          label="Search users"
          onChange={(value) =>
            listParams.setParams({ search: value, gender: undefined })
          }
          className="sm:max-w-sm"
        />

        <div className="flex items-center gap-3 sm:ml-auto">
          <span className="hidden text-sm font-medium whitespace-nowrap text-muted-foreground sm:inline">
            Gender
          </span>
          <Select
            aria-label="Filter by gender"
            value={gender}
            onChange={(event) =>
              listParams.setParams({
                gender: event.target.value || undefined,
                search: undefined,
              })
            }
            className="sm:w-40"
          >
            <option value="">All genders</option>
            {USER_GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>

          {hasFilters ? (
            <Button variant="ghost" size="sm" onClick={listParams.reset}>
              Clear
            </Button>
          ) : null}
        </div>
      </div>

      {isError ? (
        <ErrorState title="Failed to load users" error={error} onRetry={() => refetch()} />
      ) : (
        <>
          <DataTable
            caption="Users"
            columns={columns}
            rows={users}
            getRowId={(user) => user.id}
            isLoading={isLoading}
            skeletonRows={listParams.limit}
            sortBy={listParams.sortBy}
            order={listParams.order}
            onSortChange={listParams.toggleSort}
            emptyState={
              <EmptyState
                icon={UsersRound}
                title="No users found"
                description={
                  hasFilters
                    ? "No users match the current search or filter."
                    : "There are no users to display yet."
                }
                action={
                  hasFilters ? (
                    <Button variant="outline" size="sm" onClick={listParams.reset}>
                      Clear filters
                    </Button>
                  ) : null
                }
              />
            }
          />

          <Pagination
            page={listParams.page}
            limit={listParams.limit}
            total={total}
            itemLabel="users"
            isLoading={isFetching}
            onPageChange={(page) => listParams.setParams({ page })}
          />
        </>
      )}

      <UserFormDialog
        open={isFormOpen}
        onOpenChange={(open) => (open ? setIsFormOpen(true) : closeForm())}
        user={userBeingEdited}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
      />

      <UserDetailsDrawer
        userId={viewedUserId}
        onOpenChange={(open) => !open && setViewedUserId(null)}
        onEdit={() => {
          const user = users.find((candidate) => candidate.id === viewedUserId);
          setViewedUserId(null);
          if (user) openEdit(user);
        }}
      />

      <ConfirmDialog
        open={userToDelete !== null}
        onOpenChange={(open) => !open && setUserToDelete(null)}
        title="Delete user"
        description={`${userToDelete?.firstName ?? ""} ${userToDelete?.lastName ?? ""} will be removed. This action cannot be undone.`}
        confirmLabel="Delete user"
        destructive
        isPending={deleteMutation.isPending}
        onConfirm={() => userToDelete && deleteMutation.mutate(userToDelete.id)}
      />
    </div>
  );
}
