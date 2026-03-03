import uuid

from django.conf import settings
from django.core.files.storage import default_storage
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response

from apps.events.models import RSVP

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
    lookup_field = "uid"
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
        if "name" in serializer.validated_data:
            request.user.first_name = serializer.validated_data["name"]
            request.user.save(update_fields=["first_name"])
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
        url = request.build_absolute_uri(f"{settings.MEDIA_URL}{saved}")
        return Response({"url": url})

    @action(detail=True, methods=["post", "delete"])
    def follow(self, request, uid=None):
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
    def events(self, request, uid=None):
        from apps.events.models import Event
        from apps.events.serializers import EventListSerializer

        profile = self.get_object()
        event_ids = RSVP.objects.filter(user=profile.user).values_list("event_id", flat=True)
        events = Event.objects.filter(id__in=event_ids).prefetch_related("rsvps")
        serializer = EventListSerializer(events, many=True, context={"request": request})
        return Response(serializer.data)

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
