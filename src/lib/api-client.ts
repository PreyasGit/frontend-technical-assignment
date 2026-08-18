import axios, { AxiosError, type AxiosInstance } from "axios";

import { env } from "@/config/env";

/**
 * Single shared Axios instance. Feature code never calls `axios` directly so
 * that base URL, timeout and error normalisation stay in one place.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeoutMs,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  // Auth headers would be attached here; the public demo API needs none.
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    return Promise.reject(new ApiError(error));
  }
);

/** Error type surfaced to React Query with a human readable message. */
export class ApiError extends Error {
  readonly status?: number;

  constructor(error: AxiosError<{ message?: string }>) {
    super(ApiError.resolveMessage(error));
    this.name = "ApiError";
    this.status = error.response?.status;
  }

  private static resolveMessage(
    error: AxiosError<{ message?: string }>
  ): string {
    if (error.response?.data?.message) return error.response.data.message;
    if (error.code === "ECONNABORTED") {
      return "The request timed out. Please check your connection and try again.";
    }
    if (error.response) {
      return `Request failed with status ${error.response.status}.`;
    }
    return error.message || "Unable to reach the server.";
  }
}

/** Extracts a displayable message from any thrown value. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
