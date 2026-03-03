import { useState, useRef, useLayoutEffect } from "react";
import { Outlet, Form, useLocation } from "react-router";
import type { Route } from "./+types/member-layout";
import { apiGet } from "~/lib/api.server";
import { redirect } from "react-router";
import { MemberSidebar } from "~/components/member-sidebar";
import { MemberMobileNav } from "~/components/member-mobile-nav";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { LogOut } from "lucide-react";
import { HelpDialog } from "~/components/help-dialog";
import { NotificationPanel } from "~/components/notification-panel";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const [authRes, notifRes] = await Promise.all([
      apiGet(request, "/api/auth/me/"),
      apiGet(request, "/api/notifications/unread-count/"),
    ]);
    if (!authRes.ok) {
      return redirect("/login");
    }
    const user = await authRes.json();
    const notifData = notifRes.ok ? await notifRes.json() : { count: 0 };
    return { user, unreadNotificationCount: notifData.count as number };
  } catch {
    return redirect("/login");
  }
}

export default function MemberLayout({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  const [avatarPopoverOpen, setAvatarPopoverOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [pathname]);

  const initial = user.first_name?.charAt(0).toUpperCase() || "G";

  return (
    <div className="flex h-screen overflow-hidden bg-background md:bg-sidebar">
      {/* Desktop sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <MemberSidebar user={user} />
      </div>

      {/* Main content area */}
      <main className="flex-1 min-w-0 pb-16 md:pb-0 md:pt-2">
        <div className="bg-background md:rounded-tl-2xl md:border-l md:border-t md:border-border/60 md:shadow-sm h-full overflow-hidden">
          <div
            ref={scrollRef}
            className="h-full overflow-y-auto overflow-x-hidden overscroll-none md:rounded-tl-2xl"
          >
            {/* Avatar overlay - desktop only, sticky at top-right */}
            <div className="hidden md:block sticky top-0 z-20 h-0 overflow-visible pointer-events-none">
              <div className="flex justify-end items-center h-18 px-8 pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-3">
                  <HelpDialog />
                  <NotificationPanel initialUnreadCount={loaderData.unreadNotificationCount} />
                  <Popover
                    open={avatarPopoverOpen}
                    onOpenChange={setAvatarPopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <button className="cursor-pointer flex items-center justify-center rounded-full transition-colors">
                        <Avatar>
                          <AvatarFallback className="text-sm font-medium bg-primary text-primary-foreground">
                            {initial}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      side="bottom"
                      align="end"
                      className="w-48 rounded p-1.5"
                    >
                      <div className="flex flex-col">
                        <Form method="post" action="/logout">
                          <button
                            type="submit"
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-destructive rounded hover:bg-destructive/10 transition-colors cursor-pointer"
                            onClick={() => setAvatarPopoverOpen(false)}
                          >
                            <LogOut className="size-4" />
                            Log out
                          </button>
                        </Form>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Page content rendered by child routes */}
            <Outlet />
          </div>
        </div>
      </main>

      {/* Mobile bottom nav - hidden on desktop */}
      <MemberMobileNav />
    </div>
  );
}
