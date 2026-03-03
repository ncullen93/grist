import django_filters
from django.db import models as db_models

from .models import Listing


class ListingFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name="category")
    tag = django_filters.CharFilter(method="tag_filter")
    search = django_filters.CharFilter(method="search_filter")
    author = django_filters.CharFilter(field_name="author__profile__slug")

    class Meta:
        model = Listing
        fields = ["category", "author"]

    def tag_filter(self, queryset, name, value):
        return queryset.filter(tags__slug=value)

    def search_filter(self, queryset, name, value):
        return queryset.filter(
            db_models.Q(title__icontains=value) | db_models.Q(description__icontains=value)
        )
