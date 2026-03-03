import django_filters
from django.db import models as db_models

from .models import ForumPost


class ForumPostFilter(django_filters.FilterSet):
    channel = django_filters.CharFilter(field_name="channel__slug")
    topic = django_filters.CharFilter(method="topic_filter")
    search = django_filters.CharFilter(method="search_filter")
    author = django_filters.CharFilter(field_name="author__profile__uid")

    class Meta:
        model = ForumPost
        fields = ["channel", "author"]

    def topic_filter(self, queryset, name, value):
        return queryset.filter(topics__slug=value)

    def search_filter(self, queryset, name, value):
        return queryset.filter(
            db_models.Q(title__icontains=value) | db_models.Q(body__icontains=value)
        )
