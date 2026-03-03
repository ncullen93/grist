import { Link, useFetcher, useSearchParams } from "react-router";
import type { Route } from "./+types/admin-events";
import { apiGet, apiDelete } from "~/lib/api.server";
import { redirect } from "react-router";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { Plus, Pencil, Trash2, CalendarDays, Users } from "lucide-react";

export async function loader({ request }: Route.LoaderArgs) {
  const [meRes, eventsRes] = await Promise.all([
    apiGet(request, "/api/auth/me/"),
    apiGet(request, "/api/events/"),
  ]);

  if (!meRes.ok) return redirect("/login");
  const user = await meRes.json();
  if (!user.is_staff) return redirect("/m");

  const eventsData = await eventsRes.json();
  return { events: eventsData.results ?? eventsData };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete-event") {
    const eventId = formData.get("eventId") as string;
    await apiDelete(request, `/api/events/${eventId}/`);
    return { ok: true };
  }

  return { ok: false };
}

type EventItem = {
  id: number;
  title: string;
  date: string;
  type: string;
  status: string;
  attendees: number;
  image: string;
};

function EventRow({ event, onDelete }: { event: EventItem; onDelete: () => void }) {
  return (
    <div className="group flex items-start gap-5 px-6 py-5 transition-colors hover:bg-muted/30">
      <Link to={`/m/admin/events/${event.id}/edit`} className="shrink-0">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="size-20 rounded-lg object-cover"
          />
        ) : (
          <div className="flex size-20 items-center justify-center rounded-lg bg-muted">
            <CalendarDays className="size-6 text-muted-foreground/50" />
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link to={`/m/admin/events/${event.id}/edit`}>
          <p className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            {event.title}
          </p>
        </Link>
        <div className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
          <span>{event.date}</span>
          <span className="text-border">&middot;</span>
          <span>{event.type}</span>
          <span className="text-border">&middot;</span>
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
              event.status === "upcoming"
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {event.status}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="size-3.5" />
          <span>
            {event.attendees} {event.attendees === 1 ? "attendee" : "attendees"}
          </span>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-3 pt-1">
        <Link
          to={`/m/admin/events/${event.id}/edit`}
          className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          title="Edit"
        >
          <Pencil className="size-3.5" />
        </Link>
        <button
          onClick={onDelete}
          className="inline-flex items-center text-destructive/70 hover:text-destructive transition-colors cursor-pointer"
          title="Delete"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function EventList({ events, handleDelete }: { events: EventItem[]; handleDelete: (id: number, title: string) => void }) {
  if (events.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-border p-16 text-center">
        <p className="text-sm text-muted-foreground">No events found.</p>
      </div>
    );
  }
  return (
    <div className="mt-6 rounded-xl border border-border divide-y divide-border">
      {events.map((event) => (
        <EventRow
          key={event.id}
          event={event}
          onDelete={() => handleDelete(event.id, event.title)}
        />
      ))}
    </div>
  );
}

export default function AdminEventsPage({ loaderData }: Route.ComponentProps) {
  const { events } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "all";
  const setActiveTab = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "all") next.delete("tab");
    else next.set("tab", value);
    setSearchParams(next, { replace: true });
  };
  const fetcher = useFetcher();

  const handleDelete = (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    fetcher.submit(
      { intent: "delete-event", eventId: String(id) },
      { method: "post" }
    );
  };

  const upcoming = events.filter((e: EventItem) => e.status === "upcoming");
  const past = events.filter((e: EventItem) => e.status === "past");

  return (
    <>
      <header className="px-4 md:px-8 h-18 flex items-center bg-background shrink-0 border-b border-border sticky top-0 z-10">
        <nav className="flex items-center gap-1.5 text-sm">
          <Link to="/m/admin" className="font-medium text-muted-foreground hover:text-foreground transition-colors">
            Admin
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <span className="font-semibold text-foreground">Events</span>
        </nav>
      </header>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All ({events.length})</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
              <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
            </TabsList>
            <Link to="/m/admin/events/new">
              <Button className="rounded-full gap-2">
                <Plus className="size-4" />
                Create Event
              </Button>
            </Link>
          </div>

          <TabsContent value="all">
            <EventList events={events} handleDelete={handleDelete} />
          </TabsContent>
          <TabsContent value="upcoming">
            <EventList events={upcoming} handleDelete={handleDelete} />
          </TabsContent>
          <TabsContent value="past">
            <EventList events={past} handleDelete={handleDelete} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
