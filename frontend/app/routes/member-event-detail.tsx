import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { getEventById, allMembers } from "~/lib/demo-data";
import type { Route } from "./+types/member-event-detail";

export function loader({ params }: Route.LoaderArgs) {
  const event = getEventById(Number(params.id));
  if (!event) {
    throw new Response("Event not found", { status: 404 });
  }
  return { event };
}

export default function MemberEventDetailPage({
  loaderData,
}: Route.ComponentProps) {
  const [event, setEvent] = useState(loaderData.event);

  const toggleRsvp = () => {
    setEvent((prev) => ({
      ...prev,
      rsvped: !prev.rsvped,
      attendees: prev.rsvped ? prev.attendees - 1 : prev.attendees + 1,
    }));
  };

  return (
    <>
      <header className="px-4 md:px-8 h-18 flex items-center bg-background shrink-0 border-b border-border sticky top-0 z-10">
        <Link
          to="/m/events"
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Events
        </Link>
      </header>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 pb-36">
        {/* Event info */}
        <div className="flex items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                {event.type}
              </span>
              {event.status === "past" && (
                <span className="inline-flex rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  Past event
                </span>
              )}
            </div>

            <h1 className="mt-4 font-display text-3xl md:text-4xl font-medium tracking-tight text-foreground">
              {event.title}
            </h1>

            <p className="mt-3 text-sm text-muted-foreground">
              {event.subtitle && (
                <>
                  <span className="font-medium text-foreground">{event.subtitle}</span>
                  {" · "}
                </>
              )}
              {event.date} · {event.time}
            </p>
          </div>

          {event.status === "upcoming" && (
            <Button
              variant={event.rsvped ? "outline" : "default"}
              className="rounded-full px-8 shrink-0"
              onClick={toggleRsvp}
            >
              {event.rsvped ? "Cancel RSVP" : "RSVP"}
            </Button>
          )}
        </div>

        {/* Hero image */}
        <div className="mt-8 overflow-hidden rounded-xl">
          <img
            src={event.image.replace(/w=\d+&h=\d+/, "w=900&h=500")}
            alt={event.title}
            className="aspect-video w-full object-cover"
          />
        </div>

        {/* Details bar */}
        <div className="mt-12 grid grid-cols-3 gap-8 rounded-xl bg-[#e8ece5] p-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Date
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {event.date}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Time
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {event.time}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Attendees
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {event.attendees}
              {event.spots ? ` / ${event.spots}` : ""}
            </p>
          </div>
        </div>

        {/* Speaker */}
        {event.speaker && (
          <div className="mt-12">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Speaker
            </p>
            <div className="mt-4">
              <p className="text-base font-medium text-foreground">
                {event.speaker.name}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {event.speaker.role}
              </p>
            </div>
          </div>
        )}

        {/* Full description */}
        <div className="mt-12 space-y-6">
          {event.longDescription.map((paragraph, i) => (
            <p
              key={i}
              className="text-[15px] leading-relaxed text-muted-foreground"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Agenda */}
        {event.agenda && event.agenda.length > 0 && (
          <div className="mt-12">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Schedule
            </p>
            <div className="mt-6">
              {event.agenda.map((item, i) => (
                <div
                  key={i}
                  className="flex gap-6 border-t border-border py-5 last:border-b"
                >
                  <p className="w-36 shrink-0 text-sm font-medium text-muted-foreground">
                    {item.time}
                  </p>
                  <p className="text-sm text-foreground">{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attendees */}
        {(() => {
          const attendeeMembers = allMembers.slice(
            0,
            Math.min(event.attendees, allMembers.length),
          );
          const remaining = event.attendees - attendeeMembers.length;
          return (
            <div className="mt-12">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                {event.status === "past" ? "Who Attended" : "Who\u2019s Going"}
              </h2>
              <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex -space-x-3">
                    {attendeeMembers.map((member) => (
                      <Link
                        key={member.slug}
                        to={`/m/members/${member.slug}`}
                        className="relative hover:z-10 transition-transform hover:scale-110"
                      >
                        <img
                          src={member.photo}
                          alt={member.name}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-background"
                        />
                      </Link>
                    ))}
                  </div>
                  {remaining > 0 && (
                    <span className="ml-3 text-sm text-muted-foreground">
                      +{remaining} others
                    </span>
                  )}
                </div>
                {event.status === "upcoming" && (
                  <Button
                    variant={event.rsvped ? "outline" : "default"}
                    className="rounded-full px-8 shrink-0"
                    onClick={toggleRsvp}
                  >
                    {event.rsvped ? "Cancel RSVP" : "RSVP"}
                  </Button>
                )}
              </div>
            </div>
          );
        })()}

      </div>
    </>
  );
}
