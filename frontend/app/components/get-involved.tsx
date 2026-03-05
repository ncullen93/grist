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

function BlogMockup() {
  return (
    <div className="w-full space-y-2.5">
      {/* Featured post */}
      <div className="overflow-hidden rounded-xl bg-white/80 shadow-sm backdrop-blur">
        <img
          src="/mockups/blog-hero.jpg"
          alt="Historic home interior"
          className="aspect-2/1 w-full object-cover"
        />
        <div className="p-4">
          <p className="text-[8px] font-medium uppercase tracking-wide text-gray-400">
            Restoration
          </p>
          <p className="mt-1 text-[10px] font-semibold leading-snug text-gray-900">
            How We Saved Our 1870s Plaster Ceilings
          </p>
        </div>
      </div>
      {/* Post list */}
      <div className="rounded-xl bg-white/80 p-4 shadow-sm backdrop-blur">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="size-1.5 shrink-0 rounded-full bg-gray-900" />
            <p className="text-[9px] text-gray-700">
              Before &amp; After: Our Kitchen Revival
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="size-1.5 shrink-0 rounded-full bg-gray-900" />
            <p className="text-[9px] text-gray-700">
              Living with Lead Paint: A Practical Guide
            </p>
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
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-700 ring-1 ring-white">
            <span className="text-[7px] font-semibold text-white">JR</span>
          </div>
          <div className="min-w-0 rounded-lg bg-zinc-100 px-3 py-2">
            <p className="text-[9px] leading-relaxed text-gray-700">
              Anyone dealt with knob-and-tube in
              plaster walls? Not sure if I need to
              rewire the whole house.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-700 ring-1 ring-white">
            <span className="text-[7px] font-semibold text-white">MT</span>
          </div>
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

function MarketplaceMockup() {
  return (
    <div className="w-full space-y-2.5">
      {/* Listing */}
      <div className="overflow-hidden rounded-xl bg-white/80 shadow-sm backdrop-blur">
        <img
          src="/mockups/marketplace-hero.jpg"
          alt="Salvaged door hardware"
          className="aspect-2/1 w-full object-cover"
        />
        <div className="flex items-center justify-between p-4">
          <div>
            <p className="text-[10px] font-semibold text-gray-900">
              Victorian Door Hardware Set
            </p>
            <p className="mt-0.5 text-[8px] text-gray-400">
              Original brass &middot; c. 1890
            </p>
          </div>
          <span className="text-[10px] font-semibold text-gray-900">$120</span>
        </div>
      </div>
      {/* More listings */}
      <div className="rounded-xl bg-white/80 p-4 shadow-sm backdrop-blur">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-6 shrink-0 rounded-md bg-gray-200" />
              <p className="text-[9px] text-gray-700">Reclaimed heart pine</p>
            </div>
            <span className="text-[9px] font-medium text-gray-900">$8/ft</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-6 shrink-0 rounded-md bg-gray-200" />
              <p className="text-[9px] text-gray-700">Slate roof tiles (lot)</p>
            </div>
            <span className="text-[9px] font-medium text-gray-900">$350</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const ways = [
  {
    title: "Verify Your Home",
    description:
      "Enter your address and we'll check it against state and national historic registers. Most verifications take minutes.",
    bg: "bg-linear-to-br from-[#ddd9d2] to-[#d1cbc2]",
    illustration: <VerifyMockup />,
  },
  {
    title: "Ask & Answer",
    description:
      "Post a question and get real advice from people who've been through it — not internet strangers guessing.",
    bg: "bg-linear-to-br from-[#d3dbd0] to-[#c6d1bd]",
    illustration: <ForumMockup />,
  },
  {
    title: "Share Your Story",
    description:
      "Write about your restoration journey — before-and-afters, lessons learned, and the history behind your home.",
    bg: "bg-linear-to-br from-[#e0d2cf] to-[#d5c3bf]",
    illustration: <BlogMockup />,
  },
  {
    title: "Buy & Sell",
    description:
      "Find salvaged materials, period hardware, and specialty supplies from fellow owners who know what matters.",
    bg: "bg-linear-to-br from-[#ced8e0] to-[#bfcdd8]",
    illustration: <MarketplaceMockup />,
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
