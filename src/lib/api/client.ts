const DEFAULT_API_BASE_URL = "https://focused-mindfulness-production-10b9.up.railway.app";

function normalizeApiBaseUrl(url: string) {
  const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  return withProtocol.replace(/\/+$/, "");
}

const API_BASE_URL = normalizeApiBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL,
);

let accessToken: string | null =
  typeof window !== "undefined" ? window.localStorage.getItem("Zenivra_access_token") : null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem("Zenivra_access_token", token);
  else window.localStorage.removeItem("Zenivra_access_token");
}

export function getAccessToken() {
  return accessToken;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message);
  }
}

type ApiOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  timeoutMs?: number;
  retry?: boolean;
};

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;
  refreshPromise = fetch(`${API_BASE_URL}/api/auth/me`, { credentials: "include" })
    .then(async (response) => {
      if (!response.ok) return false;
      const session = (await response.json()) as { accessToken: string };
      setAccessToken(session.accessToken);
      return true;
    })
    .catch(() => false)
    .finally(() => { refreshPromise = null; });
  return refreshPromise;
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { timeoutMs = 20_000, retry = false, ...requestOptions } = options;
  const headers = new Headers(options.headers);
  if (requestOptions.body !== undefined) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    signal: requestOptions.signal ?? controller.signal,
    credentials: "include",
    headers,
    body: requestOptions.body === undefined ? undefined : JSON.stringify(requestOptions.body),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw new ApiError("Request timed out. Please try again.", 408);
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }

  if (response.status === 401 && accessToken && path !== "/api/auth/me" && !retry && await refreshAccessToken()) {
    return api<T>(path, { ...options, retry: true });
  }

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload
        ? String(payload.error)
        : `Request failed (${response.status})`;
    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}
