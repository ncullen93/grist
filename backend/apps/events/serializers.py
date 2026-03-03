from rest_framework import serializers

from .models import Event, EventAgendaItem, EventSpeaker


class EventAgendaItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventAgendaItem
        fields = ["time", "title"]


class EventSpeakerSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventSpeaker
        fields = ["name", "role"]


class EventListSerializer(serializers.ModelSerializer):
    attendees = serializers.IntegerField(source="rsvps.count", read_only=True)
    rsvped = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id", "title", "subtitle", "description", "date", "time",
            "type", "status", "image", "spots", "featured",
            "attendees", "rsvped",
        ]

    def get_rsvped(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.rsvps.filter(user=request.user).exists()
        return False


class EventDetailSerializer(EventListSerializer):
    long_description = serializers.JSONField()
    agenda = EventAgendaItemSerializer(many=True, read_only=True)
    speaker = EventSpeakerSerializer(read_only=True)

    class Meta(EventListSerializer.Meta):
        fields = EventListSerializer.Meta.fields + ["long_description", "agenda", "speaker"]
