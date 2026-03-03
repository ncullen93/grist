import type { Route } from "./+types/events";
import { MembersOnlyGate } from "~/components/members-only-gate";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Events - Grist Club" },
    {
      name: "description",
      content:
        "Upcoming events for Grist Club members. Meetups, workshops, retreats, and more.",
    },
  ];
}

function SkeletonLine({ width = "w-full" }: { width?: string }) {
  return <div className={`h-3 rounded ${width} bg-gray-200`} />;
}

function SkeletonEventCard({ featured = false }: { featured?: boolean }) {
  if (featured) {
    return (
      <div className="grid grid-cols-1 gap-6 rounded-xl border border-gray-100 bg-white p-6 sm:grid-cols-2">
        <div className="aspect-video rounded-lg bg-gray-100" />
        <div className="flex flex-col justify-center space-y-3">
          <div className="h-5 w-20 rounded-full bg-primary/10" />
          <SkeletonLine width="w-3/4" />
          <SkeletonLine width="w-full" />
          <SkeletonLine width="w-2/3" />
          <div className="flex items-center gap-4 pt-2">
            <div className="h-3 w-24 rounded bg-gray-100" />
            <div className="h-3 w-20 rounded bg-gray-100" />
          </div>
          <div className="pt-2">
            <div className="h-9 w-24 rounded-full bg-gray-900" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <div className="aspect-video rounded-lg bg-gray-100" />
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 rounded-full bg-primary/10" />
          <div className="h-3 w-20 rounded bg-gray-100" />
        </div>
        <SkeletonLine width="w-3/4" />
        <SkeletonLine />
        <SkeletonLine width="w-2/3" />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex -space-x-1.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="size-6 rounded-full border-2 border-white bg-gray-200"
            />
          ))}
        </div>
        <div className="h-3 w-16 rounded bg-gray-100" />
      </div>
    </div>
  );
}

function EventsSkeleton() {
  return (
    <section className="px-8 py-12 lg:px-10">
      <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
        Events
      </p>
      <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">
        Upcoming Events
      </h2>

      {/* Tabs */}
      <div className="mt-10 flex gap-6 border-b border-gray-100">
        {["Upcoming", "Past", "My RSVPs"].map((tab, i) => (
          <button
            key={tab}
            className={`pb-3 text-sm font-medium ${i === 0 ? "border-b-2 border-gray-900 text-gray-900" : "text-gray-400"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Featured event */}
      <div className="mt-8">
        <SkeletonEventCard featured />
      </div>

      {/* Event grid */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SkeletonEventCard />
        <SkeletonEventCard />
        <SkeletonEventCard />
        <SkeletonEventCard />
        <SkeletonEventCard />
        <SkeletonEventCard />
      </div>

      {/* Calendar preview */}
      <div className="mt-12 rounded-xl border border-gray-100 bg-white p-6">
        <div className="flex items-center justify-between">
          <SkeletonLine width="w-32" />
          <div className="flex gap-2">
            <div className="size-8 rounded-lg bg-gray-100" />
            <div className="size-8 rounded-lg bg-gray-100" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div
              key={i}
              className="py-2 text-center text-xs font-medium text-gray-400"
            >
              {d}
            </div>
          ))}
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className={`flex aspect-square items-center justify-center rounded-lg text-xs text-gray-300 ${i === 14 || i === 22 ? "bg-primary/10 font-medium text-primary" : ""}`}
            >
              {((i + 27) % 31) + 1}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function EventsPage() {
  return (
    <MembersOnlyGate demoPath="/events/demo">
      <EventsSkeleton />
    </MembersOnlyGate>
  );
}
