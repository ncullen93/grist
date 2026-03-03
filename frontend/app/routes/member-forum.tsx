import { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router";
import { Search, SlidersHorizontal, Plus, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { PageHeader } from "~/components/page-header";
import {
  allChannels,
  allTopics,
  allPosts as initialPosts,
} from "~/lib/demo-data";

export default function MemberForumPage() {
  const [search, setSearch] = useState("");
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
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

  const filteredPosts = useMemo(() => {
    const q = search.toLowerCase();
    return initialPosts.filter((post) => {
      const channelMatch = !activeChannel || post.channel === activeChannel;
      const topicMatch = !activeTopic || post.topics.includes(activeTopic);
      const searchMatch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.body.toLowerCase().includes(q);
      return channelMatch && topicMatch && searchMatch;
    });
  }, [search, activeChannel, activeTopic]);

  const activeFilterCount =
    (activeChannel ? 1 : 0) + (activeTopic ? 1 : 0);

  return (
    <>
      <PageHeader title="Forum" />

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
                        setActiveChannel(null);
                        setActiveTopic(null);
                      }}
                      className="text-xs text-primary hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Channel */}
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Channel</p>
                    <div className="flex flex-wrap gap-1.5">
                      {allChannels.map((ch) => (
                        <button
                          key={ch.slug}
                          onClick={() =>
                            setActiveChannel(activeChannel === ch.slug ? null : ch.slug)
                          }
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                            activeChannel === ch.slug
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {ch.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Topic */}
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Topic</p>
                    <div className="flex flex-wrap gap-1.5">
                      {allTopics.map((t) => (
                        <button
                          key={t}
                          onClick={() =>
                            setActiveTopic(activeTopic === t ? null : t)
                          }
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                            activeTopic === t
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
            <Link to="/m/posts/new-forum">
              <Plus className="size-4" />
              New
            </Link>
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 pb-8">
        {/* Posts */}
        <div>
          {filteredPosts.length === 0 ? (
            <div className="rounded-xl border border-border p-16 text-center">
              <p className="text-sm text-muted-foreground">
                No posts in this view yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/m/forum/${post.id}`}
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
                        src={post.homePhoto}
                        alt=""
                        className="size-9 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {post.author}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {post.location}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            &middot; {post.time}
                          </span>
                        </div>
                      </div>
                      {post.pinned && (
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary shrink-0">
                          Pinned
                        </span>
                      )}
                    </div>

                    <h3 className="mt-4 font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>

                    <div className="mt-3 flex items-center gap-5 text-sm text-muted-foreground">
                      <span>{post.likes} likes</span>
                      <span>{post.replies.length} replies</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
