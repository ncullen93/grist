import { Link } from "react-router";
import type { Route } from "./+types/admin";
import { apiGet } from "~/lib/api.server";
import { redirect } from "react-router";
import { PageHeader } from "~/components/page-header";
import {
  CalendarDays,
  Users,
  BookOpen,
  MessageSquare,
  Store,
  ClipboardList,
  LifeBuoy,
  BarChart3,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export async function loader({ request }: Route.LoaderArgs) {
  const meRes = await apiGet(request, "/api/auth/me/");
  if (!meRes.ok) return redirect("/login");
  const user = await meRes.json();
  if (!user.is_staff) return redirect("/m");

  return { user };
}

const cards: { title: string; description: string; icon: LucideIcon; href: string }[] = [
  {
    title: "Events",
    description: "Create, edit, and manage club events",
    icon: CalendarDays,
    href: "/m/admin/events",
  },
  {
    title: "Members",
    description: "View and manage member profiles",
    icon: Users,
    href: "/m/admin/members",
  },
  {
    title: "Blog",
    description: "Moderate blog posts and comments",
    icon: BookOpen,
    href: "/m/admin/blog",
  },
  {
    title: "Forum",
    description: "Manage channels, topics, and posts",
    icon: MessageSquare,
    href: "/m/admin/forum",
  },
  {
    title: "Marketplace",
    description: "Moderate listings, tags, and replies",
    icon: Store,
    href: "/m/admin/marketplace",
  },
  {
    title: "Applications",
    description: "Review membership applications and codes",
    icon: ClipboardList,
    href: "/m/admin/applications",
  },
  {
    title: "Support",
    description: "Help requests, bug reports, and suggestions",
    icon: LifeBuoy,
    href: "/m/admin/support",
  },
  {
    title: "Analytics",
    description: "Site-wide statistics and engagement",
    icon: BarChart3,
    href: "/m/admin/analytics",
  },
];

export default function AdminPage() {
  return (
    <>
      <PageHeader title="Admin" />
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map((card) => (
            <Link
              key={card.title}
              to={card.href}
              className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-background p-6 aspect-3/1 transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <card.icon className="size-6" />
              </div>
              <h3 className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                {card.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
