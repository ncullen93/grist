import { redirect } from "react-router";
import type { Route } from "./+types/member-posts-new-blog-redirect";
import { apiPost } from "~/lib/api.server";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const res = await apiPost(request, "/api/blog/posts/", {
      title: "",
      content: "[]",
      status: "draft",
    });
    if (!res.ok) return redirect("/login");
    const created = await res.json();
    return redirect(`/m/posts/blog/${created.id}`);
  } catch {
    return redirect("/login");
  }
}
