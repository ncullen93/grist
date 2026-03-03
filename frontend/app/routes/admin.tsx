import { useState } from "react";
import { Link, useFetcher } from "react-router";
import type { Route } from "./+types/admin";
import { apiGet, apiDelete } from "~/lib/api.server";
import { redirect } from "react-router";
import { PageHeader } from "~/components/page-header";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";

export async function loader({ request }: Route.LoaderArgs) {
  const [meRes, eventsRes, membersRes, blogRes, forumRes] = await Promise.all([
    apiGet(request, "/api/auth/me/"),
    apiGet(request, "/api/events/"),
    apiGet(request, "/api/members/"),
    apiGet(request, "/api/blog/posts/"),
    apiGet(request, "/api/forum/posts/"),
  ]);

  if (!meRes.ok) return redirect("/login");
  const user = await meRes.json();
  if (!user.is_staff) return redirect("/m");

  const eventsData = await eventsRes.json();
  const membersData = await membersRes.json();
  const blogData = await blogRes.json();
  const forumData = await forumRes.json();

  return {
    user,
    events: eventsData.results ?? eventsData,
    members: membersData.results ?? membersData,
    blogPosts: blogData.results ?? blogData,
    forumPosts: forumData.results ?? forumData,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete-event") {
    const eventId = formData.get("eventId") as string;
    await apiDelete(request, `/api/events/${eventId}/`);
    return { ok: true };
  }

  if (intent === "delete-blog") {
    const postId = formData.get("postId") as string;
    await apiDelete(request, `/api/blog/posts/${postId}/`);
    return { ok: true };
  }

  if (intent === "delete-forum") {
    const postId = formData.get("postId") as string;
    await apiDelete(request, `/api/forum/posts/${postId}/`);
    return { ok: true };
  }

  return { ok: false };
}

