import "server-only";

import { ValidationError, type AnyObjectSchema } from "yup";

import { UpstreamError } from "@/server/upstream/upstream-client";

/** Successful JSON response. */
export function jsonOk<T>(data: T, status = 200): Response {
  return Response.json(data, { status });
}

/** Error response using the shape the Axios interceptor already understands. */
export function jsonError(message: string, status: number): Response {
  return Response.json({ message }, { status });
}

/**
 * Wraps a route handler so any thrown error becomes a well-formed JSON
 * response instead of an opaque 500.
 */
export async function handleRoute(
  handler: () => Promise<Response>
): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof ValidationError) {
      return jsonError(error.errors.join(", "), 422);
    }
    if (error instanceof UpstreamError) {
      return jsonError(`Upstream API error: ${error.message}`, error.status);
    }

    console.error("[api] Unhandled route error", error);
    return jsonError("Unexpected server error.", 500);
  }
}

/**
 * Parses and validates a JSON request body against a Yup schema.
 *
 * The same schemas back the client forms, so validation rules cannot drift
 * between the two sides.
 */
export async function parseJsonBody<T>(
  request: Request,
  schema: AnyObjectSchema
): Promise<T> {
  let raw: unknown;

  try {
    raw = await request.json();
  } catch {
    throw new ValidationError("Request body must be valid JSON.");
  }

  return (await schema.validate(raw, {
    abortEarly: false,
    stripUnknown: true,
  })) as T;
}
