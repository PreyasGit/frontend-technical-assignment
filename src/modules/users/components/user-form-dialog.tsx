"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

import {
  userFormDefaults,
  userSchema,
  type UserFormValues,
} from "../schemas/user.schema";
import { USER_GENDER_OPTIONS, type User } from "../types/user.types";

export interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present in edit mode, absent in create mode. */
  user?: User | null;
  isSubmitting: boolean;
  onSubmit: (values: UserFormValues) => void;
}

/** Modal hosting the Add User and Edit User forms. */
export function UserFormDialog({
  open,
  onOpenChange,
  user,
  isSubmitting,
  onSubmit,
}: UserFormDialogProps) {
  const isEditMode = Boolean(user);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: yupResolver(userSchema),
    defaultValues: userFormDefaults,
    mode: "onBlur",
  });

  // Re-seed the form every time the modal opens so stale values never leak in.
  useEffect(() => {
    if (!open) return;
    reset(
      user
        ? {
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            phone: user.phone,
            age: user.age,
            gender: user.gender === "female" ? "female" : "male",
          }
        : userFormDefaults
    );
  }, [open, reset, user]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit user" : "Add user"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update this user's profile and save your changes."
              : "Create a new user profile. All fields are required."}
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              name="firstName"
              label="First name"
              required
              error={errors.firstName?.message}
            >
              <Input
                id="firstName"
                aria-invalid={Boolean(errors.firstName)}
                {...register("firstName")}
              />
            </FormField>

            <FormField
              name="lastName"
              label="Last name"
              required
              error={errors.lastName?.message}
            >
              <Input
                id="lastName"
                aria-invalid={Boolean(errors.lastName)}
                {...register("lastName")}
              />
            </FormField>
          </div>

          <FormField
            name="username"
            label="Username"
            required
            error={errors.username?.message}
          >
            <Input
              id="username"
              aria-invalid={Boolean(errors.username)}
              {...register("username")}
            />
          </FormField>

          <FormField name="email" label="Email" required error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
          </FormField>

          <FormField name="phone" label="Phone" required error={errors.phone?.message}>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 555 123 4567"
              aria-invalid={Boolean(errors.phone)}
              {...register("phone")}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField name="age" label="Age" required error={errors.age?.message}>
              <Input
                id="age"
                type="number"
                min="18"
                max="120"
                aria-invalid={Boolean(errors.age)}
                {...register("age")}
              />
            </FormField>

            <FormField
              name="gender"
              label="Gender"
              required
              error={errors.gender?.message}
            >
              <Select
                id="gender"
                aria-invalid={Boolean(errors.gender)}
                {...register("gender")}
              >
                {USER_GENDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : isEditMode ? "Save changes" : "Create user"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
