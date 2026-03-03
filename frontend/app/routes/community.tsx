import type { Route } from "./+types/community";
import { MembersOnlyGate } from "~/components/members-only-gate";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Community - Grist Club" },
    {
      name: "description",
      content:
        "Connect with fellow historic homeowners. Share advice, ask questions, and join the conversation.",
    },
  ];
}

function SkeletonAvatar() {
  return <div className="size-8 shrink-0 rounded-full bg-gray-200" />;
}

function SkeletonLine({ width = "w-full" }: { width?: string }) {
  return <div className={`h-3 rounded ${width} bg-gray-200`} />;
}

function SkeletonPost() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <div className="flex items-center gap-3">
        <SkeletonAvatar />
        <div className="flex-1 space-y-1.5">
          <SkeletonLine width="w-28" />
          <SkeletonLine width="w-16" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <SkeletonLine />
        <SkeletonLine width="w-4/5" />
        <SkeletonLine width="w-3/5" />
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div className="h-3 w-12 rounded bg-gray-100" />
        <div className="h-3 w-16 rounded bg-gray-100" />
        <div className="h-3 w-10 rounded bg-gray-100" />
      </div>
    </div>
  );
}

function SkeletonChannel({ active = false }: { active?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 ${active ? "bg-primary/10" : ""}`}
    >
      <div className="size-2 shrink-0 rounded-full bg-gray-300" />
      <SkeletonLine width={active ? "w-28" : "w-20"} />
    </div>
  );
}

function CommunitySkeleton() {
  return (
    <section className="px-8 py-12 lg:px-10">
      <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
        Community
      </p>
      <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">
        The Forum
      </h2>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <div className="space-y-1">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Channels
          </p>
          <SkeletonChannel active />
          <SkeletonChannel />
          <SkeletonChannel />
          <SkeletonChannel />
          <SkeletonChannel />
          <div className="pt-4">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Topics
            </p>
            <SkeletonChannel />
            <SkeletonChannel />
            <SkeletonChannel />
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {/* Compose box */}
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <div className="flex items-center gap-3">
              <SkeletonAvatar />
              <div className="h-10 flex-1 rounded-lg bg-gray-50" />
            </div>
          </div>

          <SkeletonPost />
          <SkeletonPost />
          <SkeletonPost />
          <SkeletonPost />
        </div>
      </div>
    </section>
  );
}

export default function CommunityPage() {
  return (
    <MembersOnlyGate demoPath="/community/demo">
      <CommunitySkeleton />
    </MembersOnlyGate>
  );
}