export default function AdminPage({ loaderData }: Route.ComponentProps) {
  const { events, members, blogPosts, forumPosts } = loaderData;
  const [activeTab, setActiveTab] = useState("events");
  const fetcher = useFetcher();

  const handleDelete = (
    intent: string,
    id: number | string,
    title: string,
    idField = "eventId"
  ) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    fetcher.submit(
      { intent, [idField]: String(id) },
      { method: "post" }
    );
  };

  return (
    <>
      <PageHeader title="Admin" />
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            {activeTab === "events" && (
              <Link to="/m/admin/events/new">
                <Button className="rounded-full gap-2">
                  <Plus className="size-4" />
                  Create Event
                </Button>
              </Link>
            )}
          </div>

          {/* Events Tab */}
          <TabsContent value="events">
            {events.length === 0 ? (
              <div className="mt-8 rounded-lg border border-border p-16 text-center">
                <p className="text-sm text-muted-foreground">
                  No events yet. Create your first event to get started.
                </p>
              </div>
            ) : (
              <div className="mt-8 rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-sidebar border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map(
                      (event: {
                        id: number;
                        title: string;
                        date: string;
                        type: string;
                        status: string;
                        attendees: number;
                      }) => (
                        <tr
                          key={event.id}
                          className="border-b border-border last:border-0"
                        >
                          <td className="px-6 py-4 font-medium">
                            {event.title}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground hidden sm:table-cell">
                            {event.date}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">
                            {event.type}
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                event.status === "upcoming"
                                  ? "bg-primary/10 text-primary"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {event.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <Link
                                to={`/m/admin/events/${event.id}/edit`}
                                className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
                                title="Edit"
                              >
                                <Pencil className="size-3.5" />
                              </Link>
                              <button
                                onClick={() =>
                                  handleDelete(
                                    "delete-event",
                                    event.id,
                                    event.title
                                  )
                                }
                                className="inline-flex items-center text-destructive/70 hover:text-destructive transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members">
            {members.length === 0 ? (
              <div className="mt-8 rounded-lg border border-border p-16 text-center">
                <p className="text-sm text-muted-foreground">
                  No members yet.
                </p>
              </div>
            ) : (
              <div className="mt-8 rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-sidebar border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                        Home Style
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                        Since
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map(
                      (member: {
                        slug: string;
                        name: string;
                        location: string;
                        state: string;
                        home_style: string;
                        member_since: string;
                        photo: string;
                      }) => (
                        <tr
                          key={member.slug}
                          className="border-b border-border last:border-0"
                        >
                          <td className="px-6 py-4">
                            <Link
                              to={`/m/members/${member.slug}`}
                              className="flex items-center gap-3 hover:text-primary transition-colors"
                            >
                              {member.photo ? (
                                <img
                                  src={member.photo}
                                  alt={member.name}
                                  className="size-8 rounded-full object-cover shrink-0"
                                />
                              ) : (
                                <div className="size-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                                  <span className="text-xs font-medium text-primary-foreground">
                                    {member.name?.charAt(0) || "?"}
                                  </span>
                                </div>
                              )}
                              <span className="font-medium">{member.name}</span>
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground hidden sm:table-cell">
                            {[member.location, member.state]
                              .filter(Boolean)
                              .join(", ") || "—"}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">
                            {member.home_style || "—"}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">
                            {member.member_since || "—"}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts">
            {blogPosts.length === 0 && forumPosts.length === 0 ? (
              <div className="mt-8 rounded-lg border border-border p-16 text-center">
                <p className="text-sm text-muted-foreground">
                  No posts yet.
                </p>
              </div>
            ) : (
              <>
                {/* Blog Posts */}
                {blogPosts.length > 0 && (
                  <div className="mt-8 rounded-lg border border-border overflow-hidden">
                    <div className="px-6 py-4 border-b border-border bg-sidebar">
                      <h3 className="text-sm font-semibold text-foreground">
                        Blog Posts
                      </h3>
                    </div>
                    <table className="w-full text-sm">
                      <thead className="bg-sidebar/50 border-b border-border">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Title
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                            Author
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                            Date
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {blogPosts.map(
                          (post: {
                            id: number;
                            title: string;
                            author_name: string;
                            time: string;
                            likes_count: number;
                          }) => (
                            <tr
                              key={post.id}
                              className="border-b border-border last:border-0"
                            >
                              <td className="px-6 py-4 font-medium">
                                {post.title}
                              </td>
                              <td className="px-6 py-4 text-muted-foreground hidden sm:table-cell">
                                {post.author_name}
                              </td>
                              <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">
                                {post.time}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() =>
                                    handleDelete(
                                      "delete-blog",
                                      post.id,
                                      post.title,
                                      "postId"
                                    )
                                  }
                                  className="inline-flex items-center text-destructive/70 hover:text-destructive transition-colors cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Forum Posts */}
                {forumPosts.length > 0 && (
                  <div className="mt-8 rounded-lg border border-border overflow-hidden">
                    <div className="px-6 py-4 border-b border-border bg-sidebar">
                      <h3 className="text-sm font-semibold text-foreground">
                        Forum Posts
                      </h3>
                    </div>
                    <table className="w-full text-sm">
                      <thead className="bg-sidebar/50 border-b border-border">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Title
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                            Author
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                            Channel
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                            Date
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {forumPosts.map(
                          (post: {
                            id: number;
                            title: string;
                            author_name: string;
                            channel_name: string;
                            time: string;
                            reply_count: number;
                          }) => (
                            <tr
                              key={post.id}
                              className="border-b border-border last:border-0"
                            >
                              <td className="px-6 py-4 font-medium">
                                {post.title}
                              </td>
                              <td className="px-6 py-4 text-muted-foreground hidden sm:table-cell">
                                {post.author_name}
                              </td>
                              <td className="px-6 py-4 hidden md:table-cell">
                                <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                                  {post.channel_name}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">
                                {post.time}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() =>
                                    handleDelete(
                                      "delete-forum",
                                      post.id,
                                      post.title,
                                      "postId"
                                    )
                                  }
                                  className="inline-flex items-center text-destructive/70 hover:text-destructive transition-colors cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="mt-8 space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Members" value={members.length} />
                <StatCard label="Events" value={events.length} />
                <StatCard label="Blog Posts" value={blogPosts.length} />
                <StatCard label="Forum Posts" value={forumPosts.length} />
              </div>

              {/* Events breakdown */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-sidebar">
                  <h3 className="text-sm font-semibold text-foreground">
                    Events Overview
                  </h3>
                </div>
                <div className="divide-y divide-border">
                  <div className="px-6 py-5 flex items-center justify-between">
                    <p className="text-sm text-foreground">Upcoming events</p>
                    <p className="text-sm font-medium text-foreground">
                      {
                        events.filter(
                          (e: { status: string }) => e.status === "upcoming"
                        ).length
                      }
                    </p>
                  </div>
                  <div className="px-6 py-5 flex items-center justify-between">
                    <p className="text-sm text-foreground">Past events</p>
                    <p className="text-sm font-medium text-foreground">
                      {
                        events.filter(
                          (e: { status: string }) => e.status === "past"
                        ).length
                      }
                    </p>
                  </div>
                  <div className="px-6 py-5 flex items-center justify-between">
                    <p className="text-sm text-foreground">Total attendees</p>
                    <p className="text-sm font-medium text-foreground">
                      {events.reduce(
                        (sum: number, e: { attendees: number }) =>
                          sum + (e.attendees || 0),
                        0
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Posts breakdown */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-sidebar">
                  <h3 className="text-sm font-semibold text-foreground">
                    Content Overview
                  </h3>
                </div>
                <div className="divide-y divide-border">
                  <div className="px-6 py-5 flex items-center justify-between">
                    <p className="text-sm text-foreground">Blog posts</p>
                    <p className="text-sm font-medium text-foreground">
                      {blogPosts.length}
                    </p>
                  </div>
                  <div className="px-6 py-5 flex items-center justify-between">
                    <p className="text-sm text-foreground">Forum posts</p>
                    <p className="text-sm font-medium text-foreground">
                      {forumPosts.length}
                    </p>
                  </div>
                  <div className="px-6 py-5 flex items-center justify-between">
                    <p className="text-sm text-foreground">Total likes</p>
                    <p className="text-sm font-medium text-foreground">
                      {blogPosts.reduce(
                        (sum: number, p: { likes_count: number }) =>
                          sum + (p.likes_count || 0),
                        0
                      ) +
                        forumPosts.reduce(
                          (sum: number, p: { likes_count: number }) =>
                            sum + (p.likes_count || 0),
                          0
                        )}
                    </p>
                  </div>
                  <div className="px-6 py-5 flex items-center justify-between">
                    <p className="text-sm text-foreground">
                      Total forum replies
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {forumPosts.reduce(
                        (sum: number, p: { reply_count: number }) =>
                          sum + (p.reply_count || 0),
                        0
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
