import django_filters
from django.db import models as db_models

from .models import MemberProfile


class MemberProfileFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method="search_filter")
    home_style = django_filters.CharFilter(field_name="home_style", lookup_expr="iexact")
    era_min = django_filters.NumberFilter(field_name="home_year", lookup_expr="gte")
    era_max = django_filters.NumberFilter(field_name="home_year", lookup_expr="lte")
    state = django_filters.CharFilter(field_name="state", lookup_expr="iexact")

    class Meta:
        model = MemberProfile
        fields = ["home_style", "state"]

    def search_filter(self, queryset, name, value):
        return queryset.filter(
            db_models.Q(name__icontains=value)
            | db_models.Q(location__icontains=value)
            | db_models.Q(home_style__icontains=value)
            | db_models.Q(home_name__icontains=value)
        )
