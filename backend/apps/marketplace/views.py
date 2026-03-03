from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .filters import ListingFilter
from .models import Listing, ListingLike, ListingTag
from .serializers import (
    ListingCreateSerializer,
    ListingDetailSerializer,
    ListingListSerializer,
    ListingReplyCreateSerializer,
    ListingReplySerializer,
    ListingTagSerializer,
)


class ListingTagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ListingTag.objects.all()
    serializer_class = ListingTagSerializer


class ListingViewSet(viewsets.ModelViewSet):
    filterset_class = ListingFilter

    def get_queryset(self):
        return (
            Listing.objects.select_related("author__profile")
            .prefetch_related("tags", "replies__author__profile", "likes")
            .all()
        )

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ListingDetailSerializer
        if self.action == "create":
            return ListingCreateSerializer
        return ListingListSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=["post"])
    def reply(self, request, pk=None):
        listing = self.get_object()
        serializer = ListingReplyCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reply = serializer.save(listing=listing, author=request.user)
        return Response(ListingReplySerializer(reply).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def like(self, request, pk=None):
        listing = self.get_object()
        like, created = ListingLike.objects.get_or_create(listing=listing, user=request.user)
        if not created:
            like.delete()
            return Response({"liked": False, "count": listing.likes.count()})
        return Response({"liked": True, "count": listing.likes.count()})
