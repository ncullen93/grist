import { useState } from "react";
import { Link, useFetcher } from "react-router";
import { redirect } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { apiGet, apiPost } from "~/lib/api.server";
import type { Route } from "./+types/member-marketplace-detail";

interface ListingReply {
  id: number;
  author_slug: string;
  author_name: string;
  location: string;
  home_photo: string;
  body: string;
  time: string;
}

interface ListingDetail {
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
  replies: ListingReply[];
  user_has_liked: boolean;
}

interface CurrentUser {
  name: string;
  photo: string;
  location: string;
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

export async function loader({ request, params }: Route.LoaderArgs) {
  try {
    const [listingRes, profileRes] = await Promise.all([
      apiGet(request, `/api/marketplace/listings/${params.id}/`),
      apiGet(request, "/api/members/me/"),
    ]);
    if (!listingRes.ok) {
      throw new Response("Listing not found", { status: 404 });
    }
    if (!profileRes.ok) return redirect("/login");
    const listing: ListingDetail = await listingRes.json();
    const profile = await profileRes.json();
    const currentUser: CurrentUser = {
      name: profile.name,
      photo: profile.photo,
      location: profile.location,
    };
    return { listing, currentUser };
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
    const res = await apiPost(
      request,
      `/api/marketplace/listings/${params.id}/reply/`,
      { body },
    );
    if (!res.ok) return { error: "Failed to post reply." };
    const reply = await res.json();
    return { newReply: reply };
  }

  if (intent === "like") {
    const res = await apiPost(
      request,
      `/api/marketplace/listings/${params.id}/like/`,
    );
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

export default function MemberMarketplaceDetailPage({
  loaderData,
}: Route.ComponentProps) {
  const { currentUser } = loaderData;
  const [listing] = useState(loaderData.listing);
  const [replyText, setReplyText] = useState("");
  const replyFetcher = useFetcher();
  const likeFetcher = useFetcher();
  const isReplying = replyFetcher.state === "submitting";

  // Append new reply when it comes back
  const displayReplies = [...(listing.replies || [])];
  if (replyFetcher.data?.newReply) {
    const nr = replyFetcher.data.newReply;
    if (!displayReplies.some((r: ListingReply) => r.id === nr.id)) {
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
  const liked = likeResult?.liked ?? listing.user_has_liked;
  const likesCount = likeResult?.likesCount ?? listing.likes_count;

  const handleLike = () => {
    likeFetcher.submit({ intent: "like" }, { method: "post" });
  };

  const badge = categoryBadge(listing.category);

  return (
    <>
      <header className="px-4 md:px-8 h-18 flex items-center bg-background shrink-0 border-b border-border sticky top-0 z-10">
        <Link
          to="/m/marketplace"
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Marketplace
        </Link>
      </header>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* Listing header */}
        <div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex rounded-full px-3 py-1.5 text-xs font-medium ${badge.classes}`}
            >
              {badge.label}
            </span>
            <span className="text-xs text-muted-foreground">
              {listing.time}
            </span>
          </div>

          <h1 className="mt-4 font-display text-3xl font-medium tracking-tight text-foreground">
            {listing.title}
          </h1>

          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to={`/m/members/${listing.author_slug}`}>
                <img
                  src={listing.home_photo}
                  alt=""
                  className="size-9 rounded-full object-cover"
                />
              </Link>
              <div>
                <Link
                  to={`/m/members/${listing.author_slug}`}
                  className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                >
                  {listing.author_name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {listing.location}
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

        {/* Listing body */}
        <div className="mt-8 border-t border-border pt-8">
          {listing.image && (
            <img
              src={listing.image}
              alt=""
              className="w-full rounded-xl object-cover aspect-video mb-6"
            />
          )}

          <RenderContent content={listing.description} />

          {/* Price + condition */}
          {(listing.price || listing.condition) && (
            <div className="mt-5 flex items-center gap-4">
              {listing.price && (
                <span className="text-lg font-semibold text-foreground">
                  {listing.price}
                </span>
              )}
              {listing.condition && (
                <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  {listing.condition}
                </span>
              )}
            </div>
          )}

          {(listing.tag_names?.length ?? 0) > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {listing.tag_names.map((t: string) => (
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

          {displayReplies.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No replies yet. Be the first to respond.
            </p>
          ) : (
            <div className="mt-6 rounded-xl border border-border overflow-hidden divide-y divide-border">
              {displayReplies.map((reply: ListingReply) => (
                <div key={reply.id} className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <Link to={`/m/members/${reply.author_slug}`}>
                      <img
                        src={reply.home_photo}
                        alt=""
                        className="size-9 rounded-full object-cover"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/m/members/${reply.author_slug}`}
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
