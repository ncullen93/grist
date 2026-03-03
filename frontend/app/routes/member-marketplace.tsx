import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useFetcher, useSearchParams } from "react-router";
import { redirect } from "react-router";
import { Search, SlidersHorizontal, Plus, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { PageHeader } from "~/components/page-header";
import { apiGet } from "~/lib/api.server";
import type { Route } from "./+types/member-marketplace";

interface ListingItem {
  id: number;
  author_slug: string;
  author_name: string;
  location: string;
  home_photo: string;
  category: string;
  title: string;
  description: string;
  price: string;
  image: string;
  condition: string;
  tag_names: string[];
  likes_count: number;
  reply_count: number;
  time: string;
  created_at: string;
}

function categoryBadge(cat: string) {
  switch (cat) {
    case "for-sale":
      return { label: "For Sale", classes: "bg-primary/10 text-primary" };
    case "wanted":
      return { label: "Wanted", classes: "bg-amber-500/10 text-amber-600" };
    case "free":
      return { label: "Free", classes: "bg-green-500/10 text-green-600" };
    default:
      return { label: cat, classes: "bg-muted text-muted-foreground" };
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = url.searchParams.get("page") || "1";
  const search = url.searchParams.get("search") || "";
  const category = url.searchParams.get("category") || "";
  const tag = url.searchParams.get("tag") || "";

  const params = new URLSearchParams();
  params.set("page", page);
  if (search) params.set("search", search);
  if (category) params.set("category", category);
  if (tag) params.set("tag", tag);

  try {
    const [listingsRes, tagsRes] = await Promise.all([
      apiGet(request, `/api/marketplace/listings/?${params}`),
      apiGet(request, "/api/marketplace/tags/"),
    ]);
    if (!listingsRes.ok) return redirect("/login");
    const listingsData = await listingsRes.json();
    const tagsData = tagsRes.ok ? await tagsRes.json() : { results: [] };
    return {
      results: listingsData.results as ListingItem[],
      nextPage: listingsData.next ? String(Number(page) + 1) : null,
      page: Number(page),
      tags: ((tagsData.results ?? tagsData) as { id: number; name: string; slug: string }[]),
    };
  } catch {
    return redirect("/login");
  }
}

const categories = [
  { slug: "for-sale", name: "For Sale" },
  { slug: "wanted", name: "Wanted" },
  { slug: "free", name: "Free" },
];

export default function MemberMarketplacePage({
  loaderData,
}: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  const [items, setItems] = useState(loaderData.results);
  const [nextPage, setNextPage] = useState(loaderData.nextPage);
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const fetcher = useFetcher({});
  const sentinelRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const activeCategory = searchParams.get("category") || "";
  const activeTag = searchParams.get("tag") || "";
  const activeFilterCount = (activeCategory ? 1 : 0) + (activeTag ? 1 : 0);

  // Reset when loaderData changes
  useEffect(() => {
    setItems(loaderData.results);
    setNextPage(loaderData.nextPage);
  }, [loaderData]);

  // Append fetcher results for infinite scroll
  useEffect(() => {
    if (fetcher.data?.results) {
      setItems((prev) => [...prev, ...fetcher.data.results]);
      setNextPage(fetcher.data.nextPage);
    }
  }, [fetcher.data]);

  // Close filter on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilter(false);
      }
    }
    if (showFilter) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [showFilter]);

  // IntersectionObserver for infinite scroll
  const loadMore = useCallback(() => {
    if (!nextPage || fetcher.state !== "idle") return;
    const params = new URLSearchParams(searchParams);
    params.set("page", nextPage);
    fetcher.load(`/m/marketplace?${params}`);
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

  const setFilter = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    next.delete("page");
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const isLoadingMore = fetcher.state === "loading";

  return (
    <>
      <PageHeader title="Marketplace" />

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
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm transition-colors ${
                activeFilterCount > 0
                  ? "border-primary text-primary"
                  : "border-border text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <SlidersHorizontal className="size-4" />
              Filter
              {activeFilterCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {showFilter && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-border bg-background p-4 shadow-lg z-30">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-foreground">
                    Filters
                  </span>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => {
                        setFilter("category", null);
                        setFilter("tag", null);
                      }}
                      className="text-xs text-primary hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Category */}
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Category
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {categories.map((cat) => (
                        <button
                          key={cat.slug}
                          onClick={() =>
                            setFilter(
                              "category",
                              activeCategory === cat.slug ? null : cat.slug,
                            )
                          }
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                            activeCategory === cat.slug
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tag */}
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Tag
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {loaderData.tags.map((t) => (
                        <button
                          key={t.slug}
                          onClick={() =>
                            setFilter(
                              "tag",
                              activeTag === t.slug ? null : t.slug,
                            )
                          }
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                            activeTag === t.slug
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <Button asChild className="rounded-lg">
            <Link to="/m/posts/new-marketplace">
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
              No listings match your filters.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((listing) => {
              const badge = categoryBadge(listing.category);
              return (
                <Link
                  key={listing.id}
                  to={`/m/marketplace/${listing.id}`}
                  className="group block rounded-xl border border-border transition-colors hover:border-border/80 hover:bg-muted/30"
                >
                  {listing.image && (
                    <div className="overflow-hidden rounded-t-xl">
                      <img
                        src={listing.image}
                        alt=""
                        className="aspect-21/9 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}

                  <div className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <img
                        src={listing.home_photo}
                        alt=""
                        className="size-9 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {listing.author_name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {listing.location}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            &middot; {listing.time}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider shrink-0 ${badge.classes}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <h3 className="mt-4 font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                      {listing.title}
                    </h3>

                    <div className="mt-2 flex items-center gap-3">
                      {listing.price && (
                        <span className="text-sm font-semibold text-foreground">
                          {listing.price}
                        </span>
                      )}
                      {listing.condition && (
                        <span className="text-xs text-muted-foreground">
                          {listing.price ? "\u00b7 " : ""}
                          {listing.condition}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-5 text-sm text-muted-foreground">
                      <span>{listing.likes_count} likes</span>
                      <span>{listing.reply_count} replies</span>
                    </div>
                  </div>
                </Link>
              );
            })}
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
