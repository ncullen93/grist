import { useState } from "react";
import { Link, useLoaderData } from "react-router";
import { UserPlus, UserCheck } from "lucide-react";
import { Button } from "~/components/ui/button";
import { getMemberBySlug } from "~/lib/demo-data";
import type { Route } from "./+types/member-profile-demo";

export function loader({ params }: Route.LoaderArgs) {
  const member = getMemberBySlug(params.slug);
  if (!member) {
    throw new Response("Member not found", { status: 404 });
  }
  return { member };
}

export default function MemberProfileDemoPage() {
  const { member } = useLoaderData<typeof loader>();
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <>
      {/* Back link */}
      <section className="px-8 pt-8 lg:px-10">
        <Link
          to="/members/demo"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-gray-600"
        >
          <svg viewBox="0 0 20 20" className="size-4 fill-current">
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
              clipRule="evenodd"
            />
          </svg>
          Back to directory
        </Link>
      </section>

      {/* Profile header */}
      <section className="px-8 pt-12 pb-0 lg:px-10">
        <div className="grid grid-cols-1 items-end gap-12 lg:grid-cols-[340px_1fr]">
          {/* Photo */}
          <div className="overflow-hidden rounded-xl">
            <img
              src={member.photo.replace("w=600&h=600", "w=680&h=800")}
              alt={member.homeName}
              className="aspect-4/5 w-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="pb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {member.homeStyle} &middot; {member.homeYear}
            </p>
            <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-gray-900 sm:text-5xl">
              {member.name}
            </h1>
            <p className="mt-2 text-[15px] text-gray-400">
              {member.location}
            </p>

            <p className="mt-6 text-lg italic text-gray-500">
              {member.homeName}
            </p>

            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-gray-600">
              {member.bio}
            </p>

            <div className="mt-8 flex flex-wrap gap-1.5">
              {member.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/members/demo?search=${encodeURIComponent(tag)}`}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  {tag}
                </Link>
              ))}
            </div>

            <div className="mt-8">
              <Button
                variant={isFollowing ? "outline" : "default"}
                className="rounded-full px-8"
                onClick={() => setIsFollowing(!isFollowing)}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="mr-2 size-4" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 size-4" />
                    Follow
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Details bar */}
      <section className="mt-16 bg-[#e8ece5] px-8 py-16 lg:px-10">
        <div className="grid grid-cols-2 gap-12 sm:grid-cols-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Registry
            </p>
            <p className="mt-2 text-sm font-medium text-gray-900">
              {member.registry}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Home built
            </p>
            <p className="mt-2 text-sm font-medium text-gray-900">
              {member.homeYear}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Style
            </p>
            <p className="mt-2 text-sm font-medium text-gray-900">
              {member.homeStyle}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Member since
            </p>
            <p className="mt-2 text-sm font-medium text-gray-900">
              {member.memberSince}
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="px-8 py-24 lg:px-10">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-2">
          <div className="lg:sticky lg:top-28">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              The story
            </p>
            <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">
              {member.homeName}
            </h2>
          </div>

          <div className="space-y-6">
            {member.story.map((paragraph, i) => (
              <p
                key={i}
                className="text-[15px] leading-relaxed text-gray-600"
              >
                {paragraph}
              </p>
            ))}

            <img
              src={member.photo.replace("w=600&h=600", "w=800&h=500")}
              alt={member.homeName}
              className="mt-6 aspect-3/2 w-full rounded-md object-cover"
            />
          </div>
        </div>
      </section>
    </>
  );
}
