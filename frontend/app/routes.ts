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
    route("community/demo", "routes/community-demo.tsx"),
    route("members", "routes/members-page.tsx"),
    route("members/demo", "routes/members-demo.tsx"),
    route("members/demo/:slug", "routes/member-profile-demo.tsx"),
    route("events", "routes/events.tsx"),
    route("events/demo", "routes/events-demo.tsx"),
    route("events/demo/:id", "routes/event-detail-demo.tsx"),
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
    index("routes/member-home.tsx"),
    route("forum", "routes/member-forum.tsx"),
    route("forum/:id", "routes/member-forum-detail.tsx"),
    route("marketplace", "routes/member-marketplace.tsx"),
    route("marketplace/:id", "routes/member-marketplace-detail.tsx"),
    route("events", "routes/member-events.tsx"),
    route("events/:id", "routes/member-event-detail.tsx"),
    route("members", "routes/member-directory.tsx"),
    route("members/:slug", "routes/member-profile-detail.tsx"),
    route("profile", "routes/member-profile.tsx"),
    route("profile/overview", "routes/member-profile-overview.tsx"),
    route("settings", "routes/member-settings.tsx"),
    route("posts", "routes/member-feed.tsx"),
    route("blog/:id", "routes/member-feed-detail.tsx"),
    route("posts/new-blog", "routes/member-posts-new.tsx"),
    route("posts/new-forum", "routes/member-posts-new-forum.tsx"),
    route("posts/new-marketplace", "routes/member-posts-new-marketplace.tsx"),
    route("blog", "routes/member-blog.tsx"),
  ]),
] satisfies RouteConfig;
