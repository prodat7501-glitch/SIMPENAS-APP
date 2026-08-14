/**
 * SIMPENAS Unified API Client
 * Mengintegrasikan REST API sesuai Postman Collection (DOCS/simpenas-api.postman_collection.json)
 */

const getApiBaseUrl = (): string => {
  if (typeof window !== "undefined" && (window as Record<string, unknown>).__NEXT_DATA__ && (window as unknown as { __NEXT_DATA__?: { env?: { NEXT_PUBLIC_API_URL?: string } } }).__NEXT_DATA__?.env?.NEXT_PUBLIC_API_URL) {
    return (window as unknown as { __NEXT_DATA__: { env: { NEXT_PUBLIC_API_URL: string } } }).__NEXT_DATA__.env.NEXT_PUBLIC_API_URL;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
};

/**
 * Konversi kunci objek dari snake_case ke camelCase secara rekursif
 */
export function toCamelCase<T = unknown>(data: unknown): T {
  if (data === null || data === undefined) return data as T;
  if (Array.isArray(data)) {
    return data.map((item) => toCamelCase(item)) as unknown as T;
  }
  if (typeof data === "object" && !(data instanceof Date) && !(data instanceof File) && !(data instanceof Blob)) {
    const record = data as Record<string, unknown>;
    const newObj: Record<string, unknown> = {};
    for (const key of Object.keys(record)) {
      const camelKey = key.replace(/_([a-z0-9])/g, (_, letter: string) => letter.toUpperCase());
      newObj[camelKey] = toCamelCase(record[key]);
    }
    return newObj as T;
  }
  return data as T;
}

/**
 * Konversi kunci objek dari camelCase ke snake_case secara rekursif
 */
export function toSnakeCase<T = unknown>(data: unknown): T {
  if (data === null || data === undefined) return data as T;
  if (Array.isArray(data)) {
    return data.map((item) => toSnakeCase(item)) as unknown as T;
  }
  if (typeof data === "object" && !(data instanceof Date) && !(data instanceof File) && !(data instanceof Blob)) {
    const record = data as Record<string, unknown>;
    const newObj: Record<string, unknown> = {};
    for (const key of Object.keys(record)) {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      newObj[snakeKey] = toSnakeCase(record[key]);
    }
    return newObj as T;
  }
  return data as T;
}

export interface ApiOptions extends RequestInit {
  params?: Record<string, unknown>;
  skipTransform?: boolean;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { params, skipTransform = false, headers: customHeaders, ...customOptions } = options;
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  let url = `${baseUrl}${cleanEndpoint}`;

  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // Auth token dari localStorage jika ada
  if (typeof window !== "undefined") {
    const sessionStr = localStorage.getItem("simpenas_auth_session");
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (session && session.token) {
          defaultHeaders["Authorization"] = `Bearer ${session.token}`;
        }
      } catch {
        // ignore JSON parse error
      }
    }
  }

  const mergedHeaders = { ...defaultHeaders, ...customHeaders };

  try {
    const response = await fetch(url, {
      ...customOptions,
      headers: mergedHeaders,
    });

    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      throw new ApiError(
        `API Error ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();
    return skipTransform ? data : toCamelCase<T>(data);
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error;
    }
    const errObj = error as { message?: string };
    throw new ApiError(errObj.message || "Network request failed", 0, error);
  }
}

export const apiClient = {
  get: <T = unknown>(endpoint: string, params?: Record<string, unknown>, options?: ApiOptions): Promise<T> =>
    request<T>(endpoint, { method: "GET", params, ...options }),

  post: <T = unknown>(endpoint: string, body?: unknown, options?: ApiOptions): Promise<T> =>
    request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(options?.skipTransform ? body : toSnakeCase(body)) : undefined,
      ...options,
    }),

  put: <T = unknown>(endpoint: string, body?: unknown, options?: ApiOptions): Promise<T> =>
    request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(options?.skipTransform ? body : toSnakeCase(body)) : undefined,
      ...options,
    }),

  patch: <T = unknown>(endpoint: string, body?: unknown, options?: ApiOptions): Promise<T> =>
    request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(options?.skipTransform ? body : toSnakeCase(body)) : undefined,
      ...options,
    }),

  delete: <T = unknown>(endpoint: string, options?: ApiOptions): Promise<T> =>
    request<T>(endpoint, { method: "DELETE", ...options }),
};

/**
 * Helper pembantu untuk eksekusi API dengan fallback otomatis ke fungsi local jika API gagal / offline
 */
export async function withApiFallback<T>(
  apiFn: () => Promise<T>,
  fallbackFn: () => T | Promise<T>
): Promise<T> {
  const forceMock = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";
  if (forceMock) {
    return await fallbackFn();
  }
  try {
    return await apiFn();
  } catch (error) {
    console.warn("REST API request failed, falling back to local storage:", error);
    return await fallbackFn();
  }
}

