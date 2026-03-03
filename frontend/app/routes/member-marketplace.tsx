import { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router";
import { Search, SlidersHorizontal, Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { PageHeader } from "~/components/page-header";
import {
  allListingCategories,
  allListingTags,
  allListings as initialListings,
} from "~/lib/demo-data";
import type { ListingCategory } from "~/lib/demo-data";

function categoryBadge(cat: ListingCategory) {
  switch (cat) {
    case "for-sale":
      return { label: "For Sale", classes: "bg-primary/10 text-primary" };
    case "wanted":
      return { label: "Wanted", classes: "bg-amber-500/10 text-amber-600" };
    case "free":
      return { label: "Free", classes: "bg-green-500/10 text-green-600" };
  }
}

export default function MemberMarketplacePage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ListingCategory | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

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

  const filteredListings = useMemo(() => {
    const q = search.toLowerCase();
    return initialListings.filter((l) => {
      const catMatch = !activeCategory || l.category === activeCategory;
      const tagMatch = !activeTag || l.tags.includes(activeTag);
      const searchMatch =
        !q ||
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q);
      return catMatch && tagMatch && searchMatch;
    });
  }, [search, activeCategory, activeTag]);

  const activeFilterCount =
    (activeCategory ? 1 : 0) + (activeTag ? 1 : 0);

  return (
    <>
      <PageHeader title="Marketplace" />

      <div className="bg-background">
        <div className="max-w-4xl mx-auto flex items-center gap-3 px-4 md:px-8 py-8">
          <div className="flex flex-1 items-center rounded-lg border border-border bg-background px-4 py-2.5">
            <Search className="mr-3 size-4 shrink-0 text-muted-foreground" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
                  <span className="text-sm font-semibold text-foreground">Filters</span>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => {
                        setActiveCategory(null);
                        setActiveTag(null);
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
                    <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</p>
                    <div className="flex flex-wrap gap-1.5">
                      {allListingCategories.map((cat) => (
                        <button
                          key={cat.slug}
                          onClick={() =>
                            setActiveCategory(activeCategory === cat.slug ? null : cat.slug)
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
                    <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Tag</p>
                    <div className="flex flex-wrap gap-1.5">
                      {allListingTags.map((t) => (
                        <button
                          key={t}
                          onClick={() =>
                            setActiveTag(activeTag === t ? null : t)
                          }
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                            activeTag === t
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {t}
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
        {/* Listings */}
        <div>
          {filteredListings.length === 0 ? (
            <div className="rounded-xl border border-border p-16 text-center">
              <p className="text-sm text-muted-foreground">
                No listings match your filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredListings.map((listing) => {
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
                          src={listing.homePhoto}
                          alt=""
                          className="size-9 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                              {listing.author}
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
                        <span>{listing.likes} likes</span>
                        <span>{listing.replies.length} replies</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
