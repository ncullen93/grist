from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.notifications.models import Notification

from .filters import ForumPostFilter
from .models import Channel, ForumPost, ForumPostLike, Topic
from .serializers import (
    ChannelSerializer,
    ForumPostCreateSerializer,
    ForumPostDetailSerializer,
    ForumPostListSerializer,
    ForumReplyCreateSerializer,
    ForumReplySerializer,
    TopicSerializer,
)


class ChannelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Channel.objects.all()
    serializer_class = ChannelSerializer


class TopicViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer


class ForumPostViewSet(viewsets.ModelViewSet):
    filterset_class = ForumPostFilter

    def get_queryset(self):
        return (
            ForumPost.objects.select_related("author__profile", "channel")
            .prefetch_related("topics", "replies__author__profile", "likes")
            .all()
        )

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ForumPostDetailSerializer
        if self.action == "create":
            return ForumPostCreateSerializer
        return ForumPostListSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=["post"])
    def reply(self, request, pk=None):
        post = self.get_object()
        serializer = ForumReplyCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reply = serializer.save(post=post, author=request.user)
        if post.author != request.user:
            Notification.objects.create(
                recipient=post.author,
                actor=request.user,
                type="forum_reply",
                title=f"{request.user.profile.name} replied to your forum post",
                body=reply.body[:100],
                href=f"/m/forum/{post.id}",
            )
        return Response(ForumReplySerializer(reply).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def like(self, request, pk=None):
        post = self.get_object()
        like, created = ForumPostLike.objects.get_or_create(post=post, user=request.user)
        if not created:
            like.delete()
            return Response({"liked": False, "count": post.likes.count()})
        return Response({"liked": True, "count": post.likes.count()})
