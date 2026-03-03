import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowLeft, Plus, Check } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "~/components/ui/tabs";
import { apiGet } from "~/lib/api.server";
import { redirect } from "react-router";
import type { Route } from "./+types/member-profile-detail";

export async function loader({ request, params }: Route.LoaderArgs) {
  try {
    const res = await apiGet(request, `/api/members/${params.slug}/`);
    if (!res.ok) {
      if (res.status === 404) throw new Response("Member not found", { status: 404 });
      return redirect("/login");
    }
    return { member: await res.json() };
  } catch (e) {
    if (e instanceof Response) throw e;
    return redirect("/login");
  }
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
      {(story as Array<{ type: string; content?: string; style?: string; preview?: string }>).map(
        (block, i) => {
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
        }
      )}
    </>
  );
}

export default function MemberProfileDetailPage({
  loaderData,
}: Route.ComponentProps) {
  const { member } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const setActiveTab = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "overview") next.delete("tab");
    else next.set("tab", value);
    setSearchParams(next, { replace: true });
  };
  const [isFollowing, setIsFollowing] = useState(member.is_following);

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
              <div className="rounded-xl border border-border p-16 text-center">
                <p className="text-sm text-muted-foreground">
                  No posts yet.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="min-h-[70dvh]">
            <div className="mt-6">
              <div className="rounded-xl border border-border p-16 text-center">
                <p className="text-sm text-muted-foreground">
                  No activity yet.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
