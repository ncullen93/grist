import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { getPostById, allMembers, allPosts } from "~/lib/demo-data";
import type { Post, Reply } from "~/lib/demo-data";
import type { Route } from "./+types/member-forum-detail";

const memberSlugMap = new Map(allMembers.map((m) => [m.name, m.slug]));

export function loader({ params }: Route.LoaderArgs) {
  const post = getPostById(Number(params.id));
  if (!post) {
    throw new Response("Post not found", { status: 404 });
  }
  return { post };
}

export default function MemberForumDetailPage({
  loaderData,
}: Route.ComponentProps) {
  const [post, setPost] = useState<Post>(loaderData.post);
  const [replyText, setReplyText] = useState("");

  const handleReply = () => {
    if (!replyText.trim()) return;
    const newReply: Reply = {
      id: Date.now(),
      author: "You",
      location: "Brewster, MA",
      homePhoto:
        "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=80&h=80&fit=crop&crop=center",
      time: "Just now",
      body: replyText.trim(),
    };
    setPost((prev) => ({ ...prev, replies: [...prev.replies, newReply] }));
    setReplyText("");
  };

  const handleLike = () => {
    setPost((prev) => ({ ...prev, likes: prev.likes + 1 }));
  };

  const authorSlug = memberSlugMap.get(post.author);

  return (
    <>
      <header className="px-4 md:px-8 h-18 flex items-center bg-background shrink-0 border-b border-border sticky top-0 z-10">
        <Link
          to="/m/forum"
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Forum
        </Link>
      </header>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* Post header */}
        <div>
          <div className="flex items-center gap-3">
            {post.pinned && (
              <span className="inline-flex rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                Pinned
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {post.channel === "general"
                ? "General"
                : post.channel
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
              {" "}&middot; {post.time}
            </span>
          </div>

          <h1 className="mt-4 font-display text-3xl font-medium tracking-tight text-foreground">
            {post.title}
          </h1>

          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {authorSlug ? (
                <Link to={`/m/members/${authorSlug}`}>
                  <img
                    src={post.homePhoto}
                    alt=""
                    className="size-9 rounded-full object-cover"
                  />
                </Link>
              ) : (
                <img
                  src={post.homePhoto}
                  alt=""
                  className="size-9 rounded-full object-cover"
                />
              )}
              <div>
                {authorSlug ? (
                  <Link
                    to={`/m/members/${authorSlug}`}
                    className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {post.author}
                  </Link>
                ) : (
                  <p className="text-sm font-semibold text-foreground">
                    {post.author}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {post.location}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <button
                onClick={handleLike}
                className="transition-colors hover:text-foreground"
              >
                {post.likes} likes
              </button>
              <span>{post.replies.length} replies</span>
            </div>
          </div>
        </div>

        {/* Post body */}
        <div className="mt-8 border-t border-border pt-8">
          {post.image && (
            <img
              src={post.image.replace(/w=\d+&h=\d+/, "w=900&h=500")}
              alt=""
              className="w-full rounded-xl object-cover aspect-video mb-6"
            />
          )}

          <p className="text-[15px] leading-relaxed text-muted-foreground">
            {post.body}
          </p>

          {post.topics.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {post.topics.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Replies */}
        <div className="mt-12">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Replies
          </h2>

          {post.replies.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No replies yet. Be the first to respond.
            </p>
          ) : (
            <div className="mt-6 rounded-xl border border-border overflow-hidden divide-y divide-border">
              {post.replies.map((reply) => {
                const replySlug = memberSlugMap.get(reply.author);
                return (
                  <div key={reply.id} className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      {replySlug ? (
                        <Link to={`/m/members/${replySlug}`}>
                          <img
                            src={reply.homePhoto}
                            alt=""
                            className="size-9 rounded-full object-cover"
                          />
                        </Link>
                      ) : (
                        <img
                          src={reply.homePhoto}
                          alt=""
                          className="size-9 rounded-full object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        {replySlug ? (
                          <Link
                            to={`/m/members/${replySlug}`}
                            className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                          >
                            {reply.author}
                          </Link>
                        ) : (
                          <p className="text-sm font-semibold text-foreground">
                            {reply.author}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {reply.location} &middot; {reply.time}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                      {reply.body}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Reply input */}
        <div className="mt-8 rounded-xl border border-border p-6">
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=80&h=80&fit=crop&crop=center"
              alt=""
              className="size-9 rounded-full object-cover shrink-0"
            />
            <p className="text-sm font-semibold text-foreground">You</p>
          </div>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            rows={3}
            className="mt-4 w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/30"
          />
          <div className="mt-3 flex justify-end">
            <Button
              size="sm"
              className="rounded-full px-6"
              onClick={handleReply}
              disabled={!replyText.trim()}
            >
              Reply
            </Button>
          </div>
        </div>

        {/* More posts */}
        {(() => {
          const related = allPosts
            .filter((p) => p.id !== post.id)
            .slice(0, 3);
          if (related.length === 0) return null;
          return (
            <div className="mt-12">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                More from the Forum
              </h2>
              <div className="mt-6 space-y-4">
                {related.map((p) => (
                  <Link
                    key={p.id}
                    to={`/m/forum/${p.id}`}
                    className="group flex items-center gap-4 rounded-xl border border-border px-6 py-5 transition-colors hover:bg-muted/30"
                  >
                    <img
                      src={p.homePhoto}
                      alt=""
                      className="size-9 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                        {p.title}
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {p.author} &middot; {p.likes} likes &middot;{" "}
                        {p.replies.length} replies
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </>
  );
}
