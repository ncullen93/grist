import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useFetcher, useSearchParams } from "react-router";
import { redirect } from "react-router";
import {
  Search,
  Plus,
  Loader2,
  MessageCircle,
  ChevronRight,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { PageHeader } from "~/components/page-header";
import { apiGet } from "~/lib/api.server";
import type { Route } from "./+types/member-forum";

interface Channel {
  id: number;
  name: string;
  slug: string;
  post_count: number;
  latest_post_title: string | null;
  latest_activity: string | null;
}

interface ForumPostItem {
  id: number;
  author_uid: string;
  author_name: string;
  location: string;
  home_photo: string;
  channel_name: string;
  channel_slug: string;
  title: string;
  body: string;
  image: string;
  pinned: boolean;
  likes_count: number;
  reply_count: number;
  time: string;
  created_at: string;
  last_reply_time: string | null;
  last_reply_author_name: string | null;
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = url.searchParams.get("page") || "1";
  const search = url.searchParams.get("search") || "";
  const channel = url.searchParams.get("channel") || "";
  const params = new URLSearchParams();
  params.set("page", page);
  if (search) params.set("search", search);
  if (channel) params.set("channel", channel);

  try {
    const [postsRes, channelsRes] = await Promise.all([
      apiGet(request, `/api/forum/posts/?${params}`),
      apiGet(request, "/api/forum/channels/"),
    ]);
    if (!postsRes.ok) return redirect("/login");
    const postsData = await postsRes.json();
    const channelsData = channelsRes.ok
      ? await channelsRes.json()
      : { results: [] };
    return {
      results: postsData.results as ForumPostItem[],
      nextPage: postsData.next ? String(Number(page) + 1) : null,
      page: Number(page),
      channels: (channelsData.results ?? channelsData) as Channel[],
    };
  } catch {
    return redirect("/login");
  }
}

export default function MemberForumPage({
  loaderData,
}: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  // Extra pages appended via infinite scroll (kept separate from loaderData)
  const [extraItems, setExtraItems] = useState<ForumPostItem[]>([]);
  const [nextPage, setNextPage] = useState(loaderData.nextPage);
  const fetcher = useFetcher({});
  const sentinelRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const activeChannel = searchParams.get("channel") || "";
  const activeSearch = searchParams.get("search") || "";

  // Show threads when a channel or search is active
  const showThreads = !!activeChannel || !!activeSearch;

  // Find active channel for the header
  const activeChannelObj = loaderData.channels.find(
    (ch) => ch.slug === activeChannel,
  );

  // Combine loader results with any infinite-scroll pages
  const items = [...loaderData.results, ...extraItems];

  // Reset extra items when loaderData changes (new navigation/filter)
  useEffect(() => {
    setExtraItems([]);
    setNextPage(loaderData.nextPage);
  }, [loaderData]);

  // Append fetcher results for infinite scroll
  useEffect(() => {
    if (fetcher.data?.results) {
      setExtraItems((prev) => [...prev, ...fetcher.data.results]);
      setNextPage(fetcher.data.nextPage);
    }
  }, [fetcher.data]);

  // IntersectionObserver for infinite scroll
  const loadMore = useCallback(() => {
    if (!nextPage || fetcher.state !== "idle") return;
    const params = new URLSearchParams(searchParams);
    params.set("page", nextPage);
    fetcher.load(`/m/forum?${params}`);
  }, [nextPage, fetcher.state, searchParams]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !showThreads) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, showThreads]);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      next.delete("page");
      if (value) next.set("search", value);
      else next.delete("search");
      setSearchParams(next, { replace: true });
    }, 300);
  };

  const isLoadingMore = fetcher.state === "loading";

  return (
    <>
      {/* Header changes based on whether we're in a channel */}
      {showThreads && activeChannelObj ? (
        <header className="px-4 md:px-8 h-18 flex items-center bg-background shrink-0 border-b border-border sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Link
              to="/m/forum"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Forum
            </Link>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-foreground">{activeChannelObj.name}</span>
          </div>
        </header>
      ) : (
        <PageHeader title="Forum" />
      )}

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* Search + New */}
        <div className="flex items-center gap-3">
          <div className="flex flex-1 items-center rounded-lg border border-border bg-background px-3 h-10">
            <Search className="mr-2.5 size-4 shrink-0 text-muted-foreground" />
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search threads..."
              className="h-auto border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0 focus-visible:border-0"
            />
          </div>
          <Button asChild size="lg" className="rounded-lg">
            <Link to="/m/forum/new">
              <Plus className="size-4" />
              New
            </Link>
          </Button>
        </div>

        {/* Main content */}
        <div className="mt-6">
          {!showThreads ? (
            <ChannelDirectory channels={loaderData.channels} />
          ) : (
            <>
              <ThreadList items={items} showChannel={!activeChannel} />

              {/* Sentinel + loading indicator */}
              <div ref={sentinelRef} className="h-1" />
              {isLoadingMore && (
                <div className="flex justify-center py-8">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Channel descriptions ─── */

const defaultChannels: { name: string; slug: string }[] = [
  { name: "Introductions", slug: "introductions" },
  { name: "Restoration and Repairs", slug: "restoration-and-repairs" },
  { name: "Contractors and Vendors", slug: "contractors-and-vendors" },
  { name: "Historic Commissions and Regulations", slug: "historic-commissions-and-regulations" },
  { name: "Buy, Sell, and Give Away", slug: "buy-sell-and-give-away" },
  { name: "Weekly Check-In", slug: "weekly-check-in" },
  { name: "Off Topic", slug: "off-topic" },
];

/* ─── Channel Directory ─── */

function ChannelDirectory({ channels }: { channels: Channel[] }) {
  // Use API channels if available, otherwise fall back to defaults
  const displayChannels = channels.length > 0
    ? channels
    : defaultChannels.map((ch, i) => ({
        id: i,
        name: ch.name,
        slug: ch.slug,
        post_count: 0,
        latest_post_title: null,
        latest_activity: null,
      }));

  return (
    <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
      {displayChannels.map((ch) => (
        <Link
          key={ch.slug}
          to={`/m/forum?channel=${ch.slug}`}
          className="flex items-center justify-between px-7 py-6 transition-colors hover:bg-muted/30 group"
        >
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {ch.name}
            </h3>
            {ch.post_count > 0 && (
              <p className="mt-2 text-xs text-muted-foreground/70">
                {ch.post_count} {ch.post_count === 1 ? "thread" : "threads"}
                {ch.latest_activity && (
                  <span> &middot; Last active {ch.latest_activity}</span>
                )}
              </p>
            )}
          </div>
          <ChevronRight className="size-5 text-muted-foreground/50 shrink-0 ml-4 group-hover:text-muted-foreground transition-colors" />
        </Link>
      ))}
    </div>
  );
}

/* ─── Thread List ─── */

function ThreadList({
  items,
  showChannel,
}: {
  items: ForumPostItem[];
  showChannel: boolean;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border p-16 text-center">
        <p className="text-base text-muted-foreground">
          No threads in this view yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((post) => (
        <Link
          key={post.id}
          to={`/m/forum/${post.id}`}
          className="block rounded-xl border border-border px-6 py-5 transition-colors hover:bg-muted/30 group"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {/* Title row */}
              <div className="flex items-center gap-2.5">
                {post.pinned && (
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary shrink-0">
                    Pinned
                  </span>
                )}
                <h3 className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {post.title}
                </h3>
              </div>

              {/* Meta line */}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span>{post.author_name}</span>
                {showChannel && (
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                    {post.channel_name}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MessageCircle className="size-3.5" />
                  {post.reply_count}{" "}
                  {post.reply_count === 1 ? "reply" : "replies"}
                </span>
                <span>{post.last_reply_time || post.time}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
