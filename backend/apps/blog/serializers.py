from django.utils.timesince import timesince
from rest_framework import serializers

from .models import BlogComment, BlogPost


class BlogCommentSerializer(serializers.ModelSerializer):
    author_slug = serializers.CharField(source="author.profile.slug", read_only=True)
    author_name = serializers.CharField(source="author.profile.name", read_only=True)
    author_photo = serializers.URLField(source="author.profile.photo", read_only=True)
    author_location = serializers.CharField(source="author.profile.location", read_only=True)
    time = serializers.SerializerMethodField()

    class Meta:
        model = BlogComment
        fields = [
            "id", "author_slug", "author_name", "author_photo",
            "author_location", "body", "time", "created_at",
        ]

    def get_time(self, obj):
        return f"{timesince(obj.created_at)} ago"


class BlogCommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogComment
        fields = ["body"]


class BlogPostListSerializer(serializers.ModelSerializer):
    author_slug = serializers.CharField(source="author.profile.slug", read_only=True)
    author_name = serializers.CharField(source="author.profile.name", read_only=True)
    author_photo = serializers.URLField(source="author.profile.photo", read_only=True)
    author_location = serializers.CharField(source="author.profile.location", read_only=True)
    likes_count = serializers.IntegerField(source="likes.count", read_only=True)
    comment_count = serializers.IntegerField(source="comments.count", read_only=True)
    time = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            "id", "author_slug", "author_name", "author_photo",
            "author_location", "title", "content", "image",
            "likes_count", "comment_count", "time", "created_at",
        ]

    def get_time(self, obj):
        return f"{timesince(obj.created_at)} ago"


class BlogPostDetailSerializer(BlogPostListSerializer):
    comments = BlogCommentSerializer(many=True, read_only=True)
    user_has_liked = serializers.SerializerMethodField()

    class Meta(BlogPostListSerializer.Meta):
        fields = BlogPostListSerializer.Meta.fields + ["comments", "user_has_liked"]

    def get_user_has_liked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False


class BlogPostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = ["title", "content", "image"]
