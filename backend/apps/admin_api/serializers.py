from rest_framework import serializers

from apps.accounts.models import ActivationCode, Application
from apps.blog.models import BlogComment
from apps.members.models import Invitation, SupportRequest


class ApplicationListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ["id", "full_name", "email", "address", "status", "created_at", "reviewed_at"]


class ApplicationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ["status"]


class ActivationCodeSerializer(serializers.ModelSerializer):
    used_by_email = serializers.CharField(source="used_by.email", read_only=True, default=None)

    class Meta:
        model = ActivationCode
        fields = ["id", "code", "is_used", "used_by_email", "used_at", "created_at"]
        read_only_fields = ["id", "is_used", "used_by_email", "used_at", "created_at"]


class SupportRequestListSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.profile.name", read_only=True, default="")

    class Meta:
        model = SupportRequest
        fields = ["id", "type", "subject", "message", "user_name", "created_at"]


class InvitationListSerializer(serializers.ModelSerializer):
    inviter_name = serializers.CharField(source="inviter.profile.name", read_only=True, default="")
    used_by_name = serializers.CharField(source="used_by.profile.name", read_only=True, default=None)

    class Meta:
        model = Invitation
        fields = ["id", "inviter_name", "email", "code", "created_at", "used_by_name"]


class BlogCommentListSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.profile.name", read_only=True, default="")
    post_title = serializers.CharField(source="post.title", read_only=True, default="")

    class Meta:
        model = BlogComment
        fields = ["id", "body", "author_name", "post_title", "created_at"]
