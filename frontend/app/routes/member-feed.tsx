import { useMemo } from "react";
import { Link, useNavigate, useSearchParams, useFetcher } from "react-router";
import { redirect } from "react-router";
import type { Route } from "./+types/member-feed";
import { apiGet, apiDelete } from "~/lib/api.server";
import {
  Heart,
  Share2,
  Trash2,
  MoreHorizontal,
  ExternalLink,
  MessageCircle,
  FileText,
  MessageSquare,
  Store,
  ChevronDown,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { PageHeader } from "~/components/page-header";

// API response types
interface BlogPostItem {
  id: number;
  title: string;
  image: string;
  likes_count: number;
  comment_count: number;
  time: string;
  created_at: string;
}

interface ForumPostItem {
  id: number;
  title: string;
  image: string;
  likes_count: number;
  reply_count: number;
  time: string;
  created_at: string;
}

interface ListingItem {
  id: number;
  title: string;
  image: string;
  category: string;
  price: string;
  likes_count: number;
  reply_count: number;
  time: string;
  created_at: string;
}

type UnifiedPost =
  | { type: "blog"; data: BlogPostItem }
  | { type: "forum"; data: ForumPostItem }
  | { type: "marketplace"; data: ListingItem };

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const profileRes = await apiGet(request, "/api/members/me/");
    if (!profileRes.ok) return redirect("/login");
    const profile = await profileRes.json();
    const slug = profile.slug;

    const [blogRes, forumRes, listingRes] = await Promise.all([
      apiGet(request, `/api/blog/posts/?author=${slug}`),
      apiGet(request, `/api/forum/posts/?author=${slug}`),
      apiGet(request, `/api/marketplace/listings/?author=${slug}`),
    ]);

    const blogData = blogRes.ok ? await blogRes.json() : { results: [] };
    const forumData = forumRes.ok ? await forumRes.json() : { results: [] };
    const listingData = listingRes.ok
      ? await listingRes.json()
      : { results: [] };

    return {
      blogs: blogData.results as BlogPostItem[],
      forums: forumData.results as ForumPostItem[],
      listings: listingData.results as ListingItem[],
    };
  } catch {
    return redirect("/login");
  }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "delete") {
    const postType = formData.get("postType") as string;
    const postId = formData.get("postId") as string;

    const endpoints: Record<string, string> = {
      blog: `/api/blog/posts/${postId}/`,
      forum: `/api/forum/posts/${postId}/`,
      marketplace: `/api/marketplace/listings/${postId}/`,
    };

    const endpoint = endpoints[postType];
    if (!endpoint) return { error: "Invalid post type" };

    try {
      const res = await apiDelete(request, endpoint);
      if (!res.ok && res.status !== 204) {
        return { error: "Failed to delete." };
      }
      return { deleted: `${postType}-${postId}` };
    } catch {
      return { error: "Unable to connect to server." };
    }
  }

  return { error: "Unknown action" };
}

function getPostLink(item: UnifiedPost) {
  switch (item.type) {
    case "blog":
      return `/m/blog/${item.data.id}`;
    case "forum":
      return `/m/forum/${item.data.id}`;
    case "marketplace":
      return `/m/marketplace/${item.data.id}`;
  }
}

function getPostLikes(item: UnifiedPost) {
  return item.data.likes_count;
}

function getPostReplies(item: UnifiedPost): number {
  switch (item.type) {
    case "blog":
      return item.data.comment_count;
    case "forum":
    case "marketplace":
      return item.data.reply_count;
  }
}

function getPostIcon(type: UnifiedPost["type"]) {
  switch (type) {
    case "blog":
      return FileText;
    case "forum":
      return MessageSquare;
    case "marketplace":
      return Store;
  }
}

function getUniqueKey(item: UnifiedPost) {
  return `${item.type}-${item.data.id}`;
}

