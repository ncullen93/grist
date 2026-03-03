import { useState } from "react";
import { Link, useLoaderData } from "react-router";
import { Button } from "~/components/ui/button";
import { getEventById } from "~/lib/demo-data";
import type { Route } from "./+types/event-detail-demo";

export function loader({ params }: Route.LoaderArgs) {
  const event = getEventById(Number(params.id));
  if (!event) {
    throw new Response("Event not found", { status: 404 });
  }
  return { event };
}

export default function EventDetailDemoPage() {
  const { event: initialEvent } = useLoaderData<typeof loader>();
  const [event, setEvent] = useState(initialEvent);

  const toggleRsvp = () => {
    setEvent((prev) => ({
      ...prev,
      rsvped: !prev.rsvped,
      attendees: prev.rsvped ? prev.attendees - 1 : prev.attendees + 1,
    }));
  };

  return (
    <>
      {/* Back link */}
      <section className="px-8 pt-8 lg:px-10">
        <Link
          to="/events/demo"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-gray-600"
        >
          <svg viewBox="0 0 20 20" className="size-4 fill-current">
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
              clipRule="evenodd"
            />
          </svg>
          Back to events
        </Link>
      </section>

      {/* Event header */}
      <section className="px-8 pt-12 pb-0 lg:px-10">
        <div className="grid grid-cols-1 items-end gap-12 lg:grid-cols-[1fr_400px]">
          {/* Info */}
          <div className="pb-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {event.type}
              </span>
              {event.status === "past" && (
                <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-400">
                  Past event
                </span>
              )}
            </div>

            <h1 className="mt-5 font-display text-4xl font-medium tracking-tight text-gray-900 sm:text-5xl">
              {event.title}
            </h1>

            {event.subtitle && (
              <p className="mt-3 text-lg text-gray-400">{event.subtitle}</p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 20 20" className="size-4 fill-gray-300">
                  <path
                    fillRule="evenodd"
                    d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm font-medium text-gray-700">
                  {event.date}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 20 20" className="size-4 fill-gray-300">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-gray-500">{event.time}</p>
              </div>
              <p className="text-sm text-gray-400">
                {event.attendees}
                {event.spots
                  ? ` of ${event.spots} spots filled`
                  : " attending"}
              </p>
            </div>

            <p className="mt-8 max-w-lg text-[15px] leading-relaxed text-gray-600">
              {event.description}
            </p>

            {event.status === "upcoming" && (
              <div className="mt-8 flex gap-3">
                <Button
                  variant={event.rsvped ? "outline" : "default"}
                  className="rounded-full px-8"
                  onClick={toggleRsvp}
                >
                  {event.rsvped ? "Cancel RSVP" : "RSVP"}
                </Button>
              </div>
            )}
          </div>

          {/* Photo */}
          <div className="overflow-hidden rounded-xl">
            <img
              src={event.image.replace(/w=\d+&h=\d+/, "w=800&h=1000")}
              alt={event.title}
              className="aspect-4/5 w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Details bar */}
      <section className="mt-16 bg-[#e8ece5] px-8 py-16 lg:px-10">
        <div className="grid grid-cols-2 gap-12 sm:grid-cols-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Date
            </p>
            <p className="mt-2 text-sm font-medium text-gray-900">
              {event.date}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Time
            </p>
            <p className="mt-2 text-sm font-medium text-gray-900">
              {event.time}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Format
            </p>
            <p className="mt-2 text-sm font-medium text-gray-900">
              {event.type}
            </p>
          </div>
          {event.speaker ? (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Speaker
              </p>
              <p className="mt-2 text-sm font-medium text-gray-900">
                {event.speaker.name}
              </p>
              <p className="text-xs text-gray-500">{event.speaker.role}</p>
            </div>
          ) : (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Attendees
              </p>
              <p className="mt-2 text-sm font-medium text-gray-900">
                {event.attendees}
                {event.spots ? ` / ${event.spots}` : ""}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Full description + agenda */}
      <section className="px-8 py-24 lg:px-10">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-2">
          <div className="lg:sticky lg:top-28">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              {event.agenda ? "About & schedule" : "About this event"}
            </p>
            <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">
              {event.title}
            </h2>

            {event.status === "past" && event.rsvped && (
              <p className="mt-4 text-sm text-primary">
                You attended this event
              </p>
            )}
          </div>

          <div>
            <div className="space-y-6">
              {event.longDescription.map((paragraph, i) => (
                <p
                  key={i}
                  className="text-[15px] leading-relaxed text-gray-600"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Agenda */}
            {event.agenda && event.agenda.length > 0 && (
              <div className="mt-16">
                <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                  Schedule
                </p>
                <div className="mt-6">
                  {event.agenda.map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-6 border-t border-gray-100 py-5 last:border-b"
                    >
                      <p className="w-36 shrink-0 text-sm font-medium text-gray-400">
                        {item.time}
                      </p>
                      <p className="text-sm text-gray-900">{item.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Secondary image */}
            <img
              src={event.image.replace(/w=\d+&h=\d+/, "w=800&h=500")}
              alt={event.title}
              className="mt-12 aspect-3/2 w-full rounded-md object-cover"
            />
          </div>
        </div>
      </section>
    </>
  );
}
