from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.blog.views import BlogPostViewSet
from apps.events.views import EventViewSet
from apps.forum.views import ChannelViewSet, ForumPostViewSet, TopicViewSet
from apps.marketplace.views import ListingTagViewSet, ListingViewSet
from apps.members.views import MemberProfileViewSet, MemberSettingsView
from apps.notifications.views import NotificationViewSet

router = DefaultRouter()
router.register(r"members", MemberProfileViewSet, basename="member")
router.register(r"forum/posts", ForumPostViewSet, basename="forum-post")
router.register(r"forum/channels", ChannelViewSet, basename="channel")
router.register(r"forum/topics", TopicViewSet, basename="topic")
router.register(r"blog/posts", BlogPostViewSet, basename="blog-post")
router.register(r"marketplace/listings", ListingViewSet, basename="listing")
router.register(r"marketplace/tags", ListingTagViewSet, basename="listing-tag")
router.register(r"events", EventViewSet, basename="event")
router.register(r"notifications", NotificationViewSet, basename="notification")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/settings/", MemberSettingsView.as_view(), name="member-settings"),
]

# HomeFeedView
from apps.members.views_feed import HomeFeedView

urlpatterns += [
    path("api/feed/", HomeFeedView.as_view(), name="home-feed"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
