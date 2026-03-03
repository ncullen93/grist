import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Heart, MessageCircle, Check, ChevronRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Progress } from "~/components/ui/progress";
import { Button } from "~/components/ui/button";
import { PageHeader } from "~/components/page-header";
import {
  allMembers,
  allEvents,
  allPosts,
  allMicroPosts,
} from "~/lib/demo-data";

const upcomingEvents = allEvents.filter((e) => e.status === "upcoming");
const recentMembers = allMembers.slice(0, 3);

const onboardingItems = [
  { id: "profile", title: "Fill out your profile", href: "/m/profile" },
  { id: "blog", title: "Make a blog post", href: "/m/posts" },
  { id: "forum", title: "Answer a forum question", href: "/m/forum" },
  { id: "marketplace", title: "Check out the marketplace", href: "/m/marketplace" },
  { id: "events", title: "View our events", href: "/m/events" },
];

const followedSlugs = new Set(["margaret-h", "eleanor-m"]);
const followedNames = new Set(
  allMembers.filter((m) => followedSlugs.has(m.slug)).map((m) => m.name),
);

type FeedItemType = "post" | "event" | "forum" | "member";
type AudienceType = "all" | "following";

type FeedItem =
  | { type: "post"; data: (typeof allMicroPosts)[number] }
  | { type: "event"; data: (typeof allEvents)[number] }
  | { type: "forum"; data: (typeof allPosts)[number] }
  | { type: "member"; data: (typeof allMembers)[number] };

const sortedForumPosts = [...allPosts]
  .sort((a, b) => b.likes - a.likes)
  .slice(0, 4);

function buildFeed(): FeedItem[] {
  const items: FeedItem[] = [];
  const sources = {
    post: [...allMicroPosts],
    event: [...upcomingEvents],
    forum: [...sortedForumPosts],
    member: [...recentMembers],
  };
  const idx = { post: 0, event: 0, forum: 0, member: 0 };

  // Pattern: post, post, event, post, forum, post, member — then repeat
  const pattern: FeedItemType[] = [
    "post",
    "post",
    "event",
    "post",
    "forum",
    "post",
    "member",
  ];

  const totalItems =
    sources.post.length +
    sources.event.length +
    sources.forum.length +
    sources.member.length;

  let patternPos = 0;
  for (let safety = 0; safety < totalItems + pattern.length; safety++) {
    if (items.length >= totalItems) break;

    const type = pattern[patternPos % pattern.length];
    patternPos++;

    if (idx[type] < sources[type].length) {
      items.push({ type, data: sources[type][idx[type]++] } as FeedItem);
    } else {
      // This type is exhausted — try the next type in pattern
      // but don't skip, the loop will naturally move on
    }
  }

  return items;
}

const allFeedItems = buildFeed();


export default function MemberHomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const audience = (searchParams.get("tab") || "all") as AudienceType;
  const setAudience = (value: AudienceType) => {
    const next = new URLSearchParams(searchParams);
    if (value === "all") next.delete("tab");
    else next.set("tab", value);
    setSearchParams(next, { replace: true });
  };
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  const completedCount = completedItems.size;
  const totalCount = onboardingItems.length;
  const firstIncompleteIndex = onboardingItems.findIndex(
    (item) => !completedItems.has(item.id),
  );

  function handleOnboardingClick(id: string) {
    setCompletedItems((prev) => new Set([...prev, id]));
  }

  const filteredItems = allFeedItems.filter((item) => {
    if (audience === "following") {
      if (item.type === "post") {
        return followedSlugs.has(item.data.authorSlug);
      }
      if (item.type === "forum") {
        return followedNames.has(item.data.author);
      }
    }

    return true;
  });

  return (
    <>
      <PageHeader title="Home" />
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* Getting started checklist */}
        {completedCount < totalCount && (
          <div className="mb-6 border border-border rounded-lg overflow-hidden">
            <div className="px-6 py-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground">
                  Getting started
                </h2>
                <span className="text-xs text-muted-foreground">
                  {completedCount} of {totalCount}
                </span>
              </div>
              <Progress
                value={(completedCount / totalCount) * 100}
                className="h-1.5 mt-4"
              />
            </div>
            <div>
              {onboardingItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.href}
                  onClick={() => handleOnboardingClick(item.id)}
                  className="flex items-center gap-4 px-6 py-3.5 border-t border-border hover:bg-muted/50 transition-colors"
                >
                  {completedItems.has(item.id) ? (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-border shrink-0" />
                  )}
                  <span
                    className={`text-sm flex-1 ${completedItems.has(item.id) ? "text-muted-foreground" : ""}`}
                  >
                    {item.title}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                </Link>
              ))}
            </div>
            {firstIncompleteIndex >= 0 && (
              <div className="px-6 py-4 border-t border-border">
                <Button className="w-full" asChild>
                  <Link
                    to={onboardingItems[firstIncompleteIndex].href}
                    onClick={() =>
                      handleOnboardingClick(
                        onboardingItems[firstIncompleteIndex].id,
                      )
                    }
                  >
                    Next step
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Quick stats */}
        <div className="mb-4 grid grid-cols-3 rounded-lg border border-border overflow-hidden">
          {[
            { label: "Members", value: "342", href: "/m/members" },
            { label: "Forum Posts", value: "89", href: "/m/forum" },
            {
              label: "Upcoming Events",
              value: String(upcomingEvents.length),
              href: "/m/events",
            },
          ].map((stat, i) => (
            <Link
              key={stat.label}
              to={stat.href}
              className={`group px-6 py-6 transition-colors hover:bg-muted/50 ${i < 2 ? "border-r border-border" : ""}`}
            >
              <p className="text-2xl font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                {stat.value}
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {stat.label}
              </p>
            </Link>
          ))}
        </div>

        {/* Filter bar */}
        <div className="sticky top-18 z-10 -mx-4 md:-mx-8 px-4 md:px-8 pt-6 pb-4 bg-background">
          <Tabs value={audience} onValueChange={(v) => setAudience(v as AudienceType)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Feed */}
        <div className="mt-8 space-y-5">
          {filteredItems.length === 0 ? (
            <div className="rounded-xl border border-border p-16 text-center">
              <p className="text-sm text-muted-foreground">
                {audience === "following"
                  ? "No updates from people you follow."
                  : "Nothing to show for this filter."}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              switch (item.type) {
                case "post":
                  return (
                    <PostCard key={`post-${item.data.id}`} post={item.data} />
                  );
                case "event":
                  return (
                    <EventCard
                      key={`event-${item.data.id}`}
                      event={item.data}
                    />
                  );
                case "forum":
                  return (
                    <ForumCard key={`forum-${item.data.id}`} post={item.data} />
                  );
                case "member":
                  return (
                    <MemberCard
                      key={`member-${item.data.slug}`}
                      member={item.data}
                    />
                  );
              }
            })
          )}
        </div>
      </div>
    </>
  );
}

