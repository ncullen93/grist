import { useState } from "react";
import { Link, useLocation } from "react-router";
import {
  Home,
  MessageSquare,
  CalendarDays,
  UserCircle,
  Settings,
  PanelLeft,
  PanelLeftClose,
  Shield,
} from "lucide-react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";

interface User {
  id: string;
  email: string;
  first_name: string;
  profile_uid?: string;
  is_staff?: boolean;
}

const navItems = [
  {
    title: "Home",
    url: "/m/home",
    icon: Home,
    exact: true,
  },
  {
    title: "Forum",
    url: "/m/forum",
    icon: MessageSquare,
  },
  {
    title: "Events",
    url: "/m/events",
    icon: CalendarDays,
  },
  {
    title: "Profile",
    url: "/m/profile",
    icon: UserCircle,
    spaceBefore: true,
  },
  {
    title: "Settings",
    url: "/m/settings",
    icon: Settings,
  },
  {
    title: "Admin",
    url: "/m/admin",
    icon: Shield,
    staffOnly: true,
  },
];

export function MemberSidebar({ user }: { user?: User }) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const initial = user?.first_name?.charAt(0).toUpperCase() || "G";
  const displayName = user?.first_name || "Grist Club";
  const profileUrl = user?.profile_uid ? `/m/home/${user.profile_uid}` : "/m/profile";

  const isActive = (item: (typeof navItems)[number]) => {
    if (item.exact) {
      return location.pathname === item.url || location.pathname === "/m" || location.pathname === "/m/";
    }
    return location.pathname.startsWith(item.url);
  };

  return (
    <div
      className={`h-screen flex flex-col pt-4 pb-2 bg-transparent transition-all duration-200 ${
        isCollapsed ? "w-16 px-3" : "w-60 px-4"
      }`}
    >
      {/* Logo */}
      {isCollapsed ? (
        <Link
          to={profileUrl}
          className="mt-2 mb-4 shrink-0 flex items-center justify-center"
        >
          <Avatar className="size-8">
            <AvatarFallback className="text-xs font-display font-extrabold bg-primary text-primary-foreground">
              {initial}
            </AvatarFallback>
          </Avatar>
        </Link>
      ) : (
        <Link
          to={profileUrl}
          className="mt-2 mb-4 px-2.5 py-2 rounded-lg border border-border flex items-center gap-3"
        >
          <Avatar className="size-6 shrink-0">
            <AvatarFallback className="text-[10px] font-display font-extrabold bg-primary text-primary-foreground rounded-sm">
              {initial}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-display font-extrabold truncate">
            {displayName}
          </span>
        </Link>
      )}

      {/* Navigation */}
      <nav
        className={`mt-2 flex flex-col gap-1 ${isCollapsed ? "items-center" : ""}`}
      >
        {navItems
        .filter((item) => !item.staffOnly || user?.is_staff)
        .map((item) => {
          const active = isActive(item);
          const Icon = item.icon;

          if (isCollapsed) {
            return (
              <Link
                key={item.title}
                to={item.url}
                title={item.title}
                className={`flex items-center justify-center w-10 h-9 rounded-lg transition-colors ${
                  item.spaceBefore ? "mt-4" : ""
                } ${
                  active
                    ? "bg-secondary text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-primary"
                }`}
              >
                <Icon className="size-[18px]" />
              </Link>
            );
          }

          return (
            <div key={item.title}>
              <Link
                to={item.url}
                className={`flex items-center gap-4 px-3 py-1.5 rounded-lg transition-colors ${
                  item.spaceBefore ? "mt-4" : ""
                } ${
                  active
                    ? "bg-secondary font-medium text-foreground"
                    : "text-foreground/70 hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="size-[18px] shrink-0" />
                <span className="text-sm">{item.title}</span>
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Footer with collapse toggle */}
      <div
        className={`mt-auto flex w-full gap-1 ${
          isCollapsed
            ? "flex-col items-center"
            : "flex-row justify-end items-center"
        }`}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="size-9 rounded-lg flex justify-center items-center hover:bg-secondary transition-colors text-muted-foreground cursor-pointer"
        >
          {isCollapsed ? (
            <PanelLeft className="size-[18px]" />
          ) : (
            <PanelLeftClose className="size-[18px]" />
          )}
        </button>
      </div>
    </div>
  );
}
