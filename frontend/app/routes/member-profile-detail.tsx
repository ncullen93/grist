import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Heart, Plus, Check } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import {
  getMemberBySlug,
  getMicroPostsByAuthorSlug,
  allPosts,
  allEvents,
} from "~/lib/demo-data";
import type { Route } from "./+types/member-profile-detail";

export function loader({ params }: Route.LoaderArgs) {
  const member = getMemberBySlug(params.slug);
  if (!member) {
    throw new Response("Member not found", { status: 404 });
  }
  const microPosts = getMicroPostsByAuthorSlug(params.slug);
  return { member, microPosts };
}

export default function MemberProfileDetailPage({
  loaderData,
}: Route.ComponentProps) {
  const { member, microPosts } = loaderData;
  const [activeTab, setActiveTab] = useState("overview");
  const [isFollowing, setIsFollowing] = useState(false);

  const memberForumPosts = allPosts.filter((p) => p.author === member.name);
  const memberEvents = allEvents.filter((e) => e.status === "past");

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
              <span className="font-medium text-foreground">{member.homeStyle} · {member.homeYear}</span>
              {" · "}
              {member.location}
            </p>
          </div>

          <Button
            variant={isFollowing ? "outline" : "default"}
            className="rounded-full px-8 shrink-0"
            onClick={() => setIsFollowing(!isFollowing)}
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
        <div className="mt-8 overflow-hidden rounded-xl">
          <img
            src={member.photo.replace("w=600&h=600", "w=900&h=500")}
            alt={member.homeName}
            className="aspect-video w-full object-cover"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-10">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
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
                    {member.registry}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Home built
                  </p>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {member.homeYear}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Style
                  </p>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {member.homeStyle}
                  </p>
                </div>
              </div>
            </div>

            {/* Overview */}
            <div className="mt-8">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                {member.homeName}
              </h2>
              <div className="mt-6 space-y-6">
                <p className="text-[15px] leading-relaxed text-muted-foreground">
                  {member.bio}
                </p>

                {member.story.map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-[15px] leading-relaxed text-muted-foreground"
                  >
                    {paragraph}
                  </p>
                ))}

                <img
                  src={member.photo.replace("w=600&h=600", "w=800&h=500")}
                  alt={member.homeName}
                  className="aspect-3/2 w-full rounded-xl object-cover"
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {member.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/m/members?search=${encodeURIComponent(tag)}`}
                    className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="posts" className="min-h-[70dvh]">
            <div className="mt-6 space-y-6">
              {microPosts.length === 0 ? (
                <div className="rounded-xl border border-border p-16 text-center">
                  <p className="text-sm text-muted-foreground">
                    {member.name.split(" ")[0]} hasn&apos;t published any posts
                    yet.
                  </p>
                </div>
              ) : (
                microPosts.map((post) => (
                  <article
                    key={post.id}
                    className="rounded-xl border border-border overflow-hidden"
                  >
                    {post.image && (
                      <img
                        src={post.image}
                        alt=""
                        className="aspect-video w-full object-cover"
                      />
                    )}
                    <div className="px-6 py-5">
                      <p className="text-[15px] leading-relaxed text-muted-foreground">
                        {post.content}
                      </p>
                      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Heart className="size-4" />
                          {post.likes}
                        </span>
                        <span>{post.time}</span>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="min-h-[70dvh]">
            <div className="mt-6">
              {memberForumPosts.length === 0 && memberEvents.length === 0 ? (
                <div className="rounded-xl border border-border p-16 text-center">
                  <p className="text-sm text-muted-foreground">
                    No activity yet.
                  </p>
                </div>
              ) : (
                <>
                  {memberForumPosts.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Forum Posts
                      </h3>
                      <div className="mt-4 rounded-xl border border-border overflow-hidden divide-y divide-border">
                        {memberForumPosts.map((post) => (
                          <Link
                            key={post.id}
                            to="/m/forum"
                            className="group flex items-center gap-4 px-6 py-5 transition-colors hover:bg-muted/50"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                {post.title}
                              </p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {post.likes} likes &middot;{" "}
                                {post.replies.length} replies
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {post.time}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {memberEvents.length > 0 && (
                    <div className={memberForumPosts.length > 0 ? "mt-8" : ""}>
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Events Attended
                      </h3>
                      <div className="mt-4 rounded-xl border border-border overflow-hidden divide-y divide-border">
                        {memberEvents.slice(0, 3).map((event) => (
                          <Link
                            key={event.id}
                            to={`/m/events/${event.id}`}
                            className="group flex items-center gap-4 px-6 py-5 transition-colors hover:bg-muted/50"
                          >
                            <img
                              src={event.image}
                              alt=""
                              className="size-10 rounded-lg object-cover shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                {event.title}
                              </p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {event.date}
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {event.type}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
