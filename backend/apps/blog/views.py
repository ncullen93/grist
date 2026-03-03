from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.notifications.models import Notification

from .models import BlogPost, BlogPostLike
from .serializers import (
    BlogCommentCreateSerializer,
    BlogCommentSerializer,
    BlogPostCreateSerializer,
    BlogPostDetailSerializer,
    BlogPostListSerializer,
)


class BlogPostViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        qs = BlogPost.objects.select_related("author__profile").prefetch_related(
            "comments__author__profile", "likes"
        )
        author_slug = self.request.query_params.get("author")
        if author_slug:
            qs = qs.filter(author__profile__slug=author_slug)
        return qs

    def get_serializer_class(self):
        if self.action == "retrieve":
            return BlogPostDetailSerializer
        if self.action in ("create", "update", "partial_update"):
            return BlogPostCreateSerializer
        return BlogPostListSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=["post"])
    def comment(self, request, pk=None):
        post = self.get_object()
        serializer = BlogCommentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.save(post=post, author=request.user)
        if post.author != request.user:
            Notification.objects.create(
                recipient=post.author,
                actor=request.user,
                type="post_comment",
                title=f"{request.user.profile.name} commented on your post",
                body=comment.body[:100],
                href=f"/m/blog/{post.id}",
            )
        return Response(BlogCommentSerializer(comment).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def like(self, request, pk=None):
        post = self.get_object()
        like, created = BlogPostLike.objects.get_or_create(post=post, user=request.user)
        if not created:
            like.delete()
            return Response({"liked": False, "count": post.likes.count()})
        if post.author != request.user:
            Notification.objects.create(
                recipient=post.author,
                actor=request.user,
                type="post_like",
                title=f"{request.user.profile.name} liked your post",
                body=post.title[:100],
                href=f"/m/blog/{post.id}",
            )
        return Response({"liked": True, "count": post.likes.count()})
