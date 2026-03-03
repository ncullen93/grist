from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.permissions import IsAdminUser
from .models import Event, RSVP
from .serializers import EventCreateSerializer, EventDetailSerializer, EventListSerializer


class EventViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        qs = Event.objects.prefetch_related("rsvps", "agenda", "speaker")
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return EventCreateSerializer
        if self.action == "retrieve":
            return EventDetailSerializer
        return EventListSerializer

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsAdminUser()]
        return [IsAuthenticated()]

    @action(detail=True, methods=["post"])
    def rsvp(self, request, pk=None):
        event = self.get_object()
        rsvp, created = RSVP.objects.get_or_create(event=event, user=request.user)
        if not created:
            rsvp.delete()
            return Response({"rsvped": False, "attendees": event.rsvps.count()})
        return Response({"rsvped": True, "attendees": event.rsvps.count()})

    @action(detail=False, methods=["get"], url_path="my-rsvps")
    def my_rsvps(self, request):
        events = Event.objects.filter(rsvps__user=request.user)
        serializer = EventListSerializer(events, many=True, context={"request": request})
        return Response(serializer.data)
