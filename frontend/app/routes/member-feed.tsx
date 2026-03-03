import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
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
import {
  allMicroPosts,
  allPosts as allForumPosts,
  allListings,
  allChannels,
} from "~/lib/demo-data";
import type { MicroPost, Post, Listing } from "~/lib/demo-data";

const mySlug = "margaret-h";

type UnifiedPost =
  | { type: "blog"; data: MicroPost }
  | { type: "forum"; data: Post }
  | { type: "marketplace"; data: Listing };

function getChannelName(slug: string) {
  return allChannels.find((ch) => ch.slug === slug)?.name ?? slug;
}

function getCategoryLabel(cat: string) {
  if (cat === "for-sale") return "For Sale";
  if (cat === "wanted") return "Wanted";
  if (cat === "free") return "Free";
  return cat;
}

function getCategoryClass(cat: string) {
  if (cat === "for-sale") return "bg-primary/10 text-primary";
  if (cat === "wanted") return "bg-amber-500/10 text-amber-600";
  if (cat === "free") return "bg-green-500/10 text-green-600";
  return "bg-muted text-muted-foreground";
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
  return item.data.likes;
}

function getPostReplies(item: UnifiedPost): number {
  switch (item.type) {
    case "blog":
      return item.data.comments.length;
    case "forum":
      return item.data.replies.length;
    case "marketplace":
      return item.data.replies.length;
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

function getPostDate(item: UnifiedPost): string {
  if (item.type === "blog") {
    // MicroPost has date like "Mar 2, 2026" — strip the year, add a time
    const d = item.data.date.replace(/, \d{4}$/, "");
    const timeMap: Record<number, string> = {
      1: "10:15 AM",
      5: "8:30 AM",
    };
    return `${d} · ${timeMap[item.data.id] ?? "12:00 PM"}`;
  }
  if (item.type === "forum") {
    const timeMap: Record<number, string> = {
      1: "Mar 2 · 9:45 AM",
    };
    return timeMap[item.data.id] ?? "Mar 1 · 12:00 PM";
  }
  // marketplace
  const timeMap: Record<number, string> = {
    1: "Mar 2 · 8:50 AM",
  };
  return timeMap[item.data.id] ?? "Mar 1 · 12:00 PM";
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
  onDelete: (key: string) => void;
}) {
  const key = getUniqueKey(item);
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
          <span>{getPostDate(item)}</span>
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
              onSelect={() => onDelete(key)}
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
  onDelete: (key: string) => void;
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

export default function MemberFeedPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [deletedKeys, setDeletedKeys] = useState<Set<string>>(new Set());

  const allUnified = useMemo<UnifiedPost[]>(() => {
    const blogs: UnifiedPost[] = allMicroPosts
      .filter((p) => p.authorSlug === mySlug)
      .map((data) => ({ type: "blog", data }));
    const forums: UnifiedPost[] = allForumPosts
      .filter((p) => p.authorSlug === mySlug)
      .map((data) => ({ type: "forum", data }));
    const marketplace: UnifiedPost[] = allListings
      .filter((l) => l.authorSlug === mySlug)
      .map((data) => ({ type: "marketplace", data }));
    return [...blogs, ...forums, ...marketplace];
  }, []);

  const live = useMemo(
    () => allUnified.filter((item) => !deletedKeys.has(getUniqueKey(item))),
    [allUnified, deletedKeys],
  );

  const filtered = useMemo(
    () => live.filter((item) => activeTab === "all" || item.type === activeTab),
    [live, activeTab],
  );

  const handleDelete = (key: string) => {
    setDeletedKeys((prev) => new Set([...prev, key]));
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
