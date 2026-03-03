from django.utils.timesince import timesince
from rest_framework import serializers

from .models import Listing, ListingReply, ListingTag


class ListingTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingTag
        fields = ["id", "name", "slug"]


class ListingReplySerializer(serializers.ModelSerializer):
    author_uid = serializers.CharField(source="author.profile.uid", read_only=True)
    author_name = serializers.CharField(source="author.profile.name", read_only=True)
    location = serializers.CharField(source="author.profile.location", read_only=True)
    home_photo = serializers.URLField(source="author.profile.photo", read_only=True)
    time = serializers.SerializerMethodField()

    class Meta:
        model = ListingReply
        fields = [
            "id", "author_uid", "author_name", "location", "home_photo",
            "body", "time", "created_at",
        ]

    def get_time(self, obj):
        return f"{timesince(obj.created_at)} ago"


class ListingReplyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingReply
        fields = ["body"]


class ListingListSerializer(serializers.ModelSerializer):
    author_uid = serializers.CharField(source="author.profile.uid", read_only=True)
    author_name = serializers.CharField(source="author.profile.name", read_only=True)
    location = serializers.CharField(source="author.profile.location", read_only=True)
    home_photo = serializers.URLField(source="author.profile.photo", read_only=True)
    tag_names = serializers.SerializerMethodField()
    likes_count = serializers.IntegerField(source="likes.count", read_only=True)
    reply_count = serializers.IntegerField(source="replies.count", read_only=True)
    time = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            "id", "author_uid", "author_name", "location", "home_photo",
            "category", "title", "description", "price", "image",
            "condition", "tag_names", "likes_count", "reply_count", "time", "created_at",
        ]

    def get_time(self, obj):
        return f"{timesince(obj.created_at)} ago"

    def get_tag_names(self, obj):
        return list(obj.tags.values_list("name", flat=True))


class ListingDetailSerializer(ListingListSerializer):
    replies = ListingReplySerializer(many=True, read_only=True)
    user_has_liked = serializers.SerializerMethodField()

    class Meta(ListingListSerializer.Meta):
        fields = ListingListSerializer.Meta.fields + ["replies", "user_has_liked"]

    def get_user_has_liked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False


class ListingCreateSerializer(serializers.ModelSerializer):
    tags = serializers.SlugRelatedField(
        slug_field="name", many=True, queryset=ListingTag.objects.all(), required=False
    )

    class Meta:
        model = Listing
        fields = ["id", "category", "title", "description", "price", "image", "condition", "tags"]
