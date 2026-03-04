import type { Route } from "./+types/home";
import { redirect } from "react-router";
import { apiGet } from "~/lib/api.server";
import { Hero } from "~/components/hero";
import { Members } from "~/components/members";
import { UpcomingEvents } from "~/components/upcoming-events";
import { MemberBenefits } from "~/components/member-benefits";
import { GetInvolved } from "~/components/get-involved";
import { Testimonial } from "~/components/testimonial";
import { JoinCta } from "~/components/join-cta";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const res = await apiGet(request, "/api/auth/me/");
    if (res.ok) {
      return redirect("/m/home");
    }
  } catch {
    // not logged in, show marketing page
  }
  return {};
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Grist Club - Trusted Community for Historic Homeowners" },
    {
      name: "description",
      content:
        "Grist Club is the private knowledge base for verified owners of historic homes. Connect with other owners to share advice, resources, and community.",
    },
  ];
}

export default function Home() {
  return (
    <>
      <Hero />
      <Members />
      <GetInvolved />
      <MemberBenefits />
      <UpcomingEvents />
      <Testimonial />
      <JoinCta />
    </>
  );
}
