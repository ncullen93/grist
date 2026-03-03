from django.contrib import admin

from .models import Event, EventAgendaItem, EventSpeaker, RSVP


class EventAgendaItemInline(admin.TabularInline):
    model = EventAgendaItem
    extra = 0


class EventSpeakerInline(admin.StackedInline):
    model = EventSpeaker
    extra = 0


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "date", "type", "status", "featured")
    list_filter = ("status", "type", "featured")
    search_fields = ("title", "description")
    inlines = [EventAgendaItemInline, EventSpeakerInline]


@admin.register(RSVP)
class RSVPAdmin(admin.ModelAdmin):
    list_display = ("event", "user", "created_at")
