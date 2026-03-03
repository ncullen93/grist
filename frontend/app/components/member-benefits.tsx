import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

function ExpertiseMockup() {
  return (
    <div className="w-full max-w-md space-y-3">
      {/* Question */}
      <div className="rounded-xl bg-white/80 p-5 shadow-sm backdrop-blur">
        <p className="text-[11px] font-semibold text-gray-900">
          Should I replace or restore original windows?
        </p>
        <p className="mt-1 text-[9px] text-gray-400">
          Posted 2h ago &middot; 4 replies
        </p>
      </div>
      {/* Answer with verified badge */}
      <div className="rounded-xl bg-white/80 p-5 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2.5">
          <img
            src="https://images.unsplash.com/photo-1519227355453-8f982e425321?w=48&h=48&fit=crop&crop=center"
            alt="Historic home"
            className="size-6 shrink-0 rounded-full object-cover ring-1 ring-white"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] font-semibold text-gray-900">
                Margaret K.
              </p>
              <span className="flex items-center gap-0.5 rounded-full bg-gray-900/10 px-1.5 py-0.5 text-[7px] font-medium text-gray-600">
                <svg viewBox="0 0 20 20" className="size-2.5 fill-gray-600">
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
                Verified
              </span>
            </div>
            <p className="text-[8px] text-gray-400">
              1889 Queen Anne &middot; Salem, MA
            </p>
          </div>
        </div>
        <p className="mt-3 text-[9px] leading-relaxed text-gray-600">
          Restore, always. We saved 23 original windows for about the same cost
          as replacements. The trick is finding a glazier who works with
          historic sash &mdash; I can share ours.
        </p>
      </div>
    </div>
  );
}

function CommunityMockup() {
  return (
    <div className="w-full max-w-md space-y-3">
      {/* Upcoming events */}
      <div className="rounded-xl bg-white/80 p-5 shadow-sm backdrop-blur">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
          This month
        </p>
        <div className="mt-3 space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 flex-col items-center justify-center rounded-lg bg-gray-900 text-white">
              <p className="text-[7px] font-medium uppercase leading-none">
                Mar
              </p>
              <p className="text-[11px] font-bold leading-tight">15</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-900">
                Monthly Video Meetup
              </p>
              <p className="text-[8px] text-gray-400">
                10am ET &middot; 12 attending
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 flex-col items-center justify-center rounded-lg bg-gray-100 text-gray-600">
              <p className="text-[7px] font-medium uppercase leading-none">
                Mar
              </p>
              <p className="text-[11px] font-bold leading-tight">22</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-900">
                Expert Q&amp;A: Insurance
              </p>
              <p className="text-[8px] text-gray-400">
                1pm ET &middot; 8 attending
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Active discussion */}
      <div className="rounded-xl bg-white/80 p-5 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="flex -space-x-1.5">
            <img
              src="https://images.unsplash.com/photo-1519227355453-8f982e425321?w=32&h=32&fit=crop&crop=center"
              alt="Member"
              className="size-5 rounded-full object-cover ring-1 ring-white"
            />
            <img
              src="https://images.unsplash.com/photo-1757992141434-983a12b82da3?w=32&h=32&fit=crop&crop=center"
              alt="Member"
              className="size-5 rounded-full object-cover ring-1 ring-white"
            />
            <img
              src="https://images.unsplash.com/photo-1525883405167-fc4e76c7713a?w=32&h=32&fit=crop&crop=center"
              alt="Member"
              className="size-5 rounded-full object-cover ring-1 ring-white"
            />
          </div>
          <p className="text-[9px] text-gray-500">14 members online now</p>
        </div>
      </div>
    </div>
  );
}

