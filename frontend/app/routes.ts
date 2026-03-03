import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/marketing-layout.tsx", [
    index("routes/home.tsx"),
    route("about", "routes/about.tsx"),
    route("community", "routes/community.tsx"),
    route("members", "routes/members-page.tsx"),
    route("events", "routes/events.tsx"),
  ]),

  // Auth
  route("login", "routes/login.tsx"),
  route("logout", "routes/logout.tsx"),

  // API proxy
  route("api/upload", "routes/api.upload.tsx"),

  // Signup / onboarding flow
  route("signup", "routes/signup-layout.tsx", [
    index("routes/signup-address.tsx"),
    route("account", "routes/signup-account.tsx"),
    route("welcome", "routes/signup-welcome.tsx"),
    route("apply", "routes/signup-apply.tsx"),
    route("submitted", "routes/signup-submitted.tsx"),
  ]),

  // Member dashboard (sidebar layout)
  route("m", "routes/member-layout.tsx", [
    index("routes/member-redirect-home.tsx"),
    route("home", "routes/member-home.tsx"),
    route("forum", "routes/member-forum.tsx"),
    route("forum/:id", "routes/member-forum-detail.tsx"),
    route("marketplace", "routes/member-marketplace.tsx"),
    route("marketplace/:id", "routes/member-marketplace-detail.tsx"),
    route("events", "routes/member-events.tsx"),
    route("events/:id", "routes/member-event-detail.tsx"),
    route("members", "routes/member-directory.tsx"),
    route("members/:uid", "routes/member-profile-detail.tsx"),
    route("profile", "routes/member-profile.tsx"),
    route("profile/overview", "routes/member-profile-overview.tsx"),
    route("settings", "routes/member-settings.tsx"),
    route("posts", "routes/member-feed.tsx"),
    route("blog/:id", "routes/member-feed-detail.tsx"),
    route("posts/new-blog", "routes/member-posts-new-blog-redirect.tsx"),
    route("posts/blog/:id", "routes/member-posts-blog.tsx"),
    route("posts/new-forum", "routes/member-posts-new-forum.tsx"),
    route("posts/new-marketplace", "routes/member-posts-new-marketplace.tsx"),
    route("posts/edit-forum/:id", "routes/member-posts-edit-forum.tsx"),
    route("posts/edit-marketplace/:id", "routes/member-posts-edit-marketplace.tsx"),
    route("blog", "routes/member-blog.tsx"),

    // Resource routes (no UI)
    route("notifications", "routes/member-notifications.tsx"),
    route("help", "routes/member-help.tsx"),

    // Admin
    route("admin", "routes/admin.tsx"),
    route("admin/events", "routes/admin-events.tsx"),
    route("admin/events/new", "routes/admin-event-create.tsx"),
    route("admin/events/:id/edit", "routes/admin-event-edit.tsx"),
    route("admin/members", "routes/admin-members.tsx"),
    route("admin/blog", "routes/admin-blog.tsx"),
    route("admin/forum", "routes/admin-forum.tsx"),
    route("admin/marketplace", "routes/admin-marketplace.tsx"),
    route("admin/applications", "routes/admin-applications.tsx"),
    route("admin/support", "routes/admin-support.tsx"),
    route("admin/analytics", "routes/admin-analytics.tsx"),
  ]),
] satisfies RouteConfig;
