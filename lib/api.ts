import type { ApiErrorBody } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  if (init.body && !isFormData && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const response = await fetch(url, { ...init, method, headers, credentials: "include", cache: "no-store" });
  if (!response.ok) {
    let body: Partial<ApiErrorBody> = {};
    try {
      body = await response.json() as Partial<ApiErrorBody>;
    } catch {
      body = {};
    }
    throw new ApiError(body.detail ?? `Request failed (${response.status})`, response.status, body.code ?? "request_error");
  }
  if (response.status === 204) return undefined as T;
  return await response.json() as T;
}

export const apiUrl = API_BASE_URL;