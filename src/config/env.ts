/**
 * Centralised, type-safe access to runtime configuration.
 *
 * Two different base URLs are in play:
 *
 * - `apiBaseUrl` is what the browser talks to. It points at this application's
 *   own API routes, which own the writable data layer.
 * - `upstreamApiBaseUrl` is the read-only third-party source (DummyJSON) that
 *   the server reads from. It is never called directly from the browser.
 */

const DEFAULT_API_BASE_URL = "/api";
const DEFAULT_UPSTREAM_API_BASE_URL = "https://dummyjson.com";

function readEnv(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

export const env = {
  /** Base URL the browser uses for all data requests. */
  apiBaseUrl: readEnv(process.env.NEXT_PUBLIC_API_BASE_URL, DEFAULT_API_BASE_URL),
  /** Milliseconds before an in-flight browser request is aborted. */
  apiTimeoutMs: 20_000,
} as const;

/**
 * Server-only configuration. Importing this from a client component would leak
 * server settings into the bundle, so it lives behind its own export.
 */
export const serverEnv = {
  /** Read-only third-party API the server mirrors data from. */
  upstreamApiBaseUrl: readEnv(
    process.env.UPSTREAM_API_BASE_URL,
    DEFAULT_UPSTREAM_API_BASE_URL
  ),
  /** Milliseconds before an upstream request is abandoned. */
  upstreamTimeoutMs: 20_000,
  /** How long a full upstream collection stays cached in memory. */
  upstreamCacheTtlMs: 5 * 60 * 1000,
  /**
   * Directory holding the local write layer. Kept as a static literal so the
   * build can scope filesystem tracing to this folder instead of the whole project.
   */
  dataDirectory: ".data",
  /** File name inside {@link dataDirectory} the write layer is persisted to. */
  dataFileName: readEnv(process.env.LOCAL_DATA_FILE_NAME, "overlay.json"),
} as const;
