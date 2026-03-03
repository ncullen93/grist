/**
 * Server-side API client for React Router loaders/actions.
 * Forwards cookies between the browser and Django.
 */

const API_BASE = process.env.API_URL || "http://localhost:8000";

export async function apiFetch(
  request: Request,
  path: string,
  init?: RequestInit
): Promise<Response> {
  const url = `${API_BASE}${path}`;
  const cookie = request.headers.get("cookie") || "";

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(cookie ? { Cookie: cookie } : {}),
    ...(init?.headers || {}),
  };

  return fetch(url, {
    ...init,
    headers,
  });
}

export async function apiGet(request: Request, path: string) {
  return apiFetch(request, path, { method: "GET" });
}

export async function apiPost(request: Request, path: string, body?: unknown) {
  return apiFetch(request, path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiPatch(request: Request, path: string, body: unknown) {
  return apiFetch(request, path, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function apiPut(request: Request, path: string, body: unknown) {
  return apiFetch(request, path, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function apiDelete(request: Request, path: string) {
  return apiFetch(request, path, { method: "DELETE" });
}

/**
 * Create a redirect response that forwards Set-Cookie headers from Django.
 */
/**
 * Forward a multipart upload to Django, preserving the boundary.
 */
export async function apiUpload(
  request: Request,
  path: string,
  body: ArrayBuffer,
  contentType: string
): Promise<Response> {
  const url = `${API_BASE}${path}`;
  const cookie = request.headers.get("cookie") || "";

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": contentType,
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body,
  });
}

/**
 * Create a redirect response that forwards Set-Cookie headers from Django.
 */
export function redirectWithCookies(
  djangoResponse: Response,
  redirectTo: string,
  status = 302
): Response {
  const headers = new Headers();
  headers.set("Location", redirectTo);

  const setCookies = djangoResponse.headers.getSetCookie();
  for (const cookie of setCookies) {
    headers.append("Set-Cookie", cookie);
  }

  return new Response(null, { status, headers });
}
