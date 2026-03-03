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


class EventCreateSerializer(serializers.ModelSerializer):
    agenda = EventAgendaItemSerializer(many=True, required=False)
    speaker = EventSpeakerSerializer(required=False)

    class Meta:
        model = Event
        fields = [
            "title", "subtitle", "description", "long_description",
            "date", "date_start", "time", "type", "status",
            "image", "spots", "featured", "agenda", "speaker",
        ]

    def create(self, validated_data):
        agenda_data = validated_data.pop("agenda", [])
        speaker_data = validated_data.pop("speaker", None)
        event = Event.objects.create(**validated_data)
        for i, item in enumerate(agenda_data):
            EventAgendaItem.objects.create(event=event, sort_order=i, **item)
        if speaker_data:
            EventSpeaker.objects.create(event=event, **speaker_data)
        return event

    def update(self, instance, validated_data):
        agenda_data = validated_data.pop("agenda", None)
        speaker_data = validated_data.pop("speaker", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if agenda_data is not None:
            instance.agenda.all().delete()
            for i, item in enumerate(agenda_data):
                EventAgendaItem.objects.create(event=instance, sort_order=i, **item)
        if speaker_data is not None:
            EventSpeaker.objects.filter(event=instance).delete()
            EventSpeaker.objects.create(event=instance, **speaker_data)
        return instance
