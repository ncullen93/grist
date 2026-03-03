import { useState } from "react";
import { Link, useFetcher } from "react-router";
import { redirect } from "react-router";
import { ArrowLeft, Heart } from "lucide-react";
import { Button } from "~/components/ui/button";
import { apiGet, apiPost } from "~/lib/api.server";
import type { Route } from "./+types/member-feed-detail";

interface BlogComment {
  id: number;
  author_slug: string;
  author_name: string;
  author_photo: string;
  author_location: string;
  body: string;
  time: string;
}

interface BlogPost {
  id: number;
  author_slug: string;
  author_name: string;
  author_photo: string;
  author_location: string;
  title: string;
  content: string;
  image: string;
  likes_count: number;
  comment_count: number;
  time: string;
  comments: BlogComment[];
  user_has_liked: boolean;
}

interface CurrentUser {
  name: string;
  photo: string;
  location: string;
}

export async function loader({ request, params }: Route.LoaderArgs) {
  try {
    const [postRes, profileRes] = await Promise.all([
      apiGet(request, `/api/blog/posts/${params.id}/`),
      apiGet(request, "/api/members/me/"),
    ]);
    if (!postRes.ok) {
      throw new Response("Post not found", { status: 404 });
    }
    if (!profileRes.ok) return redirect("/login");
    const post: BlogPost = await postRes.json();
    const profile = await profileRes.json();
    const currentUser: CurrentUser = {
      name: profile.name,
      photo: profile.photo,
      location: profile.location,
    };
    return { post, currentUser };
  } catch (e) {
    if (e instanceof Response) throw e;
    return redirect("/login");
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "comment") {
    const body = formData.get("body") as string;
    const res = await apiPost(request, `/api/blog/posts/${params.id}/comment/`, {
      body,
    });
    if (!res.ok) return { error: "Failed to post comment." };
    const comment = await res.json();
    return { newComment: comment };
  }

  if (intent === "like") {
    const res = await apiPost(request, `/api/blog/posts/${params.id}/like/`);
    if (!res.ok) return { error: "Failed to like." };
    const data = await res.json();
    return { liked: data.liked, likesCount: data.count };
  }

  return { error: "Unknown action" };
}

/**
 * Render content that may be JSON blocks or plain text.
 */
function RenderContent({ content }: { content: string }) {
  try {
    const blocks = JSON.parse(content);
    if (Array.isArray(blocks)) {
      return (
        <>
          {blocks.map((block: { type: string; style?: string; content?: string; preview?: string }, i: number) => {
            if (block.type === "image" && block.preview) {
              return (
                <div key={i} className="my-6 overflow-hidden rounded-xl">
                  <img src={block.preview} alt="" className="w-full object-cover" />
                </div>
              );
            }
            if (block.type === "text") {
              if (!block.content?.trim()) return null;
              const style = block.style || "normal";
              const className =
                style === "h1"
                  ? "mt-8 mb-2 font-display text-3xl font-semibold"
                  : style === "h2"
                    ? "mt-6 mb-1.5 font-display text-2xl font-semibold"
                    : style === "h3"
                      ? "mt-5 mb-1 font-display text-xl font-semibold"
                      : style === "h4"
                        ? "mt-4 mb-1 font-display text-lg font-medium"
                        : "text-[15px] leading-relaxed text-muted-foreground";
              return (
                <p key={i} className={className}>
                  {block.content}
                </p>
              );
            }
            return null;
          })}
        </>
      );
    }
  } catch {
    // Not JSON — fall through to plain text
  }
  return <p className="text-[15px] leading-relaxed text-muted-foreground whitespace-pre-wrap">{content}</p>;
}

export default function MemberFeedDetailPage({
  loaderData,
}: Route.ComponentProps) {
  const { currentUser } = loaderData;
  const [post, setPost] = useState(loaderData.post);
  const [commentText, setCommentText] = useState("");
  const commentFetcher = useFetcher();
  const likeFetcher = useFetcher();
  const isCommenting = commentFetcher.state === "submitting";

  // Append new comment when it comes back
  const displayComments = [...(post.comments || [])];
  if (commentFetcher.data?.newComment) {
    const nc = commentFetcher.data.newComment;
    if (!displayComments.some((c: BlogComment) => c.id === nc.id)) {
      displayComments.push(nc);
    }
  }

  const handleComment = () => {
    if (!commentText.trim()) return;
    commentFetcher.submit(
      { intent: "comment", body: commentText.trim() },
      { method: "post" },
    );
    setCommentText("");
  };

  // Optimistic like state
  const pendingLike = likeFetcher.state !== "idle";
  const likeResult = likeFetcher.data;
  const liked = likeResult?.liked ?? post.user_has_liked;
  const likesCount = likeResult?.likesCount ?? post.likes_count;

  const handleLike = () => {
    likeFetcher.submit({ intent: "like" }, { method: "post" });
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
          <Link to={`/m/members/${post.author_slug}`}>
            <img
              src={post.author_photo}
              alt=""
              className="size-10 rounded-full object-cover"
            />
          </Link>
          <div>
            <Link
              to={`/m/members/${post.author_slug}`}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {post.author_name}
            </Link>
            <p className="text-xs text-muted-foreground">
              {post.author_location} &middot; {post.time}
            </p>
          </div>
        </div>

        {/* Title + Content */}
        {post.title && (
          <h2 className="mt-6 font-display text-2xl font-semibold text-foreground">
            {post.title}
          </h2>
        )}
        <div className={post.title ? "mt-4" : "mt-6"}>
          <RenderContent content={post.content} />
        </div>

        {/* Meta */}
        <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
          <button
            onClick={handleLike}
            disabled={pendingLike}
            className={`flex items-center gap-1.5 transition-colors hover:text-foreground ${liked ? "text-primary" : ""}`}
          >
            <Heart className={`size-4 ${liked ? "fill-current" : ""}`} />
            <span>{likesCount} likes</span>
          </button>
          <span>{displayComments.length} comments</span>
        </div>

        {/* Comments */}
        <div className="mt-12">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Comments
          </h2>

          {displayComments.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No comments yet. Be the first to respond.
            </p>
          ) : (
            <div className="mt-6 rounded-xl border border-border overflow-hidden divide-y divide-border">
              {displayComments.map((comment: BlogComment) => (
                <div key={comment.id} className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <Link to={`/m/members/${comment.author_slug}`}>
                      <img
                        src={comment.author_photo}
                        alt=""
                        className="size-9 rounded-full object-cover"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/m/members/${comment.author_slug}`}
                        className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {comment.author_name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {comment.author_location} &middot; {comment.time}
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
            {currentUser.photo && (
              <img
                src={currentUser.photo}
                alt=""
                className="size-9 rounded-full object-cover shrink-0"
              />
            )}
            <p className="text-sm font-semibold text-foreground">
              {currentUser.name}
            </p>
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
              disabled={!commentText.trim() || isCommenting}
            >
              Comment
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
