import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Heart } from "lucide-react";
import { Button } from "~/components/ui/button";
import { getMicroPostById, allMembers } from "~/lib/demo-data";
import type { MicroPost, MicroPostComment } from "~/lib/demo-data";
import type { Route } from "./+types/member-feed-detail";

const memberSlugMap = new Map(allMembers.map((m) => [m.name, m.slug]));

export function loader({ params }: Route.LoaderArgs) {
  const post = getMicroPostById(Number(params.id));
  if (!post) {
    throw new Response("Post not found", { status: 404 });
  }
  return { post };
}

export default function MemberFeedDetailPage({
  loaderData,
}: Route.ComponentProps) {
  const [post, setPost] = useState<MicroPost>(loaderData.post);
  const [commentText, setCommentText] = useState("");

  const handleLike = () => {
    setPost((prev) => ({ ...prev, likes: prev.likes + 1 }));
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    const newComment: MicroPostComment = {
      id: Date.now(),
      authorSlug: "margaret-h",
      authorName: "You",
      authorPhoto:
        "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=80&h=80&fit=crop&crop=center",
      authorLocation: "Brewster, MA",
      body: commentText.trim(),
      time: "Just now",
    };
    setPost((prev) => ({
      ...prev,
      comments: [...prev.comments, newComment],
    }));
    setCommentText("");
  };

  return (
    <>
      <header className="px-4 md:px-8 h-18 flex items-center bg-background shrink-0 border-b border-border sticky top-0 z-10">
        <Link
          to="/m/blog"
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Blog
        </Link>
      </header>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* Author */}
        <div className="flex items-center gap-3">
          <Link to={`/m/members/${post.authorSlug}`}>
            <img
              src={post.authorPhoto}
              alt=""
              className="size-10 rounded-full object-cover"
            />
          </Link>
          <div>
            <Link
              to={`/m/members/${post.authorSlug}`}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {post.authorName}
            </Link>
            <p className="text-xs text-muted-foreground">
              {post.authorLocation} &middot; {post.time}
            </p>
          </div>
        </div>

        {/* Title + Content */}
        {post.title && (
          <h2 className="mt-6 font-display text-2xl font-semibold text-foreground">
            {post.title}
          </h2>
        )}
        <p className={`${post.title ? "mt-4" : "mt-6"} text-[15px] leading-relaxed text-foreground`}>
          {post.content}
        </p>

        {/* Image */}
        {post.image && (
          <div className="mt-6 overflow-hidden rounded-xl">
            <img
              src={post.image}
              alt=""
              className="w-full object-cover"
            />
          </div>
        )}

        {/* Meta */}
        <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <Heart className="size-4" />
            <span>{post.likes} likes</span>
          </button>
          <span>{post.comments.length} comments</span>
        </div>

        {/* Comments */}
        <div className="mt-12">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Comments
          </h2>

          {post.comments.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No comments yet. Be the first to respond.
            </p>
          ) : (
            <div className="mt-6 rounded-xl border border-border overflow-hidden divide-y divide-border">
              {post.comments.map((comment) => (
                <div key={comment.id} className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <Link to={`/m/members/${comment.authorSlug}`}>
                      <img
                        src={comment.authorPhoto}
                        alt=""
                        className="size-9 rounded-full object-cover"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/m/members/${comment.authorSlug}`}
                        className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {comment.authorName}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {comment.authorLocation} &middot; {comment.time}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                    {comment.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment input */}
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
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            className="mt-4 w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/30"
          />
          <div className="mt-3 flex justify-end">
            <Button
              size="sm"
              className="rounded-full px-6"
              onClick={handleComment}
              disabled={!commentText.trim()}
            >
              Comment
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
