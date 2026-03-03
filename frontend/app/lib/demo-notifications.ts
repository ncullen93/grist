export type NotificationType =
  | "post_like"
  | "post_comment"
  | "forum_reply"
  | "event_reminder"
  | "new_member"
  | "welcome";

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  href: string;
  actorPhoto?: string;
}

export const allNotifications: Notification[] = [
  {
    id: 1,
    type: "post_comment",
    title: "James W. commented on your post",
    body: "That looks incredible. Who was your mason? We need to repoint our south wall next spring.",
    time: "25 min ago",
    read: false,
    href: "/m/blog/1",
    actorPhoto:
      "https://images.unsplash.com/photo-1525883405167-fc4e76c7713a?w=600&h=600&fit=crop&crop=center",
  },
  {
    id: 2,
    type: "post_comment",
    title: "Caroline A. commented on your post",
    body: "Six months of patience paying off beautifully. The lime mortar match is spot on.",
    time: "1 hour ago",
    read: false,
    href: "/m/blog/1",
    actorPhoto:
      "https://images.unsplash.com/photo-1757992141434-983a12b82da3?w=600&h=600&fit=crop&crop=center",
  },
  {
    id: 3,
    type: "post_like",
    title: "Eleanor M. and 17 others liked your post",
    body: "The north wall repointing is finally complete.",
    time: "2 hours ago",
    read: false,
    href: "/m/blog/1",
    actorPhoto:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=600&fit=crop&crop=center",
  },
  {
    id: 4,
    type: "forum_reply",
    title: "James W. replied to your forum post",
    body: "Lime mortar is absolutely the right call for anything pre-1920. Portland cement will cause more damage long-term.",
    time: "3 hours ago",
    read: false,
    href: "/m/forum/1",
    actorPhoto:
      "https://images.unsplash.com/photo-1525883405167-fc4e76c7713a?w=600&h=600&fit=crop&crop=center",
  },
  {
    id: 5,
    type: "event_reminder",
    title: "Event tomorrow: Monthly Member Meetup",
    body: "March 14 at 7:00 PM ET — Virtual",
    time: "5 hours ago",
    read: false,
    href: "/m/events/3",
  },
  {
    id: 6,
    type: "forum_reply",
    title: "Robert E. replied to your forum post",
    body: "Same experience here. Our mason initially pushed Portland cement but we held firm on the lime mortar.",
    time: "6 hours ago",
    read: true,
    href: "/m/forum/1",
    actorPhoto:
      "https://images.unsplash.com/photo-1519227355453-8f982e425321?w=600&h=600&fit=crop&crop=center",
  },
  {
    id: 7,
    type: "event_reminder",
    title: "Reminder: Expert Q&A: Historic Windows",
    body: "March 22 at 12:00 PM ET — You're registered",
    time: "1 day ago",
    read: true,
    href: "/m/events/2",
  },
  {
    id: 8,
    type: "new_member",
    title: "Thomas G. joined Grist Club",
    body: "1835 Federal in Lexington, KY",
    time: "1 day ago",
    read: true,
    href: "/m/members/thomas-g",
    actorPhoto:
      "https://images.unsplash.com/photo-1497219055242-93359eeed651?w=600&h=600&fit=crop&crop=center",
  },
  {
    id: 9,
    type: "forum_reply",
    title: "Susan P. replied to your forum post",
    body: "The Preservation Brief #2 from the National Park Service has great guidance on repointing mortar joints.",
    time: "2 days ago",
    read: true,
    href: "/m/forum/1",
    actorPhoto:
      "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=600&h=600&fit=crop&crop=center",
  },
  {
    id: 10,
    type: "new_member",
    title: "Eleanor M. joined Grist Club",
    body: "1868 Stick Style in Newport, RI",
    time: "3 days ago",
    read: true,
    href: "/m/members/eleanor-m",
    actorPhoto:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=600&fit=crop&crop=center",
  },
  {
    id: 11,
    type: "post_like",
    title: "David C. liked your post",
    body: "Found original 1842 wallpaper under six layers of paint in the parlor.",
    time: "4 days ago",
    read: true,
    href: "/m/blog/2",
    actorPhoto:
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&h=600&fit=crop&crop=center",
  },
  {
    id: 12,
    type: "welcome",
    title: "Welcome to Grist Club!",
    body: "Start by exploring the forum, connecting with other members, and RSVP-ing to upcoming events.",
    time: "2 weeks ago",
    read: true,
    href: "/m",
  },
];

export function getUnreadCount(): number {
  return allNotifications.filter((n) => !n.read).length;
}
