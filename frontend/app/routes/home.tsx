import type { Route } from "./+types/home";
import { Hero } from "~/components/hero";
import { Members } from "~/components/members";
import { UpcomingEvents } from "~/components/upcoming-events";
import { MemberBenefits } from "~/components/member-benefits";
import { GetInvolved } from "~/components/get-involved";
import { Testimonial } from "~/components/testimonial";
import { JoinCta } from "~/components/join-cta";

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
