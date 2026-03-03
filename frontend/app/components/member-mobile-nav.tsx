import { Link, useLocation } from "react-router";
import {
  Home,
  Rss,
  CalendarDays,
  Users,
  UserCircle,
} from "lucide-react";

const navItems = [
  { title: "Home", url: "/m/home", icon: Home, exact: true },
  { title: "Posts", url: "/m/posts", icon: Rss },
  { title: "Events", url: "/m/events", icon: CalendarDays },
  { title: "Members", url: "/m/members", icon: Users },
  { title: "Profile", url: "/m/profile", icon: UserCircle },
];

export function MemberMobileNav() {
  const location = useLocation();

  const isActive = (item: (typeof navItems)[number]) => {
    if (item.exact) return location.pathname === item.url;
    return location.pathname.startsWith(item.url);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              to={item.url}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="size-5" />
              <span className="text-[10px] font-medium">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