function PostCard({
  item,
  activeTab,
  onDelete,
}: {
  item: UnifiedPost;
  activeTab: string;
  onDelete: (type: string, id: number) => void;
}) {
  const link = getPostLink(item);
  const image = item.data.image;
  const Icon = getPostIcon(item.type);

  return (
    <div className="group flex items-start gap-5 px-6 py-5 transition-colors hover:bg-muted/30">
      {/* Thumbnail */}
      <Link to={link} className="shrink-0">
        {image ? (
          <img src={image} alt="" className="size-20 rounded-lg object-cover" />
        ) : (
          <div className="flex size-20 items-center justify-center rounded-lg bg-muted">
            <Icon className="size-6 text-muted-foreground/50" />
          </div>
        )}
      </Link>

      {/* Title + meta */}
      <div className="min-w-0 flex-1">
        <Link to={link}>
          <p className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            {item.data.title}
          </p>
        </Link>
        <div className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
          <span>{item.data.time}</span>
          {activeTab === "all" && (
            <>
              <span>&middot;</span>
              <span className="text-xs text-muted-foreground/60">
                {item.type === "blog" && "Blog"}
                {item.type === "forum" && "Forum"}
                {item.type === "marketplace" && "Marketplace"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Stats + Actions */}
      <div className="shrink-0 flex items-center gap-4">
        {item.type === "marketplace" && item.data.price ? (
          <span className="text-sm font-medium text-foreground">
            {item.data.price}
          </span>
        ) : (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Heart className="size-3.5" />
              {getPostLikes(item)}
            </span>
            <span className="flex items-center gap-1.5">
              <MessageCircle className="size-3.5" />
              {getPostReplies(item)}
            </span>
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              <MoreHorizontal className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={link}>
                <ExternalLink className="size-4" />
                View post
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                navigator.clipboard.writeText(
                  `${window.location.origin}${link}`,
                )
              }
            >
              <Share2 className="size-4" />
              Copy link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => onDelete(item.type, item.data.id)}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function PostList({
  items,
  activeTab,
  onDelete,
}: {
  items: UnifiedPost[];
  activeTab: string;
  onDelete: (type: string, id: number) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border p-16 text-center">
        <p className="text-sm text-muted-foreground">
          No posts to show here yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border divide-y divide-border">
      {items.map((item) => (
        <PostCard
          key={getUniqueKey(item)}
          item={item}
          activeTab={activeTab}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default function MemberFeedPage({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const deleteFetcher = useFetcher();
  const activeTab = searchParams.get("tab") || "all";
  const setActiveTab = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "all") next.delete("tab");
    else next.set("tab", value);
    setSearchParams(next, { replace: true });
  };

  // Build unified list from loader data, sorted by created_at desc
  const allUnified = useMemo<UnifiedPost[]>(() => {
    const blogs: UnifiedPost[] = (loaderData.blogs || []).map(
      (data: BlogPostItem) => ({
        type: "blog" as const,
        data,
      }),
    );
    const forums: UnifiedPost[] = (loaderData.forums || []).map(
      (data: ForumPostItem) => ({
        type: "forum" as const,
        data,
      }),
    );
    const marketplace: UnifiedPost[] = (loaderData.listings || []).map(
      (data: ListingItem) => ({
        type: "marketplace" as const,
        data,
      }),
    );
    const all = [...blogs, ...forums, ...marketplace];
    all.sort(
      (a, b) =>
        new Date(b.data.created_at).getTime() -
        new Date(a.data.created_at).getTime(),
    );
    return all;
  }, [loaderData]);

  // Optimistically hide items being deleted
  const pendingDelete = deleteFetcher.formData
    ? `${deleteFetcher.formData.get("postType")}-${deleteFetcher.formData.get("postId")}`
    : null;

  const live = useMemo(
    () => allUnified.filter((item) => getUniqueKey(item) !== pendingDelete),
    [allUnified, pendingDelete],
  );

  const filtered = useMemo(
    () => live.filter((item) => activeTab === "all" || item.type === activeTab),
    [live, activeTab],
  );

  const handleDelete = (type: string, id: number) => {
    deleteFetcher.submit(
      { intent: "delete", postType: type, postId: String(id) },
      { method: "post" },
    );
  };

  return (
    <>
      <PageHeader title="Posts" />
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Header row: tabs + new post dropdown */}
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="blog">Blog</TabsTrigger>
              <TabsTrigger value="forum">Forum</TabsTrigger>
              <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            </TabsList>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-1.5">
                  New Post
                  <ChevronDown className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem
                  onSelect={() => navigate("/m/posts/new-blog")}
                >
                  <FileText className="size-4" />
                  Blog
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => navigate("/m/posts/new-forum")}
                >
                  <MessageSquare className="size-4" />
                  Forum
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => navigate("/m/posts/new-marketplace")}
                >
                  <Store className="size-4" />
                  Marketplace
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <TabsContent value="all">
            <PostList
              items={filtered}
              activeTab={activeTab}
              onDelete={handleDelete}
            />
          </TabsContent>
          <TabsContent value="blog">
            <PostList
              items={filtered}
              activeTab={activeTab}
              onDelete={handleDelete}
            />
          </TabsContent>
          <TabsContent value="forum">
            <PostList
              items={filtered}
              activeTab={activeTab}
              onDelete={handleDelete}
            />
          </TabsContent>
          <TabsContent value="marketplace">
            <PostList
              items={filtered}
              activeTab={activeTab}
              onDelete={handleDelete}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
