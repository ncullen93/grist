import { Link, useFetcher, useSearchParams } from "react-router";
import type { Route } from "./+types/admin-blog";
import { apiGet, apiDelete } from "~/lib/api.server";
import { redirect } from "react-router";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "~/components/ui/tabs";
import { ArrowLeft, Trash2 } from "lucide-react";

export async function loader({ request }: Route.LoaderArgs) {
  const [meRes, blogRes, commentsRes] = await Promise.all([
    apiGet(request, "/api/auth/me/"),
    apiGet(request, "/api/blog/posts/?all=true"),
    apiGet(request, "/api/admin/blog/comments/"),
  ]);

  if (!meRes.ok) return redirect("/login");
  const user = await meRes.json();
  if (!user.is_staff) return redirect("/m");

  const blogData = await blogRes.json();
  const commentsData = commentsRes.ok ? await commentsRes.json() : [];

  return {
    posts: blogData.results ?? blogData,
    comments: Array.isArray(commentsData) ? commentsData : commentsData.results ?? [],
  };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete-post") {
    const postId = formData.get("postId") as string;
    await apiDelete(request, `/api/blog/posts/${postId}/`);
    return { ok: true };
  }

  if (intent === "delete-comment") {
    const commentId = formData.get("commentId") as string;
    await apiDelete(request, `/api/admin/blog/comments/${commentId}/`);
    return { ok: true };
  }

  return { ok: false };
}

type BlogPost = {
  id: number;
  title: string;
  author_name: string;
  status: string;
  likes_count: number;
  time: string;
};

type BlogComment = {
  id: number;
  body: string;
  author_name: string;
  post_title: string;
  created_at: string;
};

function PostTable({
  posts,
  handleDelete,
}: {
  posts: BlogPost[];
  handleDelete: (id: number, title: string) => void;
}) {
  if (posts.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-border p-16 text-center">
        <p className="text-sm text-muted-foreground">No blog posts found.</p>
      </div>
    );
  }
  return (
    <div className="mt-6 rounded-lg border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-sidebar border-b border-border">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
              Author
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
              Date
            </th>
            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id} className="border-b border-border last:border-0">
              <td className="px-6 py-4 font-medium">{post.title || "Untitled"}</td>
              <td className="px-6 py-4 text-muted-foreground hidden sm:table-cell">
                {post.author_name}
              </td>
              <td className="px-6 py-4 hidden md:table-cell">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    post.status === "published"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {post.status}
                </span>
              </td>
              <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">
                {post.time}
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => handleDelete(post.id, post.title)}
                  className="inline-flex items-center text-destructive/70 hover:text-destructive transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminBlogPage({ loaderData }: Route.ComponentProps) {
  const { posts, comments } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "all";
  const setActiveTab = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "all") next.delete("tab");
    else next.set("tab", value);
    setSearchParams(next, { replace: true });
  };
  const fetcher = useFetcher();

  const handleDeletePost = (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    fetcher.submit({ intent: "delete-post", postId: String(id) }, { method: "post" });
  };

  const handleDeleteComment = (id: number) => {
    if (!confirm("Delete this comment? This cannot be undone.")) return;
    fetcher.submit({ intent: "delete-comment", commentId: String(id) }, { method: "post" });
  };

  const published = posts.filter((p: BlogPost) => p.status === "published");
  const drafts = posts.filter((p: BlogPost) => p.status === "draft");

  return (
    <>
      <header className="px-4 md:px-8 h-18 flex items-center bg-background shrink-0 border-b border-border sticky top-0 z-10">
        <Link
          to="/m/admin"
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Admin
        </Link>
      </header>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({posts.length})</TabsTrigger>
            <TabsTrigger value="published">Published ({published.length})</TabsTrigger>
            <TabsTrigger value="drafts">Drafts ({drafts.length})</TabsTrigger>
            <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <PostTable posts={posts} handleDelete={handleDeletePost} />
          </TabsContent>
          <TabsContent value="published">
            <PostTable posts={published} handleDelete={handleDeletePost} />
          </TabsContent>
          <TabsContent value="drafts">
            <PostTable posts={drafts} handleDelete={handleDeletePost} />
          </TabsContent>
          <TabsContent value="comments">
            {comments.length === 0 ? (
              <div className="mt-6 rounded-lg border border-border p-16 text-center">
                <p className="text-sm text-muted-foreground">No comments yet.</p>
              </div>
            ) : (
              <div className="mt-6 rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-sidebar border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Comment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                        Post
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comments.map((comment: BlogComment) => (
                      <tr key={comment.id} className="border-b border-border last:border-0">
                        <td className="px-6 py-4 text-foreground max-w-xs truncate">
                          {comment.body.slice(0, 80)}{comment.body.length > 80 ? "..." : ""}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground hidden sm:table-cell">
                          {comment.author_name}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground hidden md:table-cell max-w-xs truncate">
                          {comment.post_title}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="inline-flex items-center text-destructive/70 hover:text-destructive transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
