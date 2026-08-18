import type { NextRequest } from "next/server";

import { userSchema } from "@/modules/users/schemas/user.schema";
import type { UserPayload } from "@/modules/users/types/user.types";
import {
  handleRoute,
  jsonOk,
  parseJsonBody,
} from "@/server/shared/api-response";
import { parseCollectionQuery } from "@/server/shared/collection-query";
import { createUser, listUsers } from "@/server/users/user.repository";

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    const query = parseCollectionQuery(request.nextUrl.searchParams, {
      sortBy: "firstName",
    });

    const result = await listUsers({
      ...query,
      gender: request.nextUrl.searchParams.get("gender") || undefined,
    });

    return jsonOk(result);
  });
}

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    const payload = await parseJsonBody<UserPayload>(request, userSchema);
    const user = await createUser(payload);
    return jsonOk(user, 201);
  });
}
