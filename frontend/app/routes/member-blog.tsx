import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useFetcher, useSearchParams } from "react-router";
import { redirect } from "react-router";
import { Heart, MessageCircle, Search, Plus, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { PageHeader } from "~/components/page-header";
import { apiGet } from "~/lib/api.server";
import type { Route } from "./+types/member-blog";

interface BlogPostItem {
  id: number;
  author_uid: string;
  author_name: string;
  author_photo: string;
  author_location: string;
  title: string;
  content: string;
  image: string;
  likes_count: number;
  comment_count: number;
  time: string;
  created_at: string;
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = url.searchParams.get("page") || "1";
  const search = url.searchParams.get("search") || "";

  const params = new URLSearchParams();
  params.set("page", page);
  if (search) params.set("search", search);

  try {
    const res = await apiGet(request, `/api/blog/posts/?${params}`);
    if (!res.ok) return redirect("/login");
    const data = await res.json();
    return {
      results: data.results as BlogPostItem[],
      nextPage: data.next ? String(Number(page) + 1) : null,
      page: Number(page),
    };
  } catch {
    return redirect("/login");
  }
}

/**
 * Extract a plain-text snippet from content that may be JSON blocks.
 */
function contentSnippet(content: string): string {
  try {
    const blocks = JSON.parse(content);
    if (Array.isArray(blocks)) {
      return blocks
        .filter((b: { type: string; content?: string }) => b.type === "text" && b.content?.trim())
        .map((b: { content: string }) => b.content)
        .join(" ");
    }
  } catch {}
  return content;
}

export default function MemberBlogPage({ loaderData }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  const [items, setItems] = useState(loaderData.results);
  const [nextPage, setNextPage] = useState(loaderData.nextPage);
  const fetcher = useFetcher({});
  const sentinelRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Reset when loaderData changes (new search/navigation)
  useEffect(() => {
    setItems(loaderData.results);
    setNextPage(loaderData.nextPage);
  }, [loaderData]);

  // Append fetcher results for infinite scroll
  useEffect(() => {
    if (fetcher.data?.results) {
      setItems((prev) => [...prev, ...fetcher.data!.results]);
      setNextPage(fetcher.data.nextPage);
    }
  }, [fetcher.data]);

  // IntersectionObserver for infinite scroll
  const loadMore = useCallback(() => {
    if (!nextPage || fetcher.state !== "idle") return;
    const params = new URLSearchParams(searchParams);
    params.set("page", nextPage);
    fetcher.load(`/m/blog?${params}`);
  }, [nextPage, fetcher.state, searchParams]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

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
      <PageHeader title="Blog" />
      <div className="bg-background">
        <div className="max-w-4xl mx-auto flex items-center gap-3 px-4 md:px-8 py-8">
          <div className="flex flex-1 items-center rounded-lg border border-border bg-background px-4 py-2.5">
            <Search className="mr-3 size-4 shrink-0 text-muted-foreground" />
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search..."
              className="h-auto border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0 focus-visible:border-0"
            />
          </div>
          <Button asChild className="rounded-lg">
            <Link to="/m/posts/new-blog">
              <Plus className="size-4" />
              New
            </Link>
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 pb-8">
        {items.length === 0 ? (
          <div className="rounded-xl border border-border p-16 text-center">
            <p className="text-sm text-muted-foreground">
              No blog posts yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((post) => (
              <Link
                key={post.id}
                to={`/m/blog/${post.id}`}
                className="group block rounded-xl border border-border transition-colors hover:border-border/80 hover:bg-muted/30"
              >
                {post.image && (
                  <div className="overflow-hidden rounded-t-xl">
                    <img
                      src={post.image}
                      alt=""
                      className="aspect-21/9 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}

                <div className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.author_photo}
                      alt=""
                      className="size-9 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {post.author_name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {post.author_location}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          &middot; {post.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h3 className="mt-4 font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>

                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {contentSnippet(post.content)}
                  </p>

                  <div className="mt-3 flex items-center gap-5 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Heart className="size-3.5" />
                      {post.likes_count}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageCircle className="size-3.5" />
                      {post.comment_count}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Sentinel + loading indicator */}
        <div ref={sentinelRef} className="h-1" />
        {isLoadingMore && (
          <div className="flex justify-center py-8">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </>
  );
}
