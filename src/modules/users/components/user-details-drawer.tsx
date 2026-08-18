"use client";

import Image from "next/image";
import { Building2, Cake, Mail, MapPin, Phone, User as UserIcon } from "lucide-react";

import { ErrorState } from "@/components/common/error-state";
import { Loader } from "@/components/common/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toTitleCase } from "@/lib/utils";

import { useUser } from "../hooks/use-users";

export interface UserDetailsDrawerProps {
  /** Id of the user to display, or `null` when the drawer is closed. */
  userId: number | null;
  onOpenChange: (open: boolean) => void;
  /** Opens the edit modal for the user currently shown in the drawer. */
  onEdit: () => void;
}

/** Side drawer showing the full profile of a single user. */
export function UserDetailsDrawer({
  userId,
  onOpenChange,
  onEdit,
}: UserDetailsDrawerProps) {
  const { data: user, isLoading, isError, error, refetch } = useUser(userId);

  return (
    <Sheet open={userId !== null} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-md"
      >
        <SheetHeader className="border-b border-border">
          <SheetTitle>User details</SheetTitle>
          <SheetDescription>
            Read-only profile pulled from the DummyJSON Users API.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 px-4 pb-4">
          {isLoading ? (
            <Loader label="Loading profile…" />
          ) : isError || !user ? (
            <ErrorState
              title="Failed to load this user"
              error={error}
              onRetry={() => refetch()}
            />
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                  <Image
                    src={user.image}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="truncate text-lg font-semibold text-foreground">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    @{user.username}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary">{toTitleCase(user.gender)}</Badge>
                    {user.role ? (
                      <Badge variant="accent">{toTitleCase(user.role)}</Badge>
                    ) : null}
                  </div>
                </div>
              </div>

              <section className="space-y-3">
                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Contact
                </h3>
                <DetailLine icon={Mail} label="Email" value={user.email} />
                <DetailLine icon={Phone} label="Phone" value={user.phone} />
                <DetailLine
                  icon={Cake}
                  label="Age / birth date"
                  value={`${user.age} · ${user.birthDate}`}
                />
                <DetailLine
                  icon={UserIcon}
                  label="Blood group"
                  value={user.bloodGroup ?? "—"}
                />
              </section>

              {user.address ? (
                <section className="space-y-3">
                  <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Address
                  </h3>
                  <DetailLine
                    icon={MapPin}
                    label="Home"
                    value={`${user.address.address}, ${user.address.city}, ${user.address.stateCode} ${user.address.postalCode}, ${user.address.country}`}
                  />
                </section>
              ) : null}

              {user.company ? (
                <section className="space-y-3">
                  <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Company
                  </h3>
                  <DetailLine
                    icon={Building2}
                    label={user.company.name}
                    value={`${user.company.title} · ${user.company.department}`}
                  />
                </section>
              ) : null}
            </div>
          )}
        </div>

        <SheetFooter className="border-t border-border sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button disabled={!user} onClick={onEdit}>
            Edit user
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function DetailLine({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </span>
      <div className="min-w-0 space-y-0.5">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <p className="text-sm break-words text-foreground">{value}</p>
      </div>
    </div>
  );
}