function PostCard({ post }: { post: (typeof allMicroPosts)[number] }) {
  return (
    <Link
      to={`/m/blog/${post.id}`}
      className="group block rounded-xl border border-border overflow-hidden transition-colors hover:border-border/80 hover:bg-muted/30"
    >
      {post.image && (
        <img
          src={post.image}
          alt=""
          className="aspect-video w-full object-cover"
        />
      )}
      <div className="px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={post.authorPhoto}
              alt=""
              className="size-9 rounded-full object-cover"
            />
            <div>
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {post.authorName}
              </span>
              <p className="text-xs text-muted-foreground">
                {post.authorLocation} &middot; {post.time}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
            Post
          </span>
        </div>
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
          {post.content}
        </p>
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Heart className="size-4" />
            {post.likes}
          </span>
          <span className="flex items-center gap-1.5">
            <MessageCircle className="size-4" />
            {post.comments.length}
          </span>
        </div>
      </div>
    </Link>
  );
}

function EventCard({ event }: { event: (typeof allEvents)[number] }) {
  return (
    <Link
      to={`/m/events/${event.id}`}
      className="group block overflow-hidden rounded-xl border border-border"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute top-3 right-3 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {event.type}
        </span>
      </div>
      <div className="px-8 py-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {event.type} &middot; {event.date}
          </p>
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
            Event
          </span>
        </div>
        <h3 className="mt-2 font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
          {event.title}
        </h3>
        <p className="mt-3 text-sm font-medium text-primary">
          {event.attendees} attending
          {event.spots
            ? ` \u00b7 ${event.spots - event.attendees} spots left`
            : ""}
        </p>
      </div>
    </Link>
  );
}

function ForumCard({ post }: { post: (typeof allPosts)[number] }) {
  return (
    <Link
      to={`/m/forum/${post.id}`}
      className="group block rounded-xl border border-border overflow-hidden"
    >
      {post.image && (
        <div className="aspect-video overflow-hidden">
          <img
            src={post.image}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={post.homePhoto}
              alt=""
              className="size-9 rounded-full object-cover"
            />
            <div>
              <span className="text-sm font-medium text-foreground">
                {post.author}
              </span>
              <p className="text-xs text-muted-foreground">
                {post.location} &middot; {post.time}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
            Forum
          </span>
        </div>
        <h3 className="mt-4 font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          <span>{post.likes} likes</span>
          <span>{post.replies.length} replies</span>
        </div>
      </div>
    </Link>
  );
}

function MemberCard({ member }: { member: (typeof allMembers)[number] }) {
  return (
    <Link
      to={`/m/members/${member.slug}`}
      className="group flex items-center gap-4 rounded-xl border border-border px-6 py-5 transition-colors hover:bg-muted/30"
    >
      <img
        src={member.photo}
        alt={member.name}
        className="size-12 rounded-full object-cover shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
          {member.name}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {member.location} &middot; {member.homeStyle} &middot;{" "}
          {member.homeYear}
        </p>
      </div>
      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary shrink-0">
        New member
      </span>
    </Link>
  );
}
