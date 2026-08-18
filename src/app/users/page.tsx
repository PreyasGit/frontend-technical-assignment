import type { Metadata } from "next";
import { Suspense } from "react";

import { PageLoader } from "@/components/common/loader";
import { UserListView } from "@/modules/users/components/user-list-view";

export const metadata: Metadata = {
  title: "Users",
  description:
    "Create, view, update and delete users from a single page using modals and a details drawer.",
};

export default function UsersPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading users…" />}>
      <UserListView />
    </Suspense>
  );
}
