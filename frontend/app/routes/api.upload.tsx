import type { Route } from "./+types/api.upload";

const API_BASE = process.env.API_URL || "http://localhost:8000";

export async function action({ request }: Route.ActionArgs) {
  const cookie = request.headers.get("cookie") || "";
  const contentType = request.headers.get("content-type") || "";

  // Forward the multipart form data directly to Django, preserving the boundary
  const res = await fetch(`${API_BASE}/api/members/upload/`, {
    method: "POST",
    headers: {
      "Content-Type": contentType,
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: await request.arrayBuffer(),
  });

  if (!res.ok) {
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }

  const data = await res.json();
  return Response.json(data);
}
