/**
 * Resource route for help form submissions (no UI export).
 * Used by HelpDialog via useFetcher.
 */
import { apiPost } from "~/lib/api.server";
import type { Route } from "./+types/member-help";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const type = formData.get("type") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  try {
    const res = await apiPost(request, "/api/support/", {
      type,
      subject,
      message,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { error: err.detail || "Failed to submit." };
    }
    return { success: true };
  } catch {
    return { error: "Unable to connect to server." };
  }
}
