from django.conf import settings
from django.db import models


class Event(models.Model):
    TYPE_CHOICES = [
        ("Virtual", "Virtual"),
        ("In Person", "In Person"),
    ]
    STATUS_CHOICES = [
        ("upcoming", "Upcoming"),
        ("past", "Past"),
    ]
    title = models.CharField(max_length=300)
    subtitle = models.CharField(max_length=300, blank=True)
    description = models.TextField()
    long_description = models.JSONField(default=list, blank=True)
    date = models.CharField(max_length=50)
    date_start = models.DateTimeField(null=True, blank=True)
    time = models.CharField(max_length=50)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="upcoming")
    image = models.URLField(max_length=500, blank=True)
    spots = models.PositiveIntegerField(null=True, blank=True)
    featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date_start", "-created_at"]

    def __str__(self):
        return self.title


class EventAgendaItem(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="agenda")
    time = models.CharField(max_length=50)
    title = models.CharField(max_length=300)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order"]

    def __str__(self):
        return f"{self.time} - {self.title}"


class EventSpeaker(models.Model):
    event = models.OneToOneField(Event, on_delete=models.CASCADE, related_name="speaker")
    name = models.CharField(max_length=200)
    role = models.CharField(max_length=300)

    def __str__(self):
        return self.name


class RSVP(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="rsvps")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="rsvps"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("event", "user")

    def __str__(self):
        return f"{self.user} RSVP to {self.event}"
