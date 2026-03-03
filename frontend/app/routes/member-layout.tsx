import { useState, useRef, useLayoutEffect } from "react";
import { Outlet, Link, useLocation } from "react-router";
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

export default function MemberLayout() {
  const [avatarPopoverOpen, setAvatarPopoverOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-background md:bg-sidebar">
      {/* Desktop sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <MemberSidebar />
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
                  <NotificationPanel />
                  <Popover
                    open={avatarPopoverOpen}
                    onOpenChange={setAvatarPopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <button className="cursor-pointer flex items-center justify-center rounded-full transition-colors">
                        <Avatar>
                          <AvatarFallback className="text-sm font-medium bg-primary text-primary-foreground">
                            G
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
                        <Link
                          to="/"
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-destructive rounded hover:bg-destructive/10 transition-colors"
                          onClick={() => setAvatarPopoverOpen(false)}
                        >
                          <LogOut className="size-4" />
                          Log out
                        </Link>
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
