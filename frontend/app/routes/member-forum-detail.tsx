import { useState } from "react";
import { Link, useFetcher } from "react-router";
import { redirect } from "react-router";
import { Button } from "~/components/ui/button";
import { apiGet, apiPost } from "~/lib/api.server";
import type { Route } from "./+types/member-forum-detail";

interface ForumReply {
  id: number;
  author_uid: string;
  author_name: string;
  location: string;
  home_photo: string;
  body: string;
  time: string;
}

interface ForumPost {
  id: number;
  author_uid: string;
  author_name: string;
  location: string;
  home_photo: string;
  channel_name: string;
  channel_slug: string;
  topic_names: string[];
  title: string;
  body: string;
  image: string;
  pinned: boolean;
  likes_count: number;
  reply_count: number;
  time: string;
  replies: ForumReply[];
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
      apiGet(request, `/api/forum/posts/${params.id}/`),
      apiGet(request, "/api/members/me/"),
    ]);
    if (!postRes.ok) {
      throw new Response("Post not found", { status: 404 });
    }
    if (!profileRes.ok) return redirect("/login");
    const post: ForumPost = await postRes.json();
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

  if (intent === "reply") {
    const body = formData.get("body") as string;
    const res = await apiPost(request, `/api/forum/posts/${params.id}/reply/`, {
      body,
    });
    if (!res.ok) return { error: "Failed to post reply." };
    const reply = await res.json();
    return { newReply: reply };
  }

  if (intent === "like") {
    const res = await apiPost(request, `/api/forum/posts/${params.id}/like/`);
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

export default function MemberForumDetailPage({
  loaderData,
}: Route.ComponentProps) {
  const { currentUser } = loaderData;
  const [post] = useState(loaderData.post);
  const [replyText, setReplyText] = useState("");
  const replyFetcher = useFetcher();
  const likeFetcher = useFetcher();
  const isReplying = replyFetcher.state === "submitting";

  // Append new reply when it comes back
  const displayReplies = [...(post.replies || [])];
  if (replyFetcher.data?.newReply) {
    const nr = replyFetcher.data.newReply;
    if (!displayReplies.some((r: ForumReply) => r.id === nr.id)) {
      displayReplies.push(nr);
    }
  }

  const handleReply = () => {
    if (!replyText.trim()) return;
    replyFetcher.submit(
      { intent: "reply", body: replyText.trim() },
      { method: "post" },
    );
    setReplyText("");
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
        <div className="flex items-center gap-2 text-sm font-medium">
          <Link
            to="/m/forum"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Forum
          </Link>
          <span className="text-muted-foreground/50">/</span>
          <Link
            to={`/m/forum?channel=${post.channel_slug}`}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {post.channel_name}
          </Link>
        </div>
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
              {post.channel_name} &middot; {post.time}
            </span>
          </div>

          <h1 className="mt-4 font-display text-3xl font-medium tracking-tight text-foreground">
            {post.title}
          </h1>

          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to={`/m/members/${post.author_uid}`}>
                <img
                  src={post.home_photo}
                  alt=""
                  className="size-9 rounded-full object-cover"
                />
              </Link>
              <div>
                <Link
                  to={`/m/members/${post.author_uid}`}
                  className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                >
                  {post.author_name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {post.location}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <button
                onClick={handleLike}
                disabled={pendingLike}
                className={`transition-colors hover:text-foreground ${liked ? "text-primary" : ""}`}
              >
                {likesCount} likes
              </button>
              <span>{displayReplies.length} replies</span>
            </div>
          </div>
        </div>

        {/* Post body */}
        <div className="mt-8 border-t border-border pt-8">
          <RenderContent content={post.body} />

        </div>

        {/* Replies */}
        <div className="mt-12">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Replies
          </h2>

          {displayReplies.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No replies yet. Be the first to respond.
            </p>
          ) : (
            <div className="mt-6 rounded-xl border border-border overflow-hidden divide-y divide-border">
              {displayReplies.map((reply: ForumReply) => (
                <div key={reply.id} className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <Link to={`/m/members/${reply.author_uid}`}>
                      <img
                        src={reply.home_photo}
                        alt=""
                        className="size-9 rounded-full object-cover"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/m/members/${reply.author_uid}`}
                        className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {reply.author_name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {reply.location} &middot; {reply.time}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                    {reply.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reply input */}
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
              disabled={!replyText.trim() || isReplying}
            >
              Reply
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
