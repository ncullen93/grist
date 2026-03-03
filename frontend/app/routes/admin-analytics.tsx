import { Link } from "react-router";
import type { Route } from "./+types/admin-analytics";
import { apiGet } from "~/lib/api.server";
import { redirect } from "react-router";
import { PageHeader } from "~/components/page-header";
import { ArrowLeft } from "lucide-react";

export async function loader({ request }: Route.LoaderArgs) {
  const [meRes, analyticsRes] = await Promise.all([
    apiGet(request, "/api/auth/me/"),
    apiGet(request, "/api/admin/analytics/"),
  ]);

  if (!meRes.ok) return redirect("/login");
  const user = await meRes.json();
  if (!user.is_staff) return redirect("/m");

  const analytics = analyticsRes.ok ? await analyticsRes.json() : null;
  return { analytics };
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-border p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function OverviewSection({ title, rows }: { title: string; rows: { label: string; value: number | string }[] }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-sidebar">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="divide-y divide-border">
        {rows.map((row) => (
          <div key={row.label} className="px-6 py-5 flex items-center justify-between">
            <p className="text-sm text-foreground">{row.label}</p>
            <p className="text-sm font-medium text-foreground">{row.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage({ loaderData }: Route.ComponentProps) {
  const { analytics } = loaderData;

  if (!analytics) {
    return (
      <>
        <PageHeader title="Analytics" />
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
          <Link
            to="/m/admin"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Admin
          </Link>
          <div className="rounded-lg border border-border p-16 text-center">
            <p className="text-sm text-muted-foreground">Could not load analytics data.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Analytics" />
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <Link
          to="/m/admin"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Admin
        </Link>

        <div className="space-y-8">
          {/* Top stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Members" value={analytics.members?.total ?? 0} />
            <StatCard label="Events" value={analytics.events?.total ?? 0} />
            <StatCard label="Blog Posts" value={analytics.blog?.total ?? 0} />
            <StatCard label="Forum Posts" value={analytics.forum?.posts ?? 0} />
          </div>

          {/* Events Overview */}
          <OverviewSection
            title="Events Overview"
            rows={[
              { label: "Upcoming events", value: analytics.events?.upcoming ?? 0 },
              { label: "Past events", value: analytics.events?.past ?? 0 },
              { label: "Total RSVPs", value: analytics.events?.total_rsvps ?? 0 },
              { label: "Avg attendees per event", value: analytics.events?.avg_attendees ?? 0 },
            ]}
          />

          {/* Content Overview */}
          <OverviewSection
            title="Content Overview"
            rows={[
              { label: "Blog posts (published)", value: analytics.blog?.published ?? 0 },
              { label: "Blog posts (drafts)", value: analytics.blog?.drafts ?? 0 },
              { label: "Forum posts", value: analytics.forum?.posts ?? 0 },
              { label: "Total blog likes", value: analytics.blog?.total_likes ?? 0 },
              { label: "Total blog comments", value: analytics.blog?.total_comments ?? 0 },
              { label: "Total forum likes", value: analytics.forum?.total_likes ?? 0 },
              { label: "Total forum replies", value: analytics.forum?.total_replies ?? 0 },
            ]}
          />

          {/* Marketplace Overview */}
          <OverviewSection
            title="Marketplace Overview"
            rows={[
              { label: "Total listings", value: analytics.marketplace?.total ?? 0 },
              { label: "For Sale", value: analytics.marketplace?.for_sale ?? 0 },
              { label: "Wanted", value: analytics.marketplace?.wanted ?? 0 },
              { label: "Free", value: analytics.marketplace?.free ?? 0 },
            ]}
          />

          {/* Invitations */}
          <OverviewSection
            title="Invitations"
            rows={[
              { label: "Total sent", value: analytics.invitations?.total ?? 0 },
              { label: "Used", value: analytics.invitations?.used ?? 0 },
            ]}
          />
        </div>
      </div>
    </>
  );
}
