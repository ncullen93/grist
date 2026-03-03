from django.utils.timesince import timesince
from rest_framework import serializers

from .models import Channel, ForumPost, ForumReply, Topic


class ChannelSerializer(serializers.ModelSerializer):
    post_count = serializers.IntegerField(read_only=True, default=0)
    latest_post_title = serializers.SerializerMethodField()
    latest_activity = serializers.SerializerMethodField()

    class Meta:
        model = Channel
        fields = ["id", "name", "slug", "post_count", "latest_post_title", "latest_activity"]

    def get_latest_post_title(self, obj):
        post = obj.posts.order_by("-created_at").first()
        return post.title if post else None

    def get_latest_activity(self, obj):
        from apps.forum.models import ForumReply
        # Check latest reply in any post in this channel
        latest_reply = (
            ForumReply.objects.filter(post__channel=obj)
            .order_by("-created_at")
            .values_list("created_at", flat=True)
            .first()
        )
        latest_post = obj.posts.order_by("-created_at").values_list("created_at", flat=True).first()
        candidates = [t for t in [latest_reply, latest_post] if t]
        if not candidates:
            return None
        latest = max(candidates)
        return f"{timesince(latest)} ago"


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
    last_reply_time = serializers.SerializerMethodField()
    last_reply_author_name = serializers.SerializerMethodField()

    class Meta:
        model = ForumPost
        fields = [
            "id", "author_slug", "author_name", "location", "home_photo",
            "channel_name", "channel_slug", "topic_names", "title", "body", "image",
            "pinned", "likes_count", "reply_count", "time", "created_at",
            "last_reply_time", "last_reply_author_name",
        ]

    def get_time(self, obj):
        return f"{timesince(obj.created_at)} ago"

    def get_topic_names(self, obj):
        return list(obj.topics.values_list("name", flat=True))

    def get_last_reply_time(self, obj):
        last_reply = obj.replies.order_by("-created_at").first()
        ts = last_reply.created_at if last_reply else obj.created_at
        return f"{timesince(ts)} ago"

    def get_last_reply_author_name(self, obj):
        last_reply = obj.replies.order_by("-created_at").first()
        if last_reply:
            return last_reply.author.profile.name
        return None


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
        fields = ["id", "title", "body", "image", "channel", "topics", "pinned"]
