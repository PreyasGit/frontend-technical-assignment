import "server-only";

import axios, { AxiosError, type AxiosInstance } from "axios";

import { serverEnv } from "@/config/env";

/**
 * Axios instance used exclusively on the server to read from the third-party
 * API. The browser never talks to it directly — it goes through this
 * application's own API routes, which layer local writes on top.
 */
export const upstreamClient: AxiosInstance = axios.create({
  baseURL: serverEnv.upstreamApiBaseUrl,
  timeout: serverEnv.upstreamTimeoutMs,
  headers: { Accept: "application/json" },
});

/** Error raised when the upstream API cannot serve a request. */
export class UpstreamError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "UpstreamError";
    this.status = status;
  }
}

/** Performs a GET against the upstream API, normalising failures. */
export async function upstreamGet<T>(path: string): Promise<T> {
  try {
    const { data } = await upstreamClient.get<T>(path);
    return data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new UpstreamError(
      axiosError.response?.data?.message ??
        axiosError.message ??
        "Upstream request failed",
      axiosError.response?.status ?? 502
    );
  }
}

/**
 * Like {@link upstreamGet} but resolves to `null` for a 404, which lets callers
 * distinguish "not there" from "upstream is broken".
 */
export async function upstreamGetOrNull<T>(path: string): Promise<T | null> {
  try {
    return await upstreamGet<T>(path);
  } catch (error) {
    if (error instanceof UpstreamError && error.status === 404) return null;
    throw error;
  }
}
