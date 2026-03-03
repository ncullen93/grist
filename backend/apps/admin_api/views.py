import random
import string

from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import ActivationCode, Application
from apps.blog.models import BlogComment, BlogPost
from apps.events.models import Event, RSVP
from apps.forum.models import Channel, ForumPost, Topic
from apps.marketplace.models import Listing, ListingTag
from apps.members.models import Invitation, MemberProfile, SupportRequest

from .serializers import (
    ActivationCodeSerializer,
    ApplicationListSerializer,
    ApplicationUpdateSerializer,
    BlogCommentListSerializer,
    InvitationListSerializer,
    SupportRequestListSerializer,
)


class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        events_qs = Event.objects.all()
        blog_qs = BlogPost.objects.all()

        return Response({
            "events": {
                "upcoming": events_qs.filter(status="upcoming").count(),
                "past": events_qs.filter(status="past").count(),
                "total": events_qs.count(),
            },
            "members": {
                "total": MemberProfile.objects.count(),
            },
            "blog": {
                "published": blog_qs.filter(status="published").count(),
                "drafts": blog_qs.filter(status="draft").count(),
                "total": blog_qs.count(),
            },
            "forum": {
                "posts": ForumPost.objects.count(),
                "channels": Channel.objects.count(),
                "topics": Topic.objects.count(),
            },
            "marketplace": {
                "listings": Listing.objects.count(),
                "tags": ListingTag.objects.count(),
            },
            "applications": {
                "pending": Application.objects.filter(status="pending").count(),
                "approved": Application.objects.filter(status="approved").count(),
                "rejected": Application.objects.filter(status="rejected").count(),
                "total": Application.objects.count(),
            },
            "support": {
                "total": SupportRequest.objects.count(),
            },
        })


class AdminAnalyticsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        events_qs = Event.objects.all()
        blog_qs = BlogPost.objects.all()
        forum_qs = ForumPost.objects.all()
        listings_qs = Listing.objects.all()

        total_rsvps = RSVP.objects.count()
        event_count = events_qs.count()

        return Response({
            "members": {
                "total": MemberProfile.objects.count(),
            },
            "events": {
                "upcoming": events_qs.filter(status="upcoming").count(),
                "past": events_qs.filter(status="past").count(),
                "total": event_count,
                "total_rsvps": total_rsvps,
                "avg_attendees": round(total_rsvps / event_count, 1) if event_count else 0,
            },
            "blog": {
                "published": blog_qs.filter(status="published").count(),
                "drafts": blog_qs.filter(status="draft").count(),
                "total": blog_qs.count(),
                "total_likes": blog_qs.aggregate(total=Count("likes"))["total"] or 0,
                "total_comments": BlogComment.objects.count(),
            },
            "forum": {
                "posts": forum_qs.count(),
                "channels": Channel.objects.count(),
                "topics": Topic.objects.count(),
                "total_likes": forum_qs.aggregate(total=Count("likes"))["total"] or 0,
                "total_replies": forum_qs.aggregate(total=Count("replies"))["total"] or 0,
            },
            "marketplace": {
                "total": listings_qs.count(),
                "for_sale": listings_qs.filter(category="for-sale").count(),
                "wanted": listings_qs.filter(category="wanted").count(),
                "free": listings_qs.filter(category="free").count(),
            },
            "invitations": {
                "total": Invitation.objects.count(),
                "used": Invitation.objects.filter(used_by__isnull=False).count(),
            },
        })


class ApplicationAdminViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    pagination_class = None

    def get_queryset(self):
        qs = Application.objects.all().order_by("-created_at")
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def get_serializer_class(self):
        if self.action in ("update", "partial_update"):
            return ApplicationUpdateSerializer
        return ApplicationListSerializer

    def perform_update(self, serializer):
        serializer.save(reviewed_at=timezone.now())


class ActivationCodeAdminViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = ActivationCode.objects.all().order_by("-created_at")
    serializer_class = ActivationCodeSerializer
    pagination_class = None

    def create(self, request, *args, **kwargs):
        count = int(request.data.get("count", 1))
        codes = []
        for _ in range(min(count, 50)):
            code = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
            codes.append(ActivationCode.objects.create(code=code))
        return Response(
            ActivationCodeSerializer(codes, many=True).data,
            status=status.HTTP_201_CREATED,
        )


class SupportRequestAdminViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAdminUser]
    serializer_class = SupportRequestListSerializer
    pagination_class = None

    def get_queryset(self):
        qs = SupportRequest.objects.select_related("user__profile").all()
        type_filter = self.request.query_params.get("type")
        if type_filter:
            qs = qs.filter(type=type_filter)
        return qs


class InvitationAdminViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAdminUser]
    serializer_class = InvitationListSerializer
    queryset = Invitation.objects.select_related(
        "inviter__profile", "used_by__profile"
    ).all().order_by("-created_at")
    pagination_class = None


class BlogCommentAdminViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    serializer_class = BlogCommentListSerializer
    queryset = BlogComment.objects.select_related(
        "author__profile", "post"
    ).all().order_by("-created_at")
    pagination_class = None
    http_method_names = ["get", "delete", "head", "options"]
