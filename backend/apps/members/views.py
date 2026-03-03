from rest_framework import generics, viewsets
from rest_framework.decorators import action
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
