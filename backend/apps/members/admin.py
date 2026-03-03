from django.contrib import admin

from .models import Follow, MemberProfile, MemberSettings


@admin.register(MemberProfile)
class MemberProfileAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "location", "home_style", "home_year", "member_since")
    search_fields = ("name", "location", "home_name")
    list_filter = ("home_style", "state")


@admin.register(MemberSettings)
class MemberSettingsAdmin(admin.ModelAdmin):
    list_display = ("user", "email_notifications", "event_reminders", "forum_digest")


@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    list_display = ("follower", "following", "created_at")
