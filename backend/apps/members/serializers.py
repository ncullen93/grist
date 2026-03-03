from rest_framework import serializers

from .models import Follow, Invitation, MemberProfile, MemberSettings, SupportRequest


class MemberProfileListSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemberProfile
        fields = [
            "slug", "name", "location", "state", "home_style", "home_year",
            "home_name", "photo", "tags", "member_since",
        ]


class MemberProfileDetailSerializer(serializers.ModelSerializer):
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = MemberProfile
        fields = [
            "slug", "name", "location", "state", "home_style", "home_year",
            "home_name", "bio", "photo", "tags", "member_since", "registry",
            "story", "onboarding_completed", "profile_visibility", "is_following",
        ]

    def get_is_following(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return Follow.objects.filter(follower=request.user, following=obj.user).exists()
        return False


class MemberProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemberProfile
        fields = [
            "name", "location", "state", "home_style", "home_year",
            "home_name", "bio", "photo", "tags", "registry", "story",
            "onboarding_completed", "profile_visibility",
        ]


class MemberSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemberSettings
        fields = ["email_notifications", "event_reminders", "forum_digest", "direct_messages"]


class SupportRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportRequest
        fields = ["id", "type", "subject", "message", "created_at"]
        read_only_fields = ["id", "created_at"]


class InvitationSerializer(serializers.ModelSerializer):
    invite_url = serializers.SerializerMethodField()

    class Meta:
        model = Invitation
        fields = ["id", "email", "code", "invite_url", "created_at"]
        read_only_fields = ["id", "code", "invite_url", "created_at"]

    def get_invite_url(self, obj):
        return f"/join/{obj.code}"
