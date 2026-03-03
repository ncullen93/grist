import { useState } from "react";
import { Link, useFetcher, useSearchParams } from "react-router";
import type { Route } from "./+types/admin-forum";
import { apiGet, apiDelete, apiPost, apiPatch } from "~/lib/api.server";
import { redirect } from "react-router";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { ArrowLeft, Trash2, Plus, Pencil, Pin } from "lucide-react";

export async function loader({ request }: Route.LoaderArgs) {
  const [meRes, postsRes, channelsRes, topicsRes] = await Promise.all([
    apiGet(request, "/api/auth/me/"),
    apiGet(request, "/api/forum/posts/"),
    apiGet(request, "/api/forum/channels/"),
    apiGet(request, "/api/forum/topics/"),
  ]);

  if (!meRes.ok) return redirect("/login");
  const user = await meRes.json();
  if (!user.is_staff) return redirect("/m");

  const postsData = await postsRes.json();
  const channelsData = await channelsRes.json();
  const topicsData = await topicsRes.json();

  return {
    posts: postsData.results ?? postsData,
    channels: Array.isArray(channelsData) ? channelsData : channelsData.results ?? [],
    topics: Array.isArray(topicsData) ? topicsData : topicsData.results ?? [],
  };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "delete-post") {
    const postId = formData.get("postId") as string;
    await apiDelete(request, `/api/forum/posts/${postId}/`);
    return { ok: true };
  }

  if (intent === "create-channel") {
    const name = formData.get("name") as string;
    await apiPost(request, "/api/forum/channels/", { name, slug: name.toLowerCase().replace(/\s+/g, "-") });
    return { ok: true };
  }

  if (intent === "delete-channel") {
    const channelId = formData.get("channelId") as string;
    await apiDelete(request, `/api/forum/channels/${channelId}/`);
    return { ok: true };
  }

  if (intent === "update-channel") {
    const channelId = formData.get("channelId") as string;
    const name = formData.get("name") as string;
    await apiPatch(request, `/api/forum/channels/${channelId}/`, { name });
    return { ok: true };
  }

  if (intent === "create-topic") {
    const name = formData.get("name") as string;
    await apiPost(request, "/api/forum/topics/", { name, slug: name.toLowerCase().replace(/\s+/g, "-") });
    return { ok: true };
  }

  if (intent === "delete-topic") {
    const topicId = formData.get("topicId") as string;
    await apiDelete(request, `/api/forum/topics/${topicId}/`);
    return { ok: true };
  }

  if (intent === "update-topic") {
    const topicId = formData.get("topicId") as string;
    const name = formData.get("name") as string;
    await apiPatch(request, `/api/forum/topics/${topicId}/`, { name });
    return { ok: true };
  }

  return { ok: false };
}

type ForumPost = {
  id: number;
  title: string;
  author_name: string;
  channel_name: string;
  reply_count: number;
  likes_count: number;
  pinned: boolean;
  time: string;
};

type Channel = { id: number; name: string; slug: string; sort_order: number };
type Topic = { id: number; name: string; slug: string };

function InlineItemManager({
  items,
  label,
  intentPrefix,
  idField,
}: {
  items: { id: number; name: string; slug: string }[];
  label: string;
  intentPrefix: string;
  idField: string;
}) {
  const fetcher = useFetcher();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const handleCreate = () => {
    if (!newName.trim()) return;
    fetcher.submit({ intent: `create-${intentPrefix}`, name: newName.trim() }, { method: "post" });
    setNewName("");
  };

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    fetcher.submit({ intent: `delete-${intentPrefix}`, [idField]: String(id) }, { method: "post" });
  };

  const handleUpdate = (id: number) => {
    if (!editName.trim()) return;
    fetcher.submit({ intent: `update-${intentPrefix}`, [idField]: String(id), name: editName.trim() }, { method: "post" });
    setEditingId(null);
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={`New ${label} name...`}
          className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/30"
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <Button onClick={handleCreate} className="rounded-full gap-2" disabled={!newName.trim()}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">No {label.toLowerCase()}s yet.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border divide-y divide-border">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-6 py-4">
              {editingId === item.id ? (
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary/30"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdate(item.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    autoFocus
                  />
                  <Button size="sm" onClick={() => handleUpdate(item.id)}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                </div>
              ) : (
                <>
                  <div>
                    <span className="font-medium text-sm text-foreground">{item.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground font-mono">{item.slug}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { setEditingId(item.id); setEditName(item.name); }}
                      className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
                      title="Edit"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      className="inline-flex items-center text-destructive/70 hover:text-destructive transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminForumPage({ loaderData }: Route.ComponentProps) {
  const { posts, channels, topics } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "posts";
  const setActiveTab = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "posts") next.delete("tab");
    else next.set("tab", value);
    setSearchParams(next, { replace: true });
  };
  const fetcher = useFetcher();

  const handleDeletePost = (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    fetcher.submit({ intent: "delete-post", postId: String(id) }, { method: "post" });
  };

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
            <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
            <TabsTrigger value="channels">Channels ({channels.length})</TabsTrigger>
            <TabsTrigger value="topics">Topics ({topics.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            {posts.length === 0 ? (
              <div className="mt-6 rounded-lg border border-border p-16 text-center">
                <p className="text-sm text-muted-foreground">No forum posts yet.</p>
              </div>
            ) : (
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
                        Channel
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
                    {posts.map((post: ForumPost) => (
                      <tr key={post.id} className="border-b border-border last:border-0">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {post.pinned && <Pin className="size-3 text-primary shrink-0" />}
                            <span className="font-medium">{post.title}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{post.likes_count} likes</span>
                            <span>{post.reply_count} replies</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground hidden sm:table-cell">
                          {post.author_name}
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                            {post.channel_name}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">
                          {post.time}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeletePost(post.id, post.title)}
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

          <TabsContent value="channels">
            <InlineItemManager
              items={channels}
              label="Channel"
              intentPrefix="channel"
              idField="channelId"
            />
          </TabsContent>

          <TabsContent value="topics">
            <InlineItemManager
              items={topics}
              label="Topic"
              intentPrefix="topic"
              idField="topicId"
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
