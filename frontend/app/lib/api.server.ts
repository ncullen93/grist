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
