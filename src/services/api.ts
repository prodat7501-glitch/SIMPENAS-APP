/**
 * SIMPENAS Unified REST API Client
 * Terintegrasi dengan koleksi Postman/REST API (DOCS/collection.json)
 * Mendukung otomatis fallback ke Local Storage saat mode offline / development
 */

export const getApiBaseUrl = (): string => {
  let rawUrl = process.env.NEXT_PUBLIC_API_URL;
  if (
    typeof window !== "undefined" &&
    (
      window as unknown as {
        __NEXT_DATA__?: { env?: { NEXT_PUBLIC_API_URL?: string } };
      }
    ).__NEXT_DATA__?.env?.NEXT_PUBLIC_API_URL
  ) {
    rawUrl = (
      window as unknown as {
        __NEXT_DATA__: { env: { NEXT_PUBLIC_API_URL: string } };
      }
    ).__NEXT_DATA__.env.NEXT_PUBLIC_API_URL;
  }

  // Jika diakses di browser remote/Vercel dan env URL kosong atau localhost, gunakan backend Vercel resmi
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1" &&
    (!rawUrl || rawUrl.includes("localhost") || rawUrl.includes("127.0.0.1"))
  ) {
    return "https://simpenas-api.vercel.app/api/v1";
  }

  const url = rawUrl || "https://simpenas-api.vercel.app/api/v1";
  return url.replace(/\/+$/, "");
};

/**
 * Konversi kunci objek dari snake_case ke camelCase secara rekursif
 */
export function toCamelCase<T = unknown>(data: unknown): T {
  if (data === null || data === undefined) return data as T;
  if (Array.isArray(data)) {
    return data.map((item) => toCamelCase(item)) as unknown as T;
  }
  if (
    typeof data === "object" &&
    !(data instanceof Date) &&
    !(data instanceof File) &&
    !(data instanceof Blob)
  ) {
    const record = data as Record<string, unknown>;
    const newObj: Record<string, unknown> = {};
    for (const key of Object.keys(record)) {
      const camelKey = key.replace(/_([a-z0-9])/g, (_, letter: string) =>
        letter.toUpperCase(),
      );
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
  if (
    typeof data === "object" &&
    !(data instanceof Date) &&
    !(data instanceof File) &&
    !(data instanceof Blob)
  ) {
    const record = data as Record<string, unknown>;
    const newObj: Record<string, unknown> = {};
    for (const key of Object.keys(record)) {
      const snakeKey = key.replace(
        /[A-Z]/g,
        (letter) => `_${letter.toLowerCase()}`,
      );
      newObj[snakeKey] = toSnakeCase(record[key]);
    }
    return newObj as T;
  }
  return data as T;
}

/**
 * Helper untuk mengurai respons API yang dibungkus { data: ... } atau { items: ... }
 */
export function unwrapApiResponse<T>(res: unknown): T {
  if (res === null || res === undefined) return res as T;
  if (typeof res === "object") {
    const record = res as Record<string, unknown>;
    if ("data" in record && record.data !== undefined) {
      return record.data as T;
    }
    if ("items" in record && Array.isArray(record.items)) {
      return record.items as T;
    }
  }
  return res as T;
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

async function request<T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const {
    params,
    skipTransform = false,
    headers: customHeaders,
    ...customOptions
  } = options;
  const baseUrl = getApiBaseUrl();
  let cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // Hindari duplikasi /api/v1 jika baseUrl sudah memilikinya
  if (baseUrl.endsWith("/api/v1") && cleanEndpoint.startsWith("/api/v1/")) {
    cleanEndpoint = cleanEndpoint.replace(/^\/api\/v1/, "");
  } else if (baseUrl.endsWith("/api") && cleanEndpoint.startsWith("/api/")) {
    cleanEndpoint = cleanEndpoint.replace(/^\/api/, "");
  }

  let url = `${baseUrl}${cleanEndpoint}`;

  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
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

  // Auth token / User ID dari localStorage jika ada
  if (typeof window !== "undefined") {
    try {
      const authStr = localStorage.getItem("simpenas-auth-storage");
      if (authStr) {
        const parsed = JSON.parse(authStr);
        if (parsed?.state?.user?.id) {
          defaultHeaders["X-User-ID"] = parsed.state.user.id;
        }
      }
    } catch {
      // ignore JSON parse error
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
      let errorMsg = `API Error ${response.status}: ${response.statusText}`;
      if (
        typeof errorData === "object" &&
        errorData !== null &&
        "message" in errorData &&
        typeof (errorData as { message: unknown }).message === "string"
      ) {
        errorMsg = (errorData as { message: string }).message;
      }
      throw new ApiError(errorMsg, response.status, errorData);
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
  get: <T = unknown>(
    endpoint: string,
    params?: Record<string, unknown>,
    options?: ApiOptions,
  ): Promise<T> => request<T>(endpoint, { method: "GET", params, ...options }),

  post: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: ApiOptions,
  ): Promise<T> =>
    request<T>(endpoint, {
      method: "POST",
      body: body
        ? JSON.stringify(options?.skipTransform ? body : toSnakeCase(body))
        : undefined,
      ...options,
    }),

  put: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: ApiOptions,
  ): Promise<T> =>
    request<T>(endpoint, {
      method: "PUT",
      body: body
        ? JSON.stringify(options?.skipTransform ? body : toSnakeCase(body))
        : undefined,
      ...options,
    }),

  patch: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: ApiOptions,
  ): Promise<T> =>
    request<T>(endpoint, {
      method: "PATCH",
      body: body
        ? JSON.stringify(options?.skipTransform ? body : toSnakeCase(body))
        : undefined,
      ...options,
    }),

  delete: <T = unknown>(endpoint: string, options?: ApiOptions): Promise<T> =>
    request<T>(endpoint, { method: "DELETE", ...options }),

  bulkPost: <T = unknown>(
    endpoint: string,
    items: unknown[],
    options?: ApiOptions,
  ): Promise<T> =>
    request<T>(`${endpoint.replace(/\/+$/, "")}/bulk`, {
      method: "POST",
      body: JSON.stringify(options?.skipTransform ? items : toSnakeCase(items)),
      ...options,
    }),
};

/**
 * Helper pembantu untuk eksekusi API dengan fallback otomatis ke fungsi local jika API gagal / offline
 */
export async function withApiFallback<T>(
  apiFn: () => Promise<T>,
  fallbackFn: () => T | Promise<T>,
): Promise<T> {
  const forceMock = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";
  if (forceMock) {
    return await fallbackFn();
  }
  try {
    return await apiFn();
  } catch (error) {
    console.warn(
      "REST API request failed, falling back to local storage:",
      error,
    );
    return await fallbackFn();
  }
}
