import { useState } from "react";
import { Link } from "react-router";
import { Bell, CalendarDays, Heart } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  allNotifications,
  type Notification,
} from "~/lib/demo-notifications";

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(allNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markRead(id: number) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative cursor-pointer flex items-center justify-center size-10 rounded-full transition-colors hover:ring-2 hover:ring-border mr-2">
          <Bell className="size-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        className="w-80 p-0"
      >
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
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={markRead}
            />
          ))}
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
        {notification.actorPhoto ? (
          <img
            src={notification.actorPhoto}
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
