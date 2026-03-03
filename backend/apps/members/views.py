import uuid

from django.conf import settings
from django.core.files.storage import default_storage
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response

from .filters import MemberProfileFilter
from .models import Follow, MemberProfile, MemberSettings
from .serializers import (
    MemberProfileDetailSerializer,
    MemberProfileListSerializer,
    MemberProfileUpdateSerializer,
    MemberSettingsSerializer,
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


class MemberSettingsView(generics.RetrieveUpdateAPIView):
    serializer_class = MemberSettingsSerializer

    def get_object(self):
        obj, _ = MemberSettings.objects.get_or_create(user=self.request.user)
        return obj
