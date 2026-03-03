import { Button } from "~/components/ui/button";

function VerifyMockup() {
  return (
    <div className="w-full space-y-2.5">
      {/* Address input */}
      <div className="rounded-xl bg-white/80 p-4 shadow-sm backdrop-blur">
        <p className="text-[9px] font-medium text-gray-400">Your address</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2">
            <p className="text-[9px] text-gray-900">
              42 Elm St, Brewster, MA
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-gray-900 px-3 py-1.5 text-[8px] font-medium text-white">
            Verify
          </span>
        </div>
      </div>
      {/* Result */}
      <div className="rounded-xl bg-white/80 p-4 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-full bg-gray-900/10">
            <svg viewBox="0 0 20 20" className="size-4 fill-gray-700">
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-900">
              Listed on NRHP
            </p>
            <p className="text-[8px] text-gray-400">
              Built 1847 &middot; Cape Cod
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DirectoryMockup() {
  return (
    <div className="w-full space-y-2.5">
      {/* Search */}
      <div className="rounded-xl bg-white/80 p-4 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
          <svg viewBox="0 0 20 20" className="size-3.5 shrink-0 fill-gray-300">
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-[9px] text-gray-300">Search members...</p>
        </div>
      </div>
      {/* Members */}
      <div className="rounded-xl bg-white/80 p-4 shadow-sm backdrop-blur">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <img
              src="https://images.unsplash.com/photo-1757992141434-983a12b82da3?w=48&h=48&fit=crop&crop=center"
              alt="Historic home"
              className="size-6 shrink-0 rounded-full object-cover ring-1 ring-white"
            />
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-gray-900">
                Sarah M.
              </p>
              <p className="text-[8px] text-gray-400">
                1892 Queen Anne &middot; Salem, MA
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <img
              src="https://images.unsplash.com/photo-1519227355453-8f982e425321?w=48&h=48&fit=crop&crop=center"
              alt="Historic home"
              className="size-6 shrink-0 rounded-full object-cover ring-1 ring-white"
            />
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-gray-900">
                James R.
              </p>
              <p className="text-[8px] text-gray-400">
                1847 Cape Cod &middot; Brewster, MA
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <img
              src="https://images.unsplash.com/photo-1525883405167-fc4e76c7713a?w=48&h=48&fit=crop&crop=center"
              alt="Historic home"
              className="size-6 shrink-0 rounded-full object-cover ring-1 ring-white"
            />
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-gray-900">
                Meg T.
              </p>
              <p className="text-[8px] text-gray-400">
                1910 Foursquare &middot; Portland, ME
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ForumMockup() {
  return (
    <div className="w-full rounded-xl bg-white/80 p-5 shadow-sm backdrop-blur">
      <div className="space-y-3">
        <div className="flex items-start gap-2.5">
          <img
            src="https://images.unsplash.com/photo-1519227355453-8f982e425321?w=48&h=48&fit=crop&crop=center"
            alt="Historic home"
            className="size-6 shrink-0 rounded-full object-cover ring-1 ring-white"
          />
          <div className="min-w-0 rounded-lg bg-zinc-100 px-3 py-2">
            <p className="text-[9px] leading-relaxed text-gray-700">
              Anyone dealt with knob-and-tube in
              plaster walls? Not sure if I need to
              rewire the whole house.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <img
            src="https://images.unsplash.com/photo-1525883405167-fc4e76c7713a?w=48&h=48&fit=crop&crop=center"
            alt="Historic home"
            className="size-6 shrink-0 rounded-full object-cover ring-1 ring-white"
          />
          <div className="min-w-0 rounded-lg bg-zinc-100 px-3 py-2">
            <p className="text-[9px] leading-relaxed text-gray-700">
              We kept ours in the walls that were
              sound. Happy to share the electrician
              we used &mdash; he specializes in old homes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventMockup() {
  return (
    <div className="w-full space-y-2.5">
      {/* Event card */}
      <div className="overflow-hidden rounded-xl bg-white/80 shadow-sm backdrop-blur">
        <img
          src="https://images.unsplash.com/photo-1745944727434-c6f56248b083?w=400&h=200&fit=crop&crop=center"
          alt="Historic neighborhood"
          className="aspect-video w-full object-cover"
        />
        <div className="p-4">
          <p className="text-[10px] font-semibold text-gray-900">
            New England Retreat
          </p>
          <p className="mt-0.5 text-[8px] text-gray-400">
            Oct 11&ndash;13 &middot; Litchfield, CT
          </p>
        </div>
      </div>
      {/* Attendees */}
      <div className="flex items-center justify-between rounded-xl bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
        <div className="flex -space-x-2">
          <img
            src="https://images.unsplash.com/photo-1757992141434-983a12b82da3?w=56&h=56&fit=crop&crop=center"
            alt="Historic home"
            className="size-6 rounded-full object-cover ring-2 ring-white"
          />
          <img
            src="https://images.unsplash.com/photo-1519227355453-8f982e425321?w=56&h=56&fit=crop&crop=center"
            alt="Historic home"
            className="size-6 rounded-full object-cover ring-2 ring-white"
          />
          <img
            src="https://images.unsplash.com/photo-1525883405167-fc4e76c7713a?w=56&h=56&fit=crop&crop=center"
            alt="Historic home"
            className="size-6 rounded-full object-cover ring-2 ring-white"
          />
        </div>
        <span className="rounded-full bg-gray-900 px-3 py-1 text-[8px] font-medium text-white">
          RSVP
        </span>
      </div>
    </div>
  );
}

const ways = [
  {
    title: "Verify Your Home",
    description:
      "Enter your address and we'll check it against state and national historic registers. Most verifications take minutes.",
    bg: "bg-linear-to-br from-[#e8ece5] to-[#dce3d8]",
    illustration: <VerifyMockup />,
  },
  {
    title: "Find Your People",
    description:
      "Browse a directory of verified owners — searchable by era, style, region, and what they're working on.",
    bg: "bg-linear-to-br from-[#e8e5ec] to-[#dbd6e2]",
    illustration: <DirectoryMockup />,
  },
  {
    title: "Ask & Answer",
    description:
      "Post a question and get real advice from people who've been through it — not internet strangers guessing.",
    bg: "bg-linear-to-br from-[#ece9e3] to-[#e2ddd5]",
    illustration: <ForumMockup />,
  },
  {
    title: "Gather Together",
    description:
      "Monthly video calls, local meetups, and an annual retreat with home tours, workshops, and good company.",
    bg: "bg-linear-to-br from-[#e5eaec] to-[#d6dde0]",
    illustration: <EventMockup />,
  },
];

export function GetInvolved() {
  return (
    <section className="px-8 py-24 lg:px-10">
      <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
        How it works
      </p>
      <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">
        From verified to connected in minutes
      </h2>

      <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ways.map((way) => (
          <div key={way.title}>
            <div
              className={`flex aspect-3/4 items-center justify-center overflow-hidden rounded-md px-4 ${way.bg}`}
            >
              {way.illustration}
            </div>
            <h3 className="mt-5 font-display text-lg font-semibold text-gray-900">
              {way.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-600">
              {way.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <Button size="lg" className="rounded-full">
          Become a founding member
        </Button>
      </div>
    </section>
  );
}
