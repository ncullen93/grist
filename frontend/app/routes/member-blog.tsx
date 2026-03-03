import { useState, useMemo } from "react";
import { Link } from "react-router";
import { Heart, MessageCircle, Search, SlidersHorizontal, Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { PageHeader } from "~/components/page-header";
import { allMicroPosts } from "~/lib/demo-data";

export default function MemberBlogPage() {
  const [search, setSearch] = useState("");

  const filteredPosts = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return allMicroPosts;
    return allMicroPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(q) ||
        post.content.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <>
      <PageHeader title="Blog" />
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
          <button className="flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/50">
            <SlidersHorizontal className="size-4" />
            Filter
          </button>
          <Button asChild className="rounded-lg">
            <Link to="/m/posts/new-blog">
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
                No blog posts yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
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
                        src={post.authorPhoto}
                        alt=""
                        className="size-9 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {post.authorName}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {post.authorLocation}
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
                      {post.content}
                    </p>

                    <div className="mt-3 flex items-center gap-5 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Heart className="size-3.5" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MessageCircle className="size-3.5" />
                        {post.comments.length}
                      </span>
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
