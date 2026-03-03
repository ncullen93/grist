import uuid
from itertools import chain
from operator import attrgetter

from django.conf import settings
from django.core.files.storage import default_storage
from django.utils.timesince import timesince
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response

from apps.blog.models import BlogComment, BlogPost, BlogPostLike
from apps.events.models import RSVP
from apps.forum.models import ForumPost, ForumPostLike, ForumReply
from apps.marketplace.models import Listing, ListingLike, ListingReply

from .filters import MemberProfileFilter
from .models import Follow, Invitation, MemberProfile, MemberSettings, SupportRequest
from .serializers import (
    InvitationSerializer,
    MemberProfileDetailSerializer,
    MemberProfileListSerializer,
    MemberProfileUpdateSerializer,
    MemberSettingsSerializer,
    SupportRequestSerializer,
)


class MemberProfileViewSet(viewsets.ModelViewSet):
    lookup_field = "slug"
    filterset_class = MemberProfileFilter

    def get_queryset(self):
        return MemberProfile.objects.select_related("user").all()

    def get_serializer_class(self):
        if self.action == "retrieve":
            return MemberProfileDetailSerializer
        if self.action in ("update", "partial_update"):
            return MemberProfileUpdateSerializer
        return MemberProfileListSerializer

    @action(detail=False, methods=["get", "put", "patch"], url_path="me")
    def me(self, request):
        profile = request.user.profile
        if request.method == "GET":
            serializer = MemberProfileDetailSerializer(profile, context={"request": request})
            return Response(serializer.data)
        serializer = MemberProfileUpdateSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            MemberProfileDetailSerializer(profile, context={"request": request}).data
        )

    @action(detail=False, methods=["post"], url_path="upload", parser_classes=[MultiPartParser])
    def upload_image(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)
        ext = file.name.rsplit(".", 1)[-1].lower() if "." in file.name else "jpg"
        filename = f"uploads/{uuid.uuid4().hex}.{ext}"
        saved = default_storage.save(filename, file)
        url = f"{settings.MEDIA_URL}{saved}"
        return Response({"url": url})

    @action(detail=True, methods=["post", "delete"])
    def follow(self, request, slug=None):
        target = self.get_object()
        if request.method == "POST":
            Follow.objects.get_or_create(follower=request.user, following=target.user)
            return Response({"status": "following"})
        Follow.objects.filter(follower=request.user, following=target.user).delete()
        return Response({"status": "unfollowed"})

    @action(detail=False, methods=["post"], url_path="invite")
    def invite(self, request):
        email = request.data.get("email", "")
        invitation = Invitation.objects.create(inviter=request.user, email=email)
        return Response(InvitationSerializer(invitation).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"], url_path="invite-link")
    def invite_link(self, request):
        invitation, created = Invitation.objects.get_or_create(
            inviter=request.user, email="",
            defaults={"inviter": request.user},
        )
        return Response(InvitationSerializer(invitation).data)

    @action(detail=True, methods=["get"])
    def activity(self, request, slug=None):
        profile = self.get_object()
        user = profile.user

        def _fmt_time(dt):
            return f"{timesince(dt)} ago"

        items = []

        for obj in BlogPost.objects.filter(author=user, status="published")[:20]:
            items.append({
                "type": "blog_post",
                "title": f"Published a blog post",
                "description": obj.title,
                "href": f"/m/blog/{obj.id}",
                "created_at": obj.created_at,
            })
        for obj in BlogComment.objects.filter(author=user).select_related("post")[:20]:
            items.append({
                "type": "blog_comment",
                "title": "Commented on a blog post",
                "description": obj.post.title,
                "href": f"/m/blog/{obj.post_id}",
                "created_at": obj.created_at,
            })
        for obj in BlogPostLike.objects.filter(user=user).select_related("post")[:20]:
            items.append({
                "type": "blog_like",
                "title": "Liked a blog post",
                "description": obj.post.title,
                "href": f"/m/blog/{obj.post_id}",
                "created_at": obj.created_at,
            })
        for obj in ForumPost.objects.filter(author=user)[:20]:
            items.append({
                "type": "forum_post",
                "title": "Started a forum discussion",
                "description": obj.title,
                "href": f"/m/forum/{obj.id}",
                "created_at": obj.created_at,
            })
        for obj in ForumReply.objects.filter(author=user).select_related("post")[:20]:
            items.append({
                "type": "forum_reply",
                "title": "Replied to a forum discussion",
                "description": obj.post.title,
                "href": f"/m/forum/{obj.post_id}",
                "created_at": obj.created_at,
            })
        for obj in ForumPostLike.objects.filter(user=user).select_related("post")[:20]:
            items.append({
                "type": "forum_like",
                "title": "Liked a forum post",
                "description": obj.post.title,
                "href": f"/m/forum/{obj.post_id}",
                "created_at": obj.created_at,
            })
        for obj in Listing.objects.filter(author=user)[:20]:
            items.append({
                "type": "listing",
                "title": "Listed on the marketplace",
                "description": obj.title,
                "href": f"/m/marketplace/{obj.id}",
                "created_at": obj.created_at,
            })
        for obj in ListingReply.objects.filter(author=user).select_related("listing")[:20]:
            items.append({
                "type": "listing_reply",
                "title": "Replied to a marketplace listing",
                "description": obj.listing.title,
                "href": f"/m/marketplace/{obj.listing_id}",
                "created_at": obj.created_at,
            })
        for obj in ListingLike.objects.filter(user=user).select_related("listing")[:20]:
            items.append({
                "type": "listing_like",
                "title": "Liked a marketplace listing",
                "description": obj.listing.title,
                "href": f"/m/marketplace/{obj.listing_id}",
                "created_at": obj.created_at,
            })
        for obj in RSVP.objects.filter(user=user).select_related("event")[:20]:
            items.append({
                "type": "rsvp",
                "title": "RSVP'd to an event",
                "description": obj.event.title,
                "href": f"/m/events/{obj.event_id}",
                "created_at": obj.created_at,
            })

        items.sort(key=lambda x: x["created_at"], reverse=True)
        items = items[:30]

        for item in items:
            item["time"] = _fmt_time(item["created_at"])
            item["created_at"] = item["created_at"].isoformat()

        return Response(items)

    @action(detail=False, methods=["post"], url_path="delete-account")
    def delete_account(self, request):
        user = request.user
        user.delete()
        return Response({"status": "deleted"}, status=status.HTTP_204_NO_CONTENT)


class MemberSettingsView(generics.RetrieveUpdateAPIView):
    serializer_class = MemberSettingsSerializer

    def get_object(self):
        obj, _ = MemberSettings.objects.get_or_create(user=self.request.user)
        return obj


class SupportRequestView(generics.CreateAPIView):
    serializer_class = SupportRequestSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
