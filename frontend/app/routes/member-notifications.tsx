/**
 * Resource route for notifications (no UI export).
 * Used by NotificationPanel via useFetcher.
 */
import { redirect } from "react-router";
import { apiGet, apiPost } from "~/lib/api.server";
import type { Route } from "./+types/member-notifications";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const res = await apiGet(request, "/api/notifications/");
    if (!res.ok) return redirect("/login");
    const data = await res.json();
    return { results: data.results ?? data };
  } catch {
    return redirect("/login");
  }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "mark-read") {
    const id = formData.get("id") as string;
    try {
      const res = await apiPost(request, `/api/notifications/${id}/read/`);
      if (!res.ok) return { error: "Failed to mark as read." };
      return { marked: id };
    } catch {
      return { error: "Unable to connect to server." };
    }
  }

  if (intent === "mark-all-read") {
    try {
      const res = await apiPost(request, "/api/notifications/mark-all-read/");
      if (!res.ok) return { error: "Failed to mark all as read." };
      return { allRead: true };
    } catch {
      return { error: "Unable to connect to server." };
    }
  }

  return null;
}
