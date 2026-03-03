from rest_framework import serializers

from .models import Follow, MemberProfile, MemberSettings


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
            "story", "profile_visibility", "is_following",
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
            "profile_visibility",
        ]


class MemberSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemberSettings
        fields = ["email_notifications", "event_reminders", "forum_digest", "direct_messages"]
