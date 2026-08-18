/**
 * Centralised, type-safe access to public runtime configuration.
 *
 * Every value must be read through this module so that no API host or
 * tunable is hardcoded inside feature code.
 */

const DEFAULT_API_BASE_URL = "https://dummyjson.com";

function readPublicEnv(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

export const env = {
  /** Base URL of the REST API consumed by the application. */
  apiBaseUrl: readPublicEnv(
    process.env.NEXT_PUBLIC_API_BASE_URL,
    DEFAULT_API_BASE_URL
  ),
  /** Milliseconds before an in-flight request is aborted. */
  apiTimeoutMs: 20_000,
} as const;
