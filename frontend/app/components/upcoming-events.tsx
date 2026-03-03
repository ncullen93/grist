import { Button } from "~/components/ui/button";

const events = [
  {
    title: "Member Meetups",
    description:
      "A relaxed video call to connect with other members. Local meetups welcome too.",
    date: "Monthly",
    image:
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600&h=800&fit=crop&crop=faces",
  },
  {
    title: "Expert Q&A Sessions",
    description:
      "Ask anything — renovations, funding, permits, finding craftspeople. Learn from the group.",
    date: "Quarterly",
    image:
      "https://images.unsplash.com/photo-1497219055242-93359eeed651?w=600&h=800&fit=crop&crop=center",
  },
  {
    title: "Members Retreat",
    description:
      "A weekend together in person — home tours, workshops, and good company in a historic town.",
    date: "Yearly",
    image:
      "https://images.unsplash.com/photo-1750387354103-7c932c3c5a01?w=600&h=800&fit=crop&crop=center",
  },
  {
    title: "Home Profiles",
    description:
      "A spotlight on a member's home — its history, the work they've done, and what makes it special.",
    date: "Ongoing",
    image:
      "https://images.unsplash.com/photo-1757992141434-983a12b82da3?w=600&h=800&fit=crop&crop=center",
  },
];

export function UpcomingEvents() {
  return (
    <section className="px-8 py-24 lg:px-10">
      <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
        Events
      </p>
      <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">
        Get to know your fellow members
      </h2>

      <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {events.map((event) => (
          <div key={event.title}>
            <div className="aspect-3/4 overflow-hidden rounded-md">
              <img
                src={event.image}
                alt={event.title}
                className="size-full object-cover"
              />
            </div>
            <p className="mt-4 text-xs font-medium text-primary">
              {event.date}
            </p>
            <h3 className="mt-1 font-display text-lg font-semibold text-gray-900">
              {event.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-600">
              {event.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <Button size="lg" className="rounded-full">
          Get notified about events
        </Button>
      </div>
    </section>
  );
}
