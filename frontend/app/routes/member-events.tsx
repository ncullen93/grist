import { Link, useSearchParams } from "react-router";
import { redirect } from "react-router";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { PageHeader } from "~/components/page-header";
import { apiGet } from "~/lib/api.server";
import type { Route } from "./+types/member-events";

interface EventItem {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  date: string;
  time: string;
  type: string;
  status: string;
  image: string;
  spots: number | null;
  featured: boolean;
  attendees: number;
  rsvped: boolean;
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const tab = url.searchParams.get("tab") || "upcoming";

  try {
    let res: Response;
    if (tab === "rsvps") {
      res = await apiGet(request, "/api/events/my-rsvps/");
    } else {
      res = await apiGet(request, `/api/events/?status=${tab}`);
    }
    if (!res.ok) return redirect("/login");
    const data = await res.json();
    // my-rsvps returns an array, events list returns paginated results
    const results = Array.isArray(data) ? data : (data.results ?? data);
    return { events: results as EventItem[], tab };
  } catch {
    return redirect("/login");
  }
}

export default function MemberEventsPage({ loaderData }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "upcoming";
  const setActiveTab = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "upcoming") next.delete("tab");
    else next.set("tab", value);
    setSearchParams(next, { replace: true });
  };

  const { events } = loaderData;
  const featured = events.find((e) => e.featured && e.status === "upcoming");
  const nonFeatured = activeTab === "upcoming" ? events.filter((e) => !e.featured) : events;

  return (
    <>
      <PageHeader title="Events" />
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="rsvps">RSVPs</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Featured event */}
        {featured && activeTab === "upcoming" && (
          <Link
            to={`/m/events/${featured.id}`}
            className="group mt-8 block overflow-hidden rounded-xl border border-border"
          >
            <div className="aspect-21/9 overflow-hidden">
              <img
                src={featured.image}
                alt={featured.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="px-8 py-6">
              <div className="flex items-center gap-3">
                <span className="inline-flex rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                  Featured
                </span>
                <span className="text-xs text-muted-foreground">
                  {featured.type} &middot; {featured.date}
                </span>
              </div>
              <h2 className="mt-3 font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                {featured.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {featured.attendees} attending
                {featured.spots
                  ? ` · ${featured.spots - featured.attendees} spots left`
                  : ""}
              </p>
            </div>
          </Link>
        )}

        {/* Event grid */}
        <div className="mt-8">
          {nonFeatured.length === 0 ? (
            <div className="rounded-xl border border-border p-16 text-center">
              <p className="text-sm text-muted-foreground">
                {activeTab === "rsvps"
                  ? "You haven\u2019t RSVP\u2019d to any events yet."
                  : "No events to show."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {nonFeatured.map((event) => (
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
      </div>
    </>
  );
}
