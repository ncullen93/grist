import type { Route } from "./+types/logout";
import { apiPost, redirectWithCookies } from "~/lib/api.server";
import { redirect } from "react-router";

export async function action({ request }: Route.ActionArgs) {
  try {
    const res = await apiPost(request, "/api/auth/logout/");
    return redirectWithCookies(res, "/");
  } catch {
    return redirect("/");
  }
}
