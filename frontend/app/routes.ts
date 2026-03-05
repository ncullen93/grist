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
    // Redirect /m to /m/homes
    index("routes/member-redirect-homes.tsx"),
    route("homes", "routes/member-homes.tsx"),
    route("homes/:uid", "routes/member-home-detail.tsx"),

    // Forum
    route("forum", "routes/member-forum.tsx"),
    route("forum/:id", "routes/member-forum-detail.tsx"),
    route("forum/new", "routes/member-posts-new-forum.tsx"),
    route("forum/edit/:id", "routes/member-posts-edit-forum.tsx"),

    // Events
    route("events", "routes/member-events.tsx"),
    route("events/:id", "routes/member-event-detail.tsx"),

    // Profile & Settings
    route("profile", "routes/member-profile.tsx"),
    route("profile/overview", "routes/member-profile-overview.tsx"),
    route("settings", "routes/member-settings.tsx"),

    // Resource routes (no UI)
    route("notifications", "routes/member-notifications.tsx"),
    route("help", "routes/member-help.tsx"),

    // Admin
    route("admin", "routes/admin.tsx"),
    route("admin/events", "routes/admin-events.tsx"),
    route("admin/events/new", "routes/admin-event-create.tsx"),
    route("admin/events/:id/edit", "routes/admin-event-edit.tsx"),
    route("admin/members", "routes/admin-members.tsx"),
    route("admin/forum", "routes/admin-forum.tsx"),
  ]),
] satisfies RouteConfig;
