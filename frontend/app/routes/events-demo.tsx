import { useState } from "react";
import { Link, useLoaderData } from "react-router";
import { Button } from "~/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { allEvents } from "~/lib/demo-data";
import type { DemoEvent } from "~/lib/demo-data";

export function loader() {
  return { events: allEvents };
}

const calendarEvents = [14, 22];
const calendarRetreat = [18, 19, 20];

export default function EventsDemoPage() {
  const { events: initialEvents } = useLoaderData<typeof loader>();
  const [events, setEvents] = useState<DemoEvent[]>(initialEvents);
  const [activeTab, setActiveTab] = useState("upcoming");

  const featured = events.find((e) => e.featured && e.status === "upcoming");

  const displayEvents = events.filter((e) => {
    if (activeTab === "rsvps") return e.rsvped;
    return e.status === activeTab;
  });

  const nonFeatured = displayEvents.filter((e) => !e.featured);

  const toggleRsvp = (id: number) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              rsvped: !e.rsvped,
              attendees: e.rsvped ? e.attendees - 1 : e.attendees + 1,
            }
          : e,
      ),
    );
  };

  return (
    <>
      {/* Header */}
      <section className="px-8 py-12 lg:px-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          Events
        </p>
        <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">
          Upcoming Events
        </h2>
      </section>

      {/* Tabs */}
      <section className="px-8 lg:px-10">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="rsvps">My RSVPs</TabsTrigger>
          </TabsList>
        </Tabs>
      </section>

      {/* Featured event */}
      {featured && activeTab === "upcoming" && (
        <section className="px-8 py-16 lg:px-10">
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <Link
                to={`/events/demo/${featured.id}`}
                className="aspect-video overflow-hidden lg:aspect-auto"
              >
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </Link>
              <div className="flex flex-col justify-center p-8 lg:p-12">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Featured &middot; In Person
                </p>
                <Link to={`/events/demo/${featured.id}`}>
                  <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight text-gray-900 transition-colors hover:text-primary sm:text-3xl">
                    {featured.title}
                  </h2>
                </Link>
                <p className="mt-1 text-sm text-gray-400">
                  {featured.subtitle} &middot; {featured.date}
                </p>
                <p className="mt-5 text-[13px] leading-relaxed text-gray-600">
                  {featured.description}
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[
                      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=48&h=48&fit=crop&crop=center",
                      "https://images.unsplash.com/photo-1525883405167-fc4e76c7713a?w=48&h=48&fit=crop&crop=center",
                      "https://images.unsplash.com/photo-1757992141434-983a12b82da3?w=48&h=48&fit=crop&crop=center",
                      "https://images.unsplash.com/photo-1519227355453-8f982e425321?w=48&h=48&fit=crop&crop=center",
                    ].map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt=""
                        className="size-7 rounded-full object-cover ring-2 ring-white"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    {featured.attendees} of {featured.spots} spots filled
                  </p>
                </div>
                <div className="mt-8 flex gap-3">
                  <Button
                    size="lg"
                    variant={featured.rsvped ? "outline" : "default"}
                    className="rounded-full"
                    onClick={() => toggleRsvp(featured.id)}
                  >
                    {featured.rsvped ? "Cancel RSVP" : "RSVP"}
                  </Button>
                  <Button
                    size="lg"
                    variant="ghost"
                    className="rounded-full"
                    asChild
                  >
                    <Link to={`/events/demo/${featured.id}`}>
                      Learn more
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Event grid */}
      <section className="px-8 pb-8 lg:px-10">
        {activeTab === "upcoming" && (
          <>
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              More events
            </p>
            <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">
              Coming up
            </h2>
          </>
        )}
        {activeTab === "past" && (
          <>
            <p className="mt-16 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Archive
            </p>
            <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">
              Past events
            </h2>
          </>
        )}
        {activeTab === "rsvps" && (
          <>
            <p className="mt-16 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Your events
            </p>
            <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">
              My RSVPs
            </h2>
          </>
        )}

        {nonFeatured.length === 0 ? (
          <div className="mt-16 rounded-xl border border-gray-100 bg-white p-16 text-center">
            <p className="text-sm text-gray-400">
              {activeTab === "rsvps"
                ? "You haven\u2019t RSVP\u2019d to any events yet."
                : "No events to show."}
            </p>
          </div>
        ) : (
          <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {nonFeatured.map((event) => (
              <div key={event.id}>
                <Link
                  to={`/events/demo/${event.id}`}
                  className="group block"
                >
                  <div className="aspect-3/4 overflow-hidden rounded-md bg-gray-100">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-xs font-medium text-primary">
                      {event.date}
                    </span>
                    <span className="text-xs text-gray-300">&middot;</span>
                    <span className="text-xs text-gray-400">{event.time}</span>
                  </div>
                  <h3 className="mt-1 font-display text-lg font-semibold text-gray-900 transition-colors group-hover:text-primary">
                    {event.title}
                  </h3>
                </Link>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-600">
                  {event.description}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="size-5 rounded-full border-2 border-[#faf9f6] bg-gray-200"
                        />
                      ))}
                    </div>
                    <p className="text-[11px] text-gray-400">
                      {event.attendees} attending
                    </p>
                  </div>
                  {event.status === "upcoming" && (
                    <button
                      onClick={() => toggleRsvp(event.id)}
                      className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                        event.rsvped
                          ? "bg-primary/10 text-primary"
                          : "bg-gray-900 text-white hover:bg-gray-800"
                      }`}
                    >
                      {event.rsvped ? "Going" : "RSVP"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Calendar */}
      <section className="px-8 py-24 lg:px-10">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-2">
          <div className="lg:sticky lg:top-28">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Calendar
            </p>
            <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">
              March 2026
            </h2>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-gray-500">
              Most events are virtual and open to all members. In-person
              gatherings are highlighted on the calendar.
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-8">
            <div className="grid grid-cols-7 gap-1">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <div
                  key={i}
                  className="py-3 text-center text-xs font-medium text-gray-400"
                >
                  {d}
                </div>
              ))}
              {Array.from({ length: 35 }).map((_, i) => {
                const day = i + 1;
                const inMonth = day <= 31;
                const display = inMonth ? day : day - 31;
                const isEvent = inMonth && calendarEvents.includes(day);
                const isRetreat = inMonth && calendarRetreat.includes(day);

                return (
                  <div
                    key={i}
                    className={`flex aspect-square items-center justify-center rounded-lg text-sm ${
                      isRetreat
                        ? "bg-primary font-semibold text-white"
                        : isEvent
                          ? "bg-primary/10 font-medium text-primary"
                          : inMonth
                            ? "text-gray-500"
                            : "text-gray-200"
                    }`}
                  >
                    {display}
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex items-center gap-6 border-t border-gray-50 pt-6">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded bg-primary/10" />
                <span className="text-xs text-gray-400">Virtual event</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 rounded bg-primary" />
                <span className="text-xs text-gray-400">
                  In-person retreat
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
