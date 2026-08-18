import type { NextRequest } from "next/server";

import { userSchema } from "@/modules/users/schemas/user.schema";
import type { UserPayload } from "@/modules/users/types/user.types";
import {
  handleRoute,
  jsonError,
  jsonOk,
  parseJsonBody,
} from "@/server/shared/api-response";
import { deleteUser, getUser, updateUser } from "@/server/users/user.repository";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  return handleRoute(async () => {
    const { id } = await params;
    const user = await getUser(id);

    if (!user) return jsonError(`User ${id} was not found.`, 404);
    return jsonOk(user);
  });
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  return handleRoute(async () => {
    const { id } = await params;
    const payload = await parseJsonBody<UserPayload>(request, userSchema);
    const user = await updateUser(id, payload);

    if (!user) return jsonError(`User ${id} was not found.`, 404);
    return jsonOk(user);
  });
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  return handleRoute(async () => {
    const { id } = await params;
    const user = await deleteUser(id);

    if (!user) return jsonError(`User ${id} was not found.`, 404);
    return jsonOk(user);
  });
}
