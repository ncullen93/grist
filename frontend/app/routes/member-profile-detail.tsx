import { Link, useFetcher, useSearchParams } from "react-router";
import {
  ArrowLeft,
  Plus,
  Check,
  Heart,
  MessageCircle,
  FileText,
  MessageSquare,
  Store,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "~/components/ui/tabs";
import { apiGet, apiPost, apiDelete } from "~/lib/api.server";
import { redirect } from "react-router";
import type { Route } from "./+types/member-profile-detail";

interface EventItem {
  id: number;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  type: string;
  status: string;
  image: string;
  spots: number | null;
  attendees: number;
  rsvped: boolean;
}

interface PostItem {
  type: "blog" | "forum" | "marketplace";
  id: number;
  title: string;
  image: string;
  likes_count: number;
  replies: number;
  time: string;
  created_at: string;
}

export async function loader({ request, params }: Route.LoaderArgs) {
  try {
    const [memberRes, blogRes, forumRes, listingRes, eventsRes] =
      await Promise.all([
        apiGet(request, `/api/members/${params.uid}/`),
        apiGet(request, `/api/blog/posts/?author=${params.uid}`),
        apiGet(request, `/api/forum/posts/?author=${params.uid}`),
        apiGet(request, `/api/marketplace/listings/?author=${params.uid}`),
        apiGet(request, `/api/members/${params.uid}/events/`),
      ]);

    if (!memberRes.ok) {
      if (memberRes.status === 404)
        throw new Response("Member not found", { status: 404 });
      return redirect("/login");
    }

    const member = await memberRes.json();
    const blogData = blogRes.ok ? await blogRes.json() : { results: [] };
    const forumData = forumRes.ok ? await forumRes.json() : { results: [] };
    const listingData = listingRes.ok
      ? await listingRes.json()
      : { results: [] };
    const eventsData: EventItem[] = eventsRes.ok
      ? await eventsRes.json()
      : [];

    // Build unified posts list
    const posts: PostItem[] = [
      ...(blogData.results || []).map(
        (p: {
          id: number;
          title: string;
          image: string;
          likes_count: number;
          comment_count: number;
          time: string;
          created_at: string;
          status: string;
        }) =>
          p.status === "published"
            ? {
                type: "blog" as const,
                id: p.id,
                title: p.title,
                image: p.image,
                likes_count: p.likes_count,
                replies: p.comment_count,
                time: p.time,
                created_at: p.created_at,
              }
            : null,
      ),
      ...(forumData.results || []).map(
        (p: {
          id: number;
          title: string;
          image: string;
          likes_count: number;
          reply_count: number;
          time: string;
          created_at: string;
        }) => ({
          type: "forum" as const,
          id: p.id,
          title: p.title,
          image: p.image,
          likes_count: p.likes_count,
          replies: p.reply_count,
          time: p.time,
          created_at: p.created_at,
        }),
      ),
      ...(listingData.results || []).map(
        (p: {
          id: number;
          title: string;
          image: string;
          likes_count: number;
          reply_count: number;
          time: string;
          created_at: string;
        }) => ({
          type: "marketplace" as const,
          id: p.id,
          title: p.title,
          image: p.image,
          likes_count: p.likes_count,
          replies: p.reply_count,
          time: p.time,
          created_at: p.created_at,
        }),
      ),
    ].filter(Boolean) as PostItem[];

    posts.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    return { member, posts, events: eventsData };
  } catch (e) {
    if (e instanceof Response) throw e;
    return redirect("/login");
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const uid = params.uid;

  try {
    if (intent === "follow") {
      const res = await apiPost(request, `/api/members/${uid}/follow/`);
      if (!res.ok) return { error: "Failed to follow." };
      return { following: true };
    }
    if (intent === "unfollow") {
      const res = await apiDelete(request, `/api/members/${uid}/follow/`);
      if (!res.ok) return { error: "Failed to unfollow." };
      return { following: false };
    }
  } catch {
    return { error: "Unable to connect to server." };
  }
  return null;
}

/** Render the story field, handling both legacy string[] and Block[] formats. */
function StoryContent({ story }: { story: unknown[] | null }) {
  if (!story || story.length === 0) return null;

  // Legacy format: array of strings
  if (typeof story[0] === "string") {
    return (
      <>
        {(story as string[]).map((paragraph, i) => (
          <p
            key={i}
            className="text-[15px] leading-relaxed text-muted-foreground"
          >
            {paragraph}
          </p>
        ))}
      </>
    );
  }

  // Block[] format from the editor
  const styleClasses: Record<string, string> = {
    normal: "text-[15px] leading-relaxed text-muted-foreground",
    h1: "text-3xl font-display font-semibold text-foreground pt-6",
    h2: "text-2xl font-display font-semibold text-foreground pt-4",
    h3: "text-xl font-display font-semibold text-foreground pt-3",
    h4: "text-lg font-display font-medium text-foreground pt-2",
  };

  return (
    <>
      {(
        story as Array<{
          type: string;
          content?: string;
          style?: string;
          preview?: string;
        }>
      ).map((block, i) => {
        if (block.type === "image" && block.preview) {
          return (
            <img
              key={i}
              src={block.preview}
              alt=""
              className="w-full rounded-xl object-cover"
            />
          );
        }
        if (block.type === "text" && block.content) {
          return (
            <p key={i} className={styleClasses[block.style || "normal"]}>
              {block.content}
            </p>
          );
        }
        return null;
      })}
    </>
  );
}

function getPostLink(post: PostItem) {
  switch (post.type) {
    case "blog":
      return `/m/blog/${post.id}`;
    case "forum":
      return `/m/forum/${post.id}`;
    case "marketplace":
      return `/m/marketplace/${post.id}`;
  }
}

function getPostIcon(type: PostItem["type"]) {
  switch (type) {
    case "blog":
      return FileText;
    case "forum":
      return MessageSquare;
    case "marketplace":
      return Store;
  }
}

function getPostLabel(type: PostItem["type"]) {
  switch (type) {
    case "blog":
      return "Blog";
    case "forum":
      return "Forum";
    case "marketplace":
      return "Marketplace";
  }
}

export default function MemberProfileDetailPage({
  loaderData,
}: Route.ComponentProps) {
  const { member, posts, events } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const setActiveTab = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "overview") next.delete("tab");
    else next.set("tab", value);
    setSearchParams(next, { replace: true });
  };
  const followFetcher = useFetcher();

  // Optimistic: use fetcher result if available, else loader data
  const isFollowing = followFetcher.data?.following ?? member.is_following;

  return (
    <>
      <header className="px-4 md:px-8 h-18 flex items-center bg-background shrink-0 border-b border-border sticky top-0 z-10">
        <Link
          to="/m/members"
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Members
        </Link>
      </header>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-medium tracking-tight text-foreground">
              {member.name}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {member.home_style} · {member.home_year}
              </span>
              {" · "}
              {member.location}
            </p>
          </div>

          <Button
            variant={isFollowing ? "outline" : "default"}
            className="rounded-full px-8 shrink-0"
            onClick={() =>
              followFetcher.submit(
                { intent: isFollowing ? "unfollow" : "follow" },
                { method: "post" },
              )
            }
            disabled={followFetcher.state !== "idle"}
          >
            {isFollowing ? (
              <>
                <Check className="mr-2 size-4" />
                Following
              </>
            ) : (
              <>
                <Plus className="mr-2 size-4" />
                Follow
              </>
            )}
          </Button>
        </div>

        {/* Hero image */}
        {member.photo && (
          <div className="mt-8 overflow-hidden rounded-xl">
            <img
              src={member.photo.replace("w=600&h=600", "w=900&h=500")}
              alt={member.home_name}
              className="aspect-video w-full object-cover"
            />
          </div>
        )}

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-10"
        >
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="min-h-[70dvh]">
            {/* Details bar */}
            <div className="mt-6 rounded-xl bg-[#e8ece5] p-8">
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Registry
                  </p>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {member.registry || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Home built
                  </p>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {member.home_year || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Style
                  </p>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {member.home_style || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Overview content */}
            <div className="mt-8">
              <div className="space-y-6">
                <StoryContent story={member.story} />
              </div>

              {member.tags && member.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {member.tags.map((tag: string) => (
                    <Link
                      key={tag}
                      to={`/m/members?search=${encodeURIComponent(tag)}`}
                      className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="posts" className="min-h-[70dvh]">
            <div className="mt-6">
              {posts.length === 0 ? (
                <div className="rounded-xl border border-border p-16 text-center">
                  <p className="text-sm text-muted-foreground">
                    No posts yet.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-border divide-y divide-border">
                  {posts.map((post) => {
                    const Icon = getPostIcon(post.type);
                    return (
                      <Link
                        key={`${post.type}-${post.id}`}
                        to={getPostLink(post)}
                        className="group flex items-start gap-5 px-6 py-5 transition-colors hover:bg-muted/30"
                      >
                        {post.image ? (
                          <img
                            src={post.image}
                            alt=""
                            className="size-20 rounded-lg object-cover shrink-0"
                          />
                        ) : (
                          <div className="flex size-20 items-center justify-center rounded-lg bg-muted shrink-0">
                            <Icon className="size-6 text-muted-foreground/50" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                              {post.title || "Untitled"}
                            </p>
                            <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                              {getPostLabel(post.type)}
                            </span>
                          </div>
                          <p className="mt-1.5 text-sm text-muted-foreground">
                            {post.time}
                          </p>
                        </div>
                        <div className="shrink-0 flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Heart className="size-3.5" />
                            {post.likes_count}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MessageCircle className="size-3.5" />
                            {post.replies}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="events" className="min-h-[70dvh]">
            <div className="mt-6">
              {events.length === 0 ? (
                <div className="rounded-xl border border-border p-16 text-center">
                  <p className="text-sm text-muted-foreground">
                    No events yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {events.map((event) => (
                    <Link
                      key={event.id}
                      to={`/m/events/${event.id}`}
                      className="group"
                    >
                      <div className="relative overflow-hidden rounded-xl">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <span className="absolute top-3 right-3 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                          {event.type}
                        </span>
                        {event.status === "past" && (
                          <span className="absolute top-3 left-3 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                            Attended
                          </span>
                        )}
                      </div>
                      <div className="mt-3">
                        <h3 className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                          {event.title}
                        </h3>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {event.date}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
