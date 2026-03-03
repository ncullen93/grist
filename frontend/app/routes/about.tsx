import type { Route } from "./+types/about";
import { JoinCta } from "~/components/join-cta";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "About - Grist Club" },
    {
      name: "description",
      content:
        "Grist Club is a private community for verified owners of historic homes. Learn our story.",
    },
  ];
}


export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="px-8 py-24 lg:px-10 lg:py-32">
        <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          About
        </p>
        <h1 className="mt-4 max-w-2xl font-display text-4xl font-medium leading-[1.15] tracking-tight text-gray-900 sm:text-5xl">
          A private club for people who care about old houses.
        </h1>
        <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-gray-500">
          Grist Club is a community of verified historic homeowners — people
          restoring, preserving, and living in homes with real history. We
          connect online and in person to share hard-won knowledge and genuine
          friendships.
        </p>
      </section>

      {/* Image break */}
      <section className="px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <img
            src="https://images.unsplash.com/photo-1519227355453-8f982e425321?w=800&h=1000&fit=crop&crop=center"
            alt="Row of historic painted homes"
            className="aspect-[4/5] w-full rounded-md object-cover"
          />
          <img
            src="https://images.unsplash.com/photo-1525883405167-fc4e76c7713a?w=800&h=1000&fit=crop&crop=center"
            alt="Victorian architectural detail"
            className="aspect-[4/5] w-full rounded-md object-cover"
          />
          <img
            src="https://images.unsplash.com/photo-1757992141434-983a12b82da3?w=800&h=1000&fit=crop&crop=center"
            alt="Historic brick home"
            className="aspect-[4/5] w-full rounded-md object-cover"
          />
        </div>
      </section>

      {/* Origin story */}
      <section className="px-8 py-24 lg:px-10">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-2">
          <div className="lg:sticky lg:top-28">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Our story
            </p>
            <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">
              Started at the kitchen table
            </h2>
          </div>
          <div className="space-y-8">
            <p className="text-[15px] leading-relaxed text-gray-600">
              When Nick and Cecilia took over a fifth-generation Cape cottage in
              Brewster, Massachusetts, they had questions that Google couldn't
              answer. How do you insure a 200-year-old house? Where do you find
              someone who actually knows how to re-point historic masonry? Is it
              normal to feel this anxious about a roof?
            </p>
            <p className="text-[15px] leading-relaxed text-gray-600">
              The house had been in the family since it was built, passed down
              through generations who each left their mark — a new porch here, a
              patched foundation there. But no one had written any of it down.
              Every decision felt like guesswork.
            </p>

            <img
              src="https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=500&fit=crop&crop=center"
              alt="Historic Cape Cod cottage"
              className="aspect-3/2 w-full rounded-md object-cover"
            />

            <p className="text-[15px] leading-relaxed text-gray-600">
              They found answers the old-fashioned way — by talking to other
              owners. Neighbors who'd been through it. Strangers on old forum
              threads. A preservationist they cold-emailed on a whim. Every
              conversation helped, and each one made them realize how isolated
              most historic homeowners are.
            </p>
            <p className="text-[15px] leading-relaxed text-gray-600">
              The advice was out there, but it was scattered — buried in niche
              Facebook groups, outdated blogs, or locked behind expensive
              consultations. There was no single place where people like them
              could just talk to each other.
            </p>
            <p className="text-[15px] leading-relaxed text-gray-600">
              So they started building one. First it was a group text with a few
              neighbors. Then a spreadsheet of trusted contractors. Then a
              standing invite to coffee on Saturday mornings for anyone in town
              who owned something old.
            </p>
            <p className="text-[15px] leading-relaxed text-gray-600">
              People showed up. They swapped horror stories about plumbing and
              celebrated small wins — a grant that came through, a window sash
              finally repaired after months of searching for the right glass. It
              became clear that the real value wasn't just the information. It
              was the people.
            </p>

            <img
              src="https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800&h=500&fit=crop&crop=center"
              alt="New England historic home in autumn"
              className="aspect-3/2 w-full rounded-md object-cover"
            />

            <p className="text-[15px] leading-relaxed text-gray-600">
              Grist Club is the place they wished existed from day one. A private
              community where verified owners of historic homes can actually find
              each other, swap notes, and build the kind of friendships that only
              come from sharing something this specific.
            </p>
            <p className="text-[15px] leading-relaxed text-gray-600">
              We verify every member. We keep the community small enough to feel
              personal, and open enough that anyone who qualifies can join.
              Whether you just inherited a farmhouse or you've been restoring a
              Victorian for twenty years, there's a seat at the table.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#e8ece5] px-8 py-24 lg:px-10">
        <div className="grid grid-cols-1 gap-16 sm:grid-cols-3">
          <div>
            <p className="font-display text-5xl font-medium tracking-tight text-gray-900 sm:text-6xl">
              9
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              State &amp; national registers
              <br />
              we verify against
            </p>
          </div>
          <div>
            <p className="font-display text-5xl font-medium tracking-tight text-gray-900 sm:text-6xl">
              100%
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              Of members verified as
              <br />
              historic homeowners
            </p>
          </div>
          <div>
            <p className="font-display text-5xl font-medium tracking-tight text-gray-900 sm:text-6xl">
              Free
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              For founding members
              <br />
              during early access
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="px-8 py-24 lg:px-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          What we stand for
        </p>
        <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">
          Our values
        </h2>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Verification */}
          <div>
            <div className="flex aspect-3/4 items-center justify-center overflow-hidden rounded-md bg-linear-to-br from-zinc-200 to-zinc-300 px-6">
              <div className="w-full space-y-2.5">
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
                        Home verified
                      </p>
                      <p className="text-[8px] text-gray-400">
                        NRHP &middot; Brewster, MA
                      </p>
                    </div>
                  </div>
                </div>
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
                        Home verified
                      </p>
                      <p className="text-[8px] text-gray-400">
                        MACRIS &middot; Salem, MA
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-white/60 p-4 shadow-sm backdrop-blur">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-full bg-gray-900/5">
                      <svg viewBox="0 0 20 20" className="size-4 fill-gray-400">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-900">
                        Pending review
                      </p>
                      <p className="text-[8px] text-gray-400">
                        ConnCRIS &middot; Hartford, CT
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="mt-5 font-display text-lg font-semibold text-gray-900">
              Verification
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-gray-600">
              Every member&rsquo;s home is on a recognized historic register. No
              exceptions.
            </p>
          </div>

          {/* Privacy */}
          <div>
            <div className="flex aspect-3/4 items-center justify-center overflow-hidden rounded-md bg-linear-to-br from-slate-200 to-slate-300 px-6">
              <div className="w-full space-y-2.5">
                <div className="rounded-xl bg-white/80 p-4 shadow-sm backdrop-blur">
                  <div className="flex items-center gap-2">
                    <svg viewBox="0 0 20 20" className="size-4 shrink-0 fill-slate-400">
                      <path
                        fillRule="evenodd"
                        d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-[10px] font-semibold text-gray-900">
                      Private community
                    </p>
                  </div>
                  <p className="mt-2 text-[9px] leading-relaxed text-gray-400">
                    Posts, conversations, and member
                    <br />
                    profiles are never public.
                  </p>
                </div>
                <div className="rounded-xl bg-white/80 p-4 shadow-sm backdrop-blur">
                  <div className="space-y-1.5">
                    <div className="h-2 w-3/4 rounded bg-slate-200" />
                    <div className="h-2 w-full rounded bg-slate-200" />
                    <div className="h-2 w-2/3 rounded bg-slate-100" />
                  </div>
                  <div className="mt-3 flex items-center gap-1.5">
                    <div className="size-4 rounded-full bg-slate-200" />
                    <div className="h-2 w-16 rounded bg-slate-200" />
                    <span className="ml-auto text-[8px] text-slate-400">
                      Members only
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="mt-5 font-display text-lg font-semibold text-gray-900">
              Privacy
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-gray-600">
              Conversations, advice, and connections stay within the community.
            </p>
          </div>

          {/* Generosity */}
          <div>
            <div className="flex aspect-3/4 items-center justify-center overflow-hidden rounded-md bg-linear-to-br from-stone-200 to-stone-300 px-6">
              <div className="w-full rounded-xl bg-white/80 p-5 shadow-sm backdrop-blur">
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <img
                      src="https://images.unsplash.com/photo-1519227355453-8f982e425321?w=48&h=48&fit=crop&crop=center"
                      alt="Historic home"
                      className="size-6 shrink-0 rounded-full object-cover ring-1 ring-white"
                    />
                    <div className="min-w-0 rounded-lg bg-stone-100 px-3 py-2">
                      <p className="text-[9px] leading-relaxed text-gray-700">
                        We used lime mortar for our 1840s
                        chimney — happy to share the mason&rsquo;s
                        contact if helpful!
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <img
                      src="https://images.unsplash.com/photo-1525883405167-fc4e76c7713a?w=48&h=48&fit=crop&crop=center"
                      alt="Historic home"
                      className="size-6 shrink-0 rounded-full object-cover ring-1 ring-white"
                    />
                    <div className="min-w-0 rounded-lg bg-stone-100 px-3 py-2">
                      <p className="text-[9px] leading-relaxed text-gray-700">
                        That would be amazing, thank you!
                        We&rsquo;ve been searching for months.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="mt-5 font-display text-lg font-semibold text-gray-900">
              Generosity
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-gray-600">
              Members share what they&rsquo;ve learned — mistakes included — so
              others don&rsquo;t start from scratch.
            </p>
          </div>

          {/* Preservation */}
          <div>
            <div className="flex aspect-3/4 flex-col items-center justify-center overflow-hidden rounded-md bg-linear-to-br from-stone-200 to-stone-300 px-6">
              <div className="w-full space-y-2.5">
                <div className="overflow-hidden rounded-xl bg-white/80 shadow-sm backdrop-blur">
                  <img
                    src="https://images.unsplash.com/photo-1745944727434-c6f56248b083?w=400&h=200&fit=crop&crop=center"
                    alt="Historic window detail"
                    className="aspect-video w-full object-cover"
                  />
                  <div className="p-4">
                    <p className="text-[10px] font-semibold text-gray-900">
                      Before &amp; After
                    </p>
                    <p className="mt-0.5 text-[8px] text-gray-400">
                      Original windows restored, not replaced
                    </p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <span className="rounded-full bg-white/80 px-2.5 py-1 text-[8px] font-medium text-stone-600 shadow-sm">
                    Restoration
                  </span>
                  <span className="rounded-full bg-white/80 px-2.5 py-1 text-[8px] font-medium text-stone-600 shadow-sm">
                    Original materials
                  </span>
                </div>
              </div>
            </div>
            <h3 className="mt-5 font-display text-lg font-semibold text-gray-900">
              Preservation
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-gray-600">
              We believe these homes deserve to be maintained, not modernized
              beyond recognition.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-8 py-24 lg:px-10">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-2">
          <div className="lg:sticky lg:top-28">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              FAQ
            </p>
            <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">
              Common questions
            </h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="eligibility">
              <AccordionTrigger>
                Who is eligible to join Grist Club?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed">
                Anyone who owns a home listed on a recognized historic register
                — the National Register of Historic Places, a state register, or
                a local historic district. We verify every applicant before
                granting access.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="verification">
              <AccordionTrigger>
                How does the verification process work?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed">
                After you apply, we cross-reference your address against public
                historic register databases. In most cases this takes a few
                minutes. If your home is on a local register that isn't digitized
                yet, we may ask for documentation.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="cost">
              <AccordionTrigger>
                Is there a cost to join?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed">
                Grist Club is free for founding members during our early launch
                period. We plan to introduce a modest annual membership fee down
                the road to keep the community sustainable and well-maintained.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="not-on-register">
              <AccordionTrigger>
                What if my home is historic but not on a register?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed">
                Many historic homes haven't been formally listed yet. If your
                home was built before 1960 and retains its historic character, we
                encourage you to apply anyway. We review edge cases individually
                and can point you toward resources for getting listed.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="what-do-members-get">
              <AccordionTrigger>
                What do members actually get access to?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed">
                A private forum for advice and discussion, a searchable member
                directory, monthly virtual meetups, quarterly expert Q&A
                sessions, an annual in-person retreat, and a growing library of
                preservation resources — all created by and for historic
                homeowners.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="location">
              <AccordionTrigger>
                Is Grist Club only for homes in New England?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed">
                No. While we started in New England, Grist Club is open to
                historic homeowners across the United States. We currently
                support verification through nine state registries and the
                National Register, and we're adding more all the time.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <JoinCta />
    </>
  );
}
