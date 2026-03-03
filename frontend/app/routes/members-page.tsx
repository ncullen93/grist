import type { Route } from "./+types/members-page";
import { MembersOnlyGate } from "~/components/members-only-gate";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Members - Grist Club" },
    {
      name: "description",
      content:
        "Browse the Grist Club member directory. Connect with historic homeowners across the country.",
    },
  ];
}

function SkeletonLine({ width = "w-full" }: { width?: string }) {
  return <div className={`h-3 rounded ${width} bg-gray-200`} />;
}

function SkeletonMemberCard() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <div className="flex items-center gap-4">
        <div className="size-14 shrink-0 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <SkeletonLine width="w-32" />
          <SkeletonLine width="w-20" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <SkeletonLine width="w-3/4" />
        <SkeletonLine width="w-1/2" />
      </div>
      <div className="mt-4 flex gap-1.5">
        <div className="h-5 w-16 rounded-full bg-gray-100" />
        <div className="h-5 w-14 rounded-full bg-gray-100" />
        <div className="h-5 w-18 rounded-full bg-gray-100" />
      </div>
    </div>
  );
}

function MembersSkeleton() {
  return (
    <section className="px-8 py-12 lg:px-10">
      <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
        Directory
      </p>
      <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">
        Member Directory
      </h2>

      {/* Search / filter bar */}
      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="h-10 flex-1 rounded-lg border border-gray-100 bg-white" />
        <div className="flex gap-2">
          <div className="h-10 w-28 rounded-lg border border-gray-100 bg-white" />
          <div className="h-10 w-28 rounded-lg border border-gray-100 bg-white" />
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {["Members", "States", "Homes Listed", "Avg. Home Age"].map(
          (label) => (
            <div
              key={label}
              className="rounded-xl border border-gray-100 bg-white p-4 text-center"
            >
              <div className="mx-auto h-7 w-12 rounded bg-gray-200" />
              <p className="mt-2 text-xs text-gray-400">{label}</p>
            </div>
          ),
        )}
      </div>

      {/* Member grid */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SkeletonMemberCard />
        <SkeletonMemberCard />
        <SkeletonMemberCard />
        <SkeletonMemberCard />
        <SkeletonMemberCard />
        <SkeletonMemberCard />
        <SkeletonMemberCard />
        <SkeletonMemberCard />
        <SkeletonMemberCard />
      </div>

      {/* Pagination */}
      <div className="mt-8 flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className={`flex size-9 items-center justify-center rounded-lg text-xs ${n === 1 ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-400"}`}
          >
            {n}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function MembersPage() {
  return (
    <MembersOnlyGate demoPath="/members/demo">
      <MembersSkeleton />
    </MembersOnlyGate>
  );
}
