/**
 * Frontend API Client (`apiClient.ts`)
 * ---------------------------------------------------------------------------
 * Beginner Note:
 * React components in the browser CANNOT talk directly to SQL Server (doing so
 * would expose database passwords to anyone opening DevTools). Instead, every
 * component calls functions in this file, which send HTTP `fetch()` requests to
 * our Next.js server routes under `/api/...`.
 *
 * Notice every function returns `{ ok, code, message, data, dbMode }` so UI
 * pages can immediately show green success banners or helpful error instructions.
 */

import type { ApiResponse } from "@/types/database";

async function request<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {}),
      },
      cache: "no-store",
    });

    const json = (await res.json()) as ApiResponse<T>;
    return json;
  } catch {
    return {
      ok: false,
      code: -1,
      message: "Network error: could not reach the server. Check that the Next.js server is running.",
    };
  }
}

export const api = {
  get<T>(url: string): Promise<ApiResponse<T>> {
    return request<T>(url, { method: "GET" });
  },
  post<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
    return request<T>(url, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },
  patch<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
    return request<T>(url, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },
  del<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
    return request<T>(url, {
      method: "DELETE",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },
};
