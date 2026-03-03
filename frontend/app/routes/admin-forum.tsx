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
import { Trash2, Plus, Pencil, Pin, PinOff } from "lucide-react";
import toast from "react-hot-toast";

export async function loader({ request }: Route.LoaderArgs) {
  const [meRes, postsRes, channelsRes] = await Promise.all([
    apiGet(request, "/api/auth/me/"),
    apiGet(request, "/api/forum/posts/"),
    apiGet(request, "/api/forum/channels/"),
  ]);

  if (!meRes.ok) return redirect("/login");
  const user = await meRes.json();
  if (!user.is_staff) return redirect("/m");

  const postsData = await postsRes.json();
  const channelsData = await channelsRes.json();

  return {
    posts: postsData.results ?? postsData,
    channels: Array.isArray(channelsData) ? channelsData : channelsData.results ?? [],
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

  if (intent === "toggle-pin") {
    const postId = formData.get("postId") as string;
    const pinned = formData.get("pinned") === "true";
    await apiPatch(request, `/api/forum/posts/${postId}/`, { pinned });
    return { ok: true, pinned };
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

function PostCard({ post }: { post: ForumPost }) {
  const fetcher = useFetcher();

  const handleDelete = () => {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    fetcher.submit(
      { intent: "delete-post", postId: String(post.id) },
      { method: "post" },
    );
  };

  const handleTogglePin = () => {
    fetcher.submit(
      {
        intent: "toggle-pin",
        postId: String(post.id),
        pinned: String(!post.pinned),
      },
      { method: "post" },
    );
    toast.success(post.pinned ? "Unpinned" : "Pinned");
  };

  return (
    <div className="rounded-xl border border-border px-6 py-5 flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          {post.pinned && (
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary shrink-0">
              Pinned
            </span>
          )}
          <Link
            to={`/m/forum/${post.id}`}
            className="font-display text-base font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
          >
            {post.title}
          </Link>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>{post.author_name}</span>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
            {post.channel_name}
          </span>
          <span>{post.likes_count} likes</span>
          <span>{post.reply_count} replies</span>
          <span>{post.time}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleTogglePin}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
            post.pinned
              ? "border-primary/30 text-primary hover:bg-primary/5"
              : "border-border text-muted-foreground hover:text-foreground hover:border-border/80"
          }`}
          title={post.pinned ? "Unpin thread" : "Pin thread"}
        >
          {post.pinned ? (
            <>
              <PinOff className="size-3.5" />
              Unpin
            </>
          ) : (
            <>
              <Pin className="size-3.5" />
              Pin
            </>
          )}
        </button>
        <button
          onClick={handleDelete}
          className="inline-flex items-center rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-destructive/70 hover:text-destructive hover:border-destructive/30 transition-colors cursor-pointer"
          title="Delete"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function AdminForumPage({ loaderData }: Route.ComponentProps) {
  const { posts, channels } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "posts";
  const setActiveTab = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "posts") next.delete("tab");
    else next.set("tab", value);
    setSearchParams(next, { replace: true });
  };

  return (
    <>
      <header className="px-4 md:px-8 h-18 flex items-center bg-background shrink-0 border-b border-border sticky top-0 z-10">
        <nav className="flex items-center gap-1.5 text-sm">
          <Link to="/m/admin" className="font-medium text-muted-foreground hover:text-foreground transition-colors">
            Admin
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <span className="font-semibold text-foreground">Forum</span>
        </nav>
      </header>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
            <TabsTrigger value="channels">Channels ({channels.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            {posts.length === 0 ? (
              <div className="mt-6 rounded-xl border border-border p-16 text-center">
                <p className="text-sm text-muted-foreground">No forum posts yet.</p>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {posts.map((post: ForumPost) => (
                  <PostCard key={post.id} post={post} />
                ))}
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

        </Tabs>
      </div>
    </>
  );
}
