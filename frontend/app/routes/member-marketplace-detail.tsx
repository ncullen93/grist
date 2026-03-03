import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { getListingById, allMembers, allListings } from "~/lib/demo-data";
import type { Listing, ListingCategory, Reply } from "~/lib/demo-data";
import type { Route } from "./+types/member-marketplace-detail";

const memberSlugMap = new Map(allMembers.map((m) => [m.name, m.slug]));

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

export function loader({ params }: Route.LoaderArgs) {
  const listing = getListingById(Number(params.id));
  if (!listing) {
    throw new Response("Listing not found", { status: 404 });
  }
  return { listing };
}

export default function MemberMarketplaceDetailPage({
  loaderData,
}: Route.ComponentProps) {
  const [listing, setListing] = useState<Listing>(loaderData.listing);
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
    setListing((prev) => ({
      ...prev,
      replies: [...prev.replies, newReply],
    }));
    setReplyText("");
  };

  const handleLike = () => {
    setListing((prev) => ({ ...prev, likes: prev.likes + 1 }));
  };

  const authorSlug = memberSlugMap.get(listing.author);
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
              {authorSlug ? (
                <Link to={`/m/members/${authorSlug}`}>
                  <img
                    src={listing.homePhoto}
                    alt=""
                    className="size-9 rounded-full object-cover"
                  />
                </Link>
              ) : (
                <img
                  src={listing.homePhoto}
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
                    {listing.author}
                  </Link>
                ) : (
                  <p className="text-sm font-semibold text-foreground">
                    {listing.author}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {listing.location}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <button
                onClick={handleLike}
                className="transition-colors hover:text-foreground"
              >
                {listing.likes} likes
              </button>
              <span>{listing.replies.length} replies</span>
            </div>
          </div>
        </div>

        {/* Listing body */}
        <div className="mt-8 border-t border-border pt-8">
          {listing.image && (
            <img
              src={listing.image.replace(/w=\d+&h=\d+/, "w=900&h=500")}
              alt=""
              className="w-full rounded-xl object-cover aspect-video mb-6"
            />
          )}

          <p className="text-[15px] leading-relaxed text-muted-foreground">
            {listing.description}
          </p>

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

          {listing.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {listing.tags.map((t) => (
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

          {listing.replies.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No replies yet. Be the first to respond.
            </p>
          ) : (
            <div className="mt-6 rounded-xl border border-border overflow-hidden divide-y divide-border">
              {listing.replies.map((reply) => {
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

        {/* More listings */}
        {(() => {
          const related = allListings
            .filter((l) => l.id !== listing.id)
            .slice(0, 3);
          if (related.length === 0) return null;
          return (
            <div className="mt-12">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                More from the Marketplace
              </h2>
              <div className="mt-6 space-y-4">
                {related.map((l) => {
                  const b = categoryBadge(l.category);
                  return (
                    <Link
                      key={l.id}
                      to={`/m/marketplace/${l.id}`}
                      className="group flex items-center gap-4 rounded-xl border border-border px-6 py-5 transition-colors hover:bg-muted/30"
                    >
                      <img
                        src={l.homePhoto}
                        alt=""
                        className="size-9 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                          {l.title}
                        </p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {l.author}
                          {l.price ? ` \u00b7 ${l.price}` : ""} &middot;{" "}
                          {l.likes} likes &middot; {l.replies.length} replies
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider shrink-0 ${b.classes}`}
                      >
                        {b.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>
    </>
  );
}
