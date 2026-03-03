from django.utils.timesince import timesince
from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    actor_photo = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            "id", "type", "title", "body", "time", "read", "href",
            "actor_photo", "created_at",
        ]

    def get_actor_photo(self, obj):
        if obj.actor and hasattr(obj.actor, "profile"):
            return obj.actor.profile.photo or None
        return None

    def get_time(self, obj):
        return f"{timesince(obj.created_at)} ago"
