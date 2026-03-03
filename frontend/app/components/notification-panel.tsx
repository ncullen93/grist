import { useState, useEffect } from "react";
import { Link, useFetcher } from "react-router";
import { Bell, CalendarDays, Heart } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

interface Notification {
  id: number;
  type: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  href: string;
  actor_photo: string | null;
}

export function NotificationPanel({ initialUnreadCount }: { initialUnreadCount: number }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [loaded, setLoaded] = useState(false);
  const listFetcher = useFetcher();
  const actionFetcher = useFetcher();

  // Fetch notifications when popover opens
  useEffect(() => {
    if (open && !loaded && listFetcher.state === "idle") {
      listFetcher.load("/m/notifications");
    }
  }, [open]);

  // Update local state when list loads
  useEffect(() => {
    if (listFetcher.data?.results) {
      setNotifications(listFetcher.data.results);
      setUnreadCount(listFetcher.data.results.filter((n: Notification) => !n.read).length);
      setLoaded(true);
    }
  }, [listFetcher.data]);

  // Handle mark-all-read response
  useEffect(() => {
    if (actionFetcher.data?.allRead) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  }, [actionFetcher.data]);

  function markAllRead() {
    actionFetcher.submit(
      { intent: "mark-all-read" },
      { method: "post", action: "/m/notifications" },
    );
  }

  function markRead(id: number) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    actionFetcher.submit(
      { intent: "mark-read", id: String(id) },
      { method: "post", action: "/m/notifications" },
    );
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative cursor-pointer flex items-center justify-center size-10 rounded-full transition-colors  mr-2">
          <Bell className="size-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-[28rem] overflow-y-auto">
          {!loaded && listFetcher.state === "loading" ? (
            <div className="px-4 py-8 text-center">
              <p className="text-xs text-muted-foreground">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-xs text-muted-foreground">No notifications yet.</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={markRead}
              />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function NotificationItem({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead: (id: number) => void;
}) {
  return (
    <Link
      to={notification.href}
      onClick={() => onRead(notification.id)}
      className={`flex items-center gap-3.5 px-4 py-3.5 border-b border-border last:border-0 transition-colors hover:bg-muted/50 ${
        !notification.read ? "bg-muted/30" : ""
      }`}
    >
      <div className="relative shrink-0">
        {notification.actor_photo ? (
          <img
            src={notification.actor_photo}
            alt=""
            className="size-8 rounded-full object-cover"
          />
        ) : (
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
            {notification.type === "event_reminder" ? (
              <CalendarDays className="size-4 text-primary" />
            ) : (
              <Heart className="size-4 text-primary" />
            )}
          </div>
        )}
        {!notification.read && (
          <span className="absolute -top-0.5 -left-0.5 size-2 rounded-full bg-primary" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-foreground leading-snug">
          {notification.title}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground/60">
          {notification.time}
        </p>
      </div>
    </Link>
  );
}
