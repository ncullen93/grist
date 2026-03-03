from django.utils.timesince import timesince
from rest_framework import serializers

from .models import Channel, ForumPost, ForumReply, Topic


class ChannelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Channel
        fields = ["id", "name", "slug"]


class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ["id", "name", "slug"]


class ForumReplySerializer(serializers.ModelSerializer):
    author_slug = serializers.CharField(source="author.profile.slug", read_only=True)
    author_name = serializers.CharField(source="author.profile.name", read_only=True)
    location = serializers.CharField(source="author.profile.location", read_only=True)
    home_photo = serializers.URLField(source="author.profile.photo", read_only=True)
    time = serializers.SerializerMethodField()

    class Meta:
        model = ForumReply
        fields = [
            "id", "author_slug", "author_name", "location", "home_photo",
            "body", "time", "created_at",
        ]

    def get_time(self, obj):
        return f"{timesince(obj.created_at)} ago"


class ForumReplyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForumReply
        fields = ["body"]


class ForumPostListSerializer(serializers.ModelSerializer):
    author_slug = serializers.CharField(source="author.profile.slug", read_only=True)
    author_name = serializers.CharField(source="author.profile.name", read_only=True)
    location = serializers.CharField(source="author.profile.location", read_only=True)
    home_photo = serializers.URLField(source="author.profile.photo", read_only=True)
    channel_name = serializers.CharField(source="channel.name", read_only=True)
    channel_slug = serializers.CharField(source="channel.slug", read_only=True)
    topic_names = serializers.SerializerMethodField()
    likes_count = serializers.IntegerField(source="likes.count", read_only=True)
    reply_count = serializers.IntegerField(source="replies.count", read_only=True)
    time = serializers.SerializerMethodField()

    class Meta:
        model = ForumPost
        fields = [
            "id", "author_slug", "author_name", "location", "home_photo",
            "channel_name", "channel_slug", "topic_names", "title", "body", "image",
            "pinned", "likes_count", "reply_count", "time", "created_at",
        ]

    def get_time(self, obj):
        return f"{timesince(obj.created_at)} ago"

    def get_topic_names(self, obj):
        return list(obj.topics.values_list("name", flat=True))


class ForumPostDetailSerializer(ForumPostListSerializer):
    replies = ForumReplySerializer(many=True, read_only=True)
    user_has_liked = serializers.SerializerMethodField()

    class Meta(ForumPostListSerializer.Meta):
        fields = ForumPostListSerializer.Meta.fields + ["replies", "user_has_liked"]

    def get_user_has_liked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False


class ForumPostCreateSerializer(serializers.ModelSerializer):
    channel = serializers.SlugRelatedField(
        slug_field="slug", queryset=Channel.objects.all()
    )
    topics = serializers.SlugRelatedField(
        slug_field="name", many=True, queryset=Topic.objects.all(), required=False
    )

    class Meta:
        model = ForumPost
        fields = ["id", "title", "body", "image", "channel", "topics"]
