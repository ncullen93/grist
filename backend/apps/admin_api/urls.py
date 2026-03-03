from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ActivationCodeAdminViewSet,
    AdminAnalyticsView,
    AdminStatsView,
    ApplicationAdminViewSet,
    BlogCommentAdminViewSet,
    InvitationAdminViewSet,
    SupportRequestAdminViewSet,
)

router = DefaultRouter()
router.register(r"applications", ApplicationAdminViewSet, basename="admin-application")
router.register(r"activation-codes", ActivationCodeAdminViewSet, basename="admin-activation-code")
router.register(r"support", SupportRequestAdminViewSet, basename="admin-support")
router.register(r"invitations", InvitationAdminViewSet, basename="admin-invitation")
router.register(r"blog/comments", BlogCommentAdminViewSet, basename="admin-blog-comment")

urlpatterns = [
    path("stats/", AdminStatsView.as_view(), name="admin-stats"),
    path("analytics/", AdminAnalyticsView.as_view(), name="admin-analytics"),
    path("", include(router.urls)),
]