function ProfileMockup() {
  return (
    <div className="w-full max-w-md space-y-3">
      {/* Profile header */}
      <div className="overflow-hidden rounded-xl bg-white/80 shadow-sm backdrop-blur">
        <img
          src="https://images.unsplash.com/photo-1757992141434-983a12b82da3?w=400&h=160&fit=crop&crop=center"
          alt="Historic home exterior"
          className="aspect-5/2 w-full object-cover"
        />
        <div className="p-5">
          <p className="text-[11px] font-semibold text-gray-900">
            1847 Cape Cod Colonial
          </p>
          <p className="mt-0.5 text-[9px] text-gray-400">
            Brewster, MA &middot; Restoring since 2023
          </p>
          <div className="mt-3 flex gap-1.5">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[8px] font-medium text-slate-600">
              Pre-Civil War
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[8px] font-medium text-slate-600">
              Cape Cod
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[8px] font-medium text-slate-600">
              NRHP Listed
            </span>
          </div>
        </div>
      </div>
      {/* Photo grid teaser */}
      <div className="rounded-xl bg-white/80 p-4 shadow-sm backdrop-blur">
        <div className="grid grid-cols-3 gap-1.5">
          <img
            src="https://images.unsplash.com/photo-1519227355453-8f982e425321?w=120&h=120&fit=crop&crop=center"
            alt="Interior detail"
            className="aspect-square rounded-md object-cover"
          />
          <img
            src="https://images.unsplash.com/photo-1525883405167-fc4e76c7713a?w=120&h=120&fit=crop&crop=center"
            alt="Trim detail"
            className="aspect-square rounded-md object-cover"
          />
          <img
            src="https://images.unsplash.com/photo-1745944727434-c6f56248b083?w=120&h=120&fit=crop&crop=center"
            alt="Window detail"
            className="aspect-square rounded-md object-cover"
          />
        </div>
        <p className="mt-2 text-[8px] text-gray-400">12 photos shared</p>
      </div>
    </div>
  );
}

const benefits = [
  {
    title: "Verified expertise",
    description:
      "Every member is a verified historic homeowner. When someone answers your question about lime mortar or knob-and-tube, they're speaking from experience — not guessing from a YouTube video.",
    bg: "from-[#ece5e6] to-[#e0d6d8]",
    illustration: <ExpertiseMockup />,
  },
  {
    title: "A real community",
    description:
      "Monthly video meetups, quarterly expert sessions, and an annual retreat. This isn't a feed you scroll past — it's a group of people you actually get to know.",
    bg: "from-[#e8ece5] to-[#dce3d8]",
    illustration: <CommunityMockup />,
  },
  {
    title: "Unique profiles",
    description:
      "Show off your home — its era, its style, the details you love. Share photos, tag what you're working on, and connect with owners of similar houses.",
    bg: "from-[#e5e7ec] to-[#d6d9e0]",
    illustration: <ProfileMockup />,
  },
];

export function MemberBenefits() {
  const [activeItem, setActiveItem] = useState("item-0");
  const activeIndex = parseInt(activeItem?.replace("item-", "") ?? "0", 10);

  return (
    <section className="px-8 py-24 lg:px-10">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-6">
        {/* Left — illustration that changes with accordion */}
        <div className="relative aspect-[5/4] overflow-hidden rounded-lg">
          {benefits.map((benefit, i) => (
            <div
              key={benefit.title}
              className={`absolute inset-0 flex items-center justify-center bg-linear-to-br px-8 ${benefit.bg} transition-opacity duration-500 ${
                i === activeIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              {benefit.illustration}
            </div>
          ))}
        </div>

        {/* Right — heading at top, accordion at bottom */}
        <div className="flex flex-col justify-between lg:px-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Why Grist Club
            </p>
            <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">
              A community that shares your passion
            </h2>
          </div>

          <div className="mt-10">
            <Accordion
              type="single"
              value={activeItem}
              onValueChange={(value) => {
                if (value) setActiveItem(value);
              }}
              className="border-t"
            >
              {benefits.map((benefit, i) => (
                <AccordionItem
                  key={benefit.title}
                  value={`item-${i}`}
                  className="border-b"
                >
                  <AccordionTrigger className="text-base font-medium text-gray-900 hover:no-underline">
                    {benefit.title}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-gray-600">
                    {benefit.description}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
